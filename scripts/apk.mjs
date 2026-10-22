import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

export const policy = JSON.parse(readFileSync(new URL('../release-policy.json', import.meta.url), 'utf8'));
export function androidSdk() {
  const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME || join(process.env.LOCALAPPDATA || '', 'Android/Sdk');
  if (!existsSync(join(sdk, 'build-tools'))) throw new Error('No se encontró Android SDK. Configura ANDROID_HOME.');
  return sdk;
}

export function javaEnvironment() {
  const bundled = 'C:/Program Files/Android/Android Studio/jbr';
  const home = process.env.JAVA_HOME || (existsSync(bundled) ? bundled : null);
  return home ? { ...process.env, JAVA_HOME: home, PATH: `${join(home, 'bin')}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}` } : process.env;
}

export function parseBadging(output) {
  const manifest = output.match(/^package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'/m);
  const sdk = output.match(/^sdkVersion:'(\d+)'/m);
  if (!manifest || !sdk) throw new Error('No se pudo leer la versión real del APK.');
  const [, applicationId, code, version] = manifest;
  const versionCode = Number(code), minSdk = Number(sdk[1]);
  if (applicationId !== policy.applicationId || !/^\d+(\.\d+){1,3}$/.test(version) || version.length > 40
      || !Number.isSafeInteger(versionCode) || versionCode < 1 || versionCode > 2100000000) {
    throw new Error('Identificador o versión del APK inválidos.');
  }
  const androidVersions = { 26: '8.0', 27: '8.1', 28: '9.0', 29: '10.0', 30: '11.0', 31: '12.0', 32: '12.1', 33: '13.0', 34: '14.0', 35: '15.0', 36: '16.0' };
  if (!androidVersions[minSdk]) throw new Error(`minSdk ${minSdk} no reconocido. Revisa su compatibilidad antes de publicar.`);
  return { applicationId, version, versionCode, minSdk, minAndroid: androidVersions[minSdk] };
}

export function assertAdvance(current, next) {
  if (!current || !Number.isSafeInteger(current.versionCode) || !/^[a-f0-9]{64}$/.test(current.sha256)) throw new Error('No se pudo validar la publicación actual.');
  if (next.versionCode < current.versionCode) throw new Error('El código interno no puede retroceder.');
  if (next.versionCode === current.versionCode && next.sha256 !== current.sha256) {
    throw new Error('Este código interno ya existe con otro APK. Incrementa versionCode; versionName puede seguir en 1.0.');
  }
}

export function inspectApk(path) {
  const absolute = resolve(path), apk = readFileSync(absolute);
  if (apk.length < 1024 || apk.length > policy.maxApkBytes) throw new Error('Tamaño de APK inválido.');
  const sdk = androidSdk();
  const versions = readdirSync(join(sdk, 'build-tools')).filter(v => /^\d+(\.\d+){1,2}$/.test(v))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const tools = versions.map(v => join(sdk, 'build-tools', v)).find(p => existsSync(join(p, 'lib/apksigner.jar')) && existsSync(join(p, process.platform === 'win32' ? 'aapt.exe' : 'aapt')));
  if (!tools) throw new Error('Instala Android SDK Build Tools (aapt y apksigner).');
  const badging = execFileSync(join(tools, process.platform === 'win32' ? 'aapt.exe' : 'aapt'), ['dump', 'badging', absolute], { encoding: 'utf8', windowsHide: true });
  const env = javaEnvironment();
  const java = env.JAVA_HOME ? join(env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
  let certificates;
  try {
    certificates = execFileSync(java, ['-jar', join(tools, 'lib/apksigner.jar'), 'verify', '--print-certs', absolute], { encoding: 'utf8', env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch { throw new Error('El APK no tiene una firma válida. Genera el release firmado con key0.'); }
  const signers = [...new Set([...certificates.matchAll(/^(?:Signer #\d+|V\d+(?:\.\d+)? Signer:) certificate SHA-256 digest: ([a-f0-9]{64})\r?$/gm)].map(m => m[1]))];
  if (signers.length !== 1 || signers[0] !== policy.signerSha256) throw new Error('La firma no coincide con el APK oficial. No se publicará una firma debug ni otra clave.');
  return { ...parseBadging(badging), signerSha256: signers[0], sizeBytes: apk.length, sha256: createHash('sha256').update(apk).digest('hex'), apk };
}
