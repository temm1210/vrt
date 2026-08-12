import { isAbsolute } from "node:path";
import { chromium, devices, type Browser } from "playwright";

export type { Browser, BrowserContextOptions } from "playwright";

export type DeviceProfile = (typeof devices)[string];

export function device(name: string): DeviceProfile {
  const preset: DeviceProfile | undefined = devices[name];
  if (!preset) {
    throw new Error(`Unknown device: ${name}`);
  }
  return structuredClone(preset);
}

export interface CaptureOptions {
  url: string;
  outPath: string;
  device: DeviceProfile;
}

export function launchBrowser(): Promise<Browser> {
  return chromium.launch({ channel: "chromium", headless: true });
}

export async function capture(
  browser: Browser,
  { url, outPath, device: profile }: CaptureOptions,
): Promise<void> {
  if (!isAbsolute(outPath)) {
    throw new Error(`outPath must be absolute: ${outPath}`);
  }

  const engine = browser.browserType().name();
  if (profile.defaultBrowserType !== engine) {
    throw new Error(
      `This device needs ${profile.defaultBrowserType}, but the browser is ${engine}`,
    );
  }

  const page = await browser.newPage(profile);
  try {
    await page.goto(url);
    await page.screenshot({ path: outPath, animations: "disabled" });
  } finally {
    await page.close().catch(() => undefined);
  }
}
