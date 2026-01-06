# 🔍 Verificación de Configuración reCAPTCHA en Vercel

Ya que dijiste que configuraste todo, vamos a verificar paso por paso:

## ✅ Checklist de Verificación

### 1. Variables de Entorno en Vercel

**Ve a:** https://vercel.com/dashboard → Tu proyecto → Settings → Environment Variables

**Deberías ver estas 3 variables:**

- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
  - ✅ Value: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` (o tu clave real)
  - ✅ Production: ✓
  - ✅ Preview: ✓
  - ✅ Development: ✓

- [ ] `RECAPTCHA_SECRET_KEY`
  - ✅ Value: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` (o tu clave real)
  - ✅ Production: ✓
  - ✅ Preview: ✓
  - ✅ Development: ✓

- [ ] `RECAPTCHA_SCORE_THRESHOLD`
  - ✅ Value: `0.5`
  - ✅ Production: ✓
  - ✅ Preview: ✓
  - ✅ Development: ✓

**⚠️ IMPORTANTE:** Si acabas de agregar estas variables, necesitás un redeploy.

---

### 2. Verificar que el Deployment es NUEVO

Las variables de entorno solo se aplican en builds NUEVOS, no en builds existentes.

**Ve a:** Deployments → Mira la fecha/hora del último deployment

**¿El último deployment es DESPUÉS de agregar las variables?**
- [ ] ✅ Sí, hice redeploy después de agregar las variables
- [ ] ❌ No, el deployment es anterior

**Si es "No":** Necesitás hacer redeploy ahora.

---

### 3. Verificar en el Build Log

**Ve a:** Deployments → Click en el último deployment → Build Logs

**Busca líneas como:**
```
Building...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
```

**⚠️ Verificá que NO haya errores de build.**

---

### 4. Verificar en Runtime (Tu Navegador)

**Abrí tu sitio en producción:**
```
https://tu-sitio.vercel.app
```

**Abrí DevTools (F12) → Console → Ejecutá:**
```javascript
// Este debería dar undefined (es normal, no se expone process.env)
console.log('Test 1:', typeof process !== 'undefined' ? 'process exists' : 'process not defined')

// Este debería mostrar true si grecaptcha se cargó
console.log('Test 2: grecaptcha loaded:', !!window.grecaptcha)

// Este debería mostrar el script cargado
console.log('Test 3: Scripts loaded:', Array.from(document.scripts).filter(s => s.src.includes('recaptcha')).map(s => s.src))
```

**¿Qué te da cada test?**
- Test 1: ________________
- Test 2: ________________
- Test 3: ________________

---

### 5. Verificar en Network Tab

**DevTools → Network → Filtra por "recaptcha" → Refresca la página**

**¿Ves un request a:**
```
https://www.google.com/recaptcha/api.js?render=6LeIx...
```

- [ ] ✅ Sí, veo el request y responde con 200 OK
- [ ] ❌ No veo ningún request
- [ ] ⚠️ Veo el request pero falla (4xx o 5xx)

---

### 6. Verificar Console Errors

**Console → Filtra por "Errors" (rojo)**

**¿Ves alguno de estos errores?**
- [ ] `Uncaught ReferenceError: process is not defined`
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set`
- [ ] `Failed to load reCAPTCHA script`
- [ ] `Content Security Policy` error
- [ ] Otro: ________________

---

## 🚨 Diagnóstico según tus respuestas

### Si Test 2 = false (grecaptcha NO se cargó):

**Posibles causas:**
1. La variable `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` NO está en Vercel
2. El deployment es viejo (antes de agregar las variables)
3. Bloqueador de anuncios activo
4. CSP bloqueando el script

### Si ves "process is not defined":

**Causa:** La variable NO está inyectada en el build

**Solución:**
1. Verifica que la variable existe en Vercel
2. Redeploy SIN cache

### Si Test 3 muestra el script pero Test 2 = false:

**Causa:** El script se descargó pero falló al ejecutarse

**Solución:** Verifica errores en Console

---

## 📸 Lo que necesito de vos

Para ayudarte mejor, necesito que me muestres:

1. **Screenshot de Vercel Environment Variables**
   - Que se vean las 3 variables configuradas

2. **Screenshot de la Console en producción**
   - Con los resultados de los 3 tests de arriba

3. **Screenshot de Network tab**
   - Filtrando por "recaptcha"

4. **Última línea del Build Log**
   - Para confirmar que el build fue exitoso

Con esa info puedo decirte exactamente qué está fallando.

---

## 🔧 Solución Rápida si NADA funciona

Si ya hiciste todo y sigue sin funcionar, probá esto:

### Plan B: Forzar rebuild completo

```bash
# 1. Limpia deployments viejos
# Ve a Vercel → Deployments → Elimina todos menos el último

# 2. Trigger nuevo build
git commit --allow-empty -m "chore: force rebuild for env vars"
git push origin main

# 3. En Vercel, cuando aparezca el nuevo deployment:
#    - NO uses existing cache
#    - Espera que termine
#    - Refresca tu navegador con Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
```

---

## ✅ Cuando funcione, deberías ver:

**Console:**
```
✅ reCAPTCHA script loaded
✅ reCAPTCHA ready
✅ reCAPTCHA token generated for action: quote_request
```

**Token en el form submit:**
```
Token: 03AFcWeA5Z9ht... (largo, NO "mock-token")
```

**Backend logs:**
```
✅ reCAPTCHA verification success
```
