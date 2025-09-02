import React, { useState } from 'react';
import type { User, Role } from '../types';
import { SyringeIcon } from './icons';
import { useTranslation } from './LanguageProvider';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register';

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Patient');
  const [doctorUsername, setDoctorUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const getUsers = (): User[] => {
    try {
      const users = localStorage.getItem('insulin_tracker_users');
      return users ? JSON.parse(users) : [];
    } catch (e) {
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('insulin_tracker_users', JSON.stringify(users));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const users = getUsers();

    if (!username.trim() || !password.trim()) {
        setError(t('errorEmptyFields'));
        return;
    }
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError(t('errorUsernameExists'));
      return;
    }
    if (role === 'Patient') {
      if (!doctorUsername.trim()) {
        setError(t('errorPatientNeedsDoctor'));
        return;
      }
      const doctorExists = users.find(u => u.username.toLowerCase() === doctorUsername.toLowerCase() && u.role === 'Doctor');
      if (!doctorExists) {
        setError(t('errorDoctorNotFound'));
        return;
      }
    }

    const newUser: User = { username, password, role, doctorUsername: role === 'Patient' ? doctorUsername : undefined };
    saveUsers([...users, newUser]);
    onLoginSuccess(newUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user && user.password === password) {
      onLoginSuccess(user);
    } else {
      setError(t('errorInvalidCredentials'));
    }
  };

  const formInputClasses = "w-full px-4 py-2 bg-zinc-900/50 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 outline-none transition-all";
  const formLabelClasses = "block text-sm font-medium text-zinc-300 mb-1";


  const formToRender = mode === 'login' ? (
    <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="username" className={formLabelClasses}>{t('username')}</label>
        <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className={formInputClasses} />
      </div>
      <div>
        <label htmlFor="password"  className={formLabelClasses}>{t('password')}</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className={formInputClasses} />
      </div>
      <button type="submit" className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105">{t('login')}</button>
    </form>
  ) : (
    <form onSubmit={handleRegister} className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="reg-username"  className={formLabelClasses}>{t('username')}</label>
        <input id="reg-username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className={formInputClasses} />
      </div>
      <div>
        <label htmlFor="reg-password"  className={formLabelClasses}>{t('password')}</label>
        <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className={formInputClasses} />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">{t('iAmA')}</label>
        <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input type="radio" name="role" value="Patient" checked={role === 'Patient'} onChange={() => setRole('Patient')} className="form-radio text-blue-500 bg-zinc-700 border-zinc-600 focus:ring-blue-500/70" />
              <span className="text-zinc-200">{t('patient')}</span>
            </label>
             <label className="flex items-center space-x-2">
              <input type="radio" name="role" value="Doctor" checked={role === 'Doctor'} onChange={() => setRole('Doctor')} className="form-radio text-blue-500 bg-zinc-700 border-zinc-600 focus:ring-blue-500/70" />
              <span className="text-zinc-200">{t('doctor')}</span>
            </label>
        </div>
      </div>
      {role === 'Patient' && (
        <div className="animate-fade-in">
          <label htmlFor="doctor-username" className={formLabelClasses}>{t('doctorUsername')}</label>
          <input id="doctor-username" type="text" value={doctorUsername} onChange={e => setDoctorUsername(e.target.value)} required className={formInputClasses} />
        </div>
      )}
      <button type="submit" className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105">{t('register')}</button>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <SyringeIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-zinc-100">{t('insulinTracker')}</h1>
            </div>

            <div className="bg-zinc-800/30 backdrop-blur-lg border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8">
                <div className="flex border-b border-zinc-700/50 mb-6">
                    <button onClick={() => { setMode('login'); setError(null); }} className={`flex-1 py-3 text-center font-semibold transition-colors ${mode === 'login' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
                        {t('login')}
                    </button>
                    <button onClick={() => { setMode('register'); setError(null); }} className={`flex-1 py-3 text-center font-semibold transition-colors ${mode === 'register' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
                        {t('register')}
                    </button>
                </div>

                {error && <p className="text-sm text-red-400 mb-4 text-center animate-shake" role="alert">{error}</p>}
                
                {formToRender}
            </div>
        </div>
    </div>
  );
};