import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { writeReleaseMetadata } from './firebase-admin.mjs';

const repository = 'RonaldArc503/Otaku-Verso';
const [apkPath, version, versionCodeArg] = process.argv.slice(2);
if (!apkPath || !version || !/^\d+(\.\d+){1,3}$/.test(version) || !/^[1-9]\d*$/.test(versionCodeArg || '')) {
  throw new Error('Uso: npm run release:publish -- "C:/ruta/app-release.apk" 1.0 1');
}
const apk = await readFile(resolve(apkPath));
if (apk[0] !== 0x50 || apk[1] !== 0x4b || apk.length < 1024) throw new Error('El archivo no parece un APK válido.');
const result = spawnSync('git', ['credential', 'fill'], {
  input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8',
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
});
const token = result.stdout?.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9);
if (!token) throw new Error('No se encontró una sesión de GitHub en Git Credential Manager.');

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${(await response.text()).slice(0, 600)}`);
  return response.json();
}

const repo = await github(`/repos/${repository}`);
if (repo.private) throw new Error('El repositorio debe ser público para distribuir el APK sin iniciar sesión.');
const tag = `v${version.split('.').length === 2 ? `${version}.0` : version}`;
const releases = await github(`/repos/${repository}/releases?per_page=100`);
let release = releases.find(item => item.tag_name === tag);
if (release && !release.draft) throw new Error(`La versión ${tag} ya está publicada. Usa una versión nueva; no reemplaces archivos publicados.`);
if (!release) release = await github(`/repos/${repository}/releases`, { method: 'POST', body: JSON.stringify({ tag_name: tag, target_commitish: repo.default_branch, name: `Otaku Verso ${version}`, draft: true, prerelease: false, body: `Aplicación oficial de Otaku Verso para Android 8.0 o superior.\n\nDescarga e instala otaku-verso.apk.\n\nSHA-256: ${createHash('sha256').update(apk).digest('hex')}` }) });
let asset = release.assets.find(item => item.name === 'otaku-verso.apk');
if (!asset) {
  const response = await fetch(`${release.upload_url.split('{')[0]}?name=otaku-verso.apk`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/vnd.android.package-archive' }, body: apk });
  if (!response.ok) throw new Error(`No se pudo adjuntar el APK: HTTP ${response.status}`);
  asset = await response.json();
} else if (asset.digest !== `sha256:${createHash('sha256').update(apk).digest('hex')}`) {
  throw new Error('El borrador ya contiene un APK distinto. Revisa el borrador antes de continuar.');
}
release = await github(`/repos/${repository}/releases/${release.id}`, { method: 'PATCH', body: JSON.stringify({ draft: false, make_latest: 'true' }) });
const downloaded = await fetch(asset.browser_download_url);
if (!downloaded.ok) throw new Error(`El enlace público del APK respondió ${downloaded.status}. Firestore no se actualizó.`);
const sha256 = createHash('sha256').update(apk).digest('hex');
if (createHash('sha256').update(Buffer.from(await downloaded.arrayBuffer())).digest('hex') !== sha256) throw new Error('El APK descargado no coincide con el original.');
const metadata = { version, versionCode: Number(versionCodeArg), downloadUrl: asset.browser_download_url, sizeBytes: apk.length, minAndroid: '8.0', publishedAt: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/El_Salvador', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), sha256, releaseNotes: `Otaku Verso ${version} para Android.` };
await writeReleaseMetadata(metadata);
await writeFile('src/data/release.json', `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`APK publicado y verificado: ${asset.browser_download_url}`);
console.log(`SHA-256: ${sha256}`);
console.log('Ejecuta npm run deploy y guarda src/data/release.json en Git para actualizar también la versión estática de respaldo.');
