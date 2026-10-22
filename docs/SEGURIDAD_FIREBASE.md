# Corrección de la alerta de clave de Firebase

Fecha: 22 de octubre de 2026.

## Naturaleza de la alerta

GitHub detectó en el primer commit una Google API Key dentro de la configuración web de Firebase. Se verificó que es la clave de navegador del proyecto `anime-rc`, no una clave privada de cuenta de servicio, una contraseña ni una credencial administrativa. Firebase documenta que estas claves del cliente son públicas por diseño y que el acceso a datos se controla con reglas e IAM.

## Cambios aplicados

- Se retiró el valor literal de `src/lib/firebase.ts`. La web solicita la configuración en tiempo de ejecución a `/__/firebase/init.json`, ruta oficial de Firebase Hosting. Se valida que el proyecto y la aplicación correspondan a Otaku Verso.
- La compilación de producción no necesita ni incorpora el valor de la clave. `.env.example` solo tiene un marcador de ejemplo; `.env.local` está excluido de Git.
- La clave de navegador se limitó a `firestore.googleapis.com`, `firebaseinstallations.googleapis.com` y `firebase.googleapis.com`.
- Los referers permitidos son `https://anime-rc.web.app/*`, `https://anime-rc.firebaseapp.com/*`, `http://localhost:4321/*` y `http://127.0.0.1:4321/*`. Los dos últimos permiten el desarrollo local con el puerto configurado.
- No se cambió la clave Android ni la configuración del proyecto Android `animelatinorc`.
- El rechazo o un fallo al cargar la configuración conserva el enlace estático verificado del APK y la opción de reintento.
- La alerta de GitHub se clasifica como falso positivo de secreto: configuración pública de cliente revisada y restringida. No se afirma una revocación.

## Verificación

- `npm run build`: 0 errores y 0 advertencias.
- Búsqueda del patrón de Google API keys en código, recursos, documentos y salida `dist`: sin coincidencias.
- Solicitud de configuración de Analytics con el referer oficial y la clave restringida: HTTP 200.
- Misma solicitud desde un referer ajeno: HTTP 403, `API_KEY_HTTP_REFERRER_BLOCKED`.
- Lectura del documento público de la versión con la clave y el referer oficial: HTTP 200.
- Las reglas de `webPublic` continúan bloqueando listados y escrituras de clientes.

## Alcance y límites

La configuración pública sigue siendo visible en el navegador y en la ruta reservada de Hosting. Obtenerla en tiempo de ejecución evita almacenarla en el código Git; no la convierte en un secreto. La clave anterior permanece en commits históricos como identificador público restringido: no se reescribió el historial ni se alteró el tag del APK.

Las restricciones de referer ayudan a limitar el uso desde navegadores, pero no sustituyen la autenticación ni las reglas de acceso: un cliente externo puede falsificar esa cabecera. El documento de descarga es público deliberadamente. Las reglas abiertas preexistentes de otras colecciones de `anime-rc` requieren la revisión independiente ya descrita en `VALIDACION.md`.

## Referencias

- https://firebase.google.com/docs/projects/api-keys
- https://firebase.google.com/docs/hosting/reserved-urls
