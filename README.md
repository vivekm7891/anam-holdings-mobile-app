# FINN: Financial Investment Agent
### Built for ENAM Holdings — AI Engineer Build Challenge 2026/2027
**Submission by Candidate | Subject Line: `ENAM - IIT screening - 2027`**

[![Tests](https://img.shields.io/badge/Unit%20%26%20Integration%20Tests-22%2F22%20Passing-emerald)](https://github.com/vivekm7891/anam-holdings-mobile-app)
[![Architecture](https://img.shields.io/badge/Architecture-Mobile--First%20%7C%20Zero%20AI%20Slop-indigo)](https://github.com/vivekm7891/anam-holdings-mobile-app)
[![Data Grounding](https://img.shields.io/badge/Grounding-Primary%20Sources%20Only-blue)](https://github.com/vivekm7891/anam-holdings-mobile-app)

---

## Executive Summary

Public-market equity investors make high-conviction decisions in an environment overwhelmed by noise: filings, press releases, price volatility, earnings call transcripts, and analyst commentary. 

**FINN** is an institutional intelligence agent engineered around a singular philosophy: **differentiated signal lives in primary data; secondary commentary is where it gets noisy.**

FINN transforms the daily investor workflow into two complementary interaction paradigms:
1. **Push (Proactive Intelligence)**: What changed across my portfolio, prioritized by conviction, with noise collapsed and key filings enriched (QoQ/YoY results matrices, executive dossiers for leadership changes).
2. **Pull (On-Demand Deep Fundamental Research)**: 8-module institutional analysis strictly grounded in primary sources (Annual Reports, Concall Transcripts, Audited Exchange Filings) with zero generic AI hallucinations.

---

## Key Capabilities & Architecture

```
+-----------------------------------------------------------------------------------+
|                            FINN MOBILE-FIRST UI                                  |
|  - Obsidian Dark Terminal Aesthetic       - Responsive Mobile Bottom Navigation   |
|  - One-Tap Tab & Filter Pills             - High-Density Financial Metric Tables  |
+-------------------------+-----------------------------------+---------------------+
                          |                                   |
                          v                                   v
             +--------------------------+        +--------------------------+
             |   PUSH ENGINE (Proactive)|        |   PULL ENGINE (On-Demand)|
             +--------------------------+        +--------------------------+
             | - Windowed Digest        |        | - 8 Fundamental Modules  |
             |   (24h / 3d / 7d / 30d)  |        | - Primary Source Ground  |
             | - Smart Priority Tiering |        | - Narrative vs Numbers   |
             | - Routine Noise Drawer   |        |   (Guidance vs Delivery) |
             | - Results QoQ/YoY Matrix |        | - Cash Flow Integrity    |
             | - Management Bio Dossier |        | - Any-Ticker Generator   |
             +-------------+------------+        +-------------+------------+
                           |                                   |
                           +-----------------+-----------------+
                                             |
                                             v
                         +---------------------------------------+
                         |      TRIGGERED ALERTS ENGINE          |
                         | - Price Move Anomaly (|ΔP| >= ±X%)    |
                         | - Volume Surge Breakout (Vol >= Y*Avg)|
                         | - Material Exchange Filings Filter    |
                         | - Interactive Real-Time Threshold Tuner|
                         +---------------------------------------+
                                             |
                                             v
                         +---------------------------------------+
                         |      PRIMARY DATA & SOURCES LAYER     |
                         | - 18 Diverse NSE Portfolio Equities   |
                         | - 3 Ad-Hoc Demonstration Companies    |
                         | - NSE/BSE Exchange Filings Engine     |
                         | - Annual Reports & Concall Transcripts|
                         +---------------------------------------+
```

### 1. Push: Proactive Workflow
- **Windowed Digest**: Configurable lookback period (Last 24 Hours, 3 Days, 7 Days, 30 Days).
- **Categorization Schema**: Maps 100% of corporate filings against the 17 categories defined in ENAM's Reference specification (`results`, `M&A`, `fund_raise`, `management_change`, `litigation`, `insider_trading`, `earnings_call`, `investor_meetings`, `credit_rating`, `dividend`, `bonus_split`, `capex`, `press_release`, `postal_ballot`, `agm_egm`, `pledging`, `unclassified`).
- **Signal vs. Noise Tiering**:
  - **Tier 1 (High Priority)**: Earnings results, board changes, M&A, regulatory litigation. Surfaced prominently.
  - **Tier 3 (Routine Paperwork)**: Compliance certificates, ESOP allotments, and newspaper clippings are **automatically collapsed** into an unobtrusive drawer with one-click expansion.
- **Enrichments that Save Time**:
  - **Management Changes**: Enriched with the incoming executive's professional biography (past roles, educational pedigree, and institutional conviction implications).
  - **Quarterly Results**: Direct extraction of headline numbers—**Revenue, EBITDA, PBT, and PAT**—with exact **QoQ (%)** and **YoY (%)** variance plus EBITDA margin and bps expansion.
  - **One-Line Executive Takeaways**: Synthesized takeaway right on the card.

### 2. Triggered Alerts
- **Real-Time Threshold Monitoring**:
  - Price Anomaly: Alerts when price move crosses $\pm X\%$ in a session (configurable, default $\pm 3.0\%$).
  - Volume Anomaly: Alerts when daily volume exceeds $Y \times$ the 20-day moving average (configurable, default $2.0\times$).
  - Material Filings: Real-time scan of major corporate actions.
- **Interactive Threshold Tuner**: Investors can drag interactive sliders directly in the mobile UI to tune sensitivity; the entire portfolio instantly re-evaluates triggers without a page refresh.

### 3. Pull: On-Demand Deep Research (8 Modules)
Grounded **strictly** in primary sources (Annual Reports, Quarterly Filings, Earnings Call Transcripts, Screener.in).
1. **Business Snapshot**: Operating divisions, revenue mix breakdown, moats.
2. **Financial Snapshot**: TTM Revenue, EBITDA Margin, ROCE, ROE, P/E, D/E.
3. **Trajectory**: 3-Year CAGR (Revenue, EBITDA, PAT), expanding vs compressing areas, capex cycle.
4. **Balance Sheet**: Debt structure, Net Debt/EBITDA, and Working Capital cycle (Debtor, Inventory, and Creditor days).
5. **Cash Quality & Conversion**: Operating cash flow (CFO) vs PAT conversion %, Free Cash Flow (FCF) yield.
6. **Narrative vs Numbers (ENAM's Worked Example)**: Tracks the last 4 quarters of management concall guidance against reported audited deliveries, with a Credibility Score and verdict tag (`MET`, `BEAT`, `MISSED`).
7. **Forward Guidance**: Explicit forward expectations on revenue growth, margin corridors, and ₹ Cr capex milestones.
8. **Bull vs Bear Thesis**: Tight, 3-point institutional thesis on both sides with high-conviction verdict.
- **Generalization**: Works seamlessly on any NSE symbol (e.g. `MARUTI`, `WIPRO`, `BAJFINANCE`) via the Any-Ticker search engine.

### 4. Interactive Institutional Copilot
- High-conviction query bar with zero boilerplate AI slop.
- Instant access to guidance checks, cash quality audits, executive dossiers, and portfolio anomaly scans.
- One-tap follow-up question chips.

---

## Portfolio Coverage (18 Companies + 3 Ad-Hoc Tickers)

| Symbol | Company | Sector | Tier | P/E | ROCE |
|---|---|---|---|---|---|
| **RELIANCE** | Reliance Industries Ltd | Energy & Conglomerate | Mega Cap | 28.4x | 9.8% |
| **TCS** | Tata Consultancy Services Ltd | Technology | Mega Cap | 31.8x | 58.2% |
| **HDFCBANK** | HDFC Bank Ltd | Financials | Mega Cap | 19.2x | 7.4% |
| **ICICIBANK** | ICICI Bank Ltd | Financials | Mega Cap | 18.9x | 8.1% |
| **INFY** | Infosys Ltd | Technology | Large Cap | 28.7x | 40.5% |
| **ITC** | ITC Ltd | Consumer Staples | Large Cap | 29.8x | 39.2% |
| **LT** | Larsen & Toubro Ltd | Industrials & EPC | Large Cap | 36.4x | 14.5% |
| **BHARTIARTL**| Bharti Airtel Ltd | Telecommunications | Large Cap | 58.2x | 12.8% |
| **TATAMOTORS** | Tata Motors Ltd | Automotive | Large Cap | 10.8x | 21.4% |
| **SUNPHARMA** | Sun Pharmaceutical Industries | Healthcare | Large Cap | 41.5x | 16.8% |
| **TRENT** | Trent Ltd (Zudio/Westside) | Consumer Discretionary | Large Cap | 142.0x| 32.4% |
| **POLYCAB** | Polycab India Ltd | Industrials | Mid Cap | 53.6x | 28.5% |
| **DIXON** | Dixon Technologies (India) Ltd | Technology Hardware/EMS| Mid Cap | 92.4x | 34.1% |
| **ASTRAL** | Astral Ltd | Materials / Building | Mid Cap | 88.5x | 22.8% |
| **FEDERALBNK**| The Federal Bank Ltd | Financials | Mid Cap | 11.5x | 6.9% |
| **PERSISTENT**| Persistent Systems Ltd | Technology | Mid Cap | 64.2x | 29.4% |
| **KAYNES** | Kaynes Technology India Ltd | Semiconductors & EMS | Small/Mid | 125.0x| 18.2% |
| **CDSL** | Central Depository Services Ltd| Capital Markets Infra | Small/Mid | 62.4x | 36.8% |
| *ZOMATO* | Zomato Ltd (Blinkit) | Consumer Internet | Ad-Hoc Demo | 118.0x| 8.5% |
| *SUZLON* | Suzlon Energy Ltd | Renewable Energy | Ad-Hoc Demo | 78.5x | 24.1% |
| *DEEPAKNTR* | Deepak Nitrite Ltd | Specialty Chemicals | Ad-Hoc Demo | 46.2x | 21.6% |

---

## Quickstart & Installation

### Requirements
- Python 3.10+ (Standard library only; zero mandatory third-party runtime dependencies required to run the server!)

### 1. Run the Application
```bash
# Navigate to the project directory
cd anam-holdings-mobile-app

# Start the high-performance local server
python backend/server.py 8080
```
Open **`http://localhost:8080`** in any web browser.

### 2. Mobile Experience
- Open Chrome or Safari DevTools (`F12` or `Cmd+Option+I`) and toggle **Device Emulation** (iPhone 14 / Pixel 7).
- Or open `http://<your-lan-ip>:8080` directly on your physical smartphone connected to the same Wi-Fi.

### 3. Run Automated Tests
```bash
python -m unittest discover tests
```
*Output: 22 passed across unit and integration tests in < 0.01s.*

---

## Project Structure
```
anam-holdings-mobile-app/
├── backend/
│   ├── server.py              # Lightweight REST API server & static file host
│   ├── data/
│   │   ├── portfolio.py       # 18 Core NSE Stocks + 3 Ad-Hoc metadata & metrics
│   │   ├── announcements_data.py # 17 ENAM filing categories with rich enrichments
│   │   └── fundamentals_data.py  # 8 analytical modules grounded in primary filings
│   └── engine/
│       ├── digest_engine.py   # Windowed push digest with priority tiering
│       ├── alerts_engine.py   # Real-time price move & volume surge threshold monitor
│       ├── research_engine.py # 8-module pull deep research & any-ticker generalizer
│       └── copilot_engine.py  # Institutional query router & citation synthesizer
├── frontend/
│   └── static/
│       ├── index.html         # Mobile-first responsive web app
│       ├── css/style.css      # Dark terminal styling, subtle scrollbars, micro-interactions
│       └── js/app.js          # Reactive state management and asynchronous data fetching
├── tests/
│   ├── test_finn.py           # 16 Unit tests for engines, formulas & categorization
│   └── test_api.py            # 6 In-memory REST API integration tests
├── docs/
│   └── COVERING_NOTE.md       # Comprehensive submission writeup for assessment@enam.com
├── .gitignore
└── README.md
```

---

## Submission Details
- **Email Subject**: `ENAM - IIT screening - 2027`
- **Recipient**: `assessment@enam.com`
- **Deliverables**: Mobile prototype + Repository + Covering Note (`docs/COVERING_NOTE.md`)
