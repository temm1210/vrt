import { parseArgs } from "node:util";
import { run } from "@vrt/runner";

const USAGE = `Usage: vrt <command>

Commands:
  run    capture every page listed in vrt.config.ts
`;

async function main(argv: string[]): Promise<void> {
  const { positionals } = parseArgs({ args: argv, allowPositionals: true });

  if (positionals[0] === "run") {
    await run(process.cwd());
    return;
  }

  process.stderr.write(USAGE);
  process.exitCode = 1;
}

function describe(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const cause =
    error.cause instanceof Error ? `\n  ${error.cause.message}` : "";
  return `${error.message}${cause}`;
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${describe(error)}\n`);
  process.exitCode = 1;
}
