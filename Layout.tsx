import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdminPath = location.pathname.startsWith('/admin');

  const navLinks = [
    { path: '/', label: 'Catalog' },
    { path: '/enquiry', label: 'Enquiry' },
    { path: '/admin', label: 'Admin', active: isAdminPath }
  ];

  return (
    <div className="min-h-screen bg-brand-100 text-brand-900 font-sans">
      <nav className="bg-brand-950 text-white sticky top-0 z-[100] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMenuOpen(false)}>
              <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tighter">REALTY<span className="text-accent-400">FLOW</span></span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] uppercase tracking-[0.2em] font-bold transition-all",
                    (link.active || location.pathname === link.path) 
                      ? "bg-accent-600/10 text-accent-400 border border-accent-400/20" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-900 border-t border-brand-800"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "px-6 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-bold transition-all flex justify-between items-center",
                      (link.active || location.pathname === link.path) 
                        ? "bg-accent-600 text-white shadow-lg shadow-accent-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-brand-800/50"
                    )}
                  >
                    {link.label}
                    <Building2 className={cn("w-4 h-4 opacity-50", (link.active || location.pathname === link.path) ? "opacity-100" : "group-hover:opacity-100")} />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>{children}</main>

      <footer className="bg-brand-950 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter mb-2">REALTY<span className="text-accent-400">FLOW</span></h1>
              <p className="text-slate-400 text-sm max-w-sm">Professional real estate solutions for modern developers. Streamlining connections between vision and residence.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Platform</p>
                <div className="flex flex-col gap-2 text-sm text-slate-300">
                  <Link to="/" className="hover:text-accent-400 transition-colors">Catalog</Link>
                  <Link to="/enquiry" className="hover:text-accent-400 transition-colors">Enquiry</Link>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Legal</p>
                <div className="flex flex-col gap-2 text-sm text-slate-300">
                  <a href="#" className="hover:text-accent-400 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-accent-400 transition-colors">Terms</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest text-center">
            © 2024 RealtyFlow Developer Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
