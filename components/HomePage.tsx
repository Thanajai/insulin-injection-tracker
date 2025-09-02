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
        <div className="text-center py-20 px-6 bg-zinc-800/30 backdrop-blur-lg border border-zinc-700/50 rounded-2xl shadow-lg shadow-black/20 mt-8 max-w-3xl mx-auto animate-fade-in">
            <SyringeIcon className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            
            {isDoctor ? (
                <>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">{t('welcomeDoctor', { username: currentUser?.username })}</h2>
                    {hasPatients ? (
                        <>
                            <p className="mt-4 text-lg text-zinc-400">
                                {t('selectPatientPrompt')}
                            </p>
                            <div className="mt-2 text-zinc-400 flex items-center justify-center space-x-2">
                                <span>{t('useSearchBarHint')}</span>
                                <ArrowUpRightIcon className="w-5 h-5" />
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={onAddPatient}
                                    className="inline-flex items-center space-x-2 bg-zinc-700/50 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105"
                                >
                                    <UserPlusIcon className="w-6 h-6" />
                                    <span>{t('orAddPatient')}</span>
                                </button>
                            </div>
                        </>
                    ) : (
                         <>
                            <p className="mt-4 text-lg text-zinc-400">
                                {t('getStartedPrompt')}
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={onAddPatient}
                                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
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
                    <h2 className="text-3xl font-bold text-zinc-100">{t('welcomePatient', { username: currentUser?.username })}</h2>
                    <p className="mt-4 text-lg text-zinc-400">
                        {t('patientDashboardReady')}
                    </p>
                 </>
            )}
        </div>
    );
}