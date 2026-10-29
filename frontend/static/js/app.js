/**
 * FINN: Financial Investment Agent - Frontend Application Logic
 * Mobile-First Reactive UI Orchestrator
 */

// Application State
const STATE = {
  activeTab: 'digest',
  digestWindowHours: 24,
  digestCategory: 'all',
  activeResearchTicker: 'RELIANCE',
  activeResearchModule: 'all',
  currentResearchData: null,
  companies: [],
  alerts: null,
  alertConfig: {
    priceMoveThresholdPct: 3.0,
    volumeMultiplierThreshold: 2.0,
    hoursLookback: 24
  }
};

// ==========================================
// 1. INITIALIZATION & TAB SWITCHING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  await fetchPortfolio();
  await fetchDigest();
  await fetchAlerts();
  await loadResearch(STATE.activeResearchTicker);
  if (window.lucide) lucide.createIcons();
}

function switchTab(tabName) {
  STATE.activeTab = tabName;

  // Toggle Tab Sections
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.classList.add('active');

  // Update Desktop Nav Pills
  document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active-tab'));
  const dBtn = document.getElementById(`nav-btn-${tabName}`);
  if (dBtn) dBtn.classList.add('active-tab');

  // Update Mobile Nav Buttons
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.classList.remove('active-tab'));
  const mBtn = document.getElementById(`m-nav-${tabName}`);
  if (mBtn) mBtn.classList.add('active-tab');

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 2. PORTFOLIO & WATCHLIST
// ==========================================
async function fetchPortfolio() {
  try {
    const res = await fetch('/api/portfolio');
    const data = await res.json();
    STATE.companies = data.companies || [];

    // Update Header Count
    const headEl = document.getElementById('header-portfolio-count');
    if (headEl) headEl.textContent = data.portfolio_count || 18;

    renderWatchlist(STATE.companies);
  } catch (err) {
    console.error('Failed to load portfolio:', err);
  }
}

function renderWatchlist(comps) {
  const tbody = document.getElementById('watchlist-table-body');
  if (!tbody) return;

  if (!comps.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="py-4 text-center text-slate-500">No companies found</td></tr>`;
    return;
  }

  tbody.innerHTML = comps.map(c => {
    const chg = c.change_pct || 0;
    const chgClass = chg >= 0 ? 'text-accent-green' : 'text-accent-red';
    const volRatio = (c.volume && c.avg_volume_20d) ? (c.volume / c.avg_volume_20d).toFixed(1) : '1.0';
    const isVolSpike = parseFloat(volRatio) >= 2.0;

    return `
      <tr class="hover:bg-dark-elevated/60 transition cursor-pointer" onclick="jumpToResearch('${c.symbol}')">
        <td class="py-2.5 px-3 font-sans">
          <div class="font-bold text-white flex items-center gap-1.5">
            ${c.symbol}
            ${c.is_portfolio ? '<span class="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400">CORE</span>' : '<span class="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">AD-HOC</span>'}
          </div>
          <div class="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-none">${c.name}</div>
        </td>
        <td class="py-2.5 px-2 text-slate-300 font-sans text-[11px]">${c.sector}</td>
        <td class="py-2.5 px-2 text-[10px] text-slate-400 font-sans">${c.market_cap_tier}</td>
        <td class="py-2.5 px-2 text-right text-slate-200">₹${c.last_price.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        <td class="py-2.5 px-2 text-right font-bold ${chgClass}">${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</td>
        <td class="py-2.5 px-2 text-right">
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${isVolSpike ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400'}">
            ${volRatio}x ${isVolSpike ? '⚡' : ''}
          </span>
        </td>
        <td class="py-2.5 px-2 text-right text-slate-300">${c.pe_ratio}x</td>
        <td class="py-2.5 px-2 text-right text-slate-300">${c.roce_pct}%</td>
        <td class="py-2.5 px-3 text-center">
          <button onclick="event.stopPropagation(); jumpToResearch('${c.symbol}')" class="px-2 py-1 rounded bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white text-[10px] font-sans font-semibold transition">
            Analyze
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterWatchlistSector(sec) {
  if (sec === 'all') {
    renderWatchlist(STATE.companies);
  } else {
    const filtered = STATE.companies.filter(c => c.sector.toLowerCase().includes(sec.toLowerCase()));
    renderWatchlist(filtered);
  }
}

function jumpToResearch(symbol) {
  loadResearch(symbol);
  switchTab('research');
}

// ==========================================
// 3. PUSH WINDOWED DIGEST
// ==========================================
function setDigestWindow(hours) {
  STATE.digestWindowHours = hours;
  document.querySelectorAll('.digest-win-pill').forEach(btn => {
    btn.classList.toggle('active-pill', parseInt(btn.dataset.val) === hours);
  });
  fetchDigest();
}

function filterDigestCategory(cat) {
  STATE.digestCategory = cat;
  fetchDigest();
}

async function fetchDigest() {
  const container = document.getElementById('digest-priority-container');
  const routineList = document.getElementById('routine-items-list');
  const routineBadge = document.getElementById('routine-count-badge');
  const statsHeadline = document.getElementById('digest-headline-stats');

  if (container) container.innerHTML = `<div class="py-8 text-center text-slate-500 text-xs">Loading digest...</div>`;

  try {
    const url = `/api/digest?window=${STATE.digestWindowHours}&category=${STATE.digestCategory}`;
    const res = await fetch(url);
    const data = await res.json();

    const pri = data.priority_items || [];
    const rou = data.routine_items || [];
    const meta = data.metadata || {};

    if (statsHeadline) {
      statsHeadline.textContent = `${meta.priority_count} high-priority filings surfaced across portfolio in ${meta.window_label}`;
    }

    if (routineBadge) {
      routineBadge.textContent = `${rou.length} hidden`;
    }

    // Render Priority Items
    if (!pri.length) {
      container.innerHTML = `
        <div class="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
          <i data-lucide="check-circle" class="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80"></i>
          <p class="text-sm font-semibold text-slate-300">No Material Filings in this Window</p>
          <p class="text-xs text-slate-500 mt-1">Change window (e.g. 7d or 30d) or clear filters to view earlier filings.</p>
        </div>
      `;
    } else {
      container.innerHTML = pri.map(renderDigestCard).join('');
    }

    // Render Collapsed Routine Items
    if (routineList) {
      if (!rou.length) {
        routineList.innerHTML = `<p class="text-xs text-slate-500">No routine paperwork in this period.</p>`;
      } else {
        routineList.innerHTML = rou.map(item => `
          <div class="p-2.5 rounded-lg bg-dark-elevated/40 border border-dark-border/40 flex items-center justify-between text-xs">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-300 font-mono">${item.symbol}</span>
                <span class="text-[10px] text-slate-500 uppercase px-1 rounded bg-slate-800">${item.category}</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5 line-clamp-1">${item.title}</p>
            </div>
            <a href="${item.filing_url}" target="_blank" class="text-slate-500 hover:text-slate-300 text-[11px] flex items-center gap-1">
              Filing <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </div>
        `).join('');
      }
    }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Failed to load digest:', err);
    if (container) container.innerHTML = `<div class="p-4 text-xs text-red-400">Error loading digest data.</div>`;
  }
}

function renderDigestCard(item) {
  const cat = item.category;
  const isHigh = item.priority === 'HIGH';
  const enrich = item.enrichment || {};

  let enrichmentHtml = '';

  // 1. Specialized Enrichment: Quarterly Results Matrix
  if (cat === 'results' && enrich.metrics) {
    const m = enrich.metrics;
    enrichmentHtml = `
      <div class="mt-3 p-3 rounded-lg bg-dark-elevated/80 border border-dark-border">
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-dark-border/60">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
            <i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-accent-cyan"></i> Headline Results Matrix (${enrich.period || 'Reported'})
          </span>
          <span class="text-[10px] font-mono text-slate-400">EBITDA Margin: <strong class="text-white">${enrich.ebitda_margin_pct}%</strong> (${enrich.margin_variance_yoy_bps >= 0 ? '+' : ''}${enrich.margin_variance_yoy_bps} bps YoY)</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div class="p-2 rounded bg-dark-card border border-dark-border/50">
            <div class="text-[10px] text-slate-400 uppercase font-sans">Revenue</div>
            <div class="text-sm font-bold text-white mt-0.5">₹${m.revenue.current.toLocaleString()} Cr</div>
            <div class="text-[10px] flex items-center justify-between mt-1 pt-1 border-t border-dark-border/40 font-sans">
              <span class="${m.revenue.qoq_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">QoQ: ${m.revenue.qoq_pct >= 0 ? '+' : ''}${m.revenue.qoq_pct}%</span>
              <span class="${m.revenue.yoy_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">YoY: ${m.revenue.yoy_pct >= 0 ? '+' : ''}${m.revenue.yoy_pct}%</span>
            </div>
          </div>
          <div class="p-2 rounded bg-dark-card border border-dark-border/50">
            <div class="text-[10px] text-slate-400 uppercase font-sans">EBITDA</div>
            <div class="text-sm font-bold text-white mt-0.5">₹${m.ebitda.current.toLocaleString()} Cr</div>
            <div class="text-[10px] flex items-center justify-between mt-1 pt-1 border-t border-dark-border/40 font-sans">
              <span class="${m.ebitda.qoq_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">QoQ: ${m.ebitda.qoq_pct >= 0 ? '+' : ''}${m.ebitda.qoq_pct}%</span>
              <span class="${m.ebitda.yoy_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">YoY: ${m.ebitda.yoy_pct >= 0 ? '+' : ''}${m.ebitda.yoy_pct}%</span>
            </div>
          </div>
          <div class="p-2 rounded bg-dark-card border border-dark-border/50">
            <div class="text-[10px] text-slate-400 uppercase font-sans">PBT</div>
            <div class="text-sm font-bold text-white mt-0.5">₹${m.pbt.current.toLocaleString()} Cr</div>
            <div class="text-[10px] flex items-center justify-between mt-1 pt-1 border-t border-dark-border/40 font-sans">
              <span class="${m.pbt.qoq_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">QoQ: ${m.pbt.qoq_pct >= 0 ? '+' : ''}${m.pbt.qoq_pct}%</span>
              <span class="${m.pbt.yoy_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">YoY: ${m.pbt.yoy_pct >= 0 ? '+' : ''}${m.pbt.yoy_pct}%</span>
            </div>
          </div>
          <div class="p-2 rounded bg-dark-card border border-dark-border/50">
            <div class="text-[10px] text-slate-400 uppercase font-sans">PAT (Net Profit)</div>
            <div class="text-sm font-bold text-white mt-0.5">₹${m.pat.current.toLocaleString()} Cr</div>
            <div class="text-[10px] flex items-center justify-between mt-1 pt-1 border-t border-dark-border/40 font-sans">
              <span class="${m.pat.qoq_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">QoQ: ${m.pat.qoq_pct >= 0 ? '+' : ''}${m.pat.qoq_pct}%</span>
              <span class="${m.pat.yoy_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">YoY: ${m.pat.yoy_pct >= 0 ? '+' : ''}${m.pat.yoy_pct}%</span>
            </div>
          </div>
        </div>
        ${enrich.management_comment ? `<p class="text-[11px] text-slate-300 italic mt-2.5 pt-2 border-t border-dark-border/40">"${enrich.management_comment}"</p>` : ''}
      </div>
    `;
  }

  // 2. Specialized Enrichment: Management Change Bio
  else if (cat === 'management_change' && enrich.incoming_executive) {
    const inc = enrich.incoming_executive;
    enrichmentHtml = `
      <div class="mt-3 p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-xs">
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-indigo-900/30">
          <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <i data-lucide="user-check" class="w-3.5 h-3.5"></i> Executive Profile Dossier (LinkedIn / Track Record)
          </span>
          <span class="text-[10px] text-slate-400 font-mono">Effective: ${inc.effective_date}</span>
        </div>
        <div class="space-y-1.5">
          <div class="font-bold text-white text-sm">${inc.name} &mdash; <span class="text-indigo-300 font-normal">${inc.role}</span></div>
          <p class="text-slate-300 text-[11px] leading-relaxed"><strong class="text-slate-200">Pedigree:</strong> ${inc.career_background}</p>
          <p class="text-slate-400 text-[11px]"><strong class="text-slate-300">Education:</strong> ${inc.education}</p>
          <div class="p-2 rounded bg-indigo-900/30 border border-indigo-700/30 text-[11px] text-indigo-200 mt-2">
            <strong>Institutional Conviction Read:</strong> ${inc.strategic_implication}
          </div>
        </div>
      </div>
    `;
  }

  // 3. Specialized Enrichment: M&A / Capex / Litigation
  else if (cat === 'M&A' && enrich.deal_size_cr) {
    enrichmentHtml = `
      <div class="mt-3 p-2.5 rounded-lg bg-dark-elevated border border-dark-border text-xs flex items-center justify-between">
        <div>
          <span class="text-slate-400 text-[10px] uppercase block">Acquisition Deal Size</span>
          <span class="text-sm font-bold text-white font-mono">₹${enrich.deal_size_cr} Cr (${enrich.stake_pct}% stake)</span>
        </div>
        <div class="text-right">
          <span class="text-slate-400 text-[10px] uppercase block">Valuation Multiple</span>
          <span class="text-xs font-semibold text-accent-cyan">${enrich.valuation_multiple || 'N/A'}</span>
        </div>
      </div>
    `;
  } else if (cat === 'capex' && enrich.capex_amount_cr) {
    enrichmentHtml = `
      <div class="mt-3 p-2.5 rounded-lg bg-dark-elevated border border-dark-border text-xs flex items-center justify-between font-mono">
        <div>
          <span class="text-slate-400 text-[10px] uppercase font-sans block">Approved Capex Spend</span>
          <span class="text-sm font-bold text-emerald-400">₹${enrich.capex_amount_cr} Cr</span>
        </div>
        <div class="text-right font-sans">
          <span class="text-slate-400 text-[10px] uppercase block">Location</span>
          <span class="text-xs text-slate-200">${enrich.location || 'India'}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="bg-dark-card border ${isHigh ? 'border-brand-500/40 shadow-lg shadow-brand-500/5' : 'border-dark-border'} rounded-xl p-3.5 sm:p-4 hover:border-slate-600 transition">
      <!-- Card Top Meta -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-mono font-bold text-white text-sm hover:text-brand-400 cursor-pointer" onclick="jumpToResearch('${item.symbol}')">${item.symbol}</span>
          <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getCategoryBadgeStyle(cat)}">${cat.replace('_', ' ')}</span>
          ${isHigh ? '<span class="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">HIGH PRIORITY</span>' : ''}
        </div>
        <div class="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
          <span>${formatTimeAgo(item.timestamp)}</span>
          <a href="${item.filing_url}" target="_blank" class="p-1 rounded hover:bg-dark-elevated text-slate-400 hover:text-white" title="Open Official Exchange PDF">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>

      <!-- Filing Title -->
      <h3 class="text-xs font-semibold text-slate-200 leading-snug">${item.title}</h3>

      <!-- 1-Line Actionable Executive Takeaway -->
      <p class="text-xs text-slate-300 mt-2 pl-2.5 border-l-2 border-brand-500/60 leading-relaxed">
        ${item.summary}
      </p>

      <!-- Specialized Enrichment Module -->
      ${enrichmentHtml}

      <!-- Footer Quick Action -->
      <div class="mt-3 pt-2.5 border-t border-dark-border/40 flex items-center justify-between text-[11px]">
        <button onclick="copilotAsk('Analyze ${item.symbol} filing: ${item.title.replace(/'/g, "\\'")}')" class="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium">
          <i data-lucide="sparkles" class="w-3 h-3"></i> Ask Copilot about this
        </button>
        <button onclick="jumpToResearch('${item.symbol}')" class="text-slate-400 hover:text-white flex items-center gap-1">
          Deep Research <i data-lucide="arrow-right" class="w-3 h-3"></i>
        </button>
      </div>
    </div>
  `;
}

function getCategoryBadgeStyle(cat) {
  switch (cat) {
    case 'results': return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
    case 'management_change': return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
    case 'M&A': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    case 'capex': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    case 'litigation': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    case 'dividend': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    case 'pledging': return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
    default: return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}

function toggleRoutineDrawer() {
  const content = document.getElementById('routine-drawer-content');
  const icon = document.getElementById('routine-drawer-icon');
  const txt = document.getElementById('routine-drawer-text');
  if (!content) return;

  const isHidden = content.classList.contains('hidden');
  content.classList.toggle('hidden', !isHidden);
  if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  if (txt) txt.textContent = isHidden ? 'Hide Routine Items' : 'Show Routine Items';
}

// ==========================================
// 4. TRIGGERED ALERTS ENGINE
// ==========================================
async function fetchAlerts() {
  try {
    const url = `/api/alerts?price_thresh=${STATE.alertConfig.priceMoveThresholdPct}&vol_thresh=${STATE.alertConfig.volumeMultiplierThreshold}`;
    const res = await fetch(url);
    const data = await res.json();
    STATE.alerts = data;

    const total = data.summary.total_triggered || 0;
    
    // Update Badge Counts
    const headerBadge = document.getElementById('alert-badge-count');
    const mobileBadge = document.getElementById('m-alert-badge');
    const totalEl = document.getElementById('alerts-total-count');

    if (headerBadge) headerBadge.textContent = total;
    if (mobileBadge) mobileBadge.textContent = total;
    if (totalEl) totalEl.textContent = `${total} Triggered`;

    // Render Sub-columns
    renderPriceAlerts(data.price_anomalies || []);
    renderVolumeAlerts(data.volume_spikes || []);
    renderMaterialAlerts(data.material_filings || []);

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Failed to load alerts:', err);
  }
}

function renderPriceAlerts(items) {
  const list = document.getElementById('alerts-price-list');
  const countEl = document.getElementById('count-price-alerts');
  if (countEl) countEl.textContent = items.length;
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<p class="text-xs text-slate-500 italic p-3 bg-dark-card/40 rounded-lg">No stocks breached the ±${STATE.alertConfig.priceMoveThresholdPct}% threshold.</p>`;
    return;
  }

  list.innerHTML = items.map(a => `
    <div class="p-3 rounded-lg bg-dark-card border border-dark-border hover:border-slate-600 transition cursor-pointer" onclick="jumpToResearch('${a.symbol}')">
      <div class="flex items-center justify-between">
        <span class="font-mono font-bold text-white text-xs">${a.symbol}</span>
        <span class="font-mono font-bold text-xs ${a.change_pct >= 0 ? 'text-accent-green' : 'text-accent-red'}">
          ${a.change_pct >= 0 ? '+' : ''}${a.change_pct.toFixed(2)}%
        </span>
      </div>
      <div class="text-[11px] text-slate-400 mt-1">${a.message}</div>
      <div class="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>CMP: ₹${a.last_price.toLocaleString()}</span>
        <span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-sans">${a.severity}</span>
      </div>
    </div>
  `).join('');
}

function renderVolumeAlerts(items) {
  const list = document.getElementById('alerts-vol-list');
  const countEl = document.getElementById('count-vol-alerts');
  if (countEl) countEl.textContent = items.length;
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<p class="text-xs text-slate-500 italic p-3 bg-dark-card/40 rounded-lg">No unusual volume breakouts above ${STATE.alertConfig.volumeMultiplierThreshold}x avg.</p>`;
    return;
  }

  list.innerHTML = items.map(v => `
    <div class="p-3 rounded-lg bg-dark-card border border-dark-border hover:border-slate-600 transition cursor-pointer" onclick="jumpToResearch('${v.symbol}')">
      <div class="flex items-center justify-between">
        <span class="font-mono font-bold text-white text-xs">${v.symbol}</span>
        <span class="font-mono font-bold text-xs text-accent-amber px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
          ${v.volume_ratio}x Avg
        </span>
      </div>
      <div class="text-[11px] text-slate-400 mt-1">${v.message}</div>
      <div class="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Vol: ${(v.volume / 100000).toFixed(1)}L</span>
        <span>Avg: ${(v.avg_volume_20d / 100000).toFixed(1)}L</span>
      </div>
    </div>
  `).join('');
}

function renderMaterialAlerts(items) {
  const list = document.getElementById('alerts-material-list');
  const countEl = document.getElementById('count-material-alerts');
  if (countEl) countEl.textContent = items.length;
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<p class="text-xs text-slate-500 italic p-3 bg-dark-card/40 rounded-lg">No material events filed.</p>`;
    return;
  }

  list.innerHTML = items.map(m => `
    <div class="p-3 rounded-lg bg-dark-card border border-dark-border hover:border-slate-600 transition cursor-pointer" onclick="jumpToResearch('${m.symbol}')">
      <div class="flex items-center justify-between mb-1">
        <span class="font-mono font-bold text-white text-xs">${m.symbol}</span>
        <span class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${getCategoryBadgeStyle(m.category)}">${m.category}</span>
      </div>
      <p class="text-[11px] text-slate-300 font-medium line-clamp-2">${m.title}</p>
      <div class="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <span>${formatTimeAgo(m.timestamp)}</span>
        <span class="text-brand-400">View Filing &rarr;</span>
      </div>
    </div>
  `).join('');
}

// Config Modal Handlers
function openConfigModal() {
  document.getElementById('config-modal').classList.remove('hidden');
}

function closeConfigModal() {
  document.getElementById('config-modal').classList.add('hidden');
}

function updatePriceSlider(val) {
  document.getElementById('slider-price-val').textContent = `±${val}%`;
}

function updateVolSlider(val) {
  document.getElementById('slider-vol-val').textContent = `${val}x avg`;
}

async function saveConfig() {
  const pVal = parseFloat(document.getElementById('slider-price').value);
  const vVal = parseFloat(document.getElementById('slider-vol').value);

  STATE.alertConfig.priceMoveThresholdPct = pVal;
  STATE.alertConfig.volumeMultiplierThreshold = vVal;

  document.getElementById('pill-price-thresh').textContent = `Price: ≥ ±${pVal.toFixed(1)}%`;
  document.getElementById('pill-vol-thresh').textContent = `Volume: ≥ ${vVal.toFixed(1)}x 20D Avg`;

  closeConfigModal();
  await fetchAlerts();
}

// ==========================================
// 5. PULL DEEP RESEARCH (8 MODULES)
// ==========================================
async function loadResearch(tickerSymbol) {
  STATE.activeResearchTicker = tickerSymbol;
  const select = document.getElementById('research-ticker-select');
  if (select) select.value = tickerSymbol.replace('.NS', '');

  const hero = document.getElementById('research-hero-banner');
  const container = document.getElementById('research-modules-container');

  if (container) container.innerHTML = `<div class="py-12 text-center text-slate-500 text-xs font-mono">Querying primary sources for ${tickerSymbol}...</div>`;

  try {
    const res = await fetch(`/api/research?ticker=${tickerSymbol}`);
    const data = await res.json();
    STATE.currentResearchData = data;

    renderResearchHero(data);
    renderResearchModules(data, STATE.activeResearchModule);

    // Update Screener Link
    const sLink = document.getElementById('research-screener-link');
    if (sLink && data.screener_url) {
      sLink.href = data.screener_url;
    }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Failed to load research:', err);
    if (container) container.innerHTML = `<div class="p-4 text-xs text-red-400">Error loading research data.</div>`;
  }
}

function renderResearchHero(data) {
  const hero = document.getElementById('research-hero-banner');
  if (!hero) return;

  const fin = data.modules?.financial_snapshot || {};
  const chg = data.daily_change_pct || 0;

  hero.innerHTML = `
    <div>
      <div class="flex items-center gap-2 flex-wrap">
        <h2 class="text-xl font-bold font-mono text-white tracking-tight">${data.symbol}</h2>
        <span class="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">${data.sector}</span>
        <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">${data.market_cap_tier}</span>
      </div>
      <p class="text-xs text-slate-300 mt-0.5 font-medium">${data.name}</p>
      <div class="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400">
        ${data.current_market_price ? `<span>CMP: <strong class="text-white">₹${data.current_market_price.toLocaleString()}</strong></span>` : ''}
        ${data.daily_change_pct ? `<span class="${chg >= 0 ? 'text-accent-green' : 'text-accent-red'} font-bold">${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</span>` : ''}
        <span>P/E: <strong class="text-slate-200">${fin.pe_ratio || 'N/A'}x</strong></span>
        <span>ROCE: <strong class="text-slate-200">${fin.roce_pct || 'N/A'}%</strong></span>
      </div>
    </div>

    <!-- Primary Source Verification Badge List -->
    <div class="border-t md:border-t-0 md:border-l border-dark-border/80 pt-2 md:pt-0 md:pl-4 space-y-1 text-[11px] text-slate-400 font-mono">
      <span class="text-[10px] uppercase font-bold text-slate-500 font-sans block">Primary Filing Sources:</span>
      ${(data.primary_sources || []).map(s => `
        <div class="flex items-center gap-1.5 truncate">
          <i data-lucide="check" class="w-3 h-3 text-emerald-400"></i>
          <span class="text-slate-300">${s.type} (${s.period}):</span>
          <span class="truncate max-w-[180px] text-slate-400">${s.title}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function switchResearchModule(modKey) {
  STATE.activeResearchModule = modKey;
  document.querySelectorAll('.res-mod-pill').forEach(btn => {
    btn.classList.toggle('active-pill', btn.dataset.module === modKey);
  });
  if (STATE.currentResearchData) {
    renderResearchModules(STATE.currentResearchData, modKey);
  }
}

function handleCustomTickerSearch() {
  const input = document.getElementById('custom-ticker-input');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  if (val) {
    loadResearch(val);
    input.value = '';
  }
}

function renderResearchModules(data, activeModule) {
  const container = document.getElementById('research-modules-container');
  if (!container) return;

  const mods = data.modules || {};

  const shouldRender = (key) => activeModule === 'all' || activeModule === key;

  let html = '';

  // 1. Narrative vs Numbers (Flagship ENAM Requirement)
  if (shouldRender('narrative_vs_numbers') && mods.narrative_vs_numbers) {
    const nvn = mods.narrative_vs_numbers;
    html += `
      <div class="bg-dark-card border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-500/5">
        <div class="flex items-center justify-between pb-3 border-b border-dark-border">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-md bg-amber-500/20 text-accent-amber flex items-center justify-center font-bold text-xs">★</span>
            <div>
              <h3 class="text-sm font-bold text-white">Narrative vs Numbers (The ENAM Discipline)</h3>
              <p class="text-[11px] text-slate-400">Tracking past 4 quarters: Concall guidance vs actual audited delivery.</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-400 uppercase font-sans block">Credibility Score</span>
            <span class="text-sm font-bold font-mono text-accent-amber">${nvn.management_credibility_score}</span>
          </div>
        </div>

        <p class="text-xs text-slate-300 mt-2.5 leading-relaxed bg-dark-elevated/40 p-2.5 rounded-lg border border-dark-border/50">
          <strong class="text-amber-400">Institutional Read:</strong> ${nvn.credibility_analysis}
        </p>

        <!-- 4-Quarter Guidance vs Delivery Table -->
        <div class="mt-3 overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-[10px] uppercase font-bold text-slate-400 border-b border-dark-border bg-dark-elevated/60">
              <tr>
                <th class="py-2 px-2.5">Quarter</th>
                <th class="py-2 px-3">Management Concall Promise</th>
                <th class="py-2 px-3">Audited Exchange Delivery</th>
                <th class="py-2 px-2.5 text-center">Verdict</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-border/40">
              ${(nvn.quarters || []).map(q => `
                <tr class="hover:bg-dark-elevated/30">
                  <td class="py-2.5 px-2.5 font-mono font-bold text-white whitespace-nowrap">${q.quarter}</td>
                  <td class="py-2.5 px-3 text-slate-300 text-[11px] leading-snug">${q.management_promise}</td>
                  <td class="py-2.5 px-3 text-slate-200 text-[11px] leading-snug font-mono">${q.actual_delivery}</td>
                  <td class="py-2.5 px-2.5 text-center whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${getVerdictClass(q.verdict)}">${q.verdict}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 2. Cash Quality & Conversion
  if (shouldRender('cash_quality') && mods.cash_quality) {
    const cq = mods.cash_quality;
    html += `
      <div class="bg-dark-card border border-emerald-500/30 rounded-xl p-4 shadow-lg shadow-emerald-500/5">
        <div class="flex items-center justify-between pb-3 border-b border-dark-border">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">₹</span>
            <div>
              <h3 class="text-sm font-bold text-white">Cash Quality & Conversion (Do Profits Turn Into Cash?)</h3>
              <p class="text-[11px] text-slate-400">Audited cash flow trends and free cash flow generation integrity.</p>
            </div>
          </div>
          <span class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold">
            Cash Conversion: ${cq.cash_conversion_pct}%
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs font-mono">
          <div class="p-2.5 rounded-lg bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">Operating Cash (CFO)</span>
            <span class="text-sm font-bold text-emerald-400">₹${cq.cfo_ttm_cr?.toLocaleString()} Cr</span>
          </div>
          <div class="p-2.5 rounded-lg bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">Reported PAT</span>
            <span class="text-sm font-bold text-white">₹${cq.pat_ttm_cr?.toLocaleString()} Cr</span>
          </div>
          <div class="p-2.5 rounded-lg bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">Free Cash Flow (FCF)</span>
            <span class="text-sm font-bold text-cyan-400">₹${cq.fcf_ttm_cr?.toLocaleString()} Cr</span>
          </div>
          <div class="p-2.5 rounded-lg bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">Capex (TTM)</span>
            <span class="text-sm font-bold text-slate-300">₹${cq.capex_ttm_cr?.toLocaleString()} Cr</span>
          </div>
        </div>

        <p class="text-xs text-slate-300 mt-3 p-2.5 rounded bg-emerald-950/20 border border-emerald-900/30 leading-relaxed">
          <strong class="text-emerald-400">Cash Flow Assessment:</strong> ${cq.fcf_conversion_assessment}
        </p>
      </div>
    `;
  }

  // 3. Business Snapshot & Operating Segments
  if (shouldRender('business_snapshot') && mods.business_snapshot) {
    const bs = mods.business_snapshot;
    html += `
      <div class="bg-dark-card border border-dark-border rounded-xl p-4">
        <h3 class="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
          <i data-lucide="building" class="w-4 h-4 text-brand-400"></i> Business Snapshot & Segments
        </h3>
        <p class="text-xs text-slate-300 leading-relaxed">${bs.description}</p>
        
        <div class="mt-3">
          <span class="text-[10px] uppercase font-bold text-slate-400 block mb-2">Segment Revenue & EBITDA Mix:</span>
          <div class="space-y-2">
            ${(bs.segments || []).map(s => `
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-slate-200 font-medium">${s.name} <span class="text-[10px] text-slate-500 font-normal">(${s.trend})</span></span>
                  <span class="font-mono text-slate-400">${s.revenue_share_pct}% Rev | ${s.ebitda_share_pct}% EBITDA</span>
                </div>
                <div class="w-full h-1.5 bg-dark-elevated rounded-full overflow-hidden flex">
                  <div class="bg-brand-500 h-full rounded-full" style="width: ${s.revenue_share_pct}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-dark-border/60 text-xs text-slate-300">
          <strong class="text-slate-200">Competitive Moats:</strong> ${bs.moats}
        </div>
      </div>
    `;
  }

  // 4. Financial Snapshot
  if (shouldRender('financial_snapshot') && mods.financial_snapshot) {
    const fin = mods.financial_snapshot;
    html += `
      <div class="bg-dark-card border border-dark-border rounded-xl p-4">
        <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
          <i data-lucide="calculator" class="w-4 h-4 text-accent-cyan"></i> Headline Financials & Multiples
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 font-mono text-xs">
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">TTM Revenue</span>
            <span class="text-sm font-bold text-white">₹${fin.revenue_ttm_cr?.toLocaleString()} Cr</span>
          </div>
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">EBITDA Margin</span>
            <span class="text-sm font-bold text-accent-cyan">${fin.ebitda_margin_pct}%</span>
          </div>
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">TTM PAT</span>
            <span class="text-sm font-bold text-white">₹${fin.pat_ttm_cr?.toLocaleString()} Cr</span>
          </div>
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">ROCE</span>
            <span class="text-sm font-bold text-accent-green">${fin.roce_pct}%</span>
          </div>
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">ROE</span>
            <span class="text-sm font-bold text-accent-green">${fin.roe_pct}%</span>
          </div>
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">P/E Ratio</span>
            <span class="text-sm font-bold text-amber-400">${fin.pe_ratio}x</span>
          </div>
        </div>
      </div>
    `;
  }

  // 5. Trajectory (Multi-Year Direction)
  if (shouldRender('trajectory') && mods.trajectory) {
    const tr = mods.trajectory;
    html += `
      <div class="bg-dark-card border border-dark-border rounded-xl p-4">
        <h3 class="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
          <i data-lucide="trending-up" class="w-4 h-4 text-brand-400"></i> Trajectory (Multi-Year Direction)
        </h3>
        <div class="grid grid-cols-3 gap-2 font-mono text-xs mb-3">
          <div class="p-2 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">3Y Revenue CAGR</span>
            <span class="text-sm font-bold text-emerald-400">+${tr.revenue_cagr_3yr_pct}%</span>
          </div>
          <div class="p-2 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">3Y EBITDA CAGR</span>
            <span class="text-sm font-bold text-emerald-400">+${tr.ebitda_cagr_3yr_pct}%</span>
          </div>
          <div class="p-2 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">3Y PAT CAGR</span>
            <span class="text-sm font-bold text-emerald-400">+${tr.pat_cagr_3yr_pct}%</span>
          </div>
        </div>
        <div class="space-y-1.5 text-xs text-slate-300">
          <p><strong class="text-emerald-400">Expanding:</strong> ${tr.expanding_areas}</p>
          <p><strong class="text-rose-400">Compressing:</strong> ${tr.compressing_areas}</p>
          <p><strong class="text-slate-200">Capex Cycle:</strong> ${tr.capex_cycle}</p>
        </div>
      </div>
    `;
  }

  // 6. Balance Sheet & Working Capital
  if (shouldRender('balance_sheet') && mods.balance_sheet) {
    const bs = mods.balance_sheet;
    html += `
      <div class="bg-dark-card border border-dark-border rounded-xl p-4">
        <h3 class="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
          <i data-lucide="scale" class="w-4 h-4 text-accent-cyan"></i> Balance Sheet, Leverage & Working Capital
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs mb-3">
          <div class="p-2 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">Total Debt</span>
            <span class="text-sm font-bold text-slate-200">₹${bs.total_debt_cr?.toLocaleString()} Cr</span>
          </div>
          <div class="p-2 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">Net Debt / EBITDA</span>
            <span class="text-sm font-bold ${bs.net_debt_ebitda <= 1.0 ? 'text-emerald-400' : 'text-amber-400'}">${bs.net_debt_ebitda}x</span>
          </div>
          <div class="p-2 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">Debt / Equity</span>
            <span class="text-sm font-bold text-slate-200">${bs.debt_equity_ratio}x</span>
          </div>
          <div class="p-2 rounded bg-dark-elevated border border-dark-border">
            <span class="text-[10px] uppercase font-sans text-slate-400 block">Working Capital Cycle</span>
            <span class="text-sm font-bold text-cyan-400">${bs.working_capital_days} Days</span>
          </div>
        </div>
        <div class="text-[11px] text-slate-300 font-mono flex items-center gap-4 flex-wrap pb-2 border-b border-dark-border/40">
          <span>Debtor Days: <strong>${bs.debtor_days}d</strong></span>
          <span>Inventory Days: <strong>${bs.inventory_days}d</strong></span>
          <span>Creditor Days: <strong>${bs.creditor_days}d</strong></span>
          ${bs.contingent_liabilities_cr ? `<span>Contingent Liabilities: <strong>₹${bs.contingent_liabilities_cr} Cr</strong></span>` : ''}
        </div>
        <p class="text-xs text-slate-300 mt-2">${bs.funding_structure_note}</p>
      </div>
    `;
  }

  // 7. Forward Guidance
  if (shouldRender('forward_guidance') && mods.forward_guidance) {
    const fg = mods.forward_guidance;
    html += `
      <div class="bg-dark-card border border-dark-border rounded-xl p-4">
        <h3 class="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
          <i data-lucide="compass" class="w-4 h-4 text-brand-400"></i> Management Forward Guidance
        </h3>
        <div class="space-y-2 text-xs">
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border">
            <strong class="text-brand-300 font-medium block">Topline & Revenue Target:</strong>
            <span class="text-slate-300">${fg.revenue_target}</span>
          </div>
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border">
            <strong class="text-brand-300 font-medium block">Margin Outlook:</strong>
            <span class="text-slate-300">${fg.margin_outlook}</span>
          </div>
          <div class="p-2.5 rounded bg-dark-elevated border border-dark-border flex items-center justify-between font-mono">
            <span class="font-sans text-slate-400">Annual Capex Commitment:</span>
            <span class="font-bold text-white">₹${fg.capex_plan_cr?.toLocaleString()} Cr</span>
          </div>
        </div>
      </div>
    `;
  }

  // 8. Bull vs Bear Institutional Thesis
  if (shouldRender('bull_vs_bear') && mods.bull_vs_bear) {
    const bvb = mods.bull_vs_bear;
    html += `
      <div class="bg-dark-card border border-dark-border rounded-xl p-4">
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-dark-border">
          <h3 class="text-sm font-bold text-white flex items-center gap-1.5">
            <i data-lucide="shield" class="w-4 h-4 text-brand-400"></i> Bull vs Bear Institutional Thesis
          </h3>
          <span class="text-[11px] font-semibold text-brand-400">${bvb.institutional_conviction}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <!-- Bull Case -->
          <div class="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
            <h4 class="font-bold text-emerald-400 mb-2 flex items-center gap-1">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i> The Bull Thesis
            </h4>
            <ul class="space-y-1.5 text-slate-300 list-disc list-inside">
              ${(bvb.bull_thesis || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>

          <!-- Bear Case -->
          <div class="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
            <h4 class="font-bold text-rose-400 mb-2 flex items-center gap-1">
              <i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i> The Bear Thesis
            </h4>
            <ul class="space-y-1.5 text-slate-300 list-disc list-inside">
              ${(bvb.bear_thesis || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function getVerdictClass(v) {
  if (v.includes('BEAT') || v.includes('EXACT HIT') || v.includes('TRACK')) {
    return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
  }
  if (v.includes('MISS')) {
    return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
  }
  return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
}

// ==========================================
// 6. INVESTOR COPILOT
// ==========================================
function copilotAsk(queryText) {
  switchTab('copilot');
  const input = document.getElementById('copilot-input');
  if (input) input.value = queryText;
  handleCopilotSubmit(new Event('submit'));
}

async function handleCopilotSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('copilot-input');
  const stream = document.getElementById('copilot-chat-stream');
  if (!input || !stream) return;

  const query = input.value.trim();
  if (!query) return;

  // Append User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'flex justify-end';
  userBubble.innerHTML = `
    <div class="bg-brand-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs max-w-[85%] shadow-md">
      ${query}
    </div>
  `;
  stream.appendChild(userBubble);
  input.value = '';
  stream.scrollTop = stream.scrollHeight;

  // Append Thinking Indicator
  const thinkingBubble = document.createElement('div');
  thinkingBubble.className = 'flex justify-start';
  thinkingBubble.innerHTML = `
    <div class="bg-dark-elevated border border-dark-border text-slate-400 rounded-2xl rounded-tl-sm px-3 py-2 text-xs flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span> Querying primary fundamental disclosures...
    </div>
  `;
  stream.appendChild(thinkingBubble);
  stream.scrollTop = stream.scrollHeight;

  try {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, active_ticker: STATE.activeResearchTicker })
    });
    const ans = await res.json();
    thinkingBubble.remove();

    renderCopilotResponse(stream, ans);
    stream.scrollTop = stream.scrollHeight;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    thinkingBubble.remove();
    console.error('Copilot error:', err);
    const errBubble = document.createElement('div');
    errBubble.className = 'text-xs text-rose-400 p-2';
    errBubble.textContent = 'Error processing request. Please retry.';
    stream.appendChild(errBubble);
  }
}

function renderCopilotResponse(stream, ans) {
  const bubble = document.createElement('div');
  bubble.className = 'flex justify-start';

  let metricsHtml = '';
  if (ans.metrics && ans.metrics.length) {
    metricsHtml = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 font-mono text-[11px]">
        ${ans.metrics.map(m => `
          <div class="p-2 rounded bg-dark-card border border-dark-border/60">
            <span class="text-[9px] uppercase font-sans text-slate-400 block">${m.label}</span>
            <span class="text-xs font-bold text-white mt-0.5">${m.value}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  let tableHtml = '';
  if (ans.table && ans.table.length) {
    tableHtml = `
      <div class="my-2 overflow-x-auto">
        <table class="w-full text-left text-[11px]">
          <thead class="text-[9px] uppercase text-slate-400 border-b border-dark-border bg-dark-card">
            <tr>
              <th class="py-1.5 px-2">Quarter</th>
              <th class="py-1.5 px-2">Promise</th>
              <th class="py-1.5 px-2">Delivered</th>
              <th class="py-1.5 px-2">Verdict</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-border/40 font-mono">
            ${ans.table.map(r => `
              <tr>
                <td class="py-1.5 px-2 font-bold text-white">${r.quarter}</td>
                <td class="py-1.5 px-2 font-sans text-slate-300 text-[10px]">${r.promise}</td>
                <td class="py-1.5 px-2 text-slate-200 text-[10px]">${r.actual}</td>
                <td class="py-1.5 px-2"><span class="px-1.5 py-0.2 rounded text-[9px] ${getVerdictClass(r.verdict)}">${r.verdict}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  let citationsHtml = '';
  if (ans.citations && ans.citations.length) {
    citationsHtml = `
      <div class="mt-2 pt-2 border-t border-dark-border/40 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400 font-mono">
        <span class="text-slate-500 font-sans">Primary Sources:</span>
        ${ans.citations.map(c => `<span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">${c}</span>`).join('')}
      </div>
    `;
  }

  let suggestionsHtml = '';
  if (ans.suggested_questions && ans.suggested_questions.length) {
    suggestionsHtml = `
      <div class="mt-2.5 flex items-center gap-1 flex-wrap">
        ${ans.suggested_questions.map(q => `
          <button onclick="copilotAsk('${q.replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded-full text-[10px] bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/20 transition">
            ${q}
          </button>
        `).join('')}
      </div>
    `;
  }

  bubble.innerHTML = `
    <div class="bg-dark-elevated border border-dark-border text-slate-200 rounded-2xl rounded-tl-sm p-3.5 text-xs max-w-[95%] shadow-md space-y-1.5">
      <div class="font-bold text-white text-xs flex items-center gap-1.5">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-brand-400"></i> ${ans.title || 'FINN Intelligence'}
      </div>
      <p class="text-slate-300 leading-relaxed">${ans.answer}</p>
      ${metricsHtml}
      ${tableHtml}
      ${citationsHtml}
      ${suggestionsHtml}
    </div>
  `;

  stream.appendChild(bubble);
}

// ==========================================
// 7. UTILITY FUNCTIONS
// ==========================================
function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const diffHours = Math.round((now - date) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1h ago';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}
