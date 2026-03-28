import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_8b258d09-2813-4c39-875f-1044b1a2ed97/artifacts/bnfmcn2l_rqVRL__1_-removebg-preview.png';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-2" data-testid="header-logo-link">
          <img src={LOGO_URL} alt="Discuss" className="h-8" />
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/feed">
                <Button
                  variant={location.pathname === '/feed' ? 'default' : 'ghost'}
                  data-testid="header-feed-link"
                  className={location.pathname === '/feed' ? 'bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md px-3 py-1.5 text-[13px] font-medium' : 'hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] rounded-md px-3 py-1.5 text-[13px]'}
                >
                  Feed
                </Button>
              </Link>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  data-testid="header-profile-link"
                  className="hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] rounded-md px-3 py-1.5 text-[13px] flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button data-testid="header-login-btn" variant="ghost" className="hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] rounded-md px-3 py-1.5 text-[13px] font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button data-testid="header-register-btn" className="bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md px-3 py-1.5 text-[13px] font-medium shadow-sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
