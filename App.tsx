import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Injection, User, ScheduledDose } from './types';
import { InjectionForm } from './components/InjectionForm';
import { PatientForm } from './components/PatientForm';
import { InjectionList } from './components/InjectionList';
import { Header } from './components/Header';
import { LastInjectionCard } from './components/LastInjectionCard';
import { TotalUnitsCard } from './components/TotalUnitsCard';
import { NextDoseCard } from './components/NextDoseCard';
import { PlusIcon } from './components/icons';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { useTranslation } from './components/LanguageProvider';
import { ChatBot } from './components/ChatBot';

const App: React.FC = () => {
  const [injections, setInjections] = useState<Injection[]>([]);
  const [scheduledDose, setScheduledDose] = useState<ScheduledDose | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInjection, setEditingInjection] = useState<Injection | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patients, setPatients] = useState<string[]>([]);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { t } = useTranslation();

  // Load current user from session storage on initial render
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem('insulin_tracker_currentUser');
      if (savedUser) {
        const user: User = JSON.parse(savedUser);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Failed to load user from sessionStorage", error);
    }
  }, []);
  
  // Handle role-specific setup when currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Patient') {
        const patientId = `${currentUser.username} (${currentUser.doctorUsername})`;
        setCurrentPatientId(patientId);
        setPatients([]); 
      } else if (currentUser.role === 'Doctor') {
        try {
          const savedPatients = localStorage.getItem(`patients_${currentUser.username}`);
          const patientList = savedPatients ? JSON.parse(savedPatients) : [];
          setPatients(patientList);
          
          const lastPatientId = localStorage.getItem(`last_patient_${currentUser.username}`);
          if (lastPatientId && patientList.includes(lastPatientId)) {
            setCurrentPatientId(lastPatientId);
          } else {
            setCurrentPatientId(null);
          }
        } catch (error) {
          console.error("Failed to load doctor's patient data", error);
        }
      }
    } else {
      setCurrentPatientId(null);
      setPatients([]);
      setInjections([]);
      setScheduledDose(null);
    }
  }, [currentUser]);

  // Load injections and scheduled dose for the current patient
  useEffect(() => {
    if (!currentPatientId) {
      setInjections([]);
      setScheduledDose(null);
      return;
    }
    try {
      const savedInjections = localStorage.getItem(`injections_${currentPatientId}`);
      setInjections(savedInjections ? JSON.parse(savedInjections) : []);

      const savedScheduledDose = localStorage.getItem(`scheduledDose_${currentPatientId}`);
      setScheduledDose(savedScheduledDose ? JSON.parse(savedScheduledDose) : null);

    } catch (error) {
      console.error(`Failed to load data for patient ${currentPatientId}`, error);
      setInjections([]);
      setScheduledDose(null);
    }
  }, [currentPatientId]);

  // Save injections to localStorage
  useEffect(() => {
    if (!currentPatientId) return;
    try {
      localStorage.setItem(`injections_${currentPatientId}`, JSON.stringify(injections));
    } catch (error) {
      console.error(`Failed to save injections for patient ${currentPatientId}`, error);
    }
  }, [injections, currentPatientId]);
  
  // Save scheduled dose to localStorage
  useEffect(() => {
    if (!currentPatientId) return;
    try {
      if (scheduledDose) {
        localStorage.setItem(`scheduledDose_${currentPatientId}`, JSON.stringify(scheduledDose));
      } else {
        localStorage.removeItem(`scheduledDose_${currentPatientId}`);
      }
    } catch (error) {
      console.error(`Failed to save scheduled dose for patient ${currentPatientId}`, error);
    }
  }, [scheduledDose, currentPatientId]);

  const handleSavePatient = useCallback((patientName: string) => {
    if (!currentUser || currentUser.role !== 'Doctor') return;
    
    const newPatientId = `${patientName} (${currentUser.username})`;
    const updatedPatients = [...patients, newPatientId];
    setPatients(updatedPatients);
    setCurrentPatientId(newPatientId);
    try {
      localStorage.setItem(`patients_${currentUser.username}`, JSON.stringify(updatedPatients));
      localStorage.setItem(`last_patient_${currentUser.username}`, newPatientId);
    } catch(error) {
      console.error("Failed to save new patient data", error);
    }
    setIsPatientModalOpen(false);
  }, [patients, currentUser]);

  const handleSelectPatient = (patientId: string) => {
    if (currentUser?.role !== 'Doctor') return;
    if (patients.includes(patientId)) {
      setCurrentPatientId(patientId);
      try {
        localStorage.setItem(`last_patient_${currentUser.username}`, patientId);
      } catch (error) {
        console.error("Failed to save last patient ID", error);
      }
    }
  };

  const handleGoHome = () => {
    if (currentUser?.role !== 'Doctor') return;
    setCurrentPatientId(null);
    try {
      localStorage.removeItem(`last_patient_${currentUser.username}`);
    } catch (error) {
      console.error("Failed to clear last patient ID", error);
    }
  };

  const handleSaveInjection = (injectionData: Omit<Injection, 'id' | 'timestamp'>) => {
    if (!currentPatientId || !currentUser) return;
    
    const injectionId = editingInjection ? editingInjection.id : crypto.randomUUID();

    if (editingInjection) {
      setInjections(prev =>
        prev.map(inj =>
          inj.id === injectionId
            ? { ...inj, ...injectionData, timestamp: inj.timestamp }
            : inj
        ).sort((a, b) => b.timestamp - a.timestamp)
      );
    } else {
      const newInjection: Injection = {
        ...injectionData,
        id: injectionId,
        timestamp: Date.now(),
      };
      setInjections(prev => [newInjection, ...prev]);
    }

    if (currentUser.role === 'Doctor' && injectionData.nextDoseTimestamp) {
        const nextDose: ScheduledDose = {
            timestamp: injectionData.nextDoseTimestamp,
            units: injectionData.units, // Assuming next dose has same units, form could be changed for this
            type: injectionData.type,
            sourceInjectionId: injectionId
        };
        setScheduledDose(nextDose);
    } else if (editingInjection?.id === scheduledDose?.sourceInjectionId && !injectionData.nextDoseTimestamp) {
      // If the scheduled dose was removed on edit, clear it
      setScheduledDose(null);
    }

    setIsModalOpen(false);
    setEditingInjection(null);
  };

  const handleDeleteInjection = (id: string) => {
    if (window.confirm(t('deleteConfirmation'))) {
      if (id === scheduledDose?.sourceInjectionId) {
        setScheduledDose(null);
      }
      setInjections(prev => prev.filter(inj => inj.id !== id));
    }
  };

  const handleOpenEditModal = (injection: Injection) => {
    setEditingInjection(injection);
    setIsModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setEditingInjection(null);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInjection(null);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem('insulin_tracker_currentUser', JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user to sessionStorage", error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('insulin_tracker_currentUser');
    } catch (error) {
      console.error("Failed to remove user from sessionStorage", error);
    }
  };
  
  const lastInjection = useMemo(() => injections.length > 0 ? injections[0] : null, [injections]);

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen text-zinc-200 font-sans antialiased">
      <Header 
        currentUser={currentUser}
        onLogInjection={handleOpenAddModal}
        patients={patients}
        currentPatientId={currentPatientId}
        onSelectPatient={handleSelectPatient}
        onAddPatient={() => setIsPatientModalOpen(true)}
        onGoHome={handleGoHome}
        onLogout={handleLogout}
      />
      
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {currentPatientId ? (
          <div className="animate-fade-in">
            {currentUser.role === 'Patient' && (
              <div className="mb-8">
                <NextDoseCard scheduledDose={scheduledDose} injections={injections} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <LastInjectionCard lastInjection={lastInjection} />
              <TotalUnitsCard injections={injections} />
            </div>
            <InjectionList
              injections={injections}
              onDelete={handleDeleteInjection}
              onEdit={handleOpenEditModal}
              currentPatientId={currentPatientId}
              currentUser={currentUser}
            />
          </div>
        ) : (
          <HomePage onAddPatient={() => setIsPatientModalOpen(true)} patients={patients} currentUser={currentUser} />
        )}
      </main>

      {isModalOpen && currentPatientId && currentUser && (
        <InjectionForm
          onSave={handleSaveInjection}
          onClose={handleCloseModal}
          initialData={editingInjection}
          currentUser={currentUser}
        />
      )}

      {isPatientModalOpen && currentUser.role === 'Doctor' && (
        <PatientForm
          onSave={handleSavePatient}
          onClose={() => setIsPatientModalOpen(false)}
          existingPatients={patients}
          doctorUsername={currentUser.username}
        />
      )}
      
      {currentPatientId && (
        <>
            {currentUser.role === 'Doctor' && (
                <button
                    onClick={handleOpenAddModal}
                    className="fixed bottom-6 right-6 bg-blue-500/30 backdrop-blur-md border border-blue-500/50 hover:bg-blue-500/50 text-blue-300 rounded-full p-4 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                    aria-label={t('logNewInjection')}
                >
                    <PlusIcon className="w-8 h-8" />
                </button>
            )}
            <ChatBot patientId={currentPatientId} />
        </>
      )}
    </div>
  );
};

export default App;