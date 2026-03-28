import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_8b258d09-2813-4c39-875f-1044b1a2ed97/artifacts/bnfmcn2l_rqVRL__1_-removebg-preview.png';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Real-time validation states
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [emailStatus, setEmailStatus] = useState(null);
  const usernameTimer = useRef(null);
  const emailTimer = useRef(null);
  
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Real-time username check
  useEffect(() => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (!username.trim()) { setUsernameStatus(null); return; }
    if (username.trim().length < 2) { setUsernameStatus('invalid'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setUsernameStatus('invalid'); return; }
    
    setUsernameStatus('checking');
    usernameTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/auth/check-username/${username.trim()}`);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
  }, [username]);

  // Real-time email check
  useEffect(() => {
    if (emailTimer.current) clearTimeout(emailTimer.current);
    if (!email.trim()) { setEmailStatus(null); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) { setEmailStatus('invalid'); return; }
    
    setEmailStatus('checking');
    emailTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/auth/check-email/${email.trim()}`);
        setEmailStatus(data.available ? 'available' : 'taken');
      } catch {
        setEmailStatus(null);
      }
    }, 500);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) return setError('Username is required');
    if (username.trim().length < 2) return setError('Username must be at least 2 characters');
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return setError('Username can only contain letters, numbers, and underscores');
    if (usernameStatus === 'taken') return setError(`Username "${username}" is already taken`);
    if (!email.trim()) return setError('Email is required');
    if (emailStatus === 'taken') return setError('This email is already registered');
    if (!password) return setError('Password is required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPw) return setError('Passwords do not match');

    setLoading(true);
    const result = await register(username.trim(), email.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) {
      navigate('/feed');
    } else if (result.error) {
      setError(result.error);
    }
  };

  const renderFieldStatus = (status, messages) => {
    if (!status) return null;
    if (status === 'checking') return <span className="text-[#64748B] text-xs flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Checking...</span>;
    if (status === 'available') return <span className="text-[#10B981] text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {messages?.available || 'Available'}</span>;
    if (status === 'taken') return <span className="text-[#EF4444] text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> {messages?.taken || 'Already taken'}</span>;
    if (status === 'invalid') return <span className="text-[#F59E0B] text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {messages?.invalid || 'Invalid'}</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={LOGO_URL} alt="Discuss" className="h-14 mx-auto mb-4" data-testid="register-logo" />
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F172A]">Create your account</h1>
          <p className="text-[#64748B] text-[13px] md:text-[15px] mt-1">Join the community today</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 md:p-8">
          {error && (
            <div data-testid="register-error" className="bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-md p-3 text-[#EF4444] text-[13px] mb-4 flex items-start gap-2">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="button"
            data-testid="register-google-btn"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] rounded-md py-2.5 font-medium shadow-sm flex items-center justify-center gap-2.5 mb-5"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><GoogleIcon /> Continue with Google</>}
          </Button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-[#64748B]">or sign up with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="username" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">Username</Label>
                {renderFieldStatus(usernameStatus, {
                  available: 'Username is available!',
                  taken: `"${username}" is taken`,
                  invalid: 'Letters, numbers, _ only (min 2)'
                })}
              </div>
              <Input
                id="username"
                data-testid="register-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className={`mt-1.5 bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-md ${
                  usernameStatus === 'taken' ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20' :
                  usernameStatus === 'available' ? 'border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20' : ''
                }`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">Email</Label>
                {renderFieldStatus(emailStatus, {
                  available: 'Email is available!',
                  taken: 'Email already registered',
                  invalid: 'Enter a valid email'
                })}
              </div>
              <Input
                id="email"
                type="email"
                data-testid="register-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`mt-1.5 bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-md ${
                  emailStatus === 'taken' ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20' :
                  emailStatus === 'available' ? 'border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20' : ''
                }`}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  data-testid="register-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-md pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && password.length < 6 && (
                <span className="text-[#F59E0B] text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> At least 6 characters needed</span>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPw" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">Confirm Password</Label>
              <Input
                id="confirmPw"
                type="password"
                data-testid="register-confirm-password-input"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat your password"
                className="mt-1.5 bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-md"
              />
              {confirmPw && password !== confirmPw && (
                <span className="text-[#EF4444] text-xs mt-1 flex items-center gap-1"><XCircle className="w-3 h-3" /> Passwords do not match</span>
              )}
            </div>
            <Button
              type="submit"
              data-testid="register-submit-btn"
              disabled={loading || usernameStatus === 'taken' || emailStatus === 'taken'}
              className="w-full bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md py-2.5 font-medium shadow-sm mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-[#64748B] text-[13px] mt-5">
            Already have an account?{' '}
            <Link to="/login" data-testid="register-to-login-link" className="text-[#3B82F6] hover:text-[#2563EB] font-medium">Sign in</Link>
          </p>
        </div>
        <p data-testid="register-managed-by" className="text-center text-[#64748B] text-xs mt-6">
          Managed by <span className="font-semibold text-[#CC0000]">&lt;discuss&gt;</span>
        </p>
      </div>
    </div>
  );
}
