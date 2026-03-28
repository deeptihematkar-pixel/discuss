import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_8b258d09-2813-4c39-875f-1044b1a2ed97/artifacts/bnfmcn2l_rqVRL__1_-removebg-preview.png';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) return setError('Username is required');
    if (username.trim().length < 2) return setError('Username must be at least 2 characters');
    if (!email.trim()) return setError('Email is required');
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div data-testid="register-error" className="bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-md p-3 text-[#EF4444] text-[13px]">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="username" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">Username</Label>
              <Input
                id="username"
                data-testid="register-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="mt-1.5 bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="register-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            </div>
            <Button
              type="submit"
              data-testid="register-submit-btn"
              disabled={loading}
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
      </div>
    </div>
  );
}
