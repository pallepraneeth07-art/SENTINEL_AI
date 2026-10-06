import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogsTableProps {
  logs: AuditLogEntry[];
  onRefresh: () => void;
  onClear: () => void;
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  logs,
  onRefresh,
  onClear
}) => {
  const [filterDecision, setFilterDecision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filterDecision === 'ALL' || log.decision === filterDecision;
    const matchesSearch =
      searchQuery === '' ||
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.client_ip_hash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'QUARANTINE_BLOCKED':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'SANITIZE_AND_FORWARD':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'ALLOW':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    }
  };

  const exportToJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
      {/* Table Header and Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Tamper-Evident Security Telemetry Trail
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable audit record of intercepted prompts, hashes, decisions, and execution latency
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs or hash..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Filter Pills */}
          <select
            value={filterDecision}
            onChange={e => setFilterDecision(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Decisions</option>
            <option value="QUARANTINE_BLOCKED">Quarantined</option>
            <option value="SANITIZE_AND_FORWARD">Sanitized</option>
            <option value="ALLOW">Allowed</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Refresh logs"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Export button */}
          <button
            onClick={exportToJson}
            title="Export JSON"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear button */}
          <button
            onClick={onClear}
            title="Clear in-memory logs"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Event ID / Time</th>
              <th className="py-3 px-4">Client Hash</th>
              <th className="py-3 px-4">Action Taken</th>
              <th className="py-3 px-4 text-center">Threats</th>
              <th className="py-3 px-4 text-center">PII Masked</th>
              <th className="py-3 px-4 text-center">Trust Index</th>
              <th className="py-3 px-4 text-right">Latency</th>
              <th className="py-3 px-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No telemetry audit logs matching your current filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const isExpanded = expandedLogId === log.id;
                const formattedTime = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });

                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-white font-medium">{log.id}</div>
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formattedTime}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {log.client_ip_hash}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getDecisionBadge(
                            log.decision
                          )}`}
                        >
                          {log.decision}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span
                          className={
                            log.threat_count > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
                          }
                        >
                          {log.threat_count}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span
                          className={
                            log.pii_count > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'
                          }
                        >
                          {log.pii_count}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span
                          className={
                            log.trust_score < 40
                              ? 'text-rose-400 font-bold'
                              : log.trust_score < 80
                              ? 'text-amber-400 font-bold'
                              : 'text-emerald-400 font-bold'
                          }
                        >
                          {log.trust_score}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300 text-[11px]">
                        {log.latency_ms} ms
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90">
                        <td colSpan={8} className="p-4 border-t border-slate-800 space-y-3">
                          <div className="text-xs text-slate-300 font-medium">
                            <span className="text-cyan-400 font-mono">Summary: </span>
                            {log.summary}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                              <span className="text-slate-400 block mb-1 font-sans text-xs">
                                Original Input Preview:
                              </span>
                              <p className="text-slate-300 truncate">
                                {log.original_prompt_preview || 'N/A'}
                              </p>
                            </div>

                            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                              <span className="text-slate-400 block mb-1 font-sans text-xs">
                                Sanitized / Blocked Preview:
                              </span>
                              <p className="text-slate-300 truncate">
                                {log.sanitized_prompt_preview || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
