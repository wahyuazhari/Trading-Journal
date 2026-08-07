import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser } from '../../services/firebase';
import { LogIn, LogOut, Cloud, ShieldCheck, CheckCircle2, User as UserIcon, Lock, Sparkles, RefreshCw } from 'lucide-react';

interface AuthViewProps {
  user: User | null;
  onLoginSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ user }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled by user.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  if (user) {
    return (
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-11 h-11 rounded-full border-2 border-[#FF7A00] object-cover shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center text-[#FF7A00] shrink-0 font-bold">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                {user.displayName || 'Trader Account'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 font-semibold flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Cloud Synced
              </span>
            </div>
            <p className="text-xs text-[#8B8B8B] truncate font-mono">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-4 py-2 bg-[#202020] hover:bg-[#F44336]/20 hover:text-[#F44336] text-[#B8B8B8] rounded-xl text-xs font-bold border border-[#2D2D2D] hover:border-[#F44336]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#151515] border border-[#2D2D2D] rounded-[20px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle orange accent glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#FF7A00]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF7A00] to-[#FF8E26] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-[#FF7A00]/20 mb-3">
            <Cloud className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Account Cloud Sync
          </h2>
          <p className="text-xs sm:text-sm text-[#8B8B8B] max-w-xs mx-auto leading-relaxed">
            Log in with your Gmail account to access your trades & analysis from any device.
          </p>
        </div>

        {/* Feature List */}
        <div className="bg-[#111111] border border-[#2D2D2D] rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Google Cloud Firestore Storage</span>
              <span className="text-[#8B8B8B] text-[11px]">All trade entries and chart screenshots backed up securely.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Multi-Device Access</span>
              <span className="text-[#8B8B8B] text-[11px]">Seamless sync across desktop, laptop, tablet & mobile phone.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Account Privacy Secured</span>
              <span className="text-[#8B8B8B] text-[11px]">Strict user-isolated security rules protect your trading logs.</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#F44336]/15 border border-[#F44336]/40 text-[#F44336] rounded-xl text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          {isLoggingIn ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-gray-700" />
              <span>Connecting Google Account...</span>
            </>
          ) : (
            <>
              {/* Google Colored G Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-[#666666] font-mono">
          Powered by Firebase Authentication & Firestore
        </p>
      </div>
    </div>
  );
};
