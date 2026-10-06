import React from 'react';
import { ShieldCheck, ShieldAlert, EyeOff, Zap, Activity } from 'lucide-react';
import { StatsResponse } from '../types';

interface MetricCardsProps {
  stats: StatsResponse;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Scanned Prompts',
      value: stats.total_requests.toLocaleString(),
      subtext: 'Real-time proxy telemetry',
      icon: Activity,
      color: 'cyan',
      badge: 'Active 24/7',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40'
    },
    {
      title: 'Attacks Quarantined',
      value: stats.blocked_attacks.toLocaleString(),
      subtext: 'Jailbreaks & injections blocked',
      icon: ShieldAlert,
      color: 'rose',
      badge: 'Zero Breach',
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/40'
    },
    {
      title: 'PII Entities Redacted',
      value: stats.pii_entities_protected.toLocaleString(),
      subtext: 'Reversible synthetic tokens',
      icon: EyeOff,
      color: 'amber',
      badge: 'HIPAA & GDPR',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/40'
    },
    {
      title: 'Gateway Trust Index',
      value: `${stats.avg_trust_score}/100`,
      subtext: 'Explainable safety rating',
      icon: ShieldCheck,
      color: 'emerald',
      badge: stats.avg_trust_score >= 80 ? 'Optimal' : 'Guarded',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
    },
    {
      title: 'Inspection Latency',
      value: `${stats.avg_latency_ms} ms`,
      subtext: 'Sub-millisecond regex parsing',
      icon: Zap,
      color: 'indigo',
      badge: 'Ultra Fast',
      badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'rose':
        return {
          border: 'border-rose-900/30 hover:border-rose-700/50',
          bg: 'from-rose-950/20 to-slate-900/40',
          iconBg: 'bg-rose-900/30 text-rose-400 border border-rose-700/40',
          shadow: 'hover:shadow-rose-950/30'
        };
      case 'amber':
        return {
          border: 'border-amber-900/30 hover:border-amber-700/50',
          bg: 'from-amber-950/20 to-slate-900/40',
          iconBg: 'bg-amber-900/30 text-amber-400 border border-amber-700/40',
          shadow: 'hover:shadow-amber-950/30'
        };
      case 'emerald':
        return {
          border: 'border-emerald-900/30 hover:border-emerald-700/50',
          bg: 'from-emerald-950/20 to-slate-900/40',
          iconBg: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/40',
          shadow: 'hover:shadow-emerald-950/30'
        };
      case 'indigo':
        return {
          border: 'border-indigo-900/30 hover:border-indigo-700/50',
          bg: 'from-indigo-950/20 to-slate-900/40',
          iconBg: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700/40',
          shadow: 'hover:shadow-indigo-950/30'
        };
      case 'cyan':
      default:
        return {
          border: 'border-cyan-900/30 hover:border-cyan-700/50',
          bg: 'from-cyan-950/20 to-slate-900/40',
          iconBg: 'bg-cyan-900/30 text-cyan-400 border border-cyan-700/40',
          shadow: 'hover:shadow-cyan-950/30'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const theme = getColorClasses(card.color);
        const IconComponent = card.icon;

        return (
          <div
            key={i}
            className={`glass-panel rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 border ${theme.border} bg-gradient-to-br ${theme.bg} shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
              <div className={`p-2 rounded-lg ${theme.iconBg}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-medium text-slate-400">{card.title}</h3>
              <p className="text-2xl font-bold tracking-tight text-white font-mono">
                {card.value}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
