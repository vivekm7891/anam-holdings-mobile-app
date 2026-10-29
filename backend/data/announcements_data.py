"""
FINN: Corporate Announcements & Filings Dataset
Covers all 17 ENAM announcement categories across portfolio companies with realistic
NSE/BSE exchange filings, priority ratings, and specialized enrichments:
- Management Change: Incoming executive biography, past roles, market implications.
- Quarterly Results: Structured Revenue, EBITDA, PBT, PAT matrix with QoQ and YoY comparisons.
- High-priority material disclosures with one-line executive takeaways.
- Routine compliance items marked for automated collapsing.
"""

from datetime import datetime, timedelta

NOW = datetime.now()

def get_time(hours_ago):
    return (NOW - timedelta(hours=hours_ago)).strftime("%Y-%m-%dT%H:%M:%SZ")

ANNOUNCEMENTS = [
    # ---------------- 1. RESULTS (High Priority) ----------------
    {
        "id": "ANN-2026-001",
        "ticker": "RELIANCE.NS",
        "symbol": "RELIANCE",
        "company_name": "Reliance Industries Ltd",
        "timestamp": get_time(4),
        "title": "Financial Results for the Quarter and Half Year ended September 30, 2026",
        "category": "results",
        "priority": "HIGH",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.bseindia.com/xml-data/corpfiling/AttachLive/RELIANCE_Q2FY27_Results.pdf",
        "summary": "Revenue expands 9.4% YoY led by Retail footfall (+18%) and Jio ARPU uptick to ₹195; Oil-to-Chemicals margins stabilize after cyclical trough.",
        "enrichment": {
            "type": "results_matrix",
            "period": "Q2 FY27 (Sep 2026)",
            "metrics": {
                "revenue": {
                    "current": 258400,
                    "prev_qoq": 251200,
                    "prev_yoy": 236200,
                    "qoq_pct": 2.87,
                    "yoy_pct": 9.40,
                    "unit": "₹ Crore"
                },
                "ebitda": {
                    "current": 46800,
                    "prev_qoq": 44900,
                    "prev_yoy": 42100,
                    "qoq_pct": 4.23,
                    "yoy_pct": 11.16,
                    "unit": "₹ Crore"
                },
                "pbt": {
                    "current": 28400,
                    "prev_qoq": 27100,
                    "prev_yoy": 25300,
                    "qoq_pct": 4.80,
                    "yoy_pct": 12.25,
                    "unit": "₹ Crore"
                },
                "pat": {
                    "current": 20450,
                    "prev_qoq": 19600,
                    "prev_yoy": 18200,
                    "qoq_pct": 4.34,
                    "yoy_pct": 12.36,
                    "unit": "₹ Crore"
                }
            },
            "ebitda_margin_pct": 18.11,
            "margin_variance_yoy_bps": 29,
            "management_comment": "Consumer businesses now contribute 52% of consolidated EBITDA. Jio 5G monetisation on track with 160M 5G subscribers."
        }
    },
    {
        "id": "ANN-2026-002",
        "ticker": "DIXON.NS",
        "symbol": "DIXON",
        "company_name": "Dixon Technologies (India) Ltd",
        "timestamp": get_time(10),
        "title": "Unaudited Financial Results for Quarter ended September 30, 2026 & Earnings Presentation",
        "category": "results",
        "priority": "HIGH",
        "exchange": "NSE",
        "filing_url": "https://www.nseindia.com/corpfiling/DIXON_Q2_Results.pdf",
        "summary": "Blockbuster Q2: Revenue surges 82% YoY on exponential ramp-up in mobile phone exports under PLI scheme; PAT up 91% YoY.",
        "enrichment": {
            "type": "results_matrix",
            "period": "Q2 FY27",
            "metrics": {
                "revenue": {
                    "current": 7240,
                    "prev_qoq": 6580,
                    "prev_yoy": 3980,
                    "qoq_pct": 10.03,
                    "yoy_pct": 81.91,
                    "unit": "₹ Crore"
                },
                "ebitda": {
                    "current": 295,
                    "prev_qoq": 256,
                    "prev_yoy": 158,
                    "qoq_pct": 15.23,
                    "yoy_pct": 86.71,
                    "unit": "₹ Crore"
                },
                "pbt": {
                    "current": 248,
                    "prev_qoq": 210,
                    "prev_yoy": 125,
                    "qoq_pct": 18.10,
                    "yoy_pct": 98.40,
                    "unit": "₹ Crore"
                },
                "pat": {
                    "current": 185,
                    "prev_qoq": 158,
                    "prev_yoy": 97,
                    "qoq_pct": 17.09,
                    "yoy_pct": 90.72,
                    "unit": "₹ Crore"
                }
            },
            "ebitda_margin_pct": 4.07,
            "margin_variance_yoy_bps": 10,
            "management_comment": "Mobile volume delivery exceeded 6M units in the quarter. IT hardware and component joint venture entering pilot production."
        }
    },
    {
        "id": "ANN-2026-003",
        "ticker": "TATAMOTORS.NS",
        "symbol": "TATAMOTORS",
        "company_name": "Tata Motors Ltd",
        "timestamp": get_time(18),
        "title": "Q2 FY27 Consolidated Financial Results & Demerger Progress Update",
        "category": "results",
        "priority": "HIGH",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.bseindia.com/AttachLive/TATAMOTORS_Q2FY27.pdf",
        "summary": "Consolidated PAT slips 8.2% YoY due to temporary supply chain disruption at JLR aluminum supplier and CV domestic volume moderation.",
        "enrichment": {
            "type": "results_matrix",
            "period": "Q2 FY27",
            "metrics": {
                "revenue": {
                    "current": 104500,
                    "prev_qoq": 108200,
                    "prev_yoy": 105100,
                    "qoq_pct": -3.42,
                    "yoy_pct": -0.57,
                    "unit": "₹ Crore"
                },
                "ebitda": {
                    "current": 13800,
                    "prev_qoq": 15200,
                    "prev_yoy": 14900,
                    "qoq_pct": -9.21,
                    "yoy_pct": -7.38,
                    "unit": "₹ Crore"
                },
                "pbt": {
                    "current": 5900,
                    "prev_qoq": 7100,
                    "prev_yoy": 6650,
                    "qoq_pct": -16.90,
                    "yoy_pct": -11.28,
                    "unit": "₹ Crore"
                },
                "pat": {
                    "current": 4480,
                    "prev_qoq": 5450,
                    "prev_yoy": 4880,
                    "qoq_pct": -17.80,
                    "yoy_pct": -8.20,
                    "unit": "₹ Crore"
                }
            },
            "ebitda_margin_pct": 13.21,
            "margin_variance_yoy_bps": -97,
            "management_comment": "JLR order book remains robust at 145,000 units. Net auto debt reduction continues with target of zero net debt within 12 months."
        }
    },

    # ---------------- 2. MANAGEMENT CHANGE (High Priority) ----------------
    {
        "id": "ANN-2026-004",
        "ticker": "INFY.NS",
        "symbol": "INFY",
        "company_name": "Infosys Ltd",
        "timestamp": get_time(6),
        "title": "Appointment of Chief Financial Officer and Key Managerial Personnel",
        "category": "management_change",
        "priority": "HIGH",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.nseindia.com/corpfiling/INFY_CFO_Appointment.pdf",
        "summary": "Nilanjan Roy steps down; Board appoints veteran finance operator Rajesh Krishnamurthy as CFO effective Dec 1, 2026.",
        "enrichment": {
            "type": "executive_bio",
            "incoming_executive": {
                "name": "Rajesh Krishnamurthy",
                "role": "Chief Financial Officer (CFO)",
                "effective_date": "December 1, 2026",
                "career_background": "24+ years across global IT services and investment banking. Former Group CFO at Cognizant Digital, previously SVP Finance at Wipro and Morgan Stanley London.",
                "education": "Chartered Accountant (Rank holder), MBA from Indian Institute of Management Ahmedabad (IIM-A).",
                "pedigree_assessment": "Regarded as a disciplined operational CFO with deep expertise in enterprise margin restructuring, offshore billing efficiency, and cross-border M&A.",
                "strategic_implication": "Positive for institutional street sentiment; signals renewed focus on operating margin defense (targeting 21-23% band) and capital return discipline."
            },
            "outgoing_executive": {
                "name": "Nilanjan Roy",
                "reason": "Stepping down to pursue academic and philanthropy advisory roles after 6-year tenure."
            }
        }
    },
    {
        "id": "ANN-2026-005",
        "ticker": "FEDERALBNK.NS",
        "symbol": "FEDERALBNK",
        "company_name": "The Federal Bank Ltd",
        "timestamp": get_time(28),
        "title": "RBI Approves Appointment of KVS Manian as Managing Director & CEO",
        "category": "management_change",
        "priority": "HIGH",
        "exchange": "BSE",
        "filing_url": "https://www.bseindia.com/AttachLive/FEDERALBNK_MD_Approval.pdf",
        "summary": "RBI accords formal approval for KVS Manian to take helm as MD & CEO for 3-year term, ending leadership transition overhang.",
        "enrichment": {
            "type": "executive_bio",
            "incoming_executive": {
                "name": "K.V.S. Manian",
                "role": "Managing Director & CEO",
                "effective_date": "Immediate",
                "career_background": "Spent nearly three decades at Kotak Mahindra Bank, serving as Joint MD and heading Wholesale, Commercial Bank, and Private Banking.",
                "education": "IIT Bombay (B.Tech Electrical), Jamnalal Bajaj Institute of Management Studies (JBIMS Mumbai).",
                "pedigree_assessment": "One of India's most seasoned commercial banking veterans with proven track record of scaling CASA franchise, corporate underwriting, and asset quality control.",
                "strategic_implication": "High-conviction catalyst for Federal Bank; expected to accelerate high-margin retail loan expansion and improve ROA towards 1.40% benchmark."
            },
            "outgoing_executive": {
                "name": "Shyam Srinivasan",
                "reason": "Completed maximum 14-year statutory tenure as per RBI guidelines."
            }
        }
    },

    # ---------------- 3. M&A / ACQUISITIONS (High Priority) ----------------
    {
        "id": "ANN-2026-006",
        "ticker": "TRENT.NS",
        "symbol": "TRENT",
        "company_name": "Trent Ltd",
        "timestamp": get_time(12),
        "title": "Execution of Share Purchase Agreement to Acquire 51% Majority Stake in Value Beauty Chain 'GlowWorks'",
        "category": "M&A",
        "priority": "HIGH",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.nseindia.com/corpfiling/TRENT_MA_GlowWorks.pdf",
        "summary": "Trent enters high-margin mass-prestige beauty retail with ₹420 Cr acquisition; plans to scale to 250 stores using Zudio playbook.",
        "enrichment": {
            "deal_size_cr": 420,
            "stake_pct": 51.0,
            "target_company": "GlowWorks Cosmetics & Personal Care Pvt Ltd",
            "valuation_multiple": "3.8x FY26 EV/Sales",
            "synergies": "Cross-leveraging 600+ Zudio store footfalls for captive beauty shop-in-shops, unlocking 35% gross product margins."
        }
    },

    # ---------------- 4. CAPEX & CAPACITY EXPANSION (Medium Priority) ----------------
    {
        "id": "ANN-2026-007",
        "ticker": "KAYNES.NS",
        "symbol": "KAYNES",
        "company_name": "Kaynes Technology India Ltd",
        "timestamp": get_time(15),
        "title": "Board Approves ₹1,850 Crore Capex for Semiconductor OSAT (Outsourced Assembly & Testing) Facility in Sanand, Gujarat",
        "category": "capex",
        "priority": "HIGH",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.nseindia.com/corpfiling/KAYNES_Semiconductor_Capex.pdf",
        "summary": "Semiconductor OSAT facility cleared with 50% central and state capital subsidy; commissioning expected by Q4 FY28.",
        "enrichment": {
            "capex_amount_cr": 1850,
            "government_subsidy_expected_pct": 70.0,
            "location": "Sanand, Gujarat",
            "capacity": "1.2 Billion chips per year",
            "target_sectors": "Automotive Tier 1, 5G Base Stations, Aerospace"
        }
    },
    {
        "id": "ANN-2026-008",
        "ticker": "ASTRAL.NS",
        "symbol": "ASTRAL",
        "company_name": "Astral Ltd",
        "timestamp": get_time(42),
        "title": "Commercial Production Commences at Hyderabad CPVC and Fittings Facility",
        "category": "capex",
        "priority": "MEDIUM",
        "exchange": "NSE",
        "filing_url": "https://www.nseindia.com/corpfiling/ASTRAL_Plant_Commercial.pdf",
        "summary": "New 35,000 MT/year South India plant goes live, reducing logistics freight costs by 220 bps for Telangana/AP markets.",
        "enrichment": {
            "capacity_addition_mt": 35000,
            "investment_cr": 160,
            "freight_saving_bps": 220
        }
    },

    # ---------------- 5. LITIGATION & REGULATORY (High Priority) ----------------
    {
        "id": "ANN-2026-009",
        "ticker": "POLYCAB.NS",
        "symbol": "POLYCAB",
        "company_name": "Polycab India Ltd",
        "timestamp": get_time(22),
        "title": "Update on Income Tax Assessment Proceedings for FY 2021-22 & Demand Notice",
        "category": "litigation",
        "priority": "HIGH",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.bseindia.com/AttachLive/POLYCAB_Tax_Update.pdf",
        "summary": "IT Department issues ₹142 Cr demand; Polycab files writ petition in Bombay High Court citing full audit compliance; legal counsel advises zero material impact.",
        "enrichment": {
            "disputed_amount_cr": 142.5,
            "forum": "Bombay High Court",
            "contingent_liability_status": "Disclosed under notes to accounts; no immediate cash outflow mandated."
        }
    },

    # ---------------- 6. INSIDER TRADING & PROMOTER TRANSACTIONS (Medium/High Priority) ----------------
    {
        "id": "ANN-2026-010",
        "ticker": "PERSISTENT.NS",
        "symbol": "PERSISTENT",
        "company_name": "Persistent Systems Ltd",
        "timestamp": get_time(8),
        "title": "Disclosures under Reg. 29(2) of SEBI (SAST) - Open Market Acquisition of 45,000 Shares by Promoter Group",
        "category": "insider_trading",
        "priority": "MEDIUM",
        "exchange": "NSE",
        "filing_url": "https://www.nseindia.com/corpfiling/PERSISTENT_Promoter_Buy.pdf",
        "summary": "Promoter group buys 45,000 equity shares worth ₹24.5 Cr from open market at avg price ₹5,445, demonstrating strong alignment.",
        "enrichment": {
            "transaction_type": "Acquisition (Open Market)",
            "shares_bought": 45000,
            "total_value_cr": 24.5,
            "promoter_holding_after_pct": 31.28
        }
    },
    {
        "id": "ANN-2026-011",
        "ticker": "SUZLON.NS",
        "symbol": "SUZLON",
        "company_name": "Suzlon Energy Ltd",
        "timestamp": get_time(36),
        "title": "Release of Encumbrance / Pledging of 12.5 Crore Shares by Promoter Entity",
        "category": "pledging",
        "priority": "HIGH",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.bseindia.com/AttachLive/SUZLON_Pledge_Release.pdf",
        "summary": "Lenders release pledge on 12.5 Cr promoter shares; total promoter encumbered shares drops to zero (100% unencumbered).",
        "enrichment": {
            "shares_released": 125000000,
            "remaining_pledge_pct": 0.0,
            "credit_significance": "Removes legacy debt overhang; confirms pristine balance sheet health post-turnaround."
        }
    },

    # ---------------- 7. FUND RAISE & CORPORATE ACTIONS (Medium Priority) ----------------
    {
        "id": "ANN-2026-012",
        "ticker": "BHARTIARTL.NS",
        "symbol": "BHARTIARTL",
        "company_name": "Bharti Airtel Ltd",
        "timestamp": get_time(50),
        "title": "Prepayment of ₹8,465 Crore High-Cost Spectrum Dues to Department of Telecommunications",
        "category": "fund_raise",
        "priority": "MEDIUM",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.nseindia.com/corpfiling/BHARTIARTL_Spectrum_Prepayment.pdf",
        "summary": "Airtel prepays another tranche of spectrum liabilities using internal accruals, saving ~₹950 Cr in annual interest expenditure.",
        "enrichment": {
            "prepaid_amount_cr": 8465,
            "annual_interest_saving_cr": 950,
            "net_debt_ebitda_impact": "Deleveraging ratio improves to 2.1x."
        }
    },
    {
        "id": "ANN-2026-013",
        "ticker": "CDSL.NS",
        "symbol": "CDSL",
        "company_name": "Central Depository Services (India) Ltd",
        "timestamp": get_time(70),
        "title": "Record Date for 1:1 Bonus Issue Fixed as November 15, 2026",
        "category": "bonus_split",
        "priority": "MEDIUM",
        "exchange": "BSE",
        "filing_url": "https://www.bseindia.com/AttachLive/CDSL_Bonus_RecordDate.pdf",
        "summary": "1:1 Bonus share record date finalized; paid-up capital doubles with no cash outflow to improve retail market liquidity.",
        "enrichment": {
            "ratio": "1:1 (One bonus share for every one held)",
            "record_date": "November 15, 2026",
            "capital_structure_effect": "Share count doubles from 10.45 Cr to 20.90 Cr shares."
        }
    },

    # ---------------- 8. EARNINGS CALL & INVESTOR MEETS (Medium/Low) ----------------
    {
        "id": "ANN-2026-014",
        "ticker": "TCS.NS",
        "symbol": "TCS",
        "company_name": "Tata Consultancy Services Ltd",
        "timestamp": get_time(14),
        "title": "Transcript of Q2 FY27 Earnings Conference Call held on October 28, 2026",
        "category": "earnings_call",
        "priority": "MEDIUM",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.tcs.com/investors/concall_transcripts/Q2_FY27.pdf",
        "summary": "Management commentary highlights $8.6B quarterly TCV deal wins; confirms revival in BFSI discretionary cloud spend in North America.",
        "enrichment": {
            "tcv_order_book_usd": "8.6 Billion",
            "attrition_rate": "12.1% (LTM)",
            "hiring_plan": "Net addition of 10,000 campus graduates in H2."
        }
    },
    {
        "id": "ANN-2026-015",
        "ticker": "HDFCBANK.NS",
        "symbol": "HDFCBANK",
        "company_name": "HDFC Bank Ltd",
        "timestamp": get_time(26),
        "title": "Schedule of Institutional Investor Meeting with Fidelity & Capital Group in Singapore",
        "category": "investor_meetings",
        "priority": "ROUTINE",
        "exchange": "NSE",
        "filing_url": "https://www.nseindia.com/corpfiling/HDFCBANK_Investor_Meet_Schedule.pdf",
        "summary": "Executive management conducting one-on-one institutional roadshows in Singapore on November 4-5.",
        "enrichment": {
            "attendees": "Fidelity Management, Capital Research, GIC",
            "nature": "Institutional group meeting; no unpublished price-sensitive information shared."
        }
    },

    # ---------------- 9. PRESS RELEASE / ORDER WINS (Medium Priority) ----------------
    {
        "id": "ANN-2026-016",
        "ticker": "LT.NS",
        "symbol": "LT",
        "company_name": "Larsen & Toubro Ltd",
        "timestamp": get_time(5),
        "title": "Press Release: L&T Hydrocarbon Onshore Business Secures Mega Order Worth ₹7,500+ Crore in Middle East",
        "category": "press_release",
        "priority": "HIGH",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.larsentoubro.com/press-releases/2026-10-mega-gas-compression.pdf",
        "summary": "Mega EPC contract win for gas processing and compression plant; expands international order book to record ₹4.95 lakh crore.",
        "enrichment": {
            "order_value_bracket": "Mega (₹7,500 Cr to ₹10,000 Cr)",
            "client_region": "Middle East National Oil Company",
            "execution_tenure_months": 36
        }
    },

    # ---------------- 10. DIVIDEND (Medium Priority) ----------------
    {
        "id": "ANN-2026-017",
        "ticker": "ITC.NS",
        "symbol": "ITC",
        "company_name": "ITC Ltd",
        "timestamp": get_time(19),
        "title": "Declaration of Interim Dividend of ₹6.25 per Ordinary Share of ₹1.00",
        "category": "dividend",
        "priority": "MEDIUM",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.bseindia.com/AttachLive/ITC_Dividend_Declaration.pdf",
        "summary": "Interim dividend declared at ₹6.25/share; record date set for November 12, 2026 with total cash payout of ₹7,800 Cr.",
        "enrichment": {
            "dividend_per_share": 6.25,
            "face_value": 1.00,
            "total_payout_cr": 7800,
            "dividend_yield_annualized_pct": 3.8
        }
    },

    # ---------------- 11. UNCLASSIFIED & ROUTINE (Low / Collapsible) ----------------
    {
        "id": "ANN-2026-018",
        "ticker": "ICICIBANK.NS",
        "symbol": "ICICIBANK",
        "company_name": "ICICI Bank Ltd",
        "timestamp": get_time(3),
        "title": "Allotment of 184,250 Equity Shares under ICICI Bank Employees Stock Option Scheme-2000",
        "category": "unclassified",
        "priority": "ROUTINE",
        "exchange": "NSE",
        "filing_url": "https://www.nseindia.com/corpfiling/ICICI_ESOP_Allotment.pdf",
        "summary": "Routine ESOP share allotment of 184,250 shares under employee incentive plan.",
        "enrichment": {
            "shares_allotted": 184250,
            "dilution_pct": "< 0.001%"
        }
    },
    {
        "id": "ANN-2026-019",
        "ticker": "SUNPHARMA.NS",
        "symbol": "SUNPHARMA",
        "company_name": "Sun Pharmaceutical Industries Ltd",
        "timestamp": get_time(7),
        "title": "Compliance Certificate under Regulation 74(5) of SEBI (DP) Regulations for Quarter ended September 30, 2026",
        "category": "unclassified",
        "priority": "ROUTINE",
        "exchange": "BSE",
        "filing_url": "https://www.bseindia.com/AttachLive/SUNPHARMA_Reg74_Certificate.pdf",
        "summary": "Quarterly demat compliance certificate from Link Intime Registrar & Share Transfer Agent.",
        "enrichment": {
            "compliance_type": "SEBI DP Reg 74(5) certificate confirmation"
        }
    },
    {
        "id": "ANN-2026-020",
        "ticker": "RELIANCE.NS",
        "symbol": "RELIANCE",
        "company_name": "Reliance Industries Ltd",
        "timestamp": get_time(11),
        "title": "Submission of Newspaper Advertisements regarding Publication of Financial Results",
        "category": "unclassified",
        "priority": "ROUTINE",
        "exchange": "NSE/BSE",
        "filing_url": "https://www.bseindia.com/AttachLive/RELIANCE_Newspaper_Clipping.pdf",
        "summary": "Proof of mandatory newspaper advertisements in Financial Express and Navshakti.",
        "enrichment": {
            "publications": "Financial Express (English), Navshakti (Marathi)"
        }
    },
    {
        "id": "ANN-2026-021",
        "ticker": "ZOMATO.NS",
        "symbol": "ZOMATO",
        "company_name": "Zomato Ltd",
        "timestamp": get_time(17),
        "title": "Notice of Postal Ballot Seeking Shareholder Approval for ₹8,500 Crore QIP Fund Raise",
        "category": "postal_ballot",
        "priority": "HIGH",
        "exchange": "NSE",
        "filing_url": "https://www.nseindia.com/corpfiling/ZOMATO_Postal_Ballot_QIP.pdf",
        "summary": "Postal ballot dispatched to shareholders to approve ₹8,500 Cr Qualified Institutional Placement to fund Blinkit dark store war chest.",
        "enrichment": {
            "fund_raise_mode": "QIP (Equity / Convertible)",
            "size_cr": 8500,
            "purpose": "Dark store expansion (targeting 2,000 stores) and supply chain logistics."
        }
    }
]

def get_announcements(ticker=None, category=None, priority=None, hours_window=24):
    """
    Filters announcements by ticker, category, priority, and time window (in hours).
    """
    cutoff = NOW - timedelta(hours=hours_window)
    results = []
    for item in ANNOUNCEMENTS:
        # Check window
        dt = datetime.strptime(item["timestamp"], "%Y-%m-%dT%H:%M:%SZ")
        if dt < cutoff:
            continue
        
        # Check ticker filter
        if ticker:
            norm_ticker = ticker.strip().upper().replace(".NS", "").replace(".BO", "")
            if item["symbol"] != norm_ticker and item["ticker"].replace(".NS", "") != norm_ticker:
                continue

        # Check category
        if category and category.lower() != "all" and item["category"] != category:
            continue

        # Check priority
        if priority and priority.upper() != "ALL" and item["priority"] != priority.upper():
            continue

        results.append(item)

    # Sort descending by priority (HIGH first, then MEDIUM, then ROUTINE) and timestamp
    priority_order = {"HIGH": 0, "MEDIUM": 1, "ROUTINE": 2}
    results.sort(key=lambda x: (priority_order.get(x["priority"], 3), -datetime.strptime(x["timestamp"], "%Y-%m-%dT%H:%M:%SZ").timestamp()))
    return results
