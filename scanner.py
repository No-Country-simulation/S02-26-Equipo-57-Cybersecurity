import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import uuid
import time
from collections import deque

# =========================
# CONFIG
# =========================
HEADERS = {
    "User-Agent": "Security-Research-Bot/1.0"
}
XSS_PAYLOADS = [
    "<script>alert(1)</script>",
    "\"><script>alert(1)</script>",
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
MAX_PAGES = 10  # Límite del crawler para no sobrecargar
LOG_FILE = "scan_report.txt"  # Archivo donde se guardan los logs

# PROXIES = {"http": "http://127.0.0.1:8080", "https": "http://127.0.0.1:8080"}  # Descomentar si usas Burp / ZAP

# =========================
# HELPER FUNCTIONS
# =========================
def log(message):
    """Guarda mensajes en el archivo de log con timestamp"""
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {message}\n")

def get_forms(url):
    """Obtiene todos los formularios de una página"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.find_all("form")
    except Exception as e:
        log(f"Error obteniendo forms de {url}: {e}")
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
# XSS TEST (mejorado con marker y contexto)
# =========================
def test_xss(url):
    print("\n[+] Testing Reflected XSS (mejorado)")
    log("[+] Iniciando prueba XSS")
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
                    r = requests.post(target_url, data=data, headers=HEADERS, timeout=10)
                else:
                    r = requests.get(target_url, params=data, headers=HEADERS, timeout=10)
                
                if marker in r.text:
                    if re.search(r'<script[^>]*>[^<]*' + re.escape(marker) + r'[^<]*</script>', r.text, re.I) or \
                       re.search(r'on\w+\s*=\s*["\']?[^"\']*' + re.escape(marker), r.text, re.I):
                        print(f"[!] XSS CONFIRMADO → {target_url}")
                        print(f"  Marker: {marker}")
                        print(f"  Payload: {payload}")
                        log(f"[!] XSS CONFIRMADO: {target_url} - Marker: {marker}")
                    else:
                        print(f"[?] Posible reflexión (quizás escapada) → {target_url} - Marker: {marker}")
                        log(f"[?] Posible XSS: {target_url} - Marker: {marker}")
            except Exception as e:
                log(f"Error en XSS {target_url}: {e}")
            time.sleep(1)

# =========================
# INFORMATION DISCLOSURE
# =========================
def test_info_disclosure(url):
    print("\n[+] Testing Information Disclosure")
    log("[+] Iniciando prueba Info Disclosure")
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        for pattern in SENSITIVE_PATTERNS:
            if re.search(pattern, r.text, re.IGNORECASE):
                print(f"[!] Posible info disclosure: '{pattern}' encontrado")
                log(f"[!] Info disclosure: '{pattern}' en {url}")
    except Exception as e:
        log(f"Error en info disclosure {url}: {e}")

# =========================
# IDOR RECON
# =========================
def test_idor(url):
    print("\n[+] IDOR Recon (heurístico)")
    log("[+] Iniciando recon IDOR")
    parsed = urlparse(url)
    if re.search(r"id=\d+", parsed.query):
        print("[!] ID numérico detectado en parámetro URL")
        print("   → Prueba cambiar el ID manualmente")
        log(f"[!] Posible IDOR: ID numérico en {url}")

# =========================
# BROKEN ACCESS CONTROL
# =========================
def test_access_control(url):
    print("\n[+] Broken Access Control Recon")
    log("[+] Iniciando recon Access Control")
    test_paths = ["/admin", "/dashboard", "/config", "/api", "/internal"]
    for path in test_paths:
        target = urljoin(url, path)
        try:
            r = requests.get(target, headers=HEADERS, timeout=10)
            if r.status_code == 200:
                print(f"[!] Ruta accesible sin auth: {target}")
                log(f"[!] Ruta accesible: {target}")
            time.sleep(1)
        except Exception as e:
            log(f"Error chequeando {target}: {e}")

# =========================
# SECURITY HEADERS CHECK
# =========================
def check_security_headers(url):
    print("\n[+] Checking Security Headers")
    log("[+] Iniciando chequeo de headers de seguridad")
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        headers = r.headers
        missing = []
        if "Content-Security-Policy" not in headers:
            missing.append("CSP ausente → facilita XSS")
        if "X-XSS-Protection" not in headers or headers.get("X-XSS-Protection") == "0":
            missing.append("X-XSS-Protection ausente o desactivado")
        if "Strict-Transport-Security" not in headers:
            missing.append("HSTS ausente → riesgo MITM")
        if missing:
            print("[!] Headers de seguridad faltantes:")
            for m in missing:
                print(f"  - {m}")
                log(f"[!] Header faltante: {m} en {url}")
        else:
            print("[+] Headers de seguridad clave presentes")
            log(f"[+] Buenos headers en {url}")
    except Exception as e:
        log(f"Error chequeando headers {url}: {e}")

# =========================
# SQL INJECTION INDICATORS (nueva detección precisa)
# =========================
def test_sqli_indicators(url):
    print("\n[+] Testing SQL Injection Indicators (error-based / reflected)")
    log("[+] Iniciando prueba indicios SQLi")
    
    sqli_error_patterns = [
        r"you have an error in your sql syntax",
        r"sql syntax.*near",
        r"mysql_fetch",
        r"supplied argument is not a valid mysql",
        r"pg::syntaxerror",
        r"unterminated quoted string",
        r"ora-\d+",
        r"microsoft ole db provider for sql server",
        r"unclosed quotation mark after the character string",
        r"odbc driver.*sql",
        r"sql server.*message",
        r"query failed",
        r"statement.*failed",
        r"sql.*error",
    ]
    
    test_values = ["'", "''", "' OR '1'='1", "')", "1'", "1; --"]
    
    # 1. Probar parámetros GET existentes en la URL
    parsed = urlparse(url)
    if parsed.query:
        print("  [*] Probando parámetros GET existentes...")
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
                    r = requests.get(url, params=test_params, headers=HEADERS, timeout=10)
                    for pat in sqli_error_patterns:
                        if re.search(pat, r.text, re.IGNORECASE):
                            print(f"[!] INDICIO FUERTE SQLi → parámetro '{key}' = '{val}'")
                            print(f"    URL: {r.url}")
                            print(f"    Patrón: {pat}")
                            log(f"[!] SQLi indicator: {r.url} - param {key} - pattern {pat}")
                    time.sleep(1)
                except Exception as e:
                    log(f"Error probando GET {key}: {e}")
    
    # 2. Probar forms con comilla simple
    print("  [*] Probando forms con comilla simple...")
    forms = get_forms(url)
    for form in forms:
        action = form.get("action")
        method = form.get("method", "get").lower()
        target_url = urljoin(url, action)
        
        data = get_form_data(form, payload="'")
        
        try:
            if method == "post":
                r = requests.post(target_url, data=data, headers=HEADERS, timeout=10)
            else:
                r = requests.get(target_url, params=data, headers=HEADERS, timeout=10)
            
            for pat in sqli_error_patterns:
                if re.search(pat, r.text, re.IGNORECASE):
                    print(f"[!] INDICIO FUERTE SQLi en form → {target_url}")
                    print(f"    Método: {method.upper()}")
                    print(f"    Patrón detectado: {pat}")
                    log(f"[!] SQLi indicator in form: {target_url} - pattern {pat}")
            time.sleep(1)
        except Exception as e:
            log(f"Error probando form SQLi: {e}")

# =========================
# MAIN SCAN
# =========================
def run_scan(url):
    print(f"\n=== Escaneando: {url} ===")
    log(f"=== Iniciando scan en {url} ===")
    
    test_xss(url)
    test_info_disclosure(url)
    test_idor(url)
    test_access_control(url)
    check_security_headers(url)
    test_sqli_indicators(url)   # ← Nueva detección agregada
    
    print(f"=== Scan finalizado para {url} ===")
    log("=== Scan completado ===")

# =========================
# CRAWLER BÁSICO
# =========================
def crawl_and_scan(start_url, max_pages=MAX_PAGES):
    visited = set()
    queue = deque([start_url])
    while queue and len(visited) < max_pages:
        url = queue.popleft()
        if url in visited:
            continue
        visited.add(url)
        print(f"[*] Crawling: {url}")
        log(f"[*] Crawling {url}")
        run_scan(url)
        
        try:
            r = requests.get(url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(r.text, "html.parser")
            for link in soup.find_all("a", href=True):
                href = urljoin(url, link["href"])
                parsed = urlparse(href)
                if parsed.netloc == urlparse(start_url).netloc and href not in visited:
                    queue.append(href)
        except Exception as e:
            log(f"Error crawling {url}: {e}")
        time.sleep(1)

# =========================
# EJECUCIÓN
# =========================
if __name__ == "__main__":
    target = "https://"   
    crawl_and_scan(target)
    