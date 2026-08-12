import { resolve } from "node:path";
import { capture, device, launchBrowser } from "./capture.ts";
import { loadConfig } from "./config.ts";
import { capturePath, createRunId } from "./paths.ts";

const STEP_WITHOUT_FLOW = 0;

export async function run(cwd: string, label?: string): Promise<void> {
  const config = await loadConfig(cwd);
  const profiles = config.devices.map((name) => ({
    name,
    profile: device(name),
  }));
  const runId = createRunId(new Date(), label);
  const storeDir = resolve(cwd, config.storeDir);

  const browser = await launchBrowser();
  try {
    for (const { name, profile } of profiles) {
      for (const page of config.pages) {
        const outPath = capturePath({
          storeDir,
          runId,
          device: name,
          path: page.path,
          step: STEP_WITHOUT_FLOW,
        });
        await capture(browser, {
          url: new URL(page.path, config.baseUrl).href,
          device: profile,
          outPath,
        });
        console.log(outPath);
      }
    }
  } finally {
    await browser.close();
  }
}
