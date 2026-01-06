# 🚨 SOLUCIÓN URGENTE: reCAPTCHA en Producción (Vercel)

## El Problema

Tu app en Vercel está usando **claves de prueba de Google** que SOLO funcionan en `localhost`.

Por eso ves:
- ❌ `mock-token-1767717420059` en producción
- ❌ Error: `invalid-input-response`
- ❌ `🚨 Suspicious reCAPTCHA attempt`

**Las claves de prueba NO funcionan en dominios de producción.**

---

## ✅ SOLUCIÓN COMPLETA (15 minutos)

### PASO 1: Obtener Claves Reales de Google

1. **Ve a:** https://www.google.com/recaptcha/admin/create

2. **Inicia sesión** con tu cuenta de Google

3. **Completa el formulario:**
   - **Label:** `Fly-Fleet Production`
   - **reCAPTCHA type:** Selecciona **"reCAPTCHA v3"** ⚠️ IMPORTANTE
   - **Domains:** Agrega TUS dominios de producción:
     ```
     tu-dominio.com
     www.tu-dominio.com
     *.vercel.app
     localhost
     ```
   - ✅ Acepta los términos

4. **Clic en Submit**

5. **Copia las claves que Google te da:**
   - **Site Key** (empieza con `6L...`) → va al frontend
   - **Secret Key** (empieza con `6L...`) → va al backend

---

### PASO 2: Configurar en Vercel

#### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a:** https://vercel.com/dashboard

2. **Selecciona tu proyecto** Fly-Fleet

3. **Ve a:** Settings → Environment Variables

4. **Agrega estas variables:**

   **Variable 1:**
   ```
   Name: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
   Value: [tu-site-key-real-de-google-aqui]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   **Variable 2:**
   ```
   Name: RECAPTCHA_SECRET_KEY
   Value: [tu-secret-key-real-de-google-aqui]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   **Variable 3:**
   ```
   Name: RECAPTCHA_SCORE_THRESHOLD
   Value: 0.5
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

5. **Guarda** cada variable

#### Opción B: Desde Vercel CLI

```bash
# Instala Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Agrega las variables (reemplaza con tus claves reales)
vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY
# Pega tu site key cuando te lo pida
# Selecciona: Production, Preview, Development

vercel env add RECAPTCHA_SECRET_KEY
# Pega tu secret key cuando te lo pida
# Selecciona: Production, Preview, Development

vercel env add RECAPTCHA_SCORE_THRESHOLD
# Escribe: 0.5
# Selecciona: Production, Preview, Development
```

---

### PASO 3: Redeploy

**⚠️ IMPORTANTE:** Las variables de entorno solo se aplican en NUEVOS deployments.

#### Opción A: Desde Vercel Dashboard
1. Ve a tu proyecto
2. Click en "Deployments"
3. Click en el último deployment
4. Click en "⋯" (3 puntos)
5. Click en "Redeploy"
6. **NO** marques "Use existing Build Cache"
7. Click en "Redeploy"

#### Opción B: Desde Git
```bash
# Haz un cambio trivial y pushea
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push origin main
```

#### Opción C: Desde Vercel CLI
```bash
vercel --prod
```

---

### PASO 4: Verificar que Funciona

1. **Espera** a que termine el deployment (1-2 minutos)

2. **Abre tu sitio** en producción

3. **Abre la consola del navegador** (F12)

4. **Ve a la página del formulario**

5. **Busca estos mensajes:**
   ```
   ✅ reCAPTCHA script loaded
   ✅ reCAPTCHA ready
   ✅ reCAPTCHA token generated for action: quote_request
   ```

6. **Llena el formulario y envía**

7. **Verifica el token:**
   - ✅ Debería verse como: `03AFcWeA5Z9ht...` (token largo)
   - ❌ NO como: `mock-token-...`

8. **Verifica que NO hay errores** de `invalid-input-response`

---

## 🔍 Troubleshooting

### "Todavía veo mock-token después del redeploy"

**Causas posibles:**
1. Las variables no se guardaron correctamente
2. El cache del navegador tiene la versión vieja
3. Estás viendo un preview deployment, no production

**Solución:**
```bash
# 1. Verifica que las variables estén configuradas
vercel env ls

# 2. Limpia cache del navegador (Ctrl+Shift+Delete)

# 3. Verifica que estás en el dominio correcto
#    Debería ser: tu-dominio.vercel.app (o tu dominio custom)
#    NO: preview-xyz.vercel.app
```

### "reCAPTCHA script failed to load"

**Causa:** Tu dominio no está registrado en Google reCAPTCHA

**Solución:**
1. Ve a: https://www.google.com/recaptcha/admin
2. Selecciona tu site key
3. Settings → Domains
4. Agrega tu dominio de Vercel

### "Score too low" errors

**Causa:** El threshold `0.5` es muy estricto

**Solución:**
```bash
# Baja el threshold a 0.3
vercel env rm RECAPTCHA_SCORE_THRESHOLD
vercel env add RECAPTCHA_SCORE_THRESHOLD
# Escribe: 0.3
```

---

## 📊 Checklist Final

Antes de considerar esto resuelto, verifica:

- [ ] ✅ Obtuviste claves REALES de Google (no las de prueba)
- [ ] ✅ Agregaste `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` en Vercel
- [ ] ✅ Agregaste `RECAPTCHA_SECRET_KEY` en Vercel
- [ ] ✅ Agregaste `RECAPTCHA_SCORE_THRESHOLD` en Vercel
- [ ] ✅ Hiciste redeploy SIN usar cache
- [ ] ✅ El token en producción es largo (no "mock-token")
- [ ] ✅ No hay errores `invalid-input-response`
- [ ] ✅ Los formularios se envían exitosamente

---

## 🚀 Resumen

**El problema:** Claves de prueba en producción → Google las rechaza

**La solución:**
1. Obtén claves reales de Google
2. Configúralas en Vercel
3. Redeploy

**Tiempo estimado:** 15 minutos

**Después de esto, reCAPTCHA funcionará perfectamente en producción.** ✅
