// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE = "https://a.klaviyo.com/api";
const AUTH = `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`;
const REV  = process.env.KLAVIYO_REVISION || "2024-10-15";
const DEBUG_LOG_BODIES = process.env.KLAVIYO_DEBUG === "1";

// Debug: log breve
const logReq = (label, info) => {
  console.log(`[${label}]`, JSON.stringify(info));
};

// GET /metrics (sanity)
app.get("/api/klaviyo/metrics", async (_req, res) => {
  try {
    const r = await fetch(`${BASE}/metrics/`, {
      headers: {
        Authorization: AUTH,
        Accept: "application/json",
        revision: REV,
      },
    });
    const text = await r.text();
    res.status(r.status).type("application/json").send(text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /metric-aggregates (principal)
app.post("/api/klaviyo/metric-aggregates", async (req, res) => {
  try {
    logReq("metric-aggregates:req", req.body?.data?.attributes ?? {});
    const r = await fetch(`${BASE}/metric-aggregates/`, {
      method: "POST",
      headers: {
        Authorization: AUTH,
        "Content-Type": "application/json",
        Accept: "application/json",
        revision: REV,
      },
      body: JSON.stringify(req.body),
    });
      const text = await r.text();
      console.log(`[metric-aggregates:res ${r.status}]`);
      if (DEBUG_LOG_BODIES) {
        console.log(`[metric-aggregates:res body] ${text.slice(0, 800)}`);
      }
    res.status(r.status).type("application/json").send(text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[dotenv@${dotenv.version}] injecting env from .env`);
  console.log(`API proxy ready on http://localhost:${PORT}`);
});
