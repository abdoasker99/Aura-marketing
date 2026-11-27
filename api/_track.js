// Shared helpers for the always-on email tracker (open pixel + click redirect).
// Opens / clicks are written straight into the person's row of the Outreach Google Sheet (through the sheet's
// own Apps Script API); the Outreach Suite desktop app reads them from there on its next sync.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   SHEET_URL     the sheet's Apps Script web-app URL (…/exec)
//   SHEET_TOKEN   the sheet's API token (Settings tab of the sheet, cell "API token")
// Tracked links are signed with a key derived from SHEET_TOKEN (the desktop app derives the same key), so nobody
// can abuse the redirect and no second secret has to be copied anywhere.
const crypto = require("crypto");

const HOME = "https://www.aura-marketing.site/lawyers";
const KUWAIT_OFFSET_MS = 3 * 3600 * 1000; // Asia/Kuwait, UTC+3, no daylight saving

function kuwaitNow() {
  return new Date(Date.now() + KUWAIT_OFFSET_MS).toISOString().slice(0, 19).replace("T", " ");
}

// tokens look like "<Lead ID>.<random>" (the desktop app puts the sheet's Lead ID in front)
function leadOf(token) {
  const t = String(token || "");
  const i = t.indexOf(".");
  if (i <= 0) return null;
  const lead = t.slice(0, i);
  return /^[A-Za-z0-9_-]{3,40}$/.test(lead) ? lead : null;
}

// must match core/templating.py → sign(): HMAC-SHA256(secret, "token|url"), first 20 hex chars
function signingKey() {
  const t = String(process.env.SHEET_TOKEN || "").trim();
  return t ? crypto.createHash("sha256").update(`aura-track|${t}`).digest("hex") : "";
}

function sign(token, url) {
  const key = signingKey();
  if (!key) return "";
  return crypto.createHmac("sha256", key).update(`${token}|${url}`).digest("hex").slice(0, 20);
}

function sameSig(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

// link scanners / previews (Outlook Safe Links, security gateways…) — not a person
function isBot(req) {
  const ua = String(req.headers["user-agent"] || "");
  return req.method === "HEAD" || !ua ||
    /bot|crawl|spider|preview|scanner|safelinks|barracuda|proofpoint|mimecast|symantec|trendmicro|python|curl|wget/i.test(ua);
}

function linkLabel(url) {
  const u = String(url).toLowerCase();
  if (u.includes("loom.com") || u.includes("#vsl")) return "▶ Video";
  if (u.includes("calendly.com")) return "📅 Calendly";
  if (u.includes("wa.me") || u.includes("whatsapp")) return "🟢 WhatsApp";
  if (u.includes("aura-marketing.site")) return "🌐 Website";
  return "🔗 Link";
}

async function toSheet(lead, fields) {
  const url = process.env.SHEET_URL;
  const token = process.env.SHEET_TOKEN;
  if (!url || !token) return "not-configured";
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token, action: "update", by: "tracker", updates: [{ lead_id: lead, fields, by: "tracker" }] }),
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
    });
    const j = await r.json().catch(() => null);
    if (!j) return "bad-response";
    if (!j.ok) return "sheet-error";
    return (j.updated || []).length ? "ok" : "missing";
  } catch (e) {
    return "error";
  }
}

// answer the visitor right away, finish the sheet write in the background
function later(promise) {
  const ctx = globalThis[Symbol.for("@vercel/request-context")]?.get?.();
  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(promise);
    return true;
  }
  return false;
}

module.exports = { HOME, kuwaitNow, leadOf, sign, sameSig, isBot, linkLabel, toSheet, later };
