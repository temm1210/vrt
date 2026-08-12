import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const CONFIG_FILE = "vrt.config.ts";

export interface PageConfig {
  path: string;
}

export interface VrtConfig {
  baseUrl: string;
  storeDir: string;
  devices: string[];
  pages: PageConfig[];
}

export async function loadConfig(cwd: string): Promise<VrtConfig> {
  const file = resolve(cwd, CONFIG_FILE);

  let loaded: { default?: unknown };
  try {
    loaded = (await import(pathToFileURL(file).href)) as { default?: unknown };
  } catch (error) {
    throw new Error(`Cannot load ${file}`, { cause: error });
  }

  return parseConfig(loaded.default);
}

function parseConfig(value: unknown): VrtConfig {
  if (typeof value !== "object" || value === null) {
    throw new Error(`${CONFIG_FILE} must export a config object as default`);
  }

  const { baseUrl, storeDir, devices, pages } = value as Record<
    keyof VrtConfig,
    unknown
  >;

  if (typeof baseUrl !== "string" || !URL.canParse(baseUrl)) {
    throw new Error(`baseUrl must be an absolute URL: ${String(baseUrl)}`);
  }
  if (typeof storeDir !== "string" || storeDir.length === 0) {
    throw new Error("storeDir must be a non-empty path");
  }
  if (!isNonEmptyArrayOf(devices, isString)) {
    throw new Error("devices must list at least one device name");
  }
  if (!isNonEmptyArrayOf(pages, isPageConfig)) {
    throw new Error('pages must list at least one { path } starting with "/"');
  }

  return { baseUrl, storeDir, devices, pages };
}

function isNonEmptyArrayOf<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): value is T[] {
  return Array.isArray(value) && value.length > 0 && value.every(isItem);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isPageConfig(value: unknown): value is PageConfig {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { path } = value as Record<keyof PageConfig, unknown>;
  return typeof path === "string" && path.startsWith("/");
}
