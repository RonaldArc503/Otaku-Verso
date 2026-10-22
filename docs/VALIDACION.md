# Validación de publicación

Fecha: 22 de octubre de 2026, America/El_Salvador.

## Resultado publicado

- Web: https://anime-rc.web.app
- Repositorio: https://github.com/RonaldArc503/Otaku-Verso
- Release: https://github.com/RonaldArc503/Otaku-Verso/releases/tag/v1.0.0
- APK: https://github.com/RonaldArc503/Otaku-Verso/releases/download/v1.0.0/otaku-verso.apk
- Carpeta local: `C:\Users\HP VICTUS\Desktop\Otaku Verso Web`.

## Comprobaciones realizadas

- `npm run build`: Astro/TypeScript, 0 errores y 0 advertencias; cuatro páginas estáticas generadas.
- Auditoría de dependencias tras actualizar la dependencia transitiva gRPC: 0 vulnerabilidades reportadas.
- `firebase deploy --only firestore:rules --project anime-rc`: reglas compiladas y publicadas.
- `npm run deploy`: Firebase Hosting confirmó publicación en `anime-rc`.
- Firestore real, sin autenticación: GET de `webPublic/app` devuelve 200; listado de `webPublic` y escritura de prueba devuelven 403.
- Validador de metadatos: acepta el release oficial; rechaza JavaScript, HTTP, dominios parecidos a GitHub, otros repositorios, puertos alternativos, parámetros de redirección, hashes inválidos y datos incompletos.
- APK: `aapt dump badging` confirma Otaku Verso, `com.example.anime`, versión 1.0, versionCode 1, minSdk 26. `apksigner verify` confirma firma válida.
- Se volvió a descargar el APK publicado y su SHA-256 coincide con el archivo proporcionado: `57ea0ec5575ffafe28242c3cdb852fd9b2b1f0f0b0b40f1bb62d7193538759d9`. Tamaño: 5.590.368 bytes.
- Navegador: portada publicada visible, imágenes cargadas, respuesta de Firestore reflejada en la sección de descarga, preguntas desplegables y apertura/cierre de preferencias de privacidad.
- Vista móvil de 390 px mediante un iframe local: cabecera, título, botones y arte se adaptan a una columna; enlace principal lleva a la descarga. El archivo temporal de QA fue eliminado antes de publicar.
- Se comprobó el estado de respaldo/reintento cuando Firestore no podía devolver todavía el documento de release.
- HTTP en producción: portada, recursos locales enlazados, términos, privacidad, robots y sitemap devuelven 200; una ruta inexistente y la antigua ruta de QA devuelven 404 con el diseño propio.
- Cabeceras publicadas verificadas: `X-Content-Type-Options: nosniff` y `X-Frame-Options: DENY`.
- `git diff --check`: sin errores.

## Límites y estado previo

- Se publicó exactamente el APK de la carpeta indicada por el propietario. Esta tarea no compiló, instaló ni probó el funcionamiento interno de Android en un teléfono.
- Las reglas previas de anime-rc permitían acceso público de lectura y escritura a todas las colecciones. Se excluyó y protegió únicamente `webPublic`; el comportamiento de las demás colecciones se conservó para evitar afectar otros servicios. Esa configuración preexistente requiere una revisión separada.
- El proyecto Android utiliza `animelatinorc`; no se cambió su configuración, código ni base de datos.
- La ilustración es original y decorativa; no es una captura del producto. El logo es el proporcionado por el propietario.
- Analytics está condicionado al consentimiento; no se verificó la recepción de eventos en la consola de Google Analytics.
- La adaptación móvil se revisó en navegador, sin afirmar una prueba física del sitio en todos los modelos Android.

## Actualizaciones

El APK vive en GitHub Releases. Firestore guarda sus metadatos públicos y el enlace; no se almacenan binarios en Firestore ni se añaden APK al historial de Git. Procedimiento en `README.md`.
