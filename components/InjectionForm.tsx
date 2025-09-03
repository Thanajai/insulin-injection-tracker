import React, { useState, useEffect } from 'react';
import { Injection, InsulinType, User, GlucoseType, InjectionSite } from '../types';
import { INSULIN_TYPE_DETAILS, GLUCOSE_TYPE_DETAILS } from '../constants';
import { XIcon, CalendarIcon } from './icons';
import { useTranslation } from './LanguageProvider';
import { InjectionSiteSelector } from './InjectionSiteSelector';


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
  const [glucoseLevel, setGlucoseLevel] = useState<string>('');
  const [glucoseType, setGlucoseType] = useState<GlucoseType>(GlucoseType.PRE_MEAL);
  const [carbs, setCarbs] = useState<string>('');
  const [site, setSite] = useState<InjectionSite | undefined>();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const isDoctor = currentUser.role === 'Doctor';

  useEffect(() => {
    if (initialData) {
      setUnits(initialData.units.toString());
      setType(initialData.type);
      setNotes(initialData.notes || '');
      setNextDose(toDateTimeLocal(initialData.nextDoseTimestamp));
      setGlucoseLevel(initialData.glucoseLevel?.toString() || '');
      setGlucoseType(initialData.glucoseType || GlucoseType.PRE_MEAL);
      setCarbs(initialData.carbs?.toString() || '');
      setSite(initialData.site);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unitsNumber = parseFloat(units);
    if (isNaN(unitsNumber) || unitsNumber <= 0) {
      setError(t('errorValidUnits'));
      return;
    }
    
    const glucose = glucoseLevel ? parseFloat(glucoseLevel) : undefined;
    if (glucoseLevel && (isNaN(glucose) || glucose < 0)) {
        setError(t('errorValidGlucose'));
        return;
    }

    const carbsNumber = carbs ? parseFloat(carbs) : undefined;
    if (carbs && (isNaN(carbsNumber) || carbsNumber < 0)) {
        setError(t('errorValidCarbs'));
        return;
    }

    const nextDoseTimestamp = nextDose ? new Date(nextDose).getTime() : undefined;
    if (isDoctor && nextDoseTimestamp && nextDoseTimestamp <= Date.now()) {
        setError(t('errorNextDoseFuture'));
        return;
    }

    setError(null);
    onSave({ 
        units: unitsNumber, 
        type, 
        notes, 
        nextDoseTimestamp,
        glucoseLevel: glucose,
        glucoseType: glucose ? glucoseType : undefined,
        carbs: carbsNumber,
        site,
    });
  };
  
  const inputClasses = "w-full px-4 py-2 bg-zinc-900/50 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none transition-all";

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-lg p-6 sm:p-8 transform transition-all animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">{initialData ? t('editInjection') : t('logNewInjection')}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                  {/* Injection Details */}
                  <div>
                    <label htmlFor="units" className="block text-sm font-medium text-zinc-300 mb-1">{t('units')}</label>
                    <input
                      id="units"
                      type="number"
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      placeholder="e.g., 5"
                      step="0.1"
                      className={inputClasses}
                      required
                      autoFocus={!initialData}
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-zinc-300 mb-1">{t('insulinType')}</label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value as InsulinType)}
                      className={inputClasses}
                    >
                      {Object.entries(INSULIN_TYPE_DETAILS).map(([key, { name }]) => (
                        <option key={key} value={key} className="bg-zinc-800">{name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Contextual Info */}
                  <div className="border-t border-zinc-700/50 pt-6 space-y-6">
                     <h3 className="text-lg font-semibold text-zinc-300 -mb-2">{t('contextualInfo')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="glucose" className="block text-sm font-medium text-zinc-300 mb-1">{t('glucoseLevel')}</label>
                        <input
                          id="glucose"
                          type="number"
                          value={glucoseLevel}
                          onChange={(e) => setGlucoseLevel(e.target.value)}
                          placeholder="120"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label htmlFor="glucose-type" className="block text-sm font-medium text-zinc-300 mb-1">{t('glucoseType')}</label>
                        <select
                          id="glucose-type"
                          value={glucoseType}
                          onChange={(e) => setGlucoseType(e.target.value as GlucoseType)}
                          className={inputClasses}
                          disabled={!glucoseLevel}
                        >
                          {Object.entries(GLUCOSE_TYPE_DETAILS).map(([key, { nameKey }]) => (
                            <option key={key} value={key} className="bg-zinc-800">{t(nameKey as any)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                     <div>
                        <label htmlFor="carbs" className="block text-sm font-medium text-zinc-300 mb-1">{t('carbohydrateIntake')}</label>
                        <input
                          id="carbs"
                          type="number"
                          value={carbs}
                          onChange={(e) => setCarbs(e.target.value)}
                          placeholder="e.g., 45"
                          className={inputClasses}
                        />
                      </div>
                  </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-300 mb-1 text-center">{t('injectionSite')}</label>
                <InjectionSiteSelector selectedSite={site} onSelectSite={setSite} />
                 <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-zinc-300 mb-1">{t('notesOptional')}</label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('mealNotesPlaceholder')}
                      rows={3}
                      className={`${inputClasses} resize-none`}
                    />
                  </div>
              </div>
          </div>
          
          {isDoctor && (
             <div className="animate-fade-in border-t border-zinc-700/50 pt-6">
                <label htmlFor="next-dose" className="block text-sm font-medium text-zinc-300 mb-1">{t('scheduleNextDose')}</label>
                 <div className="relative">
                    <input
                        id="next-dose"
                        type="datetime-local"
                        value={nextDose}
                        onChange={(e) => setNextDose(e.target.value)}
                        className={`${inputClasses} pr-10`}
                    />
                    <label
                        htmlFor="next-dose"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        aria-label={t('openCalendar')}
                    >
                        <CalendarIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-200 transition-colors" aria-hidden="true" />
                    </label>
                </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400 animate-shake">{error}</p>}
          <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-700/50">
             <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-zinc-200 bg-zinc-700/50 hover:bg-zinc-700 border border-zinc-600 transition-colors font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105">{initialData ? t('saveChanges') : t('saveInjection')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};