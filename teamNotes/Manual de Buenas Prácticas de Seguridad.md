
---
## ÍNDICE

> - **1. Introducción**
>   - 1.1 Objetivo
>   - 1.2 Público Objetivo
>   - 1.3 Principios de Seguridad (CIA)
> - **2. Autenticación Segura (MFA)**
>   - 2.1 ¿Qué es MFA?
>   - 2.2 ¿Cuándo es obligatorio?
>   - 2.3 Pasos recomendados
>   - 2.4 Ejemplos
> - **3. Gestión de Contraseñas**
>   - 3.1 Almacenamiento seguro
>   - 3.2 Políticas recomendadas
> - **4. Cifrado de Datos**
>   - 4.1 Datos en reposo
> - **5. Control de Acceso (IAM & RBAC)**
>   - 5.1 Menor privilegio
>   - 5.2 Roles
>   - 5.3 Autenticación vs autorización
> - **6. Seguridad de APIs**
>   - 6.1 Tokens JWT
>   - 6.2 Cabecera de Seguridad
>   - 6.5 CORS
>   - 6.6 CSP
>   - 6.7 Validación de Inputs
>   - 6.8 Logging y Auditoría
>   - 6.9 Protección contra fuerza bruta
>   - 6.10 Manejo de errores
>   - 6.11 HTTPS Strict Only
> - **7. Seguridad de Infraestructura** (pendiente)
> - **8. Contenedores y Kubernetes** (pendiente)
> - **9. Pruebas de vulnerabilidad** (pendiente)
> - **10. Concientización** (pendiente)
> - **11. Respuesta a Incidentes** (pendiente)
> - **12. Glosario**

---
# 1. Introducción

Este manual establece las prácticas de seguridad recomendadas para startups Fintech que desarrollan **super apps** y necesitan guías claras, prácticas y aplicables sin contar con un equipo especializado de Ciberseguridad.

# 1.1 Objetivo

Proporcionar una guía clara y práctica para implementar:

- Autenticación segura
- Cifrado
- Control de acceso
- Protección de APIs
- Prevención contra amenazas comunes

# 1.2 Público Objetivo

- Principalmente equipos de desarrollo 
- Personal con conocimientos básicos de IT
- Product Owners 
  
# 1.3 Principios de Seguridad (CIA)

**==Confidencialidad==:** Asegura que la información **solo sea accesible para las personas autorizadas**. Es como un sobre cerrado: solo quien tiene la llave (o los permisos) puede ver el contenido. Se implementa mediante el **cifrado** y el **control de accesos**.

**==Integridad==:** Garantiza que la información sea **precisa y no haya sido alterada** de manera no autorizada. Se trata de asegurar que un mensaje no fue modificado en el camino. Se protege con **firmas digitales** y **hashing**. 

**==Disponibilidad==:** Asegura que la información y los servicios estén **disponibles para los usuarios autorizados cuando los necesiten**. Si un sistema es seguro pero siempre está cayéndose, no sirve. Se protege con **copias de seguridad (backups)**, redundancia de servidores y protección contra ataques de denegación de servicio (DDOS).
  
---
   
# 2. Autenticación Segura (MFA)

La autenticación es la primera línea de defensa. Una configuración incorrecta podría permitir accesos no autorizados a información sensible o daños críticos a la infraestructura. ¿Por qué la MFA es tan importante?

Porque soluciona el gran problema de "Algo que sabes" (la contraseña). Las contraseñas se roban, se adivinan o se obtienen mediante phishing, keyloggers o ingeniería Social . Si tu única barrera es una contraseña (autenticación de un solo factor), el atacante solo necesita una cosa para entrar.

**La MFA añade capas:** Para que un atacante acceda a tu información (violando la **Confidencialidad**), necesita tener dos o más piezas del rompecabezas, no solo una.

# 2.1 ¿Qué es MFA?

MFA (Multi-Factor Authentication) combina:

- **Algo que sabes:** contraseña 

- **Algo que tienes:** app autenticadora 

- **Algo que eres:** biometría

# 2.2 Ejemplo

Un administrador inicia sesión con su contraseña y luego ingresa un código generado por Microsoft Authenticator. Sin ese segundo factor, no puede acceder.

**Ejemplos:**

- **App Autenticadora** (Google Authenticator, Microsoft Authenticator): Genera un código numérico que cambia cada 30 segundos.
    
- **Teléfono móvil:** Recibir un SMS con un código (este método es cada vez menos seguro, pero sigue siendo común).

# 2.3 ¿Cuándo es obligatorio?

- Cuentas administrativas :  Los administradores de sistemas, de redes, o de plataformas como AWS, Office 365, etc. - **¿Por qué es obligatorio aquí?** Porque estas cuentas pueden **cambiar configuraciones, crear nuevos usuarios o borrar sistemas enteros**.

- Acceso a datos financieros : Cuentas bancarias, sistemas de nóminas, información y datos de tarjetas de crédito de clientes.

- Usuarios con permisos elevados : No son administradores técnicos, pero tienen poder sobre datos sensibles. Por ejemplo: RRHH, datos de contacto, ubicación, e-mails (Propensos a ataques de Phishing).

# 2.4 Pasos recomendados

1. Identificar cuentas críticas : Antes de poner candados, hay que saber **qué puertas son las más importantes**.

- **¿Qué significa?** Hacer una lista de todos los usuarios que, si les roban la cuenta, provocarían un desastre (los que vimos antes: administradores, finanzas, RRHH).

2. Habilitar MFA 

3. Forzar MFA en login : Este paso es **crucial** y muchas empresas lo olvidan. No basta con tenerlo activado; hay que **exigirlo**.

- **¿Qué significa?** Crear una política que diga: "Si eres administrador o tienes acceso a datos sensibles de la empresa, no puedes entrar solo con usuario y contraseña. El sistema te va a pedir sí o sí el código del móvil" o usar alternativas como Google Authenticator, Microsoft Authenticator.
  
- **Logins exitosos:** Sirve para saber quién ha entrado y a qué hora. Si ves que un admin entró a las 3:00 AM y normalmente nunca trabaja a esa hora, algo huele mal.
    
- **Intentos fallidos (máx. 3):** Aquí se aplica una regla muy común llamada **"bloqueo por umbral"**
    
    - **¿Qué significa?** Si alguien intenta entrar 3 veces y falla el código MFA o la contraseña, el sistema lo **bloquea automáticamente** durante un rato.
        
    - **¿Por qué 3?** Porque si un hacker está probando códigos por fuerza bruta (probando miles por segundo), con 3 intentos lo paras. Si es el usuario legítimo que se equivoca, llama al soporte y lo arreglan.

   - logins exitosos 
   - intentos fallidos, recomendamos (máx. 3).


---

# 3. Gestión de Contraseñas

- +12 caracteres de  longitud 

- **¿Por qué?** Porque cada carácter extra multiplica enormemente el tiempo que tardaría un hacker en probar todas las combinaciones posibles (ataque de fuerza bruta).
    
- **El dato clave:** Una contraseña de 8 caracteres puede hackearse en horas o días. Una de 12 caracteres, con la tecnología actual, puede tardar **siglos** en descifrarse.

- Mayúsculas, minúsculas, números, símbolos :
  
  ### Ejemplo de contraseña segura:

```
 #Pepito2026@fintech$.exe
```

- No reutilizar contraseñas : - **¿Por qué?** Por el efecto dominó o "credential stuffing".
    
    - Tú te registras en una web cualquiera (ej: una tienda de ropa online barata).
        
    - Esa web tiene poca seguridad y le roban la base de datos de usuarios.
        
    - Si usabas la misma contraseña que en tu correo o banco, el hacker prueba "combinación de correo y contraseña robada" en Gmail o en el banco.
        
    - **¡PWND!** Te hackean lo importante por haber utilizado la misma contraseña en todas tus cuentas.

# 3.1 Almacenamiento seguro

Aquí tocamos un punto crítico. De nada sirve tener una contraseña de 20 caracteres con símbolos si luego la guardas en un **bloc de notas en el escritorio de la PC donde trabajas** llamado "contraseñas.txt".

Esto trata sobre **dónde y cómo** viven las contraseñas cuando no las estamos usando.

- Nunca guardar en texto plano 
- No dejarlas visibles 
- Usar **Bitwarden** o **KeePass** : Estas son las herramientas que solucionan los dos problemas anteriores.

- **Bitwarden:**
    
    - **¿Qué es?** Un gestor de contraseñas **en la nube**.
        
    - **Ventaja:** Puedes acceder desde el móvil, la tablet y el ordenador, y se sincronizan. Tiene buena relación seguridad-comodidad.
        
- **KeePass:**
    
    - **¿Qué es?** Un gestor de contraseñas **local** (no sube nada a internet si no quieres).
        
    - **Ventaja:** Tú eres el único dueño del archivo. Lo guardas en tu PC o en un USB. Es el rey de la seguridad "offline".

  
# 3.2 Políticas recomendadas

- Bloquear tras 3 intentos fallidos : Como lo mencionamos anteriormente, - **¿Por qué?** Para frenar ataques de **fuerza bruta** (programas que prueban miles de contraseñas por segundo). Si solo permites 3 intentos, el programa no puede hacer su trabajo.
    
- **¿Qué consigue?** Gana tiempo. Bloquea la cuenta durante 5, 15 o 30 minutos. Esto hace que al atacante le lleve años probar combinaciones.

- Prohibido compartir credenciales : - Si en una empresa 5 personas usan el mismo usuario "admin", cuando alguien robe datos o los borre, no sabrás quién fue.
    
- Además, si una de esas 5 personas se va de la empresa o pierde el móvil, tienes que cambiar la contraseña y decírsela a los otros 4.


---

# 4. Cifrado de Datos

Este apartado es clave porque los datos no solo están quietos (en tu disco duro), sino que **viajan** constantemente: cuando te logueas en una web, cuando haces una compra, cuando envías un correo.

- **http:// (❌ Inseguro):** Es como mandar una **postal**. El mensaje va a la vista de todo el mundo (el cartero, los vecinos, cualquiera que intercepte el paquete). No hay cifrado.
    
- **https:// (✔ Cifrado):** Es como mandar una **carta dentro de una caja fuerte cerrada con llave**. Solo el destinatario tiene la llave para abrirla. La "s" significa "seguro".

- **El candado en el navegador:** Ese iconito de candado que ves al lado de la URL significa que hay un túnel cifrado entre tú y el servidor.

### Algoritmos:

- **AES (Cifrado simétrico):**
    
    - **¿Qué hace?** Es el algoritmo que **revuelve** los datos para que sean ilegibles. Es el más usado del mundo.
        
    - **Analogía:** Es como tener una **máquina Enigma moderna**. Metes "HOLA" y te devuelve "x7$kL9". Quien tiene la clave (la contraseña) puede revertirlo.
        
- **SHA-256 / SHA-384 (Hashing):**
    
    - **¿Qué hace?** No cifra para "esconder", sino que crea una **huella digital única** del mensaje.
        
    - **Característica:** Si el mensaje cambia aunque sea una coma, la huella SHA cambia completamente.

# El ejemplo clásico: "Hola" vs "hola"

SHA-256 siempre produce un resultado de **64 caracteres hexadecimales** (números y letras de la A a la F), sin importar si el texto de entrada es una letra o una enciclopedia.

**Texto original:** `Hola` (con H mayúscula)  
**Hash SHA-256:**
```
d1a5d2f7edd9f9a7e729cf8f08e6d37b2b3c7f9d9f8e7a6b5c4d3e2f1a0b9c8d
```

**Texto original:** `hola` (con h minúscula)  
**Hash SHA-256:**
```
b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb73
```


# 4.1 Datos en reposo

Este punto es crucial porque la mayoría de los ataques masivos (brechas de datos) no ocurren mientras la información viaja, sino cuando los atacantes entran al servidor y se llevan la base de datos.

- Bases de datos cifradas : - **¿Qué significa?** Que la información dentro de la base de datos (nombres, DNIs, tarjetas) está guardada en formato cifrado, no en texto plano.
    
- **¿Cómo funciona?** Si un atacante roba el archivo de la base de datos, al abrilo solo verá basura ilegible (por ejemplo: en lugar de "Juan Pérez" verá "x7$kL9..."). Necesita la clave para descifrarlo.

- Backups cifrados : - **¿Qué significa?** Las copias de seguridad (backups) también deben estar protegidas. No vale solo con cifrar la base de datos activa y dejar las copias en un disco duro sin protección.
    
- **¿Por qué es crítico?** Porque los atacantes saben que los backups suelen ser el **eslabón débil**. Si no pueden entrar al sistema en si, buscan en los directorios de respaldo.

- Gestión segura de claves : - **Buenas prácticas:**
    
    - Las claves no deben estar en el mismo servidor que los datos.
        
    - Deben rotarse (cambiarse) cada cierto tiempo.
        
    - Solo personas muy concretas deben tener acceso a ellas.

==IMPORTANTE==: **si almacena datos financieros o personales, también  deben estar cifrados.**

"El responsable o usuario del archivo de datos debe adoptar las **medidas técnicas y organizativas que resulten necesarias para garantizar la seguridad y confidencialidad de los datos personales**, de modo de evitar su adulteración, pérdida, consulta o tratamiento no autorizado..."


---

# 5. Control de Acceso (IAM & RBAC)

  **¿Qué es IAM?** _Identity and Access Management_ (Gestión de Identidad y Acceso). Es el marco de políticas y tecnologías que asegura que las personas correctas tengan acceso a los recursos correctos por las razones correctas.

# 5.1 IAM — Identidad y Acceso

#### Lo que permite IAM (Los 4 pilares operativos)

- **Crear usuarios:** Dar de alta a una persona en el sistema. Le creas su "DNI digital" (su identidad).
- Verificar identidad : - Asegurarse de que quien dice ser "Juan" es realmente Juan.
- Asignar permisos : - Decidir qué puede hacer cada usuario. No todos tienen las mismas llaves.
- Revocar accesos : - Quitar permisos cuando alguien se va de la empresa o cambia de puesto.

IAM responde a:

- **¿Quién eres? (Identificación)**
    
    - El usuario dice: "Soy Juan Pérez".
        
    - **En sistemas:** Introduce su nombre de usuario o email.
        
- **¿Estás autenticado? (Autenticación)**
    
    - El sistema comprueba: "A ver, demuéstrame que eres Juan".
        
    - **En sistemas:** Pide la contraseña, el código MFA, la huella dactilar.
        
- **¿Tienes permiso? (Autorización)**
    
    - El sistema consulta: "OK, eres Juan, ¿pero tienes derecho a entrar aquí?"
        
    - **En sistemas:** Revisa la lista de permisos. Juan puede ver su nómina, pero no modificar su sueldo.

### Dato clave

**IAM no es solo una tecnología, es un proceso.** Incluye:

- Dar de alta (onboarding).
- Gestionar durante la estancia (cambios de rol).
- Dar de baja (offboarding).

El error más común: dar de alta rápido, pero olvidar dar de baja cuando alguien se va. Así nacen las "cuentas zombi" que luego usan los atacantes!.

# 5.2 RBAC : El control de acceso basado en roles

**¿Qué es?** _Role-Based Access Control_. En lugar de asignar permisos uno por uno a cada persona (lo cual sería un caos), agrupamos los permisos en **roles** y luego asignamos personas a esos roles.

Ejemplo:

| **Rol**           | **Permisos**              | **Analogía**                                                                                                                                                       |
| ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Administrador** | Control total             | El **dueño del edificio**. Tiene llave de todas las puertas, puede cambiar cerraduras, contratar personal, entrar al sótano, al ático y a la sala de máquinas.     |
| **Contador**      | Accede solo a facturación | El **jefe de finanzas**. Solo puede abrir la puerta del departamento de contabilidad y la del archivo de facturas. No puede entrar al servidor ni a RRHH.          |
| **Soporte**       | Solo puede ver usuarios   | El **recepcionista**. Puede ver quién está en la oficina (lista de usuarios), pero no puede modificar sus sueldos ni entrar a sus buzones. Solo "ver", no "tocar". |

# 5.3 Menor privilegio

Cada usuario debe tener **solo** lo necesario para su función.

> **"Una persona puede tener varios roles, pero un rol nunca debe tener permisos que no correspondan."**

- **Ejemplo sano:** María es "Administradora" (control total) y también "Contadora" (ver facturas). Tiene ambos roles porque los necesita.
    
- **Ejemplo peligroso:** El rol "Soporte" tiene permisos para borrar bases de datos. Eso es un error grave de diseño, cuando en realidad debería tener únicamente los siguientes permisos:

• Ver lista de usuarios y estado de cuentas  
• Resetear contraseñas (modo seguro)  
• Ver logs de actividad (solo lectura)  
• Gestionar tickets
  

---

# 6. Seguridad de APIs

En una Fintech, las APIs son **el sistema circulatorio**: por donde viaja el dinero, los datos de clientes y las órdenes de pago. Si una API cae o es vulnerada, es un desastre inmediato.  

==Proteger APIs en una Fintech es obligatorio.==

**Exposición directa del negocio:** Las APIs son la puerta de entrada a las funcionalidades core: consultar saldo, transferir dinero, pagar servicios. No es solo "datos", es **dinero en movimiento**.
    
**Alto volumen y automatización:** Los atacantes usan bots para atacar APIs masivamente. Si no están bien protegidas, pueden hacer transferencias no autorizadas o extraer datos de miles de clientes en minutos.

Aquí las más importantes:

1. **Autenticación y Autorización Robusta:**
    
    - **OAuth 2.0 / OpenID Connect:** Estándares para delegar acceso. La API debe saber no solo _quién_ eres, sino _qué_ permites hacer a la aplicación que te representa.
        
    - **API Keys + Secrets:** Cada cliente (app móvil, web, socio) tiene su propia llave.
        
    - **MFA para operaciones sensibles:** Aunque la API esté autenticada, una transferencia grande puede requerir un segundo factor.
        
2. **Cifrado Obligatorio (Datos en Tránsito):**
    
    - Estrictamente **HTTPS (TLS 1.2+)** . No hay opción. Cualquier endpoint HTTP sin cifrar es una vulnerabilidad crítica.
        
    - **Certificados válidos y actualizados.**
        
3. **Control de Acceso a Nivel de API (RBAC aplicado):**
    
    - No todas las operaciones de la API son para todos los roles.
        
    - Un cliente (app móvil) tiene un alcance limitado. Un socio (conexión B2B) tiene otro. Un administrador interno, otro.
        
    - Se definen **scopes** (o alcances) específicos para cada endpoint.
        
4. **Rate Limiting (Límite de Peticiones):**
    
    - **¿Qué es?** Limitar cuántas veces se puede llamar a una API en un tiempo determinado (ej: 100 peticiones por minuto por usuario).
        
    - **¿Por qué?** Para prevenir ataques de fuerza bruta (probar contraseñas) y denegación de servicios (saturar la API para que caiga).
        
5. **Validación de Entrada (Input Validation):**
    
    - Nunca confiar en lo que llega del exterior.
        
    - Validar que los montos sean números positivos, que las cuentas destino existan, que los formatos de datos sean correctos.
        
    - Prevenir inyección de código (SQL Injection, NoSQL Injection) que podría ejecutar comandos maliciosos en los servidores.
        
6. **Registro y Monitorización (Auditoría):**
    
    - **Registrar todo:** Quién llamó a la API, desde qué IP, qué operación hizo, cuándo, y si fue exitosa o falló.
        
    - **Alertas en tiempo real:** Detectar patrones anómalos (ej: un usuario consultando saldo cada segundo, muchas transferencias desde una nueva ubicación).

# 6.1 Tokens (JWT)

**¿Qué es JWT?** _JSON Web Token_

Cuando un usuario inicia sesión, recibe un **token** que funciona como un pase digital (una cadena de texto) que demuestra que ya te autenticaste. Contiene información (como el ID del usuario y sus permisos) y va **firmado digitalmente** para que nadie pueda falsificarlo.

- **¿Por qué es crítico?** Si la clave de firma es débil o se filtra, cualquiera puede crear tokens falsos y suplantar a cualquier usuario (incluyendo administradores).
#### Mecanismo de revocación

Si detectamos acceso raro → invalidamos token.
# 6.2 Cabeceras de Seguridad

#### HSTS: HTTPS Siempre

**¿Qué es?** _HTTP Strict Transport Security_. Es una orden del servidor al navegador que dice: "A partir de ahora, **solo me puedes visitar usando HTTPS**. Si alguien intenta visitarme con HTTP, tú automaticamente conviértelo a HTTPS".

**¿Qué problema soluciona?** Los ataques de "downgrade" o "SSL stripping". Un atacante intercepta la petición inicial HTTP y la mantiene en HTTP para espiar.

### X-Frame-Options: Protección contra Clickjacking

**¿Qué es?** Una cabecera que controla si tu página web puede ser incrustada dentro de un `<frame>` o `<iframe>` de otra página.

**¿Qué problema soluciona?** El **clickjacking**. Un atacante pone tu página (ej: el botón de "Transferir dinero") dentro de un iframe en su página maliciosa, y encima coloca un botón invisible pero tentador. El usuario cree que está haciendo clic en "Gana un premio", pero en realidad está clicando en "Transferir dinero" de tu banco.

### X-Content-Type-Options: No te confíes del archivo

**¿Qué es?** Una cabecera muy simple con un único valor: `nosniff`. Le dice al navegador: "No intentes adivinar el tipo de un archivo (no "sniffees"). Confía en lo que yo te digo en la cabecera `Content-Type`".

**¿Qué problema soluciona?** Ataques donde un atacante sube un archivo malicioso (ej: `imagen.jpg` que en realidad contiene código JavaScript). Si el navegador "huele" el contenido y detecta que parece JS, lo ejecuta en lugar de mostrarlo como imagen.

### Referrer-Policy: Controlar qué información filtras

**¿Qué es?** Controla cuánta información de la URL desde la que vienes (la "URL de referencia" o _referrer_) se envía al sitio al que navegas.

**¿Qué problema soluciona?** La **fuga de datos por la URL**. Imagina que estás en:  
`https://bancolo.com/cuenta?token=12345&monto=1000`

Si haces clic en un enlace para ir a `https://redsocial.com`, por defecto `redsocial.com` recibe la URL completa de `bancolo.com` en la cabecera `Referer`. ¡Acabas de filtrar tu token y el monto!


---

## 6.4 SQL Injection 

  ## SQL Injection: El ataque que nunca muere.

**¿Qué es?** Ocurre cuando una aplicación construye una consulta SQL concatenando directamente lo que el usuario escribe en un campo de texto (como un formulario de login o búsqueda), sin validarlo ni sanitizarlo.

#### El ejemplo clásico (peligroso)

Imagina un login que hace esta consulta:

```
SELECT * FROM usuarios WHERE email = '$email' AND password = '$password'
```

Si el usuario escribe un email normal, todo bien. Pero si un atacante escribe en el campo **email** algo como:

```
admin@ejemplo.com' --
```

Y en password cualquier cosa, la consulta se convierte en:

```
SELECT * FROM usuarios WHERE email = 'admin@ejemplo.com' -- ' AND password = 'cualquiercosa'
```

En SQL, `--` significa "todo lo que sigue es un comentario". La consulta ahora solo pregunta por el email, ¡ignorando la contraseña! Si `admin@ejemplo.com` existe, el atacante entra sin saber la clave.

**El daño puede ser mayor:** Un atacante podría usar campos de texto para ejecutar comandos como:

```
'; DROP TABLE usuarios; -- 
```


---

  

# 7. Infraestructura (sección original base)

SSH solo con claves 

Restringir IPs 

Cerrar puertos 

Firewall 

Logs centralizados 

  

---

  

# 8. Contenedores

Imágenes oficiales 

No correr como root 

Secrets en KMS/Vault 

Network Policies 

  

---

  

# 9. Bases de datos

Acceso solo desde IP autorizada 

Cifrado 

Backups automáticos 

Rotación de credenciales 

  

---

  


---

  

# 10. Concientización

Phishing 

Buenas prácticas 

Reporte de incidentes 

  

---

  

# 12. Respuesta a Incidentes

Detección 

Contención 

Erradicación 

Recuperación 

Lecciones aprendidas 

  

---

  