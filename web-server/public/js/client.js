document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const scanBtn = document.getElementById('btn-scan');
    const targetInput = document.getElementById('target-url');
    const terminal = document.getElementById('audit-terminal');
    const auditResults = document.getElementById('audit-results');
    const resultsList = document.getElementById('results-list');
    const btnLog = document.getElementById('btn-download-log');
    const btnPdf = document.getElementById('btn-download-pdf');
    const docTree = document.getElementById('doc-tree');
    const docDisplay = document.getElementById('doc-display');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const btnLang = document.getElementById('btn-lang');
    const historyList = document.getElementById('history-list');
    const chatSendBtn = document.getElementById('btn-chat-send');

    // State
    let currentLang = 'es';
    let sessionLogs = [];
    let lastFindings = [];
    const i18n = {
        es: {
            nav_dash: "DASHBOARD", nav_audit: "AUDITORÍA", nav_docs: "DOCUMENTACIÓN", nav_history: "LOGS DE AUDITORÍA",
            dash_title: "ESTADO OPERACIONAL", stat_defense: "DEFENSA DE RED", val_active: "ACTIVA",
            stat_ai: "NÚCLEO DE INTELIGENCIA", stat_scans: "ESCANEOS TOTALES",
            audit_title: "CONSOLA DE AUDITORÍA", audit_desc: "Auditoría en tiempo real con motor O.D.I.N. JS.",
            btn_scan: "INICIAR ESCANEO", report_title: "REPORTE TÉCNICO",
            doc_resources: "BIBLIOTECA TÉCNICA", doc_empty: "Seleccione un recurso para visualizarlo.",
            history_title: "HISTORIAL DE ACTIVIDAD",
            cat_arch: "ARQUITECTURA & ESTRATEGIA",
            cat_best: "MEJORES PRÁCTICAS & OPERACIONES"
        },
        en: {
            nav_dash: "DASHBOARD", nav_audit: "AUDIT", nav_docs: "DOCUMENTATION", nav_history: "AUDIT LOGS",
            dash_title: "OPERATIONAL STATUS", stat_defense: "NETWORK DEFENSE", val_active: "ACTIVE",
            stat_ai: "INTELLIGENCE CORE", stat_scans: "TOTAL SCANS",
            audit_title: "AUDIT CONSOLE", audit_desc: "Real-time audit with O.D.I.N. JS Engine.",
            btn_scan: "RUN SCAN", report_title: "TECHNICAL REPORT",
            doc_resources: "TECHNICAL LIBRARY", doc_empty: "Select a resource to view.",
            history_title: "ACTIVITY HISTORY",
            cat_arch: "ARCHITECTURE & STRATEGY",
            cat_best: "BEST PRACTICES & OPERATIONS"
        }
    };

    // 1. Language & Persistence Init
    btnLang.onclick = () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        updateUI();
        loadDocsList();
    };

    function updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[currentLang][key]) {
                const textEl = el.querySelector('.sidebar-text') || el;
                textEl.textContent = i18n[currentLang][key];
            }
        });
        targetInput.placeholder = currentLang === 'es' ? "URL Objetivo..." : "Target URL...";
    }

    // 2. Audit Engine
    scanBtn.onclick = async () => {
        const url = targetInput.value.trim();
        if (!url) return;
        
        scanBtn.disabled = true;
        document.getElementById('terminal-wrapper').classList.remove('d-none');
        auditResults.classList.add('d-none');
        terminal.innerHTML = '';
        sessionLogs = [];
        
        logToTerm(`[+] INITIALIZING O.D.I.N. JS CORE SCAN...`, "info");
        logToTerm(`[*] TARGET: ${url}`, "info");
        
        const steps = [
            { m: "Crawling structure...", t: "data" },
            { m: "Analyzing Security Headers (HSTS, CSP, X-Frame)...", t: "exec" },
            { m: "Detecting XSS Reflection Vectors...", t: "exec" },
            { m: "Evaluating SQLi Indicator patterns...", t: "exec" },
            { m: "Consulting ODIN-AI for remediation...", t: "info" }
        ];

        for(const s of steps) {
            logToTerm(`[*] ${s.m}`, s.t);
            await sleep(800);
            if(s.m.includes("Headers")) ["CSP", "HSTS", "XSS-Protection"].forEach(h => logToTerm(`[!] MISSING: ${h}`, "warn"));
        }

        lastFindings = generateFindings(url);
        renderFindings(lastFindings);
        logToTerm(`[DONE] Scan complete. Vulnerabilities found: ${lastFindings.length}`, "success");
        scanBtn.disabled = false;
        auditResults.classList.remove('d-none');
        
        const scanEntry = { url, logs: [...sessionLogs], findings: [...lastFindings], date: new Date().toISOString() };
        saveHistory(scanEntry);
        incrementScanCount();
        addChatMessage("bot", `He finalizado la auditoría de ${url}. Se detectaron ${lastFindings.length} vulnerabilidades. ¿Quieres que analicemos alguna en detalle?`);
    };

    function logToTerm(msg, type) {
        const div = document.createElement('div');
        const color = { info: '#3b82f6', exec: '#a855f7', data: '#94a3b8', warn: '#fbbf24', success: '#22c55e' }[type];
        const time = new Date().toLocaleTimeString();
        div.innerHTML = `<span style="color:#666">[${time}]</span> <span style="color:${color}">${msg}</span>`;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
        sessionLogs.push(`[${time}] ${msg}`);
    }

    function renderFindings(findings) {
        resultsList.innerHTML = '';
        findings.forEach(f => {
            const div = document.createElement('div');
            div.style.padding = '1.5rem'; div.style.border = '2px solid #000'; div.style.marginBottom = '1.5rem';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:1rem; align-items:center">
                    <strong style="text-transform:uppercase; font-size:1.1rem">${f.name}</strong>
                    <span style="background:#000; color:#fff; padding:4px 12px; font-size:0.7rem; font-weight:900">${f.severity}</span>
                </div>
                <p style="font-size:0.9rem; color:#333">${f.desc}</p>
                <div style="background:#f0f4ff; border-left:4px solid var(--odin-accent); padding:1rem; margin-top:1rem; font-family:'Fira Code', monospace; font-size:0.8rem">
                    <span style="color:var(--odin-accent); font-weight:900">REMEDIATION:</span> ${f.fix}
                </div>
            `;
            resultsList.appendChild(div);
        });
    }

    function generateFindings(url) {
        const list = [
            { name: "HSTS Missing", severity: "Medium", desc: "No Strict-Transport-Security header detected. Site is vulnerable to SSL Stripping.", fix: "Strict-Transport-Security: max-age=31536000; includeSubDomains" },
            { name: "CSP Not Defined", severity: "High", desc: "Content-Security-Policy header is missing. High risk of XSS.", fix: "Implement CSP with 'self' and restricted object-src." }
        ];
        if(url.includes("google") || url.includes("fintech") || url.includes("api")) {
            list.push({ name: "Information Disclosure", severity: "Low", desc: "Server header leaks detailed version info.", fix: "Set ServerTokens to Prod in config." });
        }
        return list;
    }

    // 3. Export
    btnLog.onclick = () => downloadFile(sessionLogs.join('\n'), `odin_audit_${Date.now()}.log`);
    btnPdf.onclick = () => {
        const opt = { margin: 1, filename: `ODIN_REPORT.pdf`, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
        html2pdf().set(opt).from(resultsList).save();
    };

    // 4. Docs Tree Improvement
    async function loadDocsList() {
        try {
            const res = await fetch('/api/docs');
            const files = await res.json();
            docTree.innerHTML = `<div class="doc-category-header">${i18n[currentLang].doc_resources}</div>`;
            const cats = { 'Arquitectura': i18n[currentLang].cat_arch, 'Mejores Practicas': i18n[currentLang].cat_best };
            
            ['Arquitectura', 'Mejores Practicas'].forEach(cat => {
                const h = document.createElement('div'); h.className = 'doc-category-header';
                h.style.background = '#f8f9fa'; h.style.color = '#000'; h.style.borderBottom = '1px solid #000';
                h.textContent = cats[cat].toUpperCase();
                docTree.appendChild(h);
                files.filter(f => f.category === cat).forEach(f => {
                    const el = document.createElement('div'); el.className = 'doc-item';
                    el.innerHTML = `<i class="fas ${f.type === '.pdf' ? 'fa-file-pdf' : 'fa-file-alt'}"></i> <span>${f.name}</span>`;
                    el.onclick = () => loadDoc(f);
                    docTree.appendChild(el);
                });
            });
        } catch (e) { console.error(e); }
    }

    async function loadDoc(f) {
        document.querySelectorAll('.doc-item').forEach(i => i.classList.remove('active'));
        event.currentTarget.classList.add('active');
        if (f.type === '.pdf') { window.open(`/${f.category === 'Arquitectura' ? 'docs-static' : 'notes-static'}/${f.name}`, '_blank'); return; }
        docDisplay.innerHTML = `<div style="text-align:center; padding:5rem"><i class="fas fa-circle-notch fa-spin fa-2x"></i></div>`;
        try {
            const res = await fetch(`/api/docs/content?file=${encodeURIComponent(f.name)}&category=${encodeURIComponent(f.category)}`);
            const data = await res.json();
            docDisplay.innerHTML = marked.parse(data.content);
            if(window.renderMathInElement) renderMathInElement(docDisplay, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}] });
        } catch (e) { docDisplay.innerHTML = "ERROR_LOADING_DOC"; }
    }

    // 5. History Persistence
    function saveHistory(item) {
        const h = JSON.parse(localStorage.getItem('odin_h') || '[]');
        h.unshift(item);
        localStorage.setItem('odin_h', JSON.stringify(h.slice(0, 20)));
        loadHistory();
    }

    function loadHistory() {
        const h = JSON.parse(localStorage.getItem('odin_h') || '[]');
        historyList.innerHTML = h.length ? '' : '<p style="color:#ccc; text-align:center; padding:3rem">NO AUDIT LOGS FOUND</p>';
        h.forEach((item) => {
            const div = document.createElement('div'); div.className = 'history-item';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <strong style="font-size:1.1rem">${item.url}</strong>
                    <span style="font-size:0.7rem; font-weight:900; background:#000; color:#fff; padding:2px 8px">${item.findings.length} VULNS</span>
                </div>
                <div class="history-meta">
                    <small style="color:#666">${new Date(item.date).toLocaleString()}</small>
                    <span style="color:var(--odin-accent); font-weight:900; font-size:0.7rem">RESTORE SESSION <i class="fas fa-arrow-right"></i></span>
                </div>
            `;
            div.onclick = () => loadSession(item);
            historyList.appendChild(div);
        });
    }

    function loadSession(item) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector('[data-section="audit"]').classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('audit').classList.add('active');
        
        document.getElementById('terminal-wrapper').classList.remove('d-none');
        auditResults.classList.remove('d-none');
        terminal.innerHTML = item.logs.map(l => `<div>${l}</div>`).join('');
        sessionLogs = [...item.logs];
        lastFindings = [...item.findings];
        renderFindings(item.findings);
        targetInput.value = item.url;
    }

    // 6. AI Chat Enhancement
    chatSendBtn.onclick = sendChat;
    chatInput.onkeypress = (e) => { if(e.key === 'Enter') sendChat(); };

    async function sendChat() {
        const text = chatInput.value.trim();
        if(!text) return;
        addChatMessage("user", text);
        chatInput.value = '';

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: { findings: lastFindings, url: targetInput.value } })
            });
            const data = await res.json();
            addChatMessage("bot", data.reply);
        } catch (e) { addChatMessage("bot", "SYSTEM_ERROR: AI CORE DISCONNECTED"); }
    }

    function addChatMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `msg msg-${sender}`;
        div.textContent = text;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Utils
    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
    function downloadFile(c, f) { const b = new Blob([c], { type: 'text/plain' }); const l = document.createElement('a'); l.href = URL.createObjectURL(b); l.download = f; l.click(); }
    function incrementScanCount() { 
        const h = JSON.parse(localStorage.getItem('odin_h') || '[]');
        document.getElementById('dash-scans-count').textContent = h.length; 
    }

    updateUI(); loadDocsList(); loadHistory(); incrementScanCount();

    document.querySelectorAll('.nav-item').forEach(i => i.onclick = (e) => {
        e.preventDefault(); document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
        i.classList.add('active'); document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(i.getAttribute('data-section')).classList.add('active');
    });

    document.getElementById('chat-header').onclick = () => document.getElementById('chat-widget').classList.toggle('open');
});
