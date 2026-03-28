import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { User, Calendar, FileText, LogOut, Loader2, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.get(`/users/${user.id}/stats`).then(({ data }) => setStats(data)).catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/');
  };

  const formatDate = (iso) => {
    if (!iso) return 'Unknown';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <div className="max-w-lg mx-auto px-4 md:px-8 py-10">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 md:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#CC0000]/10 flex items-center justify-center mb-4">
              <User className="w-9 h-9 text-[#CC0000]" />
            </div>
            <h1 data-testid="profile-username" className="font-heading text-2xl font-bold text-[#0F172A]">{user?.username}</h1>
            <p data-testid="profile-email" className="text-[#64748B] text-[13px] md:text-[15px]">{user?.email}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
              <Calendar className="w-5 h-5 text-[#3B82F6]" />
              <div>
                <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[#64748B]">Member since</p>
                <p data-testid="profile-created-at" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">{formatDate(user?.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
              <FileText className="w-5 h-5 text-[#3B82F6]" />
              <div>
                <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[#64748B]">Total posts</p>
                <p data-testid="profile-post-count" className="text-[#0F172A] text-[13px] md:text-[15px] font-medium">
                  {stats ? stats.post_count : <Loader2 className="w-4 h-4 animate-spin inline" />}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F1F5F9] rounded-lg p-3 mb-6 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#64748B]" />
            <p data-testid="profile-password-notice" className="text-[#64748B] text-[13px]">Password change is not possible for now.</p>
          </div>

          <Button
            data-testid="profile-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] rounded-md py-2.5 font-medium"
          >
            {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogOut className="w-4 h-4 mr-2" /> Logout</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
