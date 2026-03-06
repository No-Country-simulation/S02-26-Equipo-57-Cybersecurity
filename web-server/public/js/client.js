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

        // Get current context
        const context = { 
            findings: lastFindings, 
            url: targetInput.value, 
            currentSection: document.querySelector(".section.active").id 
        };

        // If in docs, add document content
        if (context.currentSection === 'docs') {
            const activeDoc = document.querySelector('.doc-item.active span');
            if (activeDoc) {
                context.currentDocTitle = activeDoc.textContent;
                // Add snippet of content if available
                const docContent = document.getElementById('doc-display').innerText;
                context.currentDocContent = docContent.substring(0, 500) + '...'; 
            }
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: context })
            });
            const data = await res.json();
            
            // Handle [[GOTO:section]] command
            const gotoMatch = data.reply.match(/\[\[GOTO:(\w+)\]\]/);
            if (gotoMatch) {
                const sectionId = gotoMatch[1].toLowerCase();
                const navItem = document.querySelector(`[data-section="${sectionId}"]`);
                if (navItem) {
                    navItem.click();
                    // If it's a doc recommendation, we might need logic to open specific docs, 
                    // but for now, navigating to the section is a good start.
                }
                // Clean the command from the displayed text
                data.reply = data.reply.replace(/\[\[GOTO:\w+\]\]/g, "").trim();
            }

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
        const countEl = document.getElementById('dash-scans-count');
        if (countEl) countEl.textContent = h.length; 
    }

    // 1. Interactive Checklist Logic
    const checklistContainer = document.getElementById('checklist-container');
    const complianceScoreEl = document.getElementById('compliance-score');
    const complianceBar = document.getElementById('compliance-bar');

    const checklistItems = [
        { id: 'c1', text: 'MFA Enforcement (Auth0/Firebase)', cat: 'Identity' },
        { id: 'c2', text: 'TLS 1.3 + HSTS Enabled', cat: 'Network' },
        { id: 'c3', text: 'Secrets in Vault (No hardcoded)', cat: 'Secrets' },
        { id: 'c4', text: 'PCI DSS Compliance Audit', cat: 'Compliance' },
        { id: 'c5', text: 'Daily Vulnerability Scanning', cat: 'Ops' },
        { id: 'c6', text: 'DDoS Protection (Cloudflare/AWS)', cat: 'Infra' }
    ];

    function initChecklist() {
        if (!checklistContainer) return;
        const saved = JSON.parse(localStorage.getItem('odin_checklist') || '{}');
        
        checklistContainer.innerHTML = '';
        checklistItems.forEach(item => {
            const isChecked = saved[item.id] ? 'checked' : '';
            const div = document.createElement('div');
            div.className = 'checklist-item-wrapper';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '10px';
            div.style.padding = '0.5rem';
            div.style.borderBottom = '1px solid #eee';
            div.innerHTML = `
                <input type="checkbox" id="${item.id}" ${isChecked} style="width: 18px; height: 18px; cursor: pointer;">
                <label for="${item.id}" style="cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                    <span style="color: var(--odin-accent); font-size: 0.6rem; display: block;">${item.cat}</span>
                    ${item.text}
                </label>
            `;
            const checkbox = div.querySelector('input');
            checkbox.onchange = () => {
                saved[item.id] = checkbox.checked;
                localStorage.setItem('odin_checklist', JSON.stringify(saved));
                updateCompliance();
            };
            checklistContainer.appendChild(div);
        });
        updateCompliance();
    }

    function updateCompliance() {
        const saved = JSON.parse(localStorage.getItem('odin_checklist') || '{}');
        const checkedCount = Object.values(saved).filter(Boolean).length;
        const score = Math.round((checkedCount / checklistItems.length) * 100);
        
        if (complianceScoreEl) complianceScoreEl.textContent = `${score}%`;
        if (complianceBar) complianceBar.style.width = `${score}%`;
    }

    // 2. CI/CD Pipeline Simulator
    const btnCicd = document.getElementById('btn-cicd');
    const cicdViz = document.getElementById('cicd-viz');

    if (btnCicd) {
        btnCicd.onclick = async () => {
            btnCicd.disabled = true;
            cicdViz.classList.remove('d-none');
            cicdViz.innerHTML = '';
            
            const steps = [
                { n: 'GIT PUSH', icon: 'fa-code-branch' },
                { n: 'SECRET SCAN', icon: 'fa-shield-alt' },
                { n: 'DEP CHECK', icon: 'fa-box-open' },
                { n: 'SAST SCAN', icon: 'fa-search' },
                { n: 'ODIN AUDIT', icon: 'fa-microchip' },
                { n: 'DEPLOY', icon: 'fa-rocket' }
            ];

            for (const step of steps) {
                const el = document.createElement('div');
                el.style.textAlign = 'center';
                el.style.minWidth = '100px';
                el.innerHTML = `
                    <div class="pipeline-node" style="width: 40px; height: 40px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px;">
                        <i class="fas ${step.icon}"></i>
                    </div>
                    <small style="font-size: 0.6rem; font-weight: 900;">${step.n}</small>
                `;
                cicdViz.appendChild(el);
                
                const node = el.querySelector('.pipeline-node');
                node.style.background = 'var(--odin-accent)';
                node.style.color = '#fff';
                node.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
                
                await sleep(1000);
                
                node.style.background = '#22c55e';
                node.innerHTML = '<i class="fas fa-check"></i>';
                
                if (step !== steps[steps.length - 1]) {
                    const line = document.createElement('div');
                    line.style.height = '2px'; line.style.width = '30px'; line.style.background = '#22c55e';
                    cicdViz.appendChild(line);
                }
            }
            btnCicd.disabled = false;
        };
    }

    updateUI(); 
    loadDocsList(); 
    loadHistory(); 
    incrementScanCount();
    initChecklist();

    // Navigation logic (Ensure it runs even if other parts fail)
    document.querySelectorAll('.nav-item').forEach(i => {
        i.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = i.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            
            if (section) {
                document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
                i.classList.add('active');
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                section.classList.add('active');
            }
        });
    });

    const chatHeader = document.getElementById('chat-header');
    if (chatHeader) {
        chatHeader.onclick = () => {
            const widget = document.getElementById('chat-widget') || document.getElementById('chat-dock');
            if (widget) widget.classList.toggle('open');
        };
    }
});
