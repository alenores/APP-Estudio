# Checklist PWA + deploy (nuevo proyecto)

Usar **antes del primer deploy a producción** y al clonar la plantilla PWA (*Vías de Escalada Córdoba*, APP Estudio, etc.). Evita perder horas con botón «Instalar app» gris o menú ⋮ sin «Instalar aplicación».

Ver también [ADR 004](adr/004-pwa-install-standalone.md) y [ADR 005](adr/005-auth-rls.md).

---

## 1. Código (repo)

| Ítem | Dónde | Qué verificar |
|------|--------|----------------|
| Íconos 192 + 512 | `public/icon-*.png`, `app/manifest.ts` | Manifest declara `192x192` y `512x512`; generados con `npm run icons` |
| Build genera íconos | `package.json` → `"build": "npm run icons && next build …"` | Vercel siempre tiene PNG aunque no estén en git |
| Manifest standalone | `app/manifest.ts` | `display: "standalone"`, `start_url: "/"`, `short_name` = etiqueta del ícono |
| Link manifest | `app/layout.tsx` metadata | `manifest: "/manifest.webmanifest"` |
| Service worker | `next.config.ts` + `app/sw-register.tsx` | PWA activa solo en producción; `register: false` en next-pwa + registro manual |
| Middleware **no** toca SW | `middleware.ts` matcher | Excluir: `sw.js`, `workbox-`, `fallback-`, `manifest.webmanifest`, PNG/ico |
| SHA en pantalla | `next.config.ts` + `components/deploy-sha-footer.tsx` | Confirmar versión en producción sin dudas |
| Botón install | `app/install-pwa-button.tsx` | **No reescribir** al diagnosticar; arquitectura compartida con otras apps |

---

## 2. Vercel (crítico — causa real APP Estudio 2026-06)

| Ítem | Configuración | Por qué |
|------|---------------|---------|
| **Deployment Protection → Vercel Authentication** | **Desactivado en Production** (o solo en Preview) | Con auth Vercel activa, `/`, `/manifest.webmanifest`, íconos y `/sw.js` devuelven **401 sin cookie de Vercel**. Chrome **no** puede validar la PWA → no hay `beforeinstallprompt` → botón inerte y ⋮ sin «Instalar aplicación». |
| Seguridad de datos | Supabase **RLS** + login app | Vercel Authentication **no** protege datos; solo oculta el HTML a quien no es miembro del equipo Vercel. La app pública con RLS es el modelo correcto (igual que apps hermanas sin auth Supabase). |
| Build command | Default o `npm run build` | Debe incluir generación de íconos (ver §1) |
| Env vars | `NEXT_PUBLIC_SUPABASE_*` en Vercel | Mismas que `.env.local`; nunca `service_role` |

### Comprobación anónima (sin login Vercel)

Desde terminal o navegador en incógnito **sin** sesión Vercel, todas deben responder **200**:

```
https://<tu-dominio>/
https://<tu-dominio>/manifest.webmanifest
https://<tu-dominio>/icon-192x192.png
https://<tu-dominio>/icon-512x512.png
https://<tu-dominio>/sw.js
```

Si alguna da **401** → revisar Deployment Protection antes de tocar código del botón.

---

## 3. Supabase (apps con auth)

| Ítem | Acción |
|------|--------|
| SQL inicial | Ejecutar `docs/sql/001-schema-estudio.sql` |
| RLS | Cuatro tablas con RLS **enabled** y políticas `user_id = auth.uid()` |
| Signups | Opcional: desactivar registro público si es app de un solo usuario |
| Redirect URLs | `https://<dominio>/auth/callback` + localhost |

Hacer el sitio público en Vercel **solo** después de confirmar RLS en el dashboard (policies visibles en Table Editor).

---

## 4. Prueba de instalación (producción)

1. Deploy OK → SHA al pie coincide con `git log -1`.
2. **Chrome real** (no WhatsApp in-app): abrir URL, borrar datos del sitio si hubo pruebas previas con 401.
3. Home `/`: botón **Instalar app** habilitado **o** ⋮ → **Instalar aplicación**.
4. Tras instalar: abrir desde ícono → **sin barra de URL** (standalone), badge «Modo app» si aplica.
5. iOS: Safari → Compartir → Agregar a inicio (no hay `beforeinstallprompt`).

Local: `npm run build && npm start` (PWA off en `npm run dev`).

---

## 5. Diagnóstico si falla (orden fijo)

**No** cambiar `InstallPwaButton` ni UX de install hasta agotar esta lista:

1. **401 anónimo** en manifest / íconos / sw.js → Vercel Deployment Protection.
2. **404** en íconos → `npm run icons` en build o PNG en `public/`.
3. **SW no controla página** → middleware bloqueando `sw.js` / `workbox-*` / `fallback-*`.
4. **Solo «Agregar a pantalla»** → atajo manual previo; borrar ícono viejo y datos del sitio.
5. **WhatsApp / Instagram in-app** → abrir en Chrome externo (`isLikelyInAppBrowser` en `lib/pwa-platform.ts`).
6. **beforeinstallprompt = no** con todo 200 y SW activo → engagement Chrome (recargar, segunda visita); raro si §2 está OK.

Síntoma típico botón visible pero inerte: `disabled={!installPrompt}` — Chrome nunca ofreció instalar, no bug del botón.

---

## 6. Incidente APP Estudio (2026-06-03)

| Síntoma | Causa real | Fix |
|---------|------------|-----|
| Botón gris PC y Android | Vercel Authentication en Production → 401 en recursos PWA | Desactivar en Vercel; RLS Supabase sigue protegiendo datos |
| Se sospechó auth Supabase / íconos / botón | Falsos positivos; íconos y SW estaban bien tras `npm run icons` en build | Checklist §2 anónimo primero |
| Panel diagnóstico temporal | Confirmó SW OK pero `beforeinstallprompt = no` | Eliminado tras resolver; lógica documentada en §5 |

---

## 7. Plantilla para próxima app

Al crear proyecto hermano:

1. Copiar capa PWA (`manifest`, `install-pwa-button`, `lib/pwa-*`, `sw-register`, `next.config` PWA block, `middleware` exclusions).
2. Añadir `DeployShaFooter` + `NEXT_PUBLIC_DEPLOY_SHA` en `next.config.ts`.
3. Primer deploy → **desactivar Vercel Authentication en Production** (o usar dominio público desde el día 1).
4. Correr comprobación anónima §2.
5. Probar install en celular antes de pulir UI.
