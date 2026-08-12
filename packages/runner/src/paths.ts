import { hash } from "node:crypto";
import { resolve } from "node:path";

const SLUG_MAX_LENGTH = 32;
const HASH_LENGTH = 16;
const RUN_LABEL = /^[A-Za-z0-9._-]+$/;

export function slug(value: string): string {
  const beforeQuery = value.split(/[?#]/, 1)[0] ?? "";
  const cleaned = beforeQuery
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/^-+|-+$/g, "");

  if (cleaned) {
    return cleaned;
  }
  return beforeQuery === "/" ? "root" : "page";
}

export function pathHash(value: string): string {
  return hash("sha256", value, "hex").slice(0, HASH_LENGTH);
}

export function createRunId(startedAt: Date, label?: string): string {
  if (label !== undefined && !RUN_LABEL.test(label)) {
    throw new Error(
      `Run label may only contain letters, digits, dot, dash and underscore: ${label}`,
    );
  }

  const timestamp = startedAt
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "");

  return label === undefined ? timestamp : `${timestamp}-${label}`;
}

export interface CapturePathOptions {
  storeDir: string;
  runId: string;
  device: string;
  path: string;
  step: number;
}

export function capturePath({
  storeDir,
  runId,
  device,
  path,
  step,
}: CapturePathOptions): string {
  const fileName = `${slug(path)}-${pathHash(path)}__${step}.png`;
  return resolve(storeDir, "runs", runId, slug(device), fileName);
}
