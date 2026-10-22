export interface AppRelease {
  version: string;
  versionCode: number;
  downloadUrl: string;
  sizeBytes: number;
  minAndroid: string;
  publishedAt: string;
  sha256: string;
  releaseNotes: string;
}

export function parseRelease(value: unknown): AppRelease | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (typeof data.downloadUrl !== 'string') return null;
  let url: URL;
  try { url = new URL(data.downloadUrl); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.port || url.username || url.password ||
      !/^\/RonaldArc503\/Otaku-Verso\/releases\/download\/[^/]+\/[^/]+\.apk$/.test(url.pathname) || url.search || url.hash) return null;
  if (typeof data.version !== 'string' || !/^\d+(\.\d+){1,3}$/.test(data.version) ||
      typeof data.versionCode !== 'number' || !Number.isInteger(data.versionCode) || data.versionCode < 1 ||
      typeof data.sizeBytes !== 'number' || !Number.isFinite(data.sizeBytes) || data.sizeBytes <= 0 ||
      typeof data.minAndroid !== 'string' || !/^\d+(\.\d+)?$/.test(data.minAndroid) ||
      typeof data.publishedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.publishedAt) ||
      typeof data.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(data.sha256) ||
      typeof data.releaseNotes !== 'string' || data.releaseNotes.length > 2000) return null;
  return data as unknown as AppRelease;
}

export const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toLocaleString('es', { maximumFractionDigits: 1 })} MB`;
