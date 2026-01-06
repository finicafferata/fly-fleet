# 🔬 Análisis Profundo del Problema de reCAPTCHA

## 🚨 PROBLEMA IDENTIFICADO

Basado en los logs de producción que NO muestran NINGÚN mensaje de reCAPTCHA, el problema raíz es:

### **La variable de entorno NO está siendo inyectada en el código del cliente**

---

## 📊 Flujo del Problema

```
1. Build en Vercel
   ↓
2. Next.js busca process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
   ↓
3. Variable NO existe en Vercel → Next.js reemplaza con `undefined`
   ↓
4. Código compilado tiene: const siteKey = undefined;
   ↓
5. ReCaptchaLoader ejecuta: if (!siteKey) return null;
   ↓
6. Script de reCAPTCHA NUNCA se carga
   ↓
7. NO aparecen logs: "✅ reCAPTCHA script loaded"
   ↓
8. Usuario intenta enviar form → genera "mock-token"
   ↓
9. Backend rechaza token → "invalid-input-response"
```

---

## 🔍 Evidencia del Problema

### 1. Logs de producción (tu screenshot):
```
Header component rendering for locale: es
Check phishing by URL: Passed.
Hero background video loaded successfully
```

**❌ FALTA:**
```
⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set
✅ reCAPTCHA script loaded
✅ reCAPTCHA ready
```

**Conclusión:** El componente `ReCaptchaLoader` está retornando `null` porque `siteKey` es `undefined`.

### 2. Console errors en tu screenshot:
```
❌ Uncaught ReferenceError: process is not defined
```

Esto confirma que el código está intentando acceder a `process.env` en el navegador, lo cual SOLO funciona si Next.js lo reemplazó en build time.

---

## 💡 Por qué Next.js necesita las variables EN BUILD TIME

```javascript
// Tu código:
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Lo que Next.js hace en BUILD:
// SI la variable existe en Vercel:
const siteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

// SI la variable NO existe:
const siteKey = undefined;
```

**Next.js hace esta sustitución EN TIEMPO DE BUILD**, no en runtime.

Por eso:
- ✅ Agregar variable en Vercel → NO SUFICIENTE
- ✅ Agregar variable + REDEPLOY → NECESARIO

---

## 🎯 Root Cause

### Causa Principal: Variables no configuradas durante el build

**Cuándo ocurre:**
1. Hiciste deploy ANTES de agregar las variables
2. O agregaste las variables pero NO hiciste redeploy
3. O hiciste redeploy CON cache (usa el build viejo)

**Resultado:**
- El código compilado tiene `undefined` hardcodeado
- No importa si ahora agregaste las variables
- Necesitas un BUILD NUEVO sin cache

---

## ✅ SOLUCIÓN DEFINITIVA

### Paso 1: Verificar Variables en Vercel

Ve a: https://vercel.com/[tu-proyecto]/settings/environment-variables

**DEBE haber 3 variables:**

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
├─ Production: ✓
├─ Preview: ✓
└─ Development: ✓

RECAPTCHA_SECRET_KEY
├─ Production: ✓
├─ Preview: ✓
└─ Development: ✓

RECAPTCHA_SCORE_THRESHOLD
├─ Production: ✓
├─ Preview: ✓
└─ Development: ✓
```

**Si NO están → Agrégalas AHORA:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` = `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- `RECAPTCHA_SECRET_KEY` = `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`
- `RECAPTCHA_SCORE_THRESHOLD` = `0.5`

---

### Paso 2: Forzar Rebuild COMPLETO

#### Opción A: Desde Vercel Dashboard (Recomendado)

1. Ve a: **Deployments**
2. Click en el **último deployment**
3. Click en **"⋯"** (3 puntos)
4. Click en **"Redeploy"**
5. **⚠️ CRÍTICO:** **DESMARCA** "Use existing Build Cache"
6. Click en **"Redeploy"**

#### Opción B: Desde Git

```bash
# Fuerza un nuevo commit
git commit --allow-empty -m "chore: force rebuild for env vars"
git push origin main

# En Vercel, cuando aparezca el deployment:
# Cancélalo si tiene cache
# Vuelve a hacer redeploy SIN cache
```

#### Opción C: Vercel CLI

```bash
vercel --prod --force
```

---

### Paso 3: Verificar el Build

**Mientras se buildea, monitorea Build Logs:**

Busca estas líneas:
```
✓ Compiling...
✓ Building...
✓ Compiled successfully
```

**NO debería haber errores.**

---

### Paso 4: Verificar en Producción

**Una vez deployado:**

1. Abre tu sitio en producción
2. Agrega `?debug=true` a la URL:
   ```
   https://tu-sitio.vercel.app?debug=true
   ```

3. Deberías ver un **panel de debug verde en la esquina inferior derecha**

4. El panel debe mostrar:
   ```json
   {
     "hasProcess": false,  // normal en el navegador
     "siteKey": "6LeIxAcT...",  // ✅ DEBE tener valor
     "hasGrecaptcha": true,  // ✅ DEBE ser true
     "scripts": [
       {
         "src": "https://www.google.com/recaptcha/api.js?render=...",
         "loaded": true
       }
     ]
   }
   ```

**Si `siteKey` es "not found" o "undefined":**
→ Las variables NO se aplicaron → Repite desde Paso 1

---

## 🔧 Componente de Diagnóstico

He agregado `<ReCaptchaDebug />` a tu layout que muestra:
- Si `process.env` existe
- El valor de `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Si `grecaptcha` se cargó
- Todos los scripts de reCAPTCHA

**Este componente:**
- ✅ En development: Siempre visible
- ✅ En production: Solo con `?debug=true` en URL
- ✅ Auto-refresh cada 2 y 5 segundos

---

## 📸 Qué necesito que hagas

### 1. Configura las variables en Vercel
Captura de pantalla de Environment Variables mostrando las 3 variables

### 2. Haz redeploy SIN cache
Captura del deployment nuevo en proceso

### 3. Abre tu sitio con ?debug=true
```
https://tu-sitio.vercel.app?debug=true
```

### 4. Envíame screenshot del panel de debug verde

Con eso sabré EXACTAMENTE qué está fallando.

---

## 🎯 Próximos Pasos según el Diagnóstico

### Si el panel muestra `siteKey: "not found"`:
→ Las variables NO están en Vercel o el build es viejo

### Si el panel muestra `siteKey: "6LeIxAcT..."` pero `hasGrecaptcha: false`:
→ El script se está cargando pero falla (CSP, ad blocker, etc.)

### Si el panel muestra TODO correcto:
→ reCAPTCHA está funcionando, el problema está en otro lado

---

## 🚀 Build Checklist

Antes de decir "ya está configurado", verifica:

- [ ] Las 3 variables existen en Vercel Environment Variables
- [ ] Cada variable tiene ✓ en Production, Preview, Development
- [ ] Hiciste redeploy DESPUÉS de agregar las variables
- [ ] El redeploy fue SIN cache (no marcaste "Use existing Build Cache")
- [ ] El build completó exitosamente (no tiene errores rojos)
- [ ] La fecha del deployment es DESPUÉS de agregar las variables
- [ ] Refrescaste el navegador con Cmd+Shift+R (hard refresh)
- [ ] El panel de debug muestra `siteKey` con valor (no "undefined")

**Si TODOS tienen ✓ → reCAPTCHA funcionará**
**Si ALGUNO falta → esa es la causa del problema**
