import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 
                   ${isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                <span className="font-heading font-bold text-xl">NAS</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/dashboard" className="nav-link">
                Dashboard
              </a>
              <a href="/beneficiaries" className="nav-link">
                Beneficiaries
              </a>
              <a href="/disbursements" className="nav-link">
                Disbursements
              </a>
              <a href="/reports" className="nav-link">
                Reports
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <a href="/dashboard" className="nav-link block">
                Dashboard
              </a>
              <a href="/beneficiaries" className="nav-link block">
                Beneficiaries
              </a>
              <a href="/disbursements" className="nav-link block">
                Disbursements
              </a>
              <a href="/reports" className="nav-link block">
                Reports
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-heading font-semibold mb-4">About NAS</h3>
              <p className="text-sm text-muted-foreground">
                Secure Aid Network System - Empowering transparent and efficient aid distribution.
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/help" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">support@nas.com</li>
                <li className="text-muted-foreground">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} NAS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 