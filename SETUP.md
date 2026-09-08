# Conectar Kasia a servicios reales

Esta app funciona en "modo demo" sin configurar nada (con 9 habitaciones de ejemplo y
pagos/verificación simulados). Para que sea real seguí estos pasos. Solo el primer
paso (Supabase) toca variables de entorno — Stripe y Didit se cargan directamente
desde el panel interno, sin redesplegar nada.

## 1. Supabase — login, catálogo y panel interno

1. Creá una cuenta gratis en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. En el proyecto, andá a **SQL Editor → New query**, pegá el contenido de
   `supabase/schema.sql` de este repo y tocá **Run**. Esto crea las tablas:
   - `properties`: el catálogo, con 9 habitaciones de ejemplo.
   - `bookings`: cada reserva, con su etapa, pago y visita — alimenta el panel interno.
   - `app_settings`: donde quedan guardadas las claves de Stripe/Didit cuando las
     cargás desde `/admin/integraciones`.
   - `applications`: cada solicitud del formulario de compatibilidad (`/apply`),
     con su resultado (`APPROVED` / `REVIEW` / `NOT_ELIGIBLE`).
   - `profiles`: conecta cada cuenta con la solicitud que la habilitó a entrar al
     catálogo privado.
3. Andá a **Project Settings → API** y copiá:
   - `Project URL` → pegalo en `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → pegalo en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (más abajo en la misma página, dice "secret") → pegala en
     `SUPABASE_SERVICE_ROLE_KEY`. Esta clave es sensible: solo la usa el panel
     interno en el servidor, nunca la pongas en código que corra en el navegador.
4. **Para el login y el acceso al catálogo:** no hay nada más que hacer — en cuanto
   completes el paso 3, el flujo completo ya funciona: `/apply` → `/apply/result` →
   `/signup` (solo si quedó `APPROVED`) → `/rooms`. Nadie puede crear una cuenta sin
   pasar antes por el formulario de compatibilidad — ver la sección "Acceso al
   catálogo privado" más abajo para el detalle.
5. **Para el panel interno (`/admin`):** agregá tu email (y el de tu equipo) a
   `ADMIN_EMAILS`, separados por coma, ej: `ADMIN_EMAILS=vos@tuempresa.com,socia@tuempresa.com`.
   Solo esas cuentas van a poder entrar a `/admin` — a cualquier otra persona logueada
   le va a decir "No autorizado". Una vez logueado con un email de la lista, va a
   aparecer un link "Panel interno" en el menú de arriba.

## 2. Acceso al catálogo privado (formulario de compatibilidad)

El catálogo real (`/rooms`) ya no es público. El flujo es:

1. `/` — página pública, con ejemplos ilustrativos (no el inventario real) y el
   botón "Encontrar mi habitación".
2. `/apply` — formulario de compatibilidad en 5 pasos (estilo onboarding, con
   barra de progreso). Las respuestas nunca se le muestran al usuario, ni las
   reglas exactas: solo un resultado.
3. Al enviarlo, el servidor evalúa la solicitud (`lib/application-scoring.ts`) y
   la guarda en la tabla `applications` con estado `APPROVED`, `REVIEW` o
   `NOT_ELIGIBLE` y un motivo interno (`internal_reason`) que tampoco se expone.
4. `/apply/result` muestra uno de los tres mensajes según el estado.
5. `/signup` solo deja crear una cuenta si la solicitud está `APPROVED` — lo
   comprueba el servidor, no el botón del frontend. La cuenta queda linkeada a
   esa solicitud en la tabla `profiles`.
6. `/rooms`, `/rooms/[id]` y `/reservar/[id]` comprueban en el servidor (no en
   el navegador) que hay sesión Y que `profiles.application_status = 'APPROVED'`
   antes de mostrar nada — entrar escribiendo la URL directamente no sirve.

**Para ajustar las reglas de aprobación:** están todas en
`lib/application-scoring.ts`, en un solo lugar, con comentarios explicando cada
una (estancia mínima, mascota, menores, presupuesto, si hay habitaciones que
matcheen zona/presupuesto/ocupación, fumador, y un margen de presupuesto muy
ajustado que manda a revisión manual).

**Anti-reintentos:** si alguien vuelve a mandar el formulario con el mismo
email o teléfono antes de que pasen `APPLICATION_COOLDOWN_DAYS` días (30 por
defecto), se le devuelve el mismo resultado ya guardado sin volver a evaluar
las respuestas nuevas — así no se puede ir probando combinaciones para
adivinar las reglas.

## 3. Agregar o editar habitaciones — sin código

Una vez logueado con un email admin, andá a **Panel interno → Propiedades**. Ahí
podés:

- **Agregar habitación:** un formulario visual con todos los campos (zona, precio,
  fotos, colores, comodidades, descripción, y el asesor asignado con su teléfono y
  email — es el contacto que ve el cliente después de pagar).
- **Editar o eliminar** cualquier habitación existente desde la misma lista.

(Como alternativa, la tabla `properties` de Supabase también se puede editar a mano
desde Dashboard → Table Editor, pero ya no hace falta — el panel de `/admin` es más
simple.)

## 4. Stripe y Didit — desde el panel, sin tocar variables de entorno

Andá a **Panel interno → Integraciones**:

- **Stripe** (cobro de fianza + comisión): creá una cuenta en
  [stripe.com](https://stripe.com), Dashboard → Developers → API keys → copiá la
  **Secret key** (empezá con la de modo test, `sk_test_...`) y pegala en el panel.
  Al tocar "Guardar", ya queda activo — no hace falta redesplegar. Cuando quieras
  cobrar de verdad, activá tu cuenta de Stripe y pegá la clave de modo real
  (`sk_live_...`) en el mismo lugar.
- **Didit** (verificación de identidad): creá una cuenta en [Didit](https://didit.me),
  armá un "workflow" de verificación (documento + selfie), y pegá tu **API key** y el
  **ID del workflow** en el panel.
  **Importante:** la integración en `app/api/kyc/route.ts` está armada según el
  patrón habitual de la API de Didit (crear una sesión, redirigir a la URL que
  devuelve). Antes de depender de esto en producción, confirmá contra la
  [documentación actual de Didit](https://docs.didit.me) que el endpoint, el header
  de la API key y los campos de la respuesta siguen siendo los mismos — las APIs de
  terceros cambian con el tiempo.

Si en algún momento preferís configurarlas como variables de entorno en vez del
panel (por ejemplo para tener un valor por defecto en todos los ambientes), también
funciona: `STRIPE_SECRET_KEY`, `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID` en `.env.local`.
Lo que cargues desde el panel siempre tiene prioridad sobre la variable de entorno.

## 5. Qué pasa después de que un cliente paga

En cuanto Stripe confirma el pago, la página de "reserva confirmada" le muestra al
cliente el teléfono y email de la asesora asignada a esa habitación, y un formulario
para elegir fecha y hora de la visita. Esa reserva y esa visita quedan guardadas en
la tabla `bookings` y aparecen al instante en `/admin`.

Nota de robustez: esto se confirma cuando el cliente vuelve a la página de éxito
después de pagar. Si cerrara la pestaña de Stripe antes de volver, esa reserva
puntual no quedaría registrada en el panel (aunque el cobro en Stripe sí se hizo).
Si eso te importa, el paso siguiente es agregar un webhook de Stripe
(`checkout.session.completed`) que guarde la reserva del lado de Stripe en vez de
esperar a que el cliente vuelva — pedímelo cuando quieras y lo armamos.

## 6. Variables de entorno

Copiá `.env.example` a `.env.local` y completá al menos las de Supabase (paso 1):

```bash
cp .env.example .env.local
```

En Netlify/Vercel (o donde despliegues), cargá las mismas variables en la sección de
variables de entorno del proyecto.

## 7. Publicar el sitio

La forma más simple es [Vercel](https://vercel.com) o Netlify: conectá el repo de
GitHub, pegá las variables de entorno de Supabase del paso 5, y listo — cada push a
la rama actualiza el sitio en vivo. Stripe y Didit no necesitan variables de entorno
si los cargás desde `/admin/integraciones` (paso 3).
