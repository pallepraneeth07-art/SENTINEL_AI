import React from 'react';
import { Shield, ShieldAlert, Activity, Terminal, ExternalLink, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface NavbarProps {
  backendOnline: boolean | null;
  onRefreshHealth: () => void;
  isCheckingHealth: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendOnline,
  onRefreshHealth,
  isCheckingHealth
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SENTINEL<span className="text-cyan-400">-AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                v1.0 Gateway
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-Trust AI Privacy, PII Tokenizer & Jailbreak Firewall
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Health Status Pill */}
          <div 
            onClick={onRefreshHealth}
            title={`Backend URL: ${API_BASE_URL} (Click to re-ping)`}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all text-xs"
          >
            <span className="relative flex h-2 w-2">
              {backendOnline === true ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : backendOnline === false ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
              )}
            </span>
            <span className="font-medium text-slate-300 hidden md:inline">Gateway:</span>
            <span className={`font-semibold ${backendOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {backendOnline ? 'Render API Online' : 'Client Mode / Standby'}
            </span>
            <RefreshCw className={`w-3 h-3 text-slate-400 ml-1 ${isCheckingHealth ? 'animate-spin' : ''}`} />
          </div>

          {/* Zero-Trust Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-medium">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Trust Enforced</span>
          </div>

          {/* Quick API Docs Link */}
          <a
            href={`${API_BASE_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-xs font-medium"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>FastAPI Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>
    </header>
  );
};
