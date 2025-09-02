import React, { useState } from 'react';
import { UserPlusIcon, XIcon } from './icons';
import { useTranslation } from './LanguageProvider';


interface PatientFormProps {
  onSave: (patientName: string) => void;
  onClose: () => void;
  existingPatients: string[];
  doctorUsername: string;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onSave, onClose, existingPatients, doctorUsername }) => {
  const [patientName, setPatientName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = patientName.trim();

    if (trimmedName === '') {
      setError(t('errorPatientNameEmpty'));
      return;
    }
    
    // Create the prospective unique ID to check for existence
    const prospectiveId = `${trimmedName} (${doctorUsername})`;
    if (existingPatients.find(p => p.toLowerCase() === prospectiveId.toLowerCase())) {
      setError(t('errorPatientExists'));
      return;
    }

    setError(null);
    onSave(trimmedName);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('addNewPatient')}</h2>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            aria-label="Close dialog"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t('patientName')}
            </label>
            <input
              id="patientName"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2 bg-white dark:bg-zinc-700 text-black dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-500 animate-shake" role="alert">{error}</p>}
          <div className="flex justify-end space-x-4">
             <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center space-x-2">
                <UserPlusIcon className="w-5 h-5"/>
                <span>{t('savePatient')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};