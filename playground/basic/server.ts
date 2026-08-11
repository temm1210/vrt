import { access, readFile } from "node:fs/promises";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { extname, join } from "node:path";

const ROOT = import.meta.dirname;
const PORT = 4000;
const THEME_PATH = "/theme.css";
const PARSE_BASE = "http://localhost";

const CONTENT_TYPE: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

const variant = process.env.VRT_VARIANT ?? "none";
const THEME_FILE = join(ROOT, "variants", `${variant}.css`);

function fileFor(pathname: string): string {
  if (pathname === THEME_PATH) {
    return THEME_FILE;
  }
  return join(ROOT, "public", pathname === "/" ? "index.html" : pathname);
}

async function respond(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const { pathname } = new URL(req.url ?? "/", PARSE_BASE);
    const file = fileFor(pathname);
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": CONTENT_TYPE[extname(file)] ?? "text/plain",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

try {
  await access(THEME_FILE);
} catch {
  fail(`unknown variant: ${variant}`);
}

createServer((req, res) => {
  void respond(req, res);
})
  .on("error", (error: NodeJS.ErrnoException) => {
    fail(
      error.code === "EADDRINUSE"
        ? `port ${PORT} is already in use`
        : error.message,
    );
  })
  .listen(PORT, () => {
    console.log(`playground: http://localhost:${PORT}  variant=${variant}`);
  });
