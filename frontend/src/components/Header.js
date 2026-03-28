import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Search } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_8b258d09-2813-4c39-875f-1044b1a2ed97/artifacts/bnfmcn2l_rqVRL__1_-removebg-preview.png';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-2" data-testid="header-logo-link">
          <div className="w-8 h-8 bg-[#CC0000] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-heading text-[17px] font-bold text-[#0F172A] italic">discuss</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/feed">
                <Button variant="ghost" data-testid="header-feed-link"
                  className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${location.pathname === '/feed' ? 'bg-[#CC0000] text-white hover:bg-[#A30000]' : 'text-[#64748B] hover:bg-[#F0F4FA] hover:text-[#0F172A]'}`}>
                  Feed
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" data-testid="header-profile-link"
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-[#64748B] hover:bg-[#F0F4FA] hover:text-[#0F172A] flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" data-testid="header-login-btn" className="rounded-full px-4 py-1.5 text-[13px] font-medium text-[#64748B] hover:bg-[#F0F4FA] hover:text-[#0F172A]">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button data-testid="header-register-btn" className="bg-[#CC0000] hover:bg-[#A30000] text-white rounded-full px-4 py-1.5 text-[13px] font-semibold shadow-sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
