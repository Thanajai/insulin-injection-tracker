import React, { useState, useEffect } from 'react';
import { Injection, InsulinType, User } from '../types';
import { INSULIN_TYPE_DETAILS } from '../constants';
import { XIcon, CalendarIcon } from './icons';
import { useTranslation } from './LanguageProvider';


interface InjectionFormProps {
  onSave: (injection: Omit<Injection, 'id' | 'timestamp'>) => void;
  onClose: () => void;
  initialData?: Injection | null;
  currentUser: User;
}

// Helper to format date for datetime-local input
const toDateTimeLocal = (timestamp: number | undefined): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  // Adjust for timezone offset
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
  return localISOTime;
};

export const InjectionForm: React.FC<InjectionFormProps> = ({ onSave, onClose, initialData, currentUser }) => {
  const [units, setUnits] = useState<string>('');
  const [type, setType] = useState<InsulinType>(InsulinType.RAPID_ACTING);
  const [notes, setNotes] = useState('');
  const [nextDose, setNextDose] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const isDoctor = currentUser.role === 'Doctor';

  useEffect(() => {
    if (initialData) {
      setUnits(initialData.units.toString());
      setType(initialData.type);
      setNotes(initialData.notes || '');
      setNextDose(toDateTimeLocal(initialData.nextDoseTimestamp));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unitsNumber = parseFloat(units);
    if (isNaN(unitsNumber) || unitsNumber <= 0) {
      setError(t('errorValidUnits'));
      return;
    }

    const nextDoseTimestamp = nextDose ? new Date(nextDose).getTime() : undefined;
    if (isDoctor && nextDoseTimestamp && nextDoseTimestamp <= Date.now()) {
        setError(t('errorNextDoseFuture'));
        return;
    }

    setError(null);
    onSave({ units: unitsNumber, type, notes, nextDoseTimestamp });
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{initialData ? t('editInjection') : t('logNewInjection')}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="units" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('units')}</label>
            <input
              id="units"
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="e.g., 5"
              step="0.1"
              className="w-full px-4 py-2 bg-white dark:bg-zinc-700 text-black dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
              autoFocus={!initialData}
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('insulinType')}</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as InsulinType)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-700 text-black dark:text-white border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              {Object.entries(INSULIN_TYPE_DETAILS).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('notesOptional')}</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-700 text-black dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
            />
          </div>

          {isDoctor && (
             <div className="animate-fade-in">
                <label htmlFor="next-dose" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('scheduleNextDose')}</label>
                 <div className="relative">
                    <input
                        id="next-dose"
                        type="datetime-local"
                        value={nextDose}
                        onChange={(e) => setNextDose(e.target.value)}
                        className="w-full px-4 py-2 pr-10 bg-white dark:bg-zinc-700 text-black dark:text-white border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                    <label
                        htmlFor="next-dose"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        aria-label={t('openCalendar')}
                    >
                        <CalendarIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" aria-hidden="true" />
                    </label>
                </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 animate-shake">{error}</p>}
          <div className="flex justify-end space-x-4">
             <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all transform hover:scale-105">{initialData ? t('saveChanges') : t('saveInjection')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};