import React from 'react';
import { Palette, ShieldCheck, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-dark-bg/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => onChangeView('HOME')}
          >
            <div className="bg-gradient-to-tr from-brand-500 to-purple-500 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-serif tracking-wide text-white">
              DESIGN<span className="text-brand-500">PRO</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentView === 'ADMIN_DASHBOARD' ? (
              <button
                onClick={() => onChangeView('HOME')}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Chiqish
              </button>
            ) : (
              <button
                onClick={() => onChangeView('ADMIN_LOGIN')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Admin Login"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
