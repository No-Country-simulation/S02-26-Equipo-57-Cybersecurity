
##  **1. Infraestructura**

###  1.1 Servidores

- [ ]  Acceso SSH restringido por IP
- [ ]  Autenticación SSH solo con claves (no contraseñas)
- [ ]  Puertos innecesarios cerrados
- [ ]  Firewall activo (UFW / Security Groups)
- [ ]  Logs enviados a servidor central

###  1.2 Contenedores / Docker / Kubernetes

- [ ]  Imágenes base oficiales
- [ ]  Escaneo de imágenes antes del deploy
- [ ]  No correr contenedores como `root`
- [ ]  Secrets gestionados por Vault/KMS
- [ ]  Network Policies aplicadas

###  1.3 Bases de Datos

- [ ]  Acceso solo por IP autorizada
- [ ]  Cifrado en reposo
- [ ]  Cifrado en tránsito (TLS)
- [ ]  Backups automáticos
- [ ]  Rotación de credenciales

---

##  **2. Aplicación (APP)**

###  2.1 Autenticación

- [ ]  MFA habilitado
- [ ]  MFA obligatorio en administradores
- [ ]  Políticas de contraseña activas
- [ ]  Bloqueo tras 3 intentos fallidos

###  2.2 Autorización

- [ ]  Roles definidos
- [ ]  Principio de menor privilegio aplicado
- [ ]  Validación de permisos por endpoint
- [ ]  Servidor no confía en datos del cliente

###  2.3 Datos

- [ ]  Datos sensibles cifrados
- [ ]  Nada almacenado en texto plano
- [ ]  Archivos validados al subirlos

###  2.4 Frontend

- [ ]  Content Security Policy (CSP)
- [ ]  Sanitización contra XSS
- [ ]  HTTPS obligatorio
- [ ]  Cookies HttpOnly + Secure

---

##  **3. APIs**

###  3.1 Tokens

- [ ]  JWT firmados con claves fuertes
- [ ]  Expiración corta
- [ ]  Refresh tokens seguros
- [ ]  Mecanismo de revocación

###  3.2 Validación

- [ ]  Validación de input en backend
- [ ]  Rate limiting por IP
- [ ]  Prevención SQL Injection
- [ ]  Prevención Mass Assignment

###  3.3 Cabeceras de seguridad

- [ ]  X-Frame-Options
- [ ]  HSTS
- [ ]  X-Content-Type-Options
- [ ]  Referrer-Policy

###  3.4 API Keys

- [ ]  API keys cifradas
- [ ]  Rotación regular
- [ ]  Claves separadas por entorno
- [ ]  Nunca subidas al repo

---

## **4. DevSecOps**

###  4.1 Repos

- [ ]  Secret scanning (TruffleHog/Gitleaks)
- [ ]  SAST en cada push
- [ ]  Escaneo de dependencias
- [ ]  Protección de ramas

###  4.2 CI/CD

- [ ]  Pipeline con tests + lint + SAST
- [ ]  Build falla con vulnerabilidades críticas
- [ ]  Variables cifradas
- [ ]  Deploys firmados/verificados

###  4.3 Auditoría

- [ ]  ZAP corre semanalmente
- [ ]  Reportes automáticos
- [ ]  Issues creados por hallazgos críticos

---

##  **5. Gestión de cuentas (IAM)**

###  5.1 Usuarios internos

- [ ]  Cuenta individual por persona
- [ ]  MFA obligatorio
- [ ]  Baja inmediata de ex empleados
- [ ]  Revisión mensual de accesos

###  5.2 Roles

- [ ]  Roles estandarizados
- [ ]  Revisión de permisos mensual
- [ ]  Nadie con admin por defecto

###  5.3 Credenciales

- [ ]  No compartir credenciales
- [ ]  Contraseñas min. 12 caracteres
- [ ]  Rotación cada 90 días
- [ ]  Uso de Bitwarden/KeePass obligatorio


---


