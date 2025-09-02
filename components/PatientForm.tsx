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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md p-6 sm:p-8 transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">{t('addNewPatient')}</h2>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label="Close dialog"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-zinc-300 mb-1">
              {t('patientName')}
            </label>
            <input
              id="patientName"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2 bg-zinc-900/50 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none transition-all"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-400 animate-shake" role="alert">{error}</p>}
          <div className="flex justify-end space-x-4">
             <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-zinc-200 bg-zinc-700/50 hover:bg-zinc-700 border border-zinc-600 transition-colors font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center space-x-2">
                <UserPlusIcon className="w-5 h-5"/>
                <span>{t('savePatient')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};