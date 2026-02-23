import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalView = 'signin' | 'signup' | 'forgot' | 'verify' | 'reset-sent';

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [view, setView] = useState<ModalView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => { setEmail(''); setPassword(''); setFullName(''); setConfirmPassword(''); setError(''); setShowPassword(false); };
  const switchView = (v: ModalView) => { resetForm(); setView(v); };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err.message); setIsLoading(false); }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true); setError('');
    const { error: err } = await signInWithEmail(email, password);
    setIsLoading(false);
    if (err) {
      if (err.message.includes('Invalid login')) setError('Invalid email or password');
      else if (err.message.includes('Email not confirmed')) setError('Please verify your email first. Check your inbox.');
      else setError(err.message);
    } else {
      onSuccess?.();
      onClose();
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true); setError('');
    const { error: err, needsVerification } = await signUpWithEmail(email, password, fullName);
    setIsLoading(false);
    if (err) {
      if (err.message.includes('already registered')) setError('This email is already registered. Try signing in.');
      else setError(err.message);
    } else if (needsVerification) {
      setView('verify');
    } else {
      onSuccess?.();
      onClose();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setIsLoading(true); setError('');
    const { error: err } = await resetPassword(email);
    setIsLoading(false);
    if (err) setError(err.message);
    else setView('reset-sent');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/50 w-full max-w-md shadow-2xl shadow-purple-500/10" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(view !== 'signin' && view !== 'signup') && (
              <button onClick={() => switchView('signin')} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors mr-1">
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">RedFace</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Email Verification Success */}
          {view === 'verify' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-sm text-gray-400 mb-1">We sent a verification link to</p>
              <p className="text-sm font-medium text-purple-400 mb-4">{email}</p>
              <p className="text-xs text-gray-500 mb-6">Click the link in the email to verify your account, then come back and sign in.</p>
              <button onClick={() => switchView('signin')} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all">
                Back to Sign In
              </button>
            </div>
          )}

          {/* Password Reset Sent */}
          {view === 'reset-sent' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Reset link sent</h2>
              <p className="text-sm text-gray-400 mb-1">We sent a password reset link to</p>
              <p className="text-sm font-medium text-purple-400 mb-4">{email}</p>
              <p className="text-xs text-gray-500 mb-6">Check your email and follow the link to reset your password.</p>
              <button onClick={() => switchView('signin')} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all">
                Back to Sign In
              </button>
            </div>
          )}

          {/* Forgot Password */}
          {view === 'forgot' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-1">Reset password</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link</p>
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                {error && <div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}</div>}
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {/* Sign In */}
          {view === 'signin' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500 mb-6">Sign in to your creative workspace</p>
              <button onClick={handleGoogleSignIn} disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </button>
              <p className="text-[10px] text-gray-600 text-center mt-2">Your content is saved to Google Drive</p>
              <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-gray-800" /><span className="text-xs text-gray-600">or</span><div className="flex-1 h-px bg-gray-800" /></div>
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Password"
                    className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => switchView('forgot')} className="text-xs text-purple-400 hover:text-purple-300">Forgot password?</button>
                </div>
                {error && <div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}</div>}
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? 'Signing in...' : 'Sign In'} {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                Don't have an account?{' '}
                <button onClick={() => switchView('signup')} className="text-purple-400 font-medium hover:text-purple-300">Sign up</button>
              </p>
            </>
          )}

          {/* Sign Up */}
          {view === 'signup' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
              <p className="text-sm text-gray-500 mb-6">Start creating with AI in seconds</p>
              <button onClick={handleGoogleSignIn} disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Connecting...' : 'Sign up with Google'}
              </button>
              <p className="text-[10px] text-gray-600 text-center mt-2">Your content is saved to Google Drive</p>
              <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-gray-800" /><span className="text-xs text-gray-600">or</span><div className="flex-1 h-px bg-gray-800" /></div>
              <form onSubmit={handleEmailSignUp} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); setError(''); }} placeholder="Full name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Password (min 6 characters)"
                    className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }} placeholder="Confirm password"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                {error && <div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}</div>}
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? 'Creating account...' : 'Create Account'} {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <p className="text-xs text-gray-600 text-center mt-3">By signing up, you agree to our Terms of Service and Privacy Policy</p>
              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{' '}
                <button onClick={() => switchView('signin')} className="text-purple-400 font-medium hover:text-purple-300">Sign in</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
