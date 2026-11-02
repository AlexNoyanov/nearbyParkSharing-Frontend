import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE = JSON.parse(fs.readFileSync(path.join(__dirname, "knowledge.json"), "utf8"));
const PROMPT = fs.readFileSync(path.join(__dirname, "prompt.md"), "utf8");
const INTENTS = new Set(["greeting", "parking", "payment", "booking", "account", "other"]);

const ENDING =
  /(ами|ями|ого|ему|ыми|ими|ах|ях|ов|ев|иям|иях|ией|ий|ый|ой|ая|ое|ые|ие|ам|ям|ом|ем|ую|юю|ешь|ишь|ться|тся|ть|ся|ии|ы|и|а|я|е|о|у)$/u;

export function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9\s]/gi, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2)
    .map((word) => {
      const stem = word.replace(ENDING, "");
      return stem.length >= 3 ? stem : word;
    });
}

export function retrieve(query, limit = 3) {
  const queryTokens = [...new Set(tokens(query))];
  return KNOWLEDGE.map((chunk) => {
    const titleTokens = new Set(tokens(chunk.title));
    const bodyTokens = new Set(tokens(`${chunk.title} ${chunk.text}`));
    let score = 0;
    for (const token of queryTokens) {
      if (bodyTokens.has(token)) score += 1;
      if (titleTokens.has(token)) score += 1.5;
    }
    return { ...chunk, score };
  })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function factsFrom(chunks) {
  if (!chunks.length) return "В базе нет подходящей статьи.";
  return chunks.map((chunk) => `${chunk.title}\n${chunk.text}`).join("\n\n");
}

function greeting(text) {
  const q = String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е");
  if (!/^(привет|здравствуйте|здравствуй|добрый день|добрый вечер|доброе утро|хай|hello|hi)[!.?\s]*$/.test(q)) {
    return null;
  }
  return {
    reply:
      "Здравствуйте. Я техподдержка ParkShare. Спросите про бронь, оплату, отмену или как сдать своё место.",
    intent: "greeting",
    needs_human: false,
    sources: [],
    mode: "knowledge",
  };
}

function fallback(text, chunks) {
  const q = String(text || "").toLowerCase();
  const human = /жалоб|верните|возврат денег|мошен|обман|суд|полиц/.test(q);
  if (!chunks.length) {
    return {
      reply: human
        ? "Этот вопрос лучше передать человеку. Напишите на support@parkshare.ru, пароль и номер карты в чат отправлять не нужно."
        : "Я отвечаю по базе знаний ParkShare: бронь, оплата, отмена и сдача места. Спросите, например, что делать, если место занято.",
      intent: "other",
      needs_human: human,
      sources: [],
      mode: "knowledge",
    };
  }
  const top = chunks[0];
  return {
    reply: top.text,
    intent: "parking",
    needs_human: human || top.id === "human",
    sources: chunks.map((chunk) => chunk.title),
    mode: "knowledge",
  };
}

export function parseAnswer(raw) {
  const text = String(raw || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The support model did not return JSON.");
  const data = JSON.parse(body.slice(start, end + 1));
  const reply = String(data.reply || "").trim();
  if (!reply) throw new Error("The support model returned an empty reply.");
  return {
    reply: reply.slice(0, 3500),
    intent: INTENTS.has(data.intent) ? data.intent : "other",
    needs_human: data.needs_human === true,
  };
}

function messages(facts, history, text) {
  return [
    { role: "system", content: PROMPT },
    { role: "system", content: `SUPPORT FACTS:\n${facts}` },
    ...(history || [])
      .slice(-8)
      .filter((item) => item && (item.role === "user" || item.role === "assistant") && item.content)
      .map((item) => ({ role: item.role, content: String(item.content).slice(0, 2000) })),
    { role: "user", content: text },
  ];
}

async function askOllama(facts, history, text) {
  const base = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "qwen2.5:7b";
  const response = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(90000),
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      options: { temperature: 0.2, num_predict: 400 },
      messages: messages(facts, history, text),
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Ollama returned ${response.status}.`);
  return parseAnswer(payload.message?.content);
}

export async function ollamaReady() {
  const base = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "qwen2.5:7b";
  try {
    const response = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (!response.ok) return { ok: false, model };
    const payload = await response.json();
    const names = (payload.models || []).map((item) => item.name || "");
    const found = names.some((name) => name === model || name.startsWith(`${model}:`) || model.startsWith(name));
    return { ok: found, model, url: base };
  } catch {
    return { ok: false, model, url: base };
  }
}

export async function answerQuestion({ text, history }) {
  const question = String(text || "").trim();
  if (!question) {
    return {
      reply: "Напишите вопрос о брони, оплате или своём месте.",
      intent: "other",
      needs_human: false,
      sources: [],
      mode: "knowledge",
    };
  }
  const known = greeting(question);
  if (known) return known;

  const chunks = retrieve(question);
  const provider = (process.env.AI_PROVIDER || "ollama").toLowerCase();
  if (provider !== "knowledge") {
    try {
      const answer = await askOllama(factsFrom(chunks), history, question);
      return {
        ...answer,
        sources: chunks.map((chunk) => chunk.title),
        mode: "ollama",
      };
    } catch (error) {
      console.error("[support] ollama:", error.message);
    }
  }
  return fallback(question, chunks);
}

const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct && process.argv[2]) {
  const found = retrieve(process.argv.slice(2).join(" "));
  console.log(found.map((chunk) => `${chunk.score.toFixed(1)} ${chunk.title}`).join("\n") || "no hits");
}
