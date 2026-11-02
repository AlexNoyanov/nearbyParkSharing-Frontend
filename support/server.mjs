import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { answerQuestion, ollamaReady } from "./rag.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const serveStatic = process.argv.includes("--static");
const port = Number(process.env.SUPPORT_PORT || (serveStatic ? 3000 : 8787));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 100_000) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("bad json"));
      }
    });
    req.on("error", reject);
  });
}

function safeFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const file = path.resolve(distDir, relative);
  if (!file.startsWith(distDir)) return null;
  return file;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (req.method === "OPTIONS") return send(res, 204, "");

  if (url.pathname === "/api/support/health" && req.method === "GET") {
    const model = await ollamaReady();
    return send(
      res,
      200,
      JSON.stringify({
        ok: true,
        mode: model.ok ? "ollama" : "knowledge",
        model: model.model,
      }),
    );
  }

  if (url.pathname === "/api/support/chat" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const result = await answerQuestion({ text: body.message, history: body.history });
      return send(res, 200, JSON.stringify(result));
    } catch (error) {
      const status = error.message === "bad json" || error.message === "too large" ? 400 : 500;
      return send(res, status, JSON.stringify({ error: "Не получилось ответить. Спросите ещё раз." }));
    }
  }

  if (!serveStatic) return send(res, 404, JSON.stringify({ error: "not found" }));

  if (!fs.existsSync(distDir)) {
    return send(
      res,
      503,
      "Сначала соберите приложение: npm run build",
      "text/plain; charset=utf-8",
    );
  }

  const file = safeFile(url.pathname);
  if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
    const ext = path.extname(file).toLowerCase();
    return send(res, 200, fs.readFileSync(file), MIME[ext] || "application/octet-stream");
  }
  const index = path.join(distDir, "index.html");
  if (fs.existsSync(index)) return send(res, 200, fs.readFileSync(index), MIME[".html"]);
  return send(res, 404, "not found", "text/plain; charset=utf-8");
});

server.listen(port, "0.0.0.0", async () => {
  const model = await ollamaReady();
  const host = `http://localhost:${port}`;
  console.log("ParkShare ИИ-техподдержка");
  console.log(`  API:     ${host}/api/support/chat`);
  if (serveStatic) console.log(`  Демо:    ${host}/#support`);
  console.log(
    model.ok
      ? `  Модель:  ${model.model} на ${model.url}`
      : `  Модель не найдена (${model.model}). Ответы идут из базы знаний, пока Ollama не запущена.`,
  );
});
