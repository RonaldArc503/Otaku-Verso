import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { writeReleaseMetadata, firebaseRequest } from './firebase-admin.mjs';
import { inspectApk, assertAdvance } from './apk.mjs';

async function main() {
const repository = 'RonaldArc503/Otaku-Verso';
const documentUrl = 'https://firestore.googleapis.com/v1/projects/anime-rc/databases/(default)/documents/webPublic/app';
const args = process.argv.slice(2);
const apkPath = args.shift();
let checkOnly = false, notesPath;
while (args.length) {
  const arg = args.shift();
  if (arg === '--check') checkOnly = true;
  else if (arg === '--notes' && args.length) notesPath = args.shift();
  else throw new Error('Uso: npm run release:publish -- "ruta/app-release.apk" [--check] [--notes notas.txt]');
}
if (!apkPath) throw new Error('Indica la ruta del APK firmado. La versión se lee automáticamente del archivo.');
const { apk, ...verified } = inspectApk(apkPath);
const response = await fetch(documentUrl, { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`No se pudo leer la versión pública: HTTP ${response.status}`);
const fields = (await response.json()).fields;
const current = { versionCode: Number(fields?.versionCode?.integerValue), sha256: fields?.sha256?.stringValue };
assertAdvance(current, verified);
const releaseNotes = notesPath ? (await readFile(notesPath, 'utf8')).trim() : `Otaku Verso ${verified.version} para Android.`;
if (!releaseNotes || releaseNotes.length > 2000) throw new Error('Las notas deben tener entre 1 y 2000 caracteres.');
if (checkOnly) {
  console.log(JSON.stringify({ ...verified, releaseNotes, valid: true }, null, 2));
  return;
}
const normalized = verified.version.split('.').length === 2 ? `${verified.version}.0` : verified.version;
const tag = `v${normalized}-build.${verified.versionCode}`;
const expectedUrl = `https://github.com/${repository}/releases/download/${tag}/otaku-verso.apk`;
if (verified.versionCode === current.versionCode && fields.downloadUrl?.stringValue !== expectedUrl) {
  throw new Error('Este APK ya está publicado con ese código. Incrementa versionCode para publicar una compilación nueva.');
}

// Preflight both local sessions before creating or publishing a release.
await firebaseRequest(documentUrl);
const credentials = spawnSync('git', ['credential', 'fill'], {
  input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', windowsHide: true,
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
});
const token = credentials.stdout?.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9);
if (!token) throw new Error('Inicia sesión con Git Credential Manager antes de publicar.');
async function github(path, options = {}) {
  const result = await fetch(`https://api.github.com${path}`, {
    ...options, signal: AbortSignal.timeout(30000), headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', ...options.headers },
  });
  if (!result.ok) throw new Error(`GitHub respondió HTTP ${result.status}. La publicación puede reintentarse con el mismo APK.`);
  return result.json();
}
const repo = await github(`/repos/${repository}`);
if (repo.private) throw new Error('El repositorio debe ser público para descargar sin iniciar sesión.');
let release;
// The list includes drafts, so retries can reuse an interrupted draft too.
const releases = await github(`/repos/${repository}/releases?per_page=100`);
release = releases.find(item => item.tag_name === tag);
if (!release) {
  release = await github(`/repos/${repository}/releases`, { method: 'POST', body: JSON.stringify({ tag_name: tag,
    target_commitish: repo.default_branch, name: `Otaku Verso ${verified.version} · compilación ${verified.versionCode}`,
    draft: true, prerelease: false, body: `${releaseNotes}\n\nAndroid ${verified.minAndroid} o superior.\n\nSHA-256: ${verified.sha256}` }) });
}
let asset = release.assets.find(item => item.name === 'otaku-verso.apk');
if (!asset) {
  if (!release.draft) throw new Error('Esta publicación ya es pública y no tiene el APK esperado. Revisa la publicación.');
  const upload = await fetch(`${release.upload_url.split('{')[0]}?name=otaku-verso.apk`, { method: 'POST',
    signal: AbortSignal.timeout(180000), headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
      'Content-Type': 'application/vnd.android.package-archive' }, body: apk });
  if (!upload.ok) throw new Error(`No se pudo adjuntar el APK: HTTP ${upload.status}. Reintenta con el mismo archivo.`);
  asset = await upload.json();
}
if (asset.digest !== `sha256:${verified.sha256}` || asset.size !== apk.length) throw new Error('Esta compilación ya tiene otro archivo. No se reemplazan APK publicados.');
if (release.draft) release = await github(`/repos/${repository}/releases/${release.id}`, { method: 'PATCH', body: JSON.stringify({ draft: false, make_latest: 'true' }) });
asset = release.assets.find(item => item.name === 'otaku-verso.apk');
if (!asset || asset.browser_download_url !== expectedUrl) throw new Error('GitHub no devolvió la descarga oficial esperada.');
const download = await fetch(expectedUrl, { signal: AbortSignal.timeout(180000) });
if (!download.ok) throw new Error(`El enlace público respondió HTTP ${download.status}. Firestore no se actualizó.`);
const downloaded = Buffer.from(await download.arrayBuffer());
if (downloaded.length !== apk.length || createHash('sha256').update(downloaded).digest('hex') !== verified.sha256) throw new Error('El APK público no coincide. Firestore no se actualizó.');

// Recheck immediately before switching the public pointer; concurrent publications use a precondition.
const latest = await firebaseRequest(documentUrl);
assertAdvance({ versionCode: Number(latest.fields?.versionCode?.integerValue), sha256: latest.fields?.sha256?.stringValue }, verified);
const metadata = { ...verified, downloadUrl: expectedUrl,
  publishedAt: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/El_Salvador', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), releaseNotes };
await writeReleaseMetadata(metadata, latest.updateTime);
await writeFile('src/data/release.json', `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`APK ${verified.version} (compilación ${verified.versionCode}) publicado y verificado: ${expectedUrl}`);
console.log(`SHA-256: ${verified.sha256}`);
}

main().catch(error => { console.error(`No se publicó la actualización: ${error.message}`); process.exitCode = 1; });
