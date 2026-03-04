/**
 * manwar.js  –  Chart.js 4.x edition
 * Robust replacement for Highcharts/highstock
 */

/* ─── Theme palette ──────────────────────────────────────────────────── */
var THEME = {
    bg:      '#0b0e14',
    surface: '#131720',
    panel:   '#1a2030',
    border:  '#252d3e',
    text:    '#e2e8f0',
    muted:   '#64748b',
    palette: [
        '#3b82f6','#f97316','#22d3ee','#10b981','#f59e0b',
        '#ef4444','#a78bfa','#ec4899','#84cc16','#06b6d4',
        '#8b5cf6','#fb923c','#34d399','#fbbf24','#f87171',
        '#c084fc','#4ade80','#facc15','#60a5fa','#2dd4bf'
    ]
};

/* ─── Chart.js global defaults ───────────────────────────────────────── */
Chart.defaults.color                            = THEME.muted;
Chart.defaults.font.family                      = "'Space Mono', monospace";
Chart.defaults.font.size                        = 11;
Chart.defaults.plugins.legend.labels.color      = THEME.text;
Chart.defaults.plugins.legend.labels.boxWidth   = 12;
Chart.defaults.plugins.legend.labels.padding    = 16;
Chart.defaults.plugins.tooltip.backgroundColor  = THEME.panel;
Chart.defaults.plugins.tooltip.titleColor       = THEME.text;
Chart.defaults.plugins.tooltip.bodyColor        = THEME.muted;
Chart.defaults.plugins.tooltip.borderColor      = THEME.border;
Chart.defaults.plugins.tooltip.borderWidth      = 1;
Chart.defaults.plugins.tooltip.padding          = 10;
Chart.defaults.plugins.tooltip.cornerRadius     = 6;

/* ─── Chart registry (destroy before re-create) ─────────────────────── */
var _registry = {};

function destroyChart(id) {
    if (_registry[id]) {
        try { _registry[id].destroy(); } catch(e) {}
        delete _registry[id];
    }
}

/* ─── Spinner helpers ────────────────────────────────────────────────── */
function spinnerShow(id) { if (id) { var el = document.getElementById(id); if (el) el.style.display = 'block'; } }
function spinnerHide(id) { if (id) { var el = document.getElementById(id); if (el) el.style.display = 'none';  } }

/* ─── Error placeholder inside chart-wrap ───────────────────────────── */
function showError(canvasId, msg) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var wrap = canvas.parentNode;
    wrap.innerHTML = '<p style="color:#64748b;font-size:12px;padding:20px;text-align:center;'
        + 'font-family:\'Space Mono\',monospace;">' + (msg || 'No data available') + '</p>';
}

/* ═══════════════════════════════════════════════════════════════════════
   DATA NORMALISER
   Convert Highcharts JSON shapes to Chart.js { labels, datasets }
   ═══════════════════════════════════════════════════════════════════════ */

function getCategories(raw) {
    var xAxis = raw.xAxis;
    if (!xAxis) return null;
    if (Array.isArray(xAxis)) xAxis = xAxis[0];
    return (xAxis && xAxis.categories && xAxis.categories.length) ? xAxis.categories : null;
}

function buildDatasets(series, type) {
    var isLine = (type === 'line' || type === 'spline' || type === 'area' || type === 'areaspline');

    return series.map(function(s, i) {
        var color  = THEME.palette[i % THEME.palette.length];
        var values = (s.data || []).map(function(pt) {
            if (pt === null || pt === undefined) return null;
            if (typeof pt === 'number') return pt;
            if (Array.isArray(pt))  return pt[1] !== undefined ? pt[1] : pt[0];
            if (typeof pt === 'object') return pt.y !== undefined ? pt.y : (pt.value !== undefined ? pt.value : null);
            return parseFloat(pt) || null;
        });

        var ds = { label: s.name || ('Series ' + (i + 1)), data: values, borderRadius: 4 };

        if (isLine) {
            ds.borderColor      = color;
            ds.backgroundColor  = color + '22';
            ds.borderWidth      = 2;
            ds.pointRadius      = 3;
            ds.pointHoverRadius = 5;
            ds.fill             = false;
            ds.tension          = 0.35;
        } else {
            ds.backgroundColor  = color + 'bb';
            ds.borderColor      = color;
            ds.borderWidth      = 1;
        }
        return ds;
    });
}

function buildPieData(series) {
    var s = series[0] || { data: [] };
    var labels = [], values = [];
    (s.data || []).forEach(function(pt) {
        if (pt === null) return;
        if (typeof pt === 'object' && !Array.isArray(pt)) {
            labels.push(pt.name || pt.label || '');
            values.push(pt.y !== undefined ? pt.y : (pt.value !== undefined ? pt.value : 0));
        } else {
            labels.push('');
            values.push(typeof pt === 'number' ? pt : parseFloat(pt) || 0);
        }
    });
    return { labels: labels, values: values };
}

function detectType(raw) {
    if (raw.chart && raw.chart.type)              return raw.chart.type.toLowerCase();
    if (raw.series && raw.series[0] && raw.series[0].type) return raw.series[0].type.toLowerCase();
    var po = raw.plotOptions || {};
    if (po.pie)    return 'pie';
    if (po.line || po.spline || po.area) return 'line';
    if (po.bar)    return 'bar';
    return 'column';
}

function detectStacked(raw) {
    var po = raw.plotOptions || {};
    return !!((po.column && po.column.stacking) ||
              (po.bar    && po.bar.stacking)    ||
              (po.series && po.series.stacking));
}

/* ═══════════════════════════════════════════════════════════════════════
   MASTER RENDER
   ═══════════════════════════════════════════════════════════════════════ */

function renderChart(canvasId, raw) {
    if (!raw) { showError(canvasId, 'No data returned from server.'); return; }

    var canvas = document.getElementById(canvasId);
    if (!canvas) { console.warn('manwar.js: canvas not found:', canvasId); return; }

    destroyChart(canvasId);

    var type    = detectType(raw);
    var stacked = detectStacked(raw);
    var series  = raw.series || [];

    if (!series.length) { showError(canvasId, 'No series data.'); return; }

    /* ── PIE / DOUGHNUT ── */
    if (type === 'pie' || type === 'donut' || type === 'doughnut') {
        var pd = buildPieData(series);
        if (!pd.values.length) { showError(canvasId, 'Empty dataset.'); return; }
        _drillStack[canvasId] = _drillStack[canvasId] || [];
        _registry[canvasId] = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels:   pd.labels,
                datasets: [{ data: pd.values,
                    backgroundColor: THEME.palette.map(function(c){ return c+'cc'; }),
                    borderColor: THEME.panel, borderWidth: 2, hoverOffset: 6 }]
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { position: 'right', labels: { padding: 14, font: { size: 11 } } } }
            }
        });
        attachDrilldownClick(canvasId, raw);
        renderBreadcrumb(canvasId, canvas.parentNode);
        return;
    }

    /* ── LINE / AREA ── */
    var isLine = (type === 'line' || type === 'spline' || type === 'area' || type === 'areaspline');

    /* Resolve x-axis labels */
    var labels = getCategories(raw);
    if (!labels) {
        var first = series[0] || {};
        if (first.data && first.data.length && typeof first.data[0] === 'object' && !Array.isArray(first.data[0])) {
            labels = (first.data || []).map(function(pt) { return pt ? (pt.name || pt.category || '') : ''; });
        }
    }
    if (!labels || !labels.length) {
        var maxLen = series.reduce(function(m, s) { return Math.max(m, (s.data||[]).length); }, 0);
        labels = [];
        for (var i = 0; i < maxLen; i++) labels.push(String(i + 1));
    }

    var datasets = buildDatasets(series, type);
    var scalesX  = { grid: { color: THEME.border + '88' }, ticks: { color: THEME.muted, maxRotation: 45 } };
    var scalesY  = { grid: { color: THEME.border + '88' }, ticks: { color: THEME.muted } };
    if (stacked) { scalesX.stacked = true; scalesY.stacked = true; }

    _drillStack[canvasId] = _drillStack[canvasId] || [];
    _registry[canvasId] = new Chart(canvas, {
        type: isLine ? 'line' : 'bar',
        data: { labels: labels, datasets: datasets },
        options: {
            indexAxis:   (type === 'bar') ? 'y' : 'x',
            responsive:  true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: datasets.length > 1 },
                tooltip: {
                    callbacks: {
                        /*
                         * In drilldown state: read pt.name from _ddPoints
                         * which the server provides as e.g.
                         *   "#1234, #4321: metacpan/metacpan-web"
                         * Format: "<name>: <value>"
                         *
                         * At top level: default "dataset: value"
                         */
                        label: function(ctx) {
                            var cvs    = document.getElementById(canvasId);
                            var stack  = _drillStack[canvasId] || [];
                            var pts    = cvs && cvs._ddPoints;
                            if (stack.length && pts && pts[ctx.dataIndex] !== undefined) {
                                var pt    = pts[ctx.dataIndex];
                                /* Data is ["#595, #599: repo/name", 3] */
                                var raw   = Array.isArray(pt) ? pt[0]
                                          : (pt && pt.name)  ? pt.name
                                          : '';
                                var value = ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed;
                                /* Split "prs: repo" into repo (title line) + prs (detail line) */
                                var sep   = raw.lastIndexOf(': ');
                                var repo  = sep >= 0 ? raw.slice(sep + 2) : raw;
                                var prs   = sep >= 0 ? raw.slice(0, sep)  : '';
                                /* Return array → Chart.js renders each element on its own line */
                                return prs ? [repo + ': ' + value, prs] : [repo + ': ' + value];
                            }
                            return ctx.dataset.label + ': ' + (ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed);
                        },
                        title: function(ctxArr) {
                            /* In drilldown: suppress the default x-axis label title line */
                            var stack = _drillStack[canvasId] || [];
                            if (stack.length) return '';
                            return ctxArr.length ? ctxArr[0].label : '';
                        },
                        afterLabel: function(ctx) {
                            var stack = _drillStack[canvasId] || [];
                            if (stack.length) return '';
                            var r = (document.getElementById(canvasId) || {})._ddRaw;
                            if (!r) return '';
                            var sarr = r.series || [];
                            for (var s = 0; s < sarr.length; s++) {
                                var pt = sarr[s].data && sarr[s].data[ctx.dataIndex];
                                if (pt && typeof pt === 'object' && pt.drilldown) return '▸ Click to drill down';
                            }
                            return '';
                        }
                    }
                }
            },
            scales: { x: scalesX, y: scalesY }
        }
    });
    attachDrilldownClick(canvasId, raw);
    renderBreadcrumb(canvasId, canvas.parentNode);
}

/* ═══════════════════════════════════════════════════════════════════════
   FETCH + RENDER  –  AJAX wrapper
   ═══════════════════════════════════════════════════════════════════════ */

function fetchAndRender(url, canvasId, spinnerId) {
    spinnerShow(spinnerId);
    /* Fresh top-level fetch always resets the drilldown stack */
    _drillStack[canvasId] = [];
    $.ajax({
        url: url, dataType: 'json',
        success: function(data) {
            try { renderChart(canvasId, data); }
            catch(err) {
                console.error('manwar.js renderChart error [' + canvasId + ']:', err, data);
                showError(canvasId, 'Chart render error — see browser console.');
            }
        },
        error: function(xhr, status, err) {
            console.warn('manwar.js fetch failed [' + url + ']:', status, err);
            showError(canvasId, 'Could not load data (HTTP ' + (xhr.status || status) + ').');
        },
        complete: function() { spinnerHide(spinnerId); }
    });
}

/* ─── Lazy-load guard ────────────────────────────────────────────────── */
var _loaded = {};
function once(key, fn) { if (_loaded[key]) return; _loaded[key] = true; fn(); }

/* ═══════════════════════════════════════════════════════════════════════
   HOW-TO
   ═══════════════════════════════════════════════════════════════════════ */
$('#git_topic').on('change', function() {
    var id = $(this).val(); if (!id) return;
    spinnerShow('how-to-spinner');
    $.get('/git-how-to/' + id, function(html) { $('#git_how_to_response').html(html); })
     .always(function() { spinnerHide('how-to-spinner'); });
});
$('#psql_topic').on('change', function() {
    var id = $(this).val(); if (!id) return;
    spinnerShow('how-to-spinner');
    $.get('/psql-how-to/' + id, function(html) { $('#psql_how_to_response').html(html); })
     .always(function() { spinnerHide('how-to-spinner'); });
});

/* ═══════════════════════════════════════════════════════════════════════
   MAP::TUBE
   ═══════════════════════════════════════════════════════════════════════ */
$('#map_name').on('change', function() {
    var map = $(this).val(); if (!map) return;
    $('#start, #end').html('<option value="">Loading…</option>');
    $.get('/stations/' + map, function(html) { $('#start').html(html); $('#end').html(html); });
});

(function() {
    var a = Math.ceil(Math.random() * 9), b = Math.ceil(Math.random() * 9);
    $('#txt_captcha').text(a + ' + ' + b + ' =');
    window._captchaAnswer = a + b;
})();

$('#map_tube_button').on('click', function() {
    if (parseInt($('#txt_captcha_response').val(), 10) !== window._captchaAnswer) {
        $('#shortest-route-result').html('<span style="color:var(--danger)">Incorrect captcha.</span>'); return;
    }
    var map = $('#map_name').val(), start = $('#start').val(), end = $('#end').val();
    if (!map || !start || !end) {
        $('#shortest-route-result').html('<span style="color:var(--warn)">Please select map, start and end station.</span>'); return;
    }
    spinnerShow('map-tube-spinner');
    $.get('/shortest-route/' + map + '/' + encodeURIComponent(start) + '/' + encodeURIComponent(end), function(html) {
        $('#shortest-route-result').html(html);
    }).always(function() { spinnerHide('map-tube-spinner'); });
});

/* ═══════════════════════════════════════════════════════════════════════
   CPAN REGULARS
   ═══════════════════════════════════════════════════════════════════════ */
$(function() { once('daily',   function() { fetchAndRender('/stats/daily',   'chart_daily_stats',   'cr-spinner'); }); });
$('#ws').on('click', function() { once('weekly',  function() { fetchAndRender('/stats/weekly',   'chart_weekly_stats',  'cr-spinner'); }); });
$('#ms').on('click', function() { once('monthly', function() { fetchAndRender('/stats/monthly',  'chart_monthly_stats', 'cr-spinner'); }); });

/* ═══════════════════════════════════════════════════════════════════════
   CPAN UPLOADERS
   ═══════════════════════════════════════════════════════════════════════ */
$(function()         { once('cpan-uploaders',    function() { fetchAndRender('/cpan-uploaders/0',    'chart_cpan_uploaders',    'cu-spinner'); }); });
$('#nus').on('click', function() { once('neocpan-uploaders', function() { fetchAndRender('/neocpan-uploaders/0', 'chart_neocpan_uploaders', 'cu-spinner'); }); });

/* ═══════════════════════════════════════════════════════════════════════
   CPAN DISTRIBUTIONS
   ═══════════════════════════════════════════════════════════════════════ */
$(function()             { once('adopted', function() { fetchAndRender('/adopted-distributions',          'chart_adopted_dists', 'cd-spinner'); }); });
$('#pd-a-d').on('click', function() { once('pd-a-d', function() { fetchAndRender('/personal-distributions/a/d', 'chart_pd_a_d',        'cd-spinner'); }); });
$('#pd-e-z').on('click', function() { once('pd-e-z', function() { fetchAndRender('/personal-distributions/e/z', 'chart_pd_e_z',        'cd-spinner'); }); });

/* ═══════════════════════════════════════════════════════════════════════
   HISTORICAL DISTRIBUTIONS
   ═══════════════════════════════════════════════════════════════════════ */
$(function()            { once('hd-10', function() { fetchAndRender('/historical-distributions/10', 'chart_hd_10', 'hd-spinner'); }); });
$('#hd_20').on('click', function() { once('hd-20', function() { fetchAndRender('/historical-distributions/20', 'chart_hd_20', 'hd-spinner'); }); });
$('#hd_30').on('click', function() { once('hd-30', function() { fetchAndRender('/historical-distributions/30', 'chart_hd_30', 'hd-spinner'); }); });

/* ═══════════════════════════════════════════════════════════════════════
   GITHUB PR TRACKER
   ═══════════════════════════════════════════════════════════════════════ */
$(function()                     { once('prt-sum',    function() { fetchAndRender('/pull-request-tracker', 'chart_pr_tracker_summary', 'pr-tracker-spinner'); }); });
$('#author_by_pr').on('click',   function() { once('prt-bypr',   function() { fetchAndRender('/author-by-pr',         'chart_author_by_pr',       'pr-tracker-spinner'); }); });
$('#author_by_repo').on('click', function() { once('prt-byrepo', function() { fetchAndRender('/author-by-repo',       'chart_author_by_repo',     'pr-tracker-spinner'); }); });

/* ═══════════════════════════════════════════════════════════════════════
   GITHUB PULL REQUEST
   ═══════════════════════════════════════════════════════════════════════ */
$(function() { once('pr-sum', function() { fetchAndRender('/pullrequest/summary', 'chart_pr_summary', 'pr-spinner'); }); });
(function() {
    [2026,2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015].forEach(function(y) {
        $('#pr_' + y).on('click', function() { once('pr-' + y, function() { fetchAndRender('/pullrequest/' + y, 'chart_pr_' + y, 'pr-spinner'); }); });
    });
})();

/* ═══════════════════════════════════════════════════════════════════════
   PERL WEEKLY CHALLENGE
   ═══════════════════════════════════════════════════════════════════════ */
$(function() { once('pwc', function() { fetchAndRender('/pwc-leaders', 'chart_pwc_leaders', 'pwc-spinner'); }); });

/* ═══════════════════════════════════════════════════════════════════════
   PULL REQUEST CLUB
   ═══════════════════════════════════════════════════════════════════════ */
$(function() { once('prclub-sum', function() { fetchAndRender('/pullrequest-club/summary', 'chart_prclub_summary', 'prclub-spinner'); }); });
(function() {
    [2022,2021,2020,2019].forEach(function(y) {
        $('#prclub_' + y).on('click', function() { once('prclub-' + y, function() { fetchAndRender('/pullrequest-club/' + y, 'chart_prclub_' + y, 'prclub-spinner'); }); });
    });
})();

/* ═══════════════════════════════════════════════════════════════════════
   PULL REQUEST CHALLENGE
   ═══════════════════════════════════════════════════════════════════════ */
$(function() { once('prc-sum', function() { fetchAndRender('/pullrequest-challenge/summary', 'chart_prc_summary', 'prc-spinner'); }); });
(function() {
    [2018,2017,2016,2015].forEach(function(y) {
        $('#prc_' + y).on('click', function() { once('prc-' + y, function() { fetchAndRender('/pullrequest-challenge/' + y, 'chart_prc_' + y, 'prc-spinner'); }); });
    });
})();

/* ═══════════════════════════════════════════════════════════════════════
   GITHUB COMMITS
   ═══════════════════════════════════════════════════════════════════════ */
$(function() { once('gc-sum', function() { fetchAndRender('/git-commits/summary', 'chart_gc_summary', 'gc-spinner'); }); });
(function() {
    [2026,2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014].forEach(function(y) {
        $('#gc_' + y).on('click', function() { once('gc-' + y, function() { fetchAndRender('/git-commits/' + y, 'chart_gc_' + y, 'gc-spinner'); }); });
    });
})();

/* ═══════════════════════════════════════════════════════════════════════
   PR EVENTS
   ═══════════════════════════════════════════════════════════════════════ */
$(function() { once('hacktoberfest', function() { fetchAndRender('/hacktoberfest',    'chart_hacktoberfest',  'pr-events-spinner'); }); });
$('#pullrequest_24').on('click', function() { once('24pr', function() { fetchAndRender('/24pullrequest', 'chart_24pullrequest', 'pr-events-spinner'); }); });

/* ═══════════════════════════════════════════════════════════════════════
   Bootstrap tab shown → resize all charts
   Chart.js needs a visible canvas to compute dimensions correctly
   ═══════════════════════════════════════════════════════════════════════ */
$('a[data-toggle="tab"]').on('shown.bs.tab', function() {
    Object.keys(_registry).forEach(function(id) {
        try { _registry[id].resize(); } catch(e) {}
    });
});

/* ═══════════════════════════════════════════════════════════════════════
   DRILLDOWN ENGINE
   ═══════════════════════════════════════════════════════════════════════ */

/* Per-canvas drilldown state stack */
var _drillStack = {};   /* canvasId → [ { raw, title }, ... ] */

/* ── Chart title element above canvas ───────────────────────────────── */
function renderChartTitle(canvasId, wrap, titleText, subtitleText) {
    /* Remove any old title block */
    var old = wrap.querySelector('.dd-chart-title');
    if (old) old.parentNode.removeChild(old);
    if (!titleText) return;

    var block = document.createElement('div');
    block.className = 'dd-chart-title';
    block.style.cssText = [
        'margin-bottom:12px',
        'font-family:"Syne",sans-serif'
    ].join(';');

    var h = document.createElement('div');
    h.textContent = titleText;
    h.style.cssText = [
        'font-size:15px',
        'font-weight:700',
        'color:#e2e8f0',
        'letter-spacing:0.01em'
    ].join(';');
    block.appendChild(h);

    if (subtitleText) {
        var sub = document.createElement('div');
        sub.textContent = subtitleText;
        sub.style.cssText = [
            'font-size:11px',
            'color:#64748b',
            'margin-top:3px',
            'font-family:"Space Mono",monospace'
        ].join(';');
        block.appendChild(sub);
    }

    /* Insert AFTER breadcrumb (if present), before canvas */
    var bc = wrap.querySelector('.dd-breadcrumb');
    if (bc && bc.nextSibling) {
        wrap.insertBefore(block, bc.nextSibling);
    } else {
        wrap.insertBefore(block, wrap.firstChild);
    }
}

/* ── Breadcrumb bar ──────────────────────────────────────────────────── */
function renderBreadcrumb(canvasId, wrap) {
    var stack = _drillStack[canvasId] || [];
    var old   = wrap.querySelector('.dd-breadcrumb');
    if (old) old.parentNode.removeChild(old);

    if (stack.length === 0) return;   /* top level – no bar needed */

    var bar = document.createElement('div');
    bar.className = 'dd-breadcrumb';
    bar.style.cssText = [
        'display:flex', 'align-items:center', 'gap:10px',
        'margin-bottom:8px',
        'padding:6px 10px',
        'background:#131720',
        'border:1px solid #252d3e',
        'border-radius:7px',
        'font-family:"Space Mono",monospace',
        'font-size:11px'
    ].join(';');

    /* ← Back button */
    var btn = document.createElement('button');
    btn.innerHTML = '&#8592; Back';
    btn.style.cssText = [
        'background:transparent',
        'border:1px solid #3b82f6',
        'color:#3b82f6',
        'padding:3px 10px',
        'border-radius:5px',
        'cursor:pointer',
        'font-family:"Space Mono",monospace',
        'font-size:11px',
        'line-height:1.6',
        'transition:background .15s,color .15s'
    ].join(';');
    btn.onmouseover = function() { this.style.background='rgba(59,130,246,.15)'; };
    btn.onmouseout  = function() { this.style.background='transparent'; };
    btn.addEventListener('click', function() { drillUp(canvasId); });

    /* Separator */
    var sep = document.createElement('span');
    sep.textContent = '|';
    sep.style.color = '#252d3e';

    /* Trail: Home › Jan › Week 1  (current level shown at end, highlighted) */
    var trail = document.createElement('span');
    trail.style.cssText = 'color:#64748b; display:flex; align-items:center; gap:4px;';

    var crumbs = [{ label: 'Home', current: false }];
    stack.forEach(function(s, i) {
        crumbs.push({ label: s.title || '…', current: i === stack.length - 1 });
    });

    crumbs.forEach(function(c, i) {
        if (i > 0) {
            var arrow = document.createElement('span');
            arrow.textContent = '›';
            arrow.style.cssText = 'color:#3d4f6a; font-size:13px;';
            trail.appendChild(arrow);
        }
        var crumb = document.createElement('span');
        crumb.textContent = c.label;
        if (c.current) {
            crumb.style.cssText = 'color:#e2e8f0; font-weight:700;';
        }
        trail.appendChild(crumb);
    });

    bar.appendChild(btn);
    bar.appendChild(sep);
    bar.appendChild(trail);
    wrap.insertBefore(bar, wrap.firstChild);
}

/* ── Drill down ──────────────────────────────────────────────────────── */
function drillDown(canvasId, raw, childSeriesId, clickedLabel) {
    var drillData = raw.drilldown;
    if (!drillData || !drillData.series) return;

    var child = null;
    for (var i = 0; i < drillData.series.length; i++) {
        if (drillData.series[i].id === childSeriesId) { child = drillData.series[i]; break; }
    }
    if (!child) { console.warn('manwar drilldown: id not found:', childSeriesId); return; }

    if (!_drillStack[canvasId]) _drillStack[canvasId] = [];
    _drillStack[canvasId].push({ raw: raw, title: clickedLabel });

    /* Rename the child series to the clicked label so tooltip shows it */
    var childCopy = JSON.parse(JSON.stringify(child));
    childCopy.name = clickedLabel;

    var childRaw = {
        chart:  { type: raw.chart ? (raw.chart.type || 'column') : 'column' },
        series: [ childCopy ],
        xAxis:  {},
        _drillTitle:    clickedLabel,
        _drillSubtitle: '← Click Back to return to overview'
    };

    if (childCopy.data && childCopy.data.length) {
        childRaw.xAxis.categories = childCopy.data.map(function(p) {
            /* [name, value] array format */
            if (Array.isArray(p))               return p[0] || '';
            /* {name, y} object format */
            if (p && typeof p === 'object')     return p.name || p.category || '';
            return '';
        });
    }

    renderChart(canvasId, childRaw);

    var canvas = document.getElementById(canvasId);
    if (canvas) {
        /* Store the full point objects so the tooltip can read pt.name */
        canvas._ddPoints = childCopy.data || [];
        var wrap = canvas.parentNode;
        renderBreadcrumb(canvasId, wrap);
        renderChartTitle(canvasId, wrap, clickedLabel, '← Click Back to return to overview');
    }
}

/* ── Drill up ────────────────────────────────────────────────────────── */
function drillUp(canvasId) {
    var stack = _drillStack[canvasId];
    if (!stack || !stack.length) return;

    var prev = stack.pop();
    renderChart(canvasId, prev.raw);

    var canvas = document.getElementById(canvasId);
    if (canvas) canvas._ddPoints = null;  /* clear drilldown point cache */
    if (canvas) {
        var wrap = canvas.parentNode;
        renderBreadcrumb(canvasId, wrap);
        /* Restore parent title if it was a drilldown level, else remove */
        if (stack.length > 0) {
            renderChartTitle(canvasId, wrap, stack[stack.length-1].title, '← Click Back to return');
        } else {
            renderChartTitle(canvasId, wrap, null);
            /* Re-attach top-level subtitle hint */
            attachDrillHint(canvasId);
        }
    }
}

/* ── Check for drilldown data ────────────────────────────────────────── */
function hasDrilldown(raw) {
    if (!raw || !raw.drilldown || !raw.drilldown.series || !raw.drilldown.series.length) return false;
    var series = raw.series || [];
    for (var i = 0; i < series.length; i++) {
        var data = series[i].data || [];
        for (var j = 0; j < data.length; j++) {
            if (data[j] && typeof data[j] === 'object' && data[j].drilldown) return true;
        }
    }
    return false;
}

/* ── Subtitle hint on top-level drillable charts ─────────────────────── */
function attachDrillHint(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var wrap = canvas.parentNode;
    var old  = wrap.querySelector('.dd-hint');
    if (old) return;   /* already there */
    var hint = document.createElement('div');
    hint.className = 'dd-hint';
    hint.textContent = '▸ Click any bar to drill down';
    hint.style.cssText = [
        'font-size:11px',
        'color:#3b82f6',
        'margin-bottom:8px',
        'font-family:"Space Mono",monospace',
        'opacity:0.75'
    ].join(';');
    /* Insert just before the canvas */
    wrap.insertBefore(hint, canvas);
}

function removeDrillHint(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var hint = canvas.parentNode.querySelector('.dd-hint');
    if (hint) hint.parentNode.removeChild(hint);
}

/* ── Wire up click + hover + tooltip on a drillable chart ────────────── */
function attachDrilldownClick(canvasId, raw) {
    if (!hasDrilldown(raw)) return;

    var chart  = _registry[canvasId];
    if (!chart) return;

    var canvas = document.getElementById(canvasId);
    canvas._ddRaw = raw;

    /* Show the "click to drill" hint */
    attachDrillHint(canvasId);

    /* ── Click ── */
    canvas.addEventListener('click', function(evt) {
        /* Use the current chart instance (may have changed after drillUp) */
        var currentChart = _registry[canvasId];
        if (!currentChart) return;

        var stack     = _drillStack[canvasId] || [];
        var activeRaw = stack.length ? null : canvas._ddRaw;
        if (!activeRaw) return;

        var points = currentChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
        if (!points.length) return;

        var idx          = points[0].index;
        var seriesArr    = activeRaw.series || [];
        var drillId      = null;
        var clickedLabel = '';

        for (var s = 0; s < seriesArr.length; s++) {
            var pt = seriesArr[s].data && seriesArr[s].data[idx];
            if (pt && typeof pt === 'object' && pt.drilldown) {
                drillId      = pt.drilldown;
                clickedLabel = pt.name || (currentChart.data.labels[idx]) || String(idx);
                break;
            }
        }

        if (drillId) {
            removeDrillHint(canvasId);
            drillDown(canvasId, activeRaw, drillId, clickedLabel);
        }
    });

    /* ── Hover cursor ── */
    canvas.addEventListener('mousemove', function(evt) {
        var currentChart = _registry[canvasId];
        if (!currentChart) return;

        var stack = _drillStack[canvasId] || [];
        if (stack.length) { canvas.style.cursor = 'default'; return; }

        var points = currentChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
        if (!points.length) { canvas.style.cursor = 'default'; return; }

        var idx  = points[0].index;
        var sarr = (canvas._ddRaw && canvas._ddRaw.series) || [];
        var drill = false;
        for (var s = 0; s < sarr.length; s++) {
            var pt = sarr[s].data && sarr[s].data[idx];
            if (pt && typeof pt === 'object' && pt.drilldown) { drill = true; break; }
        }
        canvas.style.cursor = drill ? 'pointer' : 'default';
    });

    /* tooltip callbacks are baked into renderChart options — just update */
    chart.update();
}

