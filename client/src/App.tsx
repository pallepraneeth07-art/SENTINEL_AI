import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { LiveInspector } from './components/LiveInspector';
import { TrustScoreGauge } from './components/TrustScoreGauge';
import { ThreatVisualizer } from './components/ThreatVisualizer';
import { AuditLogsTable } from './components/AuditLogsTable';
import {
  checkHealth,
  scanPrompt,
  getAuditLogs,
  getStats,
  clearAuditLogs,
  API_BASE_URL
} from './services/api';
import { ScanResponse, AuditLogEntry, StatsResponse } from './types';
import { ShieldCheck, Cloud, Cpu, ArrowUpRight } from 'lucide-react';

export const App: React.FC = () => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<StatsResponse>({
    total_requests: 3,
    blocked_attacks: 1,
    sanitized_requests: 1,
    allowed_requests: 1,
    pii_entities_protected: 2,
    avg_trust_score: 66.7,
    avg_latency_ms: 0.98
  });

  const refreshHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    const health = await checkHealth();
    setBackendOnline(health !== null);
    setIsCheckingHealth(false);
  }, []);

  const refreshLogsAndStats = useCallback(async () => {
    const [fetchedLogs, fetchedStats] = await Promise.all([
      getAuditLogs(),
      getStats()
    ]);
    setAuditLogs(fetchedLogs);
    setStats(fetchedStats);
  }, []);

  // Initial dashboard boot
  useEffect(() => {
    refreshHealth();
    refreshLogsAndStats();

    // Trigger an initial sample scan to populate live visuals smoothly
    const initialPrompt = `Patient named Dr. Robert Taylor consulted for cardiology.\nPrimary Contact: robert.taylor@mayoclinic.org, Phone: (555) 234-5678.\nPatient SSN: 456-78-1234. Diagnosis summary: Mild hypertension prescribed Lisinopril 10mg daily.`;
    scanPrompt(initialPrompt).then(res => {
      setScanResult(res);
    });
  }, [refreshHealth, refreshLogsAndStats]);

  const handleScan = async (prompt: string) => {
    setLoading(true);
    try {
      const result = await scanPrompt(prompt);
      setScanResult(result);
      // Refresh telemetry
      await refreshLogsAndStats();
    } catch (err) {
      console.error('Scan execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    await clearAuditLogs();
    await refreshLogsAndStats();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100">
      {/* Top Navigation */}
      <Navbar
        backendOnline={backendOnline}
        onRefreshHealth={refreshHealth}
        isCheckingHealth={isCheckingHealth}
        supabaseConnected={stats.supabase_connected}
      />

      {/* Main Cockpit Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner notification if Render service is cold-booting */}
        {backendOnline === false && (
          <div className="rounded-xl p-3 bg-amber-950/40 border border-amber-800/60 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>
                Backend on Render is in sleep mode or booting ({API_BASE_URL}). The dashboard is operating in high-fidelity client simulation mode.
              </span>
            </div>
            <button
              onClick={refreshHealth}
              className="text-xs font-semibold underline hover:text-white"
            >
              Re-check Server
            </button>
          </div>
        )}

        {/* 1. Global Gateway Metrics */}
        <section aria-label="Global Gateway Metrics">
          <MetricCards stats={stats} />
        </section>

        {/* 2. Interactive Split Pane Workbench & Trust Gauge */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Interactive Inspector">
          <div className="lg:col-span-2">
            <LiveInspector
              onScan={handleScan}
              loading={loading}
              scanResult={scanResult}
            />
          </div>

          <div className="lg:col-span-1">
            {scanResult ? (
              <TrustScoreGauge
                score={scanResult.trust_breakdown.trust_score}
                breakdown={scanResult.trust_breakdown}
                decision={scanResult.decision}
                piiCount={scanResult.detected_entities.length}
                threatCount={scanResult.threat_vectors.length}
              />
            ) : (
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 h-full flex flex-col items-center justify-center text-center text-slate-400">
                <ShieldCheck className="w-8 h-8 text-cyan-400 mb-2" />
                <p className="text-xs">Awaiting scan trigger to compute Trust Index...</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Real-Time Threat Vectors & PII Vault Breakdown */}
        {scanResult && (
          <section aria-label="Threat and PII Breakdown">
            <ThreatVisualizer
              threats={scanResult.threat_vectors}
              entities={scanResult.detected_entities}
              tokenMap={scanResult.token_map}
            />
          </section>
        )}

        {/* 4. Tamper-Evident Security Telemetry Trail */}
        <section aria-label="Security Telemetry Trail">
          <AuditLogsTable
            logs={auditLogs}
            onRefresh={refreshLogsAndStats}
            onClear={handleClearLogs}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Sentinel-AI Gateway</span>
            <span>—</span>
            <span>Zero-Trust LLM Runtime Governance</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              Frontend: Vercel SPA
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Backend: Render FastAPI
            </span>
            <a
              href={`${API_BASE_URL}/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Health Check
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
