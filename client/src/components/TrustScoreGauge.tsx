import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX, Info } from 'lucide-react';
import { TrustScoreBreakdown } from '../types';

interface TrustScoreGaugeProps {
  score: number;
  breakdown: TrustScoreBreakdown;
  decision: 'ALLOW' | 'SANITIZE_AND_FORWARD' | 'QUARANTINE_BLOCKED';
  piiCount: number;
  threatCount: number;
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({
  score,
  breakdown,
  decision,
  piiCount,
  threatCount
}) => {
  // Arc calculation for semi-circle gauge (radius = 80, circumference = pi * 80 ~= 251.3)
  const radius = 75;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = arcLength * (1 - clampedScore / 100);

  // Dynamic color theme
  let statusColor = 'text-emerald-400';
  let strokeGradientId = 'gauge-emerald';
  let badgeText = 'ALLOW';
  let badgeBg = 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
  let Icon = ShieldCheck;

  if (decision === 'QUARANTINE_BLOCKED' || score < 40) {
    statusColor = 'text-rose-400';
    strokeGradientId = 'gauge-rose';
    badgeText = 'QUARANTINE BLOCKED';
    badgeBg = 'bg-rose-950/80 border-rose-500/50 text-rose-300';
    Icon = ShieldX;
  } else if (decision === 'SANITIZE_AND_FORWARD' || score < 80) {
    statusColor = 'text-amber-400';
    strokeGradientId = 'gauge-amber';
    badgeText = 'SANITIZE & FORWARD';
    badgeBg = 'bg-amber-950/80 border-amber-500/50 text-amber-300';
    Icon = AlertTriangle;
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between h-full">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            EXPLAINABLE TRUST & SAFETY INDEX
          </h2>
          <p className="text-xs text-slate-400">Zero-Trust Realtime Gateway Scoring</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${badgeBg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>
      </div>

      {/* SVG Semi-Circle Gauge */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div className="relative w-52 h-28 flex items-end justify-center">
          <svg className="w-52 h-52 overflow-visible" viewBox="0 0 180 100">
            <defs>
              <linearGradient id="gauge-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="gauge-amber" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="gauge-rose" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 15 90 A 75 75 0 0 1 165 90"
              fill="none"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Animated Value Arc */}
            <path
              d="M 15 90 A 75 75 0 0 1 165 90"
              fill="none"
              stroke={`url(#${strokeGradientId})`}
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Central Score Display */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-extrabold font-mono tracking-tight ${statusColor}`}>
              {clampedScore}
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-widest uppercase">
              Score out of 100
            </span>
          </div>
        </div>

        {/* Explainability Callout */}
        <p className="text-xs text-slate-300 mt-3 text-center px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-800 leading-relaxed">
          {breakdown.explanation}
        </p>
      </div>

      {/* Deduction Penalties Breakdown */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Deduction Breakdown</span>
          <span className="text-slate-400">Baseline 100 pts</span>
        </div>

        {/* Injection penalty */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Adversarial Injection Risk</span>
            <span className="font-mono text-rose-400 font-medium">
              -{breakdown.injection_penalty} pts
            </span>
          </div>
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (breakdown.injection_penalty / 40) * 100)}%` }}
            />
          </div>
        </div>

        {/* PII Exposure penalty */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">PII Exposure Density</span>
            <span className="font-mono text-amber-400 font-medium">
              -{breakdown.pii_penalty} pts
            </span>
          </div>
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (breakdown.pii_penalty / 30) * 100)}%` }}
            />
          </div>
        </div>

        {/* Anomaly penalty */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Heuristic / Anomaly Markers</span>
            <span className="font-mono text-cyan-400 font-medium">
              -{breakdown.anomaly_penalty} pts
            </span>
          </div>
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (breakdown.anomaly_penalty / 30) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Threat Radar Badges */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-400">Injection Shield</p>
          <p className={`text-xs font-bold font-mono mt-0.5 ${threatCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {threatCount === 0 ? 'SAFE' : `${threatCount} THREATS`}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-400">PII Vault</p>
          <p className={`text-xs font-bold font-mono mt-0.5 ${piiCount === 0 ? 'text-slate-300' : 'text-amber-400'}`}>
            {piiCount === 0 ? 'NONE' : `${piiCount} REDACTED`}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-400">Policy Verdict</p>
          <p className="text-xs font-bold font-mono mt-0.5 text-cyan-400">
            COMPLIANT
          </p>
        </div>
      </div>
    </div>
  );
};
