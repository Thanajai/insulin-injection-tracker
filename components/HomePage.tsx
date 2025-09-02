import React from 'react';
import { UserPlusIcon, SyringeIcon, ArrowUpRightIcon } from './icons';
import type { User } from '../types';
import { useTranslation } from './LanguageProvider';


interface HomePageProps {
    onAddPatient: () => void;
    patients: string[];
    currentUser: User | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddPatient, patients, currentUser }) => {
    const isDoctor = currentUser?.role === 'Doctor';
    const hasPatients = patients.length > 0;
    const { t } = useTranslation();

    return (
        <div className="text-center py-20 px-6 bg-white dark:bg-zinc-800 rounded-xl shadow-md mt-8 max-w-3xl mx-auto animate-fade-in">
            <SyringeIcon className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            
            {isDoctor ? (
                <>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t('welcomeDoctor', { username: currentUser?.username })}</h2>
                    {hasPatients ? (
                        <>
                            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                                {t('selectPatientPrompt')}
                            </p>
                            <div className="mt-2 text-zinc-500 dark:text-zinc-400 flex items-center justify-center space-x-2">
                                <span>{t('useSearchBarHint')}</span>
                                <ArrowUpRightIcon className="w-5 h-5" />
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={onAddPatient}
                                    className="inline-flex items-center space-x-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105"
                                >
                                    <UserPlusIcon className="w-6 h-6" />
                                    <span>{t('orAddPatient')}</span>
                                </button>
                            </div>
                        </>
                    ) : (
                         <>
                            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                                {t('getStartedPrompt')}
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={onAddPatient}
                                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                                >
                                    <UserPlusIcon className="w-6 h-6" />
                                    <span>{t('addFirstPatient')}</span>
                                </button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                 <>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t('welcomePatient', { username: currentUser?.username })}</h2>
                    <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                        {t('patientDashboardReady')}
                    </p>
                 </>
            )}
        </div>
    );
}