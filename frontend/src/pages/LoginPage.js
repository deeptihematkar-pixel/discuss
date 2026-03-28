import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, XCircle } from 'lucide-react';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Email is required');
    if (!password) return setError('Password is required');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = async () => {
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={LOGO_URL} alt="Discuss" className="h-14 mx-auto mb-4" data-testid="login-logo" />
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F172A]">Welcome back</h1>
          <p className="text-[#64748B] text-[13px] md:text-[15px] mt-1">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 md:p-8">
          {error && (
            <div data-testid="login-error" className="bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-md p-3 text-[#EF4444] text-[13px] mb-4 flex items-start gap-2">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="button"
            data-testid="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] rounded-md py-2.5 font-medium shadow-sm flex items-center justify-center gap-2.5 mb-5"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><GoogleIcon /> Continue with Google</>}
          </Button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-[#64748B]">or sign in with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="login-email-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="mt-1.5 bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  data-testid="login-password-input"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-md pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              data-testid="login-submit-btn"
              disabled={loading}
              className="w-full bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md py-2.5 font-medium shadow-sm mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-[#64748B] text-[13px] mt-5">
            Don't have an account?{' '}
            <Link to="/register" data-testid="login-to-register-link" className="text-[#3B82F6] hover:text-[#2563EB] font-medium">Sign up</Link>
          </p>
        </div>
        <p data-testid="login-managed-by" className="text-center text-[#64748B] text-xs mt-6">
          Managed by <span className="font-semibold text-[#CC0000]">&lt;discuss&gt;</span>
        </p>
      </div>
    </div>
  );
}
