# Otaku Verso — web oficial

Landing en español creada con **Astro + TypeScript**, npm, Firebase Hosting y Cloud Firestore. Firebase: **anime-rc**. El proyecto Android usa **animelatinorc**; esta web no cambia sus servicios.

- Web: https://anime-rc.web.app
- Código y APK: https://github.com/RonaldArc503/Otaku-Verso
- El código de la web se guarda en Git; los APK se adjuntan a **GitHub Releases**, no al historial del repositorio.

## Desarrollo

Requiere Node.js 22.23.4 o superior y npm 9.6.5 o superior. Comprobado con Node.js 24.

```sh
npm ci
npm run dev
npm run build
```

## Firebase y descarga

`src/lib/firebase.ts` obtiene la configuración pública en tiempo de ejecución desde `/__/firebase/init.json`, servido por Firebase Hosting. La clave no se guarda en Git ni se inserta durante la compilación. Esto no convierte la configuración del cliente en un secreto: sigue siendo pública por diseño. La clave del navegador está restringida por dominios y APIs; las reglas de Firestore controlan el acceso a los datos. La página lee únicamente **webPublic/app** en Firestore, valida sus campos y solo acepta enlaces HTTPS de APK en Releases de este repositorio.

Para usar el SDK durante el desarrollo local, copia `.env.example` a `.env.local` y sustituye el JSON de ejemplo por el de `/__/firebase/init.json` del sitio. `.env.local` queda excluido de Git. Sin configuración local, la página conserva su descarga estática y muestra el aviso de comprobación; la compilación no necesita claves.

Campos del documento: `version` (string), `versionCode` (number), `downloadUrl` (string), `sizeBytes` (number), `minAndroid` (string), `publishedAt` (YYYY-MM-DD), `sha256` (string) y `releaseNotes` (string).

Las reglas de `webPublic/app` permiten obtener el documento públicamente y bloquean escrituras desde clientes y listados. Las actualizaciones administrativas utilizan la sesión local de Firebase CLI. **Las reglas abiertas preexistentes del resto de anime-rc se conservaron para no afectar servicios ajenos; necesitan una revisión independiente.** No guardes información privada en esas colecciones sin corregir primero su acceso.

Si Firestore falla, permanece disponible la última versión verificada de `src/data/release.json` y aparece un aviso con opción de reintento. La descarga funciona también sin JavaScript. Las estadísticas de Google Analytics solo se cargan tras el consentimiento; las fuentes e imágenes se sirven localmente.

## Publicar una actualización del APK

La versión visible puede seguir siendo **1.0**. Cada APK diferente necesita un `versionCode` mayor en `app/build.gradle`; la primera compilación con actualizador usa **2**. La app compara ese código, no el texto de la versión.

Con el APK firmado que generaste desde Android Studio usando el almacén **key0**, ejecuta desde esta carpeta:

```sh
npm run app:release -- --apk "C:/Users/HP VICTUS/AndroidStudioProjects/Anime/app/release/app-release.apk" --notes "docs/release-notes-1.0-build-2.txt"
```

Para incluir también la compilación de Android en el mismo comando, copia `keystore.properties.example` a `keystore.properties` **en el proyecto Android**, completa localmente las contraseñas y el alias real de key0, y ejecuta `npm run app:release`. Guarda una copia privada del almacén; no subas almacenes ni contraseñas a GitHub. El archivo local está excluido de Git. Android Studio sigue permitiendo generar el APK firmado sin ese archivo. Gradle ya no usa una firma debug para release si falta la configuración.

Requiere Android SDK Build Tools, Java compatible con Gradle (se detecta el JBR de Android Studio), Firebase CLI con sesión en anime-rc y Git Credential Manager con acceso al repositorio. `OTAKU_ANDROID_DIR` o `--android` permite cambiar la ruta de Android.

El comando lee versión, código y Android mínimo directamente del manifiesto del APK con `aapt`; verifica la firma con `apksigner` y compara el certificado oficial de `release-policy.json`. Rechaza paquetes distintos, archivos sin firma, otras claves, retrocesos y códigos reutilizados con otro archivo. Nunca pasa contraseñas a GitHub. La huella del certificado es pública y no contiene la clave privada.

Crea un borrador en GitHub Releases con etiqueta `v1.0.0-build.2`, adjunta `otaku-verso.apk`, publica y vuelve a descargar el archivo para comprobar su SHA-256. Después actualiza Firestore con control de concurrencia, el respaldo estático y Firebase Hosting. Las versiones anteriores se conservan; el enlace oficial pasa a la nueva compilación. El mismo APK permite reintentar una publicación interrumpida. Si falla Hosting después de actualizar Firestore, repite el comando con el mismo archivo. Guarda `src/data/release.json` y los cambios de código en Git; el comando no hace commits ni push automáticamente.

Para comprobar un APK sin publicar ni desplegar:

```sh
npm run app:release -- --apk "C:/ruta/app-release.apk" --check
npm run test:release
```

`npm run release:publish -- "C:/ruta/app-release.apk"` permite ejecutar solo GitHub + Firestore + respaldo local, sin compilar/desplegar la web. `--notes` admite un archivo UTF-8 de hasta 2000 caracteres. Las notas del build 2 se usan solo en el ejemplo inicial; escribe las novedades reales de cada entrega.

En Android, el aviso automático se comprueba al abrir la pantalla principal, con un intervalo de seis horas tras una consulta correcta. No se ejecuta sobre el reproductor. «Más tarde» silencia esa compilación durante 24 horas; «Buscar actualizaciones» en Ajustes siempre comprueba. La descarga permanece en la caché privada y verifica tamaño, SHA-256, paquete, versión, compatibilidad y certificado contra la app instalada. Android solicita permiso de instalación cuando corresponda y confirmación en su instalador; no hay instalaciones silenciosas. La app anterior (código 1) aún no tiene este mecanismo y necesita instalar una vez la nueva 1.0 desde la web.

## Desplegar la web

```sh
firebase login
npm run deploy
```

El despliegue habitual solo publica Hosting. Las reglas se despliegan por separado y deben revisarse antes de cambiarlas:

```sh
firebase deploy --only firestore:rules --project anime-rc
```

## Contenido y recursos

Logo aportado por el propietario. La portada y la galería utilizan capturas reales de la app obtenidas por ADB, dentro de marcos Android creados con CSS. Origen y preparación en `docs/CAPTURAS_APP.md`. La ilustración inicial se conserva como recurso histórico, con su prompt en `docs/image-prompt.md`; ya no se usa en la portada ni en la imagen para compartir. Los textos legales de la app se copiaron del cliente Android actual; la política de la web describe su tratamiento por separado.

`docs/VALIDACION.md` registra las verificaciones y los límites de esta entrega.
