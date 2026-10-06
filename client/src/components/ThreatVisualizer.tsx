import React from 'react';
import { AlertCircle, ShieldAlert, Key, Mail, Phone, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { ThreatVector, DetectedEntity } from '../types';

interface ThreatVisualizerProps {
  threats: ThreatVector[];
  entities: DetectedEntity[];
  tokenMap: Record<string, string>;
}

export const ThreatVisualizer: React.FC<ThreatVisualizerProps> = ({
  threats,
  entities,
  tokenMap
}) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/60';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-300 border-orange-600/60';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/60';
      case 'LOW':
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-600/60';
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-cyan-400" />;
      case 'PHONE':
        return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'API_KEY':
        return <Key className="w-3.5 h-3.5 text-rose-400" />;
      case 'SSN':
      case 'CREDIT_CARD':
        return <Lock className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Threat Vectors Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Adversarial Threat Signatures
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
            {threats.length} Detected
          </span>
        </div>

        {threats.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-300">Clean Payload Signature</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              No prompt injection, jailbreak keywords, or unauthorized system leakage attempts found.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {threats.map((threat, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {threat.category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getSeverityBadge(
                      threat.severity
                    )}`}
                  >
                    {threat.severity}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-cyan-300/90 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 mb-1.5">
                  Matched Trigger: &quot;{threat.matched_pattern}&quot;
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {threat.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Detected PII / PHI Entities Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              PII Vault & Tokenization Map
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
            {entities.length} Masked
          </span>
        </div>

        {entities.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-10 h-10 rounded-full bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-300">No Sensitive PII Exposed</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Zero emails, SSNs, credit cards, or confidential secrets intercepted in this prompt.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {entities.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                    {getEntityIcon(item.entity_type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {item.token}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.entity_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Original: <span className="text-slate-300 font-mono blur-[2px] hover:blur-none transition-all cursor-pointer">{item.original_value}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                    {(item.confidence * 100).toFixed(0)}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
