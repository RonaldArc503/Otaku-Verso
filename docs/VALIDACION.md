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

## Actualizador Android y publicador verificado — 22/10/2026

La información inicial de este documento corresponde a la primera publicación. En esta fase se añadió código al proyecto Android y al publicador, manteniendo la versión visible 1.0 y elevando el código interno a 2.

- Android: compilación Java debug y 4 pruebas `UpdateReleaseTest` correctas. Cubren comparación por código interno, metadatos inválidos, restricciones del enlace oficial y destinos de redirección.
- `:app:assembleRelease` correcto con R8 y lint vital. Se usó un directorio temporal de salida separado porque el `classes.dex` del directorio habitual estaba bloqueado por otro proceso. No se cerró Android Studio ni se mataron procesos del usuario.
- El APK generado es **sin firma**, versión 1.0, código 2, minSdk 26. Su manifiesto contiene la actividad privada del actualizador, el FileProvider y el permiso de instalación. Copia local excluida de Git: `.local/otaku-verso-1.0-build2-unsigned.apk`.
- El publicador rechaza ese APK sin firma. Se volvió a descargar el APK oficial actualmente publicado y `app:release -- --apk .local/public-build-1.apk --check` confirmó manifiesto, firma oficial y SHA-256 sin modificar servicios externos.
- El release firmado generado previamente por el propietario conserva el certificado oficial, pero sigue en código 1 y tiene otro hash. El publicador lo rechaza por reutilizar un código con un archivo diferente.
- Las 3 pruebas Node del publicador pasaron. `npm run build`: 0 errores/advertencias, cuatro páginas. Sintaxis de los dos comandos validada con `node --check`.
- El acceso a Android Studio mediante Computer Use falló al iniciar: `failed to write kernel assets: El sistema no puede encontrar la ruta especificada`. Se reintentó y restableció la sesión sin conseguir control de la interfaz.

Este fue el estado inicial, antes de recibir la configuración local de firma. La publicación firmada se completó a continuación.

## Publicación firmada de la compilación 2

- El propietario completó la configuración en la plantilla. Se copió a `keystore.properties`, se comprobó que está excluido de Git y se restauró la plantilla con valores de ejemplo, sin publicar contraseñas.
- `npm run app:release -- --notes docs/release-notes-1.0-build-2.txt` ejecutó correctamente la compilación firmada con key0, la publicación en GitHub Releases, la verificación del archivo público, la actualización de Firestore y el despliegue de Firebase Hosting.
- Versión visible **1.0**, código interno **2**, `com.example.anime`, Android mínimo 8.0 (SDK 26), 5.604.308 bytes.
- Certificado oficial SHA-256: `3085148385dfb7450c51934534be15776515f1869ec4e7fa9e8a28629503b8ca`.
- APK publicado SHA-256: `2f1c3f685355dcb81b17986036f9e1c8e1d128993031ad464a65d3e0824ddda7`.
- Release: https://github.com/RonaldArc503/Otaku-Verso/releases/tag/v1.0.0-build.2
- Descarga: https://github.com/RonaldArc503/Otaku-Verso/releases/download/v1.0.0-build.2/otaku-verso.apk
- Hosting devuelve HTTP 200; el enlace estático de la página y el documento público real de Firestore coinciden con la compilación 2 y su hash. Astro: 0 errores y advertencias.
- Se descargó nuevamente el archivo público y se copió a `Anime/app/release/app-release.apk`, conservando una copia local del archivo anterior.
- En el teléfono Redmi Note 9 Pro, «Buscar actualizaciones» respondió correctamente. Durante la validación se observó instalada una compilación debug 2, con el certificado de depuración, distinto del oficial. No se desinstaló esa app ni se borraron sus datos. La validación de instalación del release oficial se realizó por separado.

## Prueba completa del actualizador en Android 12 / API 31

- Se creó un AVD aislado con la imagen Android TV x86 ya instalada en el SDK. Se utilizó una variante local de prueba de código 1, firmada con key0 y con Ajustes accesible para iniciar la prueba sin autenticar una cuenta. Ese manifiesto de prueba y ese APK no se publicaron; el APK oficial conserva sus actividades privadas.
- «Buscar actualizaciones» consultó el documento real de Firestore y mostró la compilación 2 con las notas publicadas.
- «Más tarde» cerró el aviso. La búsqueda manual volvió a ofrecer la misma actualización, como está previsto.
- «Actualizar» descargó el APK público de GitHub. La app llegó a «Descarga verificada», tras comprobar tamaño, SHA-256, paquete, versión, compatibilidad y firma.
- «Instalar actualización» abrió el permiso de orígenes de instalación. Se concedió únicamente en el AVD de prueba; al regresar se abrió el instalador nativo, que preguntó si se quería actualizar Otaku Verso.
- Se confirmó «Update» en el instalador y se obtuvo «App installed». PackageManager confirmó versión 1.0, código 2. Se extrajo el APK instalado y su SHA-256 coincidió exactamente con el archivo publicado: `2f1c3f685355dcb81b17986036f9e1c8e1d128993031ad464a65d3e0824ddda7`.
- Evidencias locales excluidas de Git: `.local/native-update-available.png`, `native-update-verified.png`, `native-update-installer.png`, `native-update-installed.png` y las jerarquías XML de cada paso. No se detectaron excepciones de AndroidRuntime en el recorrido.
- El emulador temporal se cerró al terminar. La prueba del instalador corresponde a Android TV / API 31; en el teléfono físico se verificó la consulta desde Ajustes, conservando su instalación debug y sus datos. No se afirma cobertura de todos los modelos móviles ni de todos los fabricantes.
