import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserIcon, ChevronDownIcon } from './icons';
import { useTranslation } from './LanguageProvider';


interface PatientSearchProps {
  patients: string[];
  currentPatientId: string | null;
  onSelectPatient: (id: string) => void;
}

/**
 * Extracts the patient's name from a patient ID string.
 * e.g., "John Doe (doc1)" -> "John Doe"
 * @param patientId The full patient ID string.
 * @returns The extracted patient name.
 */
const getPatientName = (patientId: string | null): string => {
  if (!patientId) return '';
  const match = patientId.match(/^(.*?)\s*\(/);
  return match ? match[1].trim() : patientId;
};

export const PatientSearch: React.FC<PatientSearchProps> = ({ patients, currentPatientId, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState(getPatientName(currentPatientId));
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (!isOpen) {
        setSearchTerm(getPatientName(currentPatientId));
    }
  }, [currentPatientId, isOpen]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => getPatientName(p).toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, patients]);

  const handleSelect = (patientId: string) => {
    onSelectPatient(patientId);
    setSearchTerm(getPatientName(patientId));
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
        <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onClick={() => setIsOpen(true)}
                placeholder={t('searchPatient')}
                className="w-full bg-zinc-900/50 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg py-2 pl-10 pr-10 text-sm font-medium focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none transition-all"
                aria-label={t('searchPatient')}
                autoComplete="off"
            />
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)} 
                className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-200"
                aria-label={t('togglePatientList')}
            >
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
        </div>

        {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-zinc-800/80 backdrop-blur-lg border border-zinc-700/50 rounded-md shadow-lg max-h-60 overflow-auto animate-fade-in-down">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(p => (
                <li
                key={p}
                onClick={() => handleSelect(p)}
                className="px-4 py-2 text-sm text-zinc-200 hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
                role="option"
                aria-selected={p === currentPatientId}
                >
                {getPatientName(p)}
                </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-zinc-400 italic">{t('noPatientsFound')}</li>
          )}
        </ul>
      )}
    </div>
  );
};