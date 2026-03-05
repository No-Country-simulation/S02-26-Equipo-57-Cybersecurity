import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import uuid
import time
from collections import deque
import csv
import os
import json

# =========================
# CONFIG
# =========================
HEADERS = {
    "User-Agent": "Security-Research-Bot/1.0"
}
XSS_PAYLOADS = [
    "<script>alert(1)</script>",
    ""><script>alert(1)</script>",
    "'><img src=x onerror=alert(1)>"
]
SENSITIVE_PATTERNS = [
    r"password",
    r"token",
    r"apikey",
    r"secret",
    r"internal server error",
    r"exception",
    r"traceback"
]
MAX_PAGES = 5  # Reduced for demo speed

# =========================
# HELPER FUNCTIONS
# =========================
def get_forms(url):
    """Obtiene todos los formularios de una página"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.find_all("form")
    except Exception as e:
        return []

def get_form_data(form, payload=None):
    """Construye datos del form respetando campos hidden (CSRF, tokens, etc.)"""
    data = {}
    for tag in form.find_all(["input", "textarea", "select"]):
        name = tag.get("name")
        if not name:
            continue
        input_type = tag.get("type", "").lower()
        if input_type in ["hidden", "submit"]:
            value = tag.get("value", "")
            data[name] = value
        elif payload and input_type in ["text", "search", "email", "password", "", "textarea"]:
            data[name] = payload
    return data

# =========================
# SCAN LOGIC
# =========================
class Scanner:
    def __init__(self):
        self.findings = []

    def log_finding(self, url, finding_type, description, severity="Medium"):
        finding = {
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
            "url": url,
            "type": finding_type,
            "description": description,
            "severity": severity
        }
        self.findings.append(finding)
        print(f"[!] {finding_type}: {description} ({url})")

    def test_xss(self, url):
        print(f"[*] Testing XSS on {url}")
        forms = get_forms(url)
        for form in forms:
            action = form.get("action")
            method = form.get("method", "get").lower()
            target_url = urljoin(url, action)
            
            for payload_base in XSS_PAYLOADS:
                marker = str(uuid.uuid4())[:8]
                payload = payload_base.replace("alert(1)", f"alert('{marker}')")
                
                data = get_form_data(form, payload=payload)
                
                try:
                    if method == "post":
                        r = requests.post(target_url, data=data, headers=HEADERS, timeout=5)
                    else:
                        r = requests.get(target_url, params=data, headers=HEADERS, timeout=5)
                    
                    if marker in r.text:
                        if re.search(r'<script[^>]*>[^<]*' + re.escape(marker) + r'[^<]*</script>', r.text, re.I) or 
                           re.search(r'on\w+\s*=\s*["']?[^"']*' + re.escape(marker), r.text, re.I):
                            self.log_finding(target_url, "XSS", f"Reflected XSS confirmed with marker {marker}", "High")
                        else:
                            self.log_finding(target_url, "Potential XSS", f"Reflection found for marker {marker} (possibly escaped)", "Low")
                except Exception:
                    pass

    def test_info_disclosure(self, url):
        print(f"[*] Testing Info Disclosure on {url}")
        try:
            r = requests.get(url, headers=HEADERS, timeout=5)
            for pattern in SENSITIVE_PATTERNS:
                if re.search(pattern, r.text, re.IGNORECASE):
                    self.log_finding(url, "Info Disclosure", f"Sensitive pattern found: '{pattern}'", "Medium")
        except Exception:
            pass

    def test_idor(self, url):
        print(f"[*] Testing IDOR on {url}")
        parsed = urlparse(url)
        if re.search(r"id=\d+", parsed.query):
            self.log_finding(url, "Potential IDOR", "Numeric ID detected in URL parameter", "Medium")

    def test_access_control(self, url):
        print(f"[*] Testing Access Control on {url}")
        test_paths = ["/admin", "/dashboard", "/config", "/api", "/internal"]
        for path in test_paths:
            target = urljoin(url, path)
            try:
                r = requests.get(target, headers=HEADERS, timeout=5)
                if r.status_code == 200:
                    self.log_finding(target, "Broken Access Control", "Sensitive path accessible without auth", "High")
            except Exception:
                pass

    def check_security_headers(self, url):
        print(f"[*] Checking Headers on {url}")
        try:
            r = requests.get(url, headers=HEADERS, timeout=5)
            headers = r.headers
            if "Content-Security-Policy" not in headers:
                self.log_finding(url, "Missing Header", "Content-Security-Policy missing", "Low")
            if "X-XSS-Protection" not in headers:
                self.log_finding(url, "Missing Header", "X-XSS-Protection missing", "Low")
            if "Strict-Transport-Security" not in headers:
                self.log_finding(url, "Missing Header", "HSTS missing", "Medium")
        except Exception:
            pass

    def test_sqli_indicators(self, url):
        print(f"[*] Testing SQLi on {url}")
        sqli_error_patterns = [
            r"you have an error in your sql syntax",
            r"sql syntax.*near",
            r"mysql_fetch",
            r"syntax error",
        ]
        test_values = ["'", "' OR '1'='1"]
        
        parsed = urlparse(url)
        if parsed.query:
            params = {}
            for p in parsed.query.split('&'):
                if '=' in p:
                    k, v = p.split('=', 1)
                    params[k] = v
            
            for key in list(params.keys()):
                for val in test_values:
                    test_params = params.copy()
                    test_params[key] = val
                    try:
                        r = requests.get(url, params=test_params, headers=HEADERS, timeout=5)
                        for pat in sqli_error_patterns:
                            if re.search(pat, r.text, re.IGNORECASE):
                                self.log_finding(r.url, "SQL Injection", f"SQL error pattern '{pat}' triggered by param {key}", "High")
                    except Exception:
                        pass

    def run_url_scan(self, url):
        self.test_xss(url)
        self.test_info_disclosure(url)
        self.test_idor(url)
        self.test_access_control(url)
        self.check_security_headers(url)
        self.test_sqli_indicators(url)

    def execute_scan(self, start_url):
        visited = set()
        queue = deque([start_url])
        pages_scanned = 0
        
        while queue and pages_scanned < MAX_PAGES:
            url = queue.popleft()
            if url in visited:
                continue
            visited.add(url)
            pages_scanned += 1
            
            self.run_url_scan(url)
            
            try:
                r = requests.get(url, headers=HEADERS, timeout=5)
                soup = BeautifulSoup(r.text, "html.parser")
                for link in soup.find_all("a", href=True):
                    href = urljoin(url, link["href"])
                    parsed = urlparse(href)
                    if parsed.netloc == urlparse(start_url).netloc and href not in visited:
                        queue.append(href)
            except Exception:
                pass
        
        return self.findings

# =========================
# EXPORT FUNCTION
# =========================
def save_csv_report(findings, job_id):
    report_dir = os.path.join("reports")
    if not os.path.exists(report_dir):
        os.makedirs(report_dir)
        
    filename = f"{report_dir}/scan_report_{job_id}.csv"
    keys = ["timestamp", "url", "type", "description", "severity"]
    
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(findings)
    
    return filename

def run_full_scan(target_url, job_id):
    scanner = Scanner()
    findings = scanner.execute_scan(target_url)
    csv_path = save_csv_report(findings, job_id)
    return {
        "job_id": job_id,
        "target": target_url,
        "findings_count": len(findings),
        "csv_report": csv_path,
        "findings": findings
    }
