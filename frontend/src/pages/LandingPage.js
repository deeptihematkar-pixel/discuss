import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Share2, Heart, Users, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_8b258d09-2813-4c39-875f-1044b1a2ed97/artifacts/bnfmcn2l_rqVRL__1_-removebg-preview.png';

const features = [
  { icon: MessageSquare, title: 'Rich Discussions', desc: 'Start meaningful conversations with the community. Share your thoughts and ideas.' },
  { icon: Share2, title: 'Project Sharing', desc: 'Showcase your projects with GitHub links and live previews for instant feedback.' },
  { icon: Heart, title: 'Real-time Engagement', desc: 'Like, comment, and interact — everything updates instantly across all users.' },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up in seconds with just a username, email and password.' },
  { num: '02', title: 'Join the Feed', desc: 'Browse discussions and projects from the community in real time.' },
  { num: '03', title: 'Start Sharing', desc: 'Post discussions, share projects, and engage with other members.' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 md:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/3 via-transparent to-[#3B82F6]/3" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#CC0000]/8 border border-[#CC0000]/15 rounded-full px-4 py-1.5 mb-6">
                <Zap className="w-3.5 h-3.5 text-[#CC0000]" />
                <span className="text-[12px] font-semibold text-[#CC0000] tracking-wide uppercase">Real-time Platform</span>
              </div>
              <h1 data-testid="hero-title" className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight font-bold text-[#0F172A] leading-[1.1]">
                Where Developers
                <span className="block text-[#CC0000]">Discuss & Share</span>
              </h1>
              <p className="mt-5 text-[#64748B] text-[13px] md:text-[15px] leading-relaxed max-w-lg mx-auto lg:mx-0">
                A modern discussion platform built for developers. Share your projects, start conversations, and connect with a vibrant community — all in real time.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {user ? (
                  <Link to="/feed">
                    <Button data-testid="hero-go-to-feed" className="bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md px-6 py-2.5 font-medium shadow-sm">
                      Go to Feed <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button data-testid="hero-register-btn" className="bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md px-6 py-2.5 font-medium shadow-sm">
                        Get Started <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button data-testid="hero-login-btn" variant="outline" className="border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] rounded-md px-6 py-2.5 font-medium">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 max-w-md lg:max-w-lg">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#CC0000]/5 rounded-2xl blur-2xl" />
                <img 
                  src={LOGO_URL} 
                  alt="Discuss Logo" 
                  className="relative w-full max-w-xs mx-auto drop-shadow-lg"
                  data-testid="hero-logo"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-tight">
              Everything you need
            </h2>
            <p className="mt-3 text-[#64748B] text-[13px] md:text-[15px]">Built for developers who want to connect, share, and grow together.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} data-testid={`feature-card-${i}`} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#3B82F6]/30 transition-all duration-200 group">
                <div className="w-11 h-11 rounded-lg bg-[#CC0000]/8 flex items-center justify-center mb-4 group-hover:bg-[#CC0000]/15 transition-colors">
                  <f.icon className="w-5 h-5 text-[#CC0000]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{f.title}</h3>
                <p className="text-[#64748B] text-[13px] md:text-[15px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 md:px-8 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-tight">
              How it works
            </h2>
            <p className="mt-3 text-[#64748B] text-[13px] md:text-[15px]">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} data-testid={`step-card-${i}`} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#CC0000] text-white font-bold text-lg mb-5 shadow-lg shadow-[#CC0000]/20">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{s.title}</h3>
                <p className="text-[#64748B] text-[13px] md:text-[15px] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div className="w-10 h-10 rounded-full bg-[#CC0000]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#10B981]" />
            </div>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F172A] mb-4">
            Ready to join the conversation?
          </h2>
          <p className="text-[#64748B] text-[13px] md:text-[15px] mb-8">Join developers from around the world in sharing knowledge and projects.</p>
          {!user && (
            <Link to="/register">
              <Button data-testid="cta-register-btn" className="bg-[#CC0000] text-white hover:bg-[#A30000] rounded-md px-8 py-3 font-medium shadow-sm text-base">
                Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Discuss" className="h-7" />
          </div>
          <p className="text-[#64748B] text-xs">&copy; {new Date().getFullYear()} Discuss. Built for developers.</p>
        </div>
      </footer>
    </div>
  );
}
