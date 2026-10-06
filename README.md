# 🛡️ Sentinel-AI: AI Trust, Privacy & Runtime Security Gateway

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Sentinel-AI** is a production-grade, zero-trust AI security & privacy gateway that intercepts inputs and outputs between enterprise end-users and Large Language Models (LLMs). It delivers real-time adversarial prompt injection detection, reversible synthetic PII/PHI tokenization, an Explainable Trust & Safety Index (0-100), and an auditable security telemetry trail.

---

## 🏛️ Architecture Overview

```text
       [ User / Client Application ]
                     │
                     ▼ (HTTP POST /api/v1/scan)
   ┌──────────────────────────────────────────────┐
   │        SENTINEL-AI SECURITY GATEWAY          │
   │                                              │
   │  1. PII/PHI Anonymization Engine             │
   │     - Emails, SSNs, Phones, API Keys, IPs    │
   │     - Reversible synthetic token mapping     │
   │                                              │
   │  2. Threat & Injection Detector              │
   │     - DAN / Jailbreaks / System Leakage      │
   │     - Destructive RCE / Shell commands       │
   │                                              │
   │  3. Explainable Trust Index (0-100)          │
   │     - Decision: ALLOW | SANITIZE | QUARANTINE│
   │                                              │
   │  4. Tamper-Evident Telemetry Log             │
   └──────────────────────┬───────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼ (If Allowed / Sanitized)        ▼ (If Quarantined)
   [ Downstream LLM ]             [ Blocked at Proxy ]
   (OpenAI, Anthropic, etc.)      [ Zero Data Leakage ]
```

---

## 📂 Project Structure

```text
sentinel-ai/
├── client/                     # Frontend (React 18, Vite, TypeScript, Tailwind CSS)
│   ├── public/
│   │   └── shield.svg          # Favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Gateway status and health check ping
│   │   │   ├── MetricCards.tsx        # Global telemetry counters & metrics
│   │   │   ├── LiveInspector.tsx      # Split pane workbench with presets
│   │   │   ├── ThreatVisualizer.tsx   # Threat vector and PII token chips
│   │   │   ├── AuditLogsTable.tsx     # Filterable telemetry stream & JSON export
│   │   │   └── TrustScoreGauge.tsx    # Animated SVG semi-circle gauge
│   │   ├── services/
│   │   │   └── api.ts                 # API client with offline demo fallback
│   │   ├── types/
│   │   │   └── index.ts               # Shared TypeScript schemas
│   │   ├── App.tsx                    # Main dashboard container
│   │   ├── main.tsx
│   │   └── index.css                  # Cyber cockpit theme styling
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json                    # Client SPA rewrite rules
│   └── vite.config.ts
├── server/                     # Backend (Python 3.10+, FastAPI, Uvicorn, Pydantic v2)
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py              # Environment configuration & CORS
│   │   │   ├── pii_engine.py          # Regex PII/PHI detection & tokenization
│   │   │   └── security.py            # Jailbreak & threat scoring algorithm
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic v2 request/response models
│   │   ├── routers/
│   │   │   ├── analyze.py             # /scan and /detokenize endpoints
│   │   │   └── audit.py               # /audit-logs and /stats endpoints
│   │   ├── __init__.py
│   │   └── main.py                    # FastAPI root with CORS and /health
│   ├── requirements.txt
│   ├── Procfile                       # Render start command
│   ├── render.yaml                    # Render service blueprint
│   └── .python-version                # Pinned Python version (3.11.9)
├── .gitignore
├── README.md
└── vercel.json                 # Monorepo root Vercel configuration
```

---

## 🚀 Deployment Instructions

### 1. Push to GitHub
Initialize your Git repository and push the code:
```bash
git init
git add .
git commit -m "feat: initial release of Sentinel-AI Gateway"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sentinel-ai.git
git push -u origin main
```

---

### 2. Deploy Backend to Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in the following settings:
   - **Name**: `sentinel-ai-backend` (or any custom name)
   - **Region**: Any (e.g., Oregon or Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. In **Environment Variables**, add:
   - `PYTHON_VERSION`: `3.11.9`
   - `ENVIRONMENT`: `production`
   - `CORS_ORIGINS`: `*`
6. Click **Create Web Service**.
7. Once deployed, copy your Render service URL (e.g., `https://sentinel-ai-backend.onrender.com`).
8. Verify it works by opening `https://sentinel-ai-backend.onrender.com/health` in your browser.

---

### 3. Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. Under **Environment Variables**, add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your Render service URL (e.g., `https://sentinel-ai-backend.onrender.com`)
6. Click **Deploy**.
7. Your high-performance dashboard is now live!

---

## 💻 Local Development

### Run Backend Locally
```bash
cd server
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend will be available at `http://localhost:8000`. OpenAPI documentation at `http://localhost:8000/docs`.

### Run Frontend Locally
```bash
cd client
npm install
npm run dev
```
Frontend will be available at `http://localhost:5173`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check for Render uptime monitoring |
| `POST` | `/api/v1/scan` | Scans prompt, applies PII tokenization, evaluates threat score |
| `POST` | `/api/v1/detokenize` | Reverses synthetic tokens back into original text |
| `GET` | `/api/v1/audit-logs` | Retrieves recent telemetry trail entries |
| `GET` | `/api/v1/stats` | Returns aggregate metrics and gateway averages |
| `DELETE` | `/api/v1/audit-logs` | Clears in-memory audit logs |

---

## 🔒 Security Engine Specifications

- **PII / PHI Redaction**:
  - Replaces Social Security Numbers (SSN) with `[SSN_X]`
  - Replaces Emails with `[EMAIL_X]`
  - Replaces Phone Numbers with `[PHONE_X]`
  - Replaces API Keys & Tokens (`sk-...`, `AKIA...`, `Bearer...`) with `[API_KEY_X]`
  - Replaces Credit Card Numbers with `[CREDIT_CARD_X]`
  - Replaces IP Addresses with `[IP_ADDRESS_X]`
- **Threat Vector Detection**:
  - Direct Prompt Injection (`ignore previous instructions`, `new directive:`)
  - Jailbreak Personas (`DAN mode`, `AIM persona`, `uncensored mode`)
  - System Prompt Leakage Probes (`repeat words above`, `output initial prompt`)
  - Destructive Remote Code Execution (`rm -rf`, `chmod 777`, `curl \| sh`, PowerShell exploits)
- **Explainable Trust Index (0 - 100)**:
  - Base: `100 pts`
  - Injection penalty: up to `-40 pts`
  - PII exposure density penalty: up to `-30 pts`
  - Anomaly / evasion penalty: up to `-30 pts`
  - **Verdict**:
    - `ALLOW` (Score $\ge 80$, clean input)
    - `SANITIZE_AND_FORWARD` (Score $40-79$, PII redacted)
    - `QUARANTINE_BLOCKED` (Score $< 40$, critical threat blocked)
