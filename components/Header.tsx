import React from 'react';
import { SyringeIcon, PlusIcon, UserPlusIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from './icons';
import { PatientSearch } from './PatientSearch';
import type { User } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useTranslation } from './LanguageProvider';


interface HeaderProps {
    currentUser: User | null;
    onLogInjection: () => void;
    patients: string[];
    currentPatientId: string | null;
    onSelectPatient: (id: string) => void;
    onAddPatient: () => void;
    onGoHome: () => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogInjection, patients, currentPatientId, onSelectPatient, onAddPatient, onGoHome, onLogout }) => {
  const isDoctor = currentUser?.role === 'Doctor';
  const hasPatients = patients.length > 0;
  const hasSelectedPatient = !!currentPatientId;
  const { t } = useTranslation();

  return (
    <header className="bg-zinc-900/70 backdrop-blur-xl shadow-lg shadow-black/30 sticky top-0 z-40 border-b border-zinc-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={isDoctor ? onGoHome : undefined} 
            className={`flex items-center space-x-3 group ${isDoctor ? '' : 'cursor-default'}`} 
            aria-label={t('goToHomepage')}
          >
            <SyringeIcon className="w-10 h-10 text-blue-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight group-hover:text-blue-400 transition-colors">
              {t('insulinTracker')}
            </h1>
          </button>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isDoctor && hasPatients && (
              <div className="w-40 sm:w-48">
                <PatientSearch
                  patients={patients}
                  currentPatientId={currentPatientId}
                  onSelectPatient={onSelectPatient}
                />
              </div>
            )}
            {isDoctor && (
              <button
                  onClick={onAddPatient}
                  className="hidden sm:flex items-center space-x-2 bg-zinc-800/50 hover:bg-zinc-700/70 border border-zinc-700 text-zinc-300 font-semibold py-2 px-3 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105"
                  aria-label={t('addNewPatient')}
              >
                  <UserPlusIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{t('newPatient')}</span>
              </button>
            )}
            {isDoctor && (
              <button
                onClick={onLogInjection}
                className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                disabled={!hasSelectedPatient}
                aria-label={t('logInjection')}
              >
                <PlusIcon className="w-5 h-5" />
                <span>{t('logInjection')}</span>
              </button>
            )}
            {currentUser && (
              <div className="flex items-center space-x-2 border-l border-zinc-700/50 pl-2 sm:pl-3">
                <ThemeSwitcher />
                <LanguageSwitcher />
                <div className="flex items-center space-x-2 border-l border-zinc-700/50 pl-2">
                    <UserCircleIcon className="w-7 h-7 text-zinc-400" />
                    <span className="text-sm font-semibold text-zinc-300 hidden sm:inline">{currentUser.username}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-zinc-400 hover:bg-zinc-700/50 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label={t('logout')}
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};