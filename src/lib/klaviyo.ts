// src/lib/klaviyo.ts
import { fetchWithRetry } from "./http";

export type Range = { from: string; to: string };

// Máx 1 año (dejamos 364 días)
export function isoRangeUnderOneYear(): Range {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 364);
  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Semáforo global simple para SERIALIZAR todas las llamadas a /metric-aggregates.
 * Evita picos concurrentes que disparan 429.
 */
let chain = Promise.resolve();
const paceMs = 250; // pequeño pacing entre llamadas

export async function postAggregates(payload: any) {
  // Encola en cadena para que solo corra una request a la vez
  chain = chain.then(async () => {
    // pequeño delay anti-ráfaga
    await new Promise((r) => setTimeout(r, paceMs));
    const res = await fetchWithRetry("/api/klaviyo/metric-aggregates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, {
      retries: 6,         // más tolerante con 429
      baseDelayMs: 600,   // arranca con 600ms
      maxDelayMs: 6000,   // tope 6s
      onRetry: ({ attempt, status }) => {
        // Opcional: console.debug(`Retry #${attempt} (status ${status ?? "net"})`);
      },
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`metric-aggregates failed: ${res.status} ${t}`);
    }
    return res.json();
  });

  return chain;
}

/**
 * Payloads válidos (sin "$time" en "by"; el tiempo va en "interval")
 */
export const payloads = {
  countMonthly(metricId: string, range: Range) {
    return {
      data: {
        type: "metric-aggregate",
        attributes: {
          metric_id: metricId,
          measurements: ["count"],
          interval: "month",
          timezone: "UTC",
          filter: [
            `greater-or-equal(datetime,${range.from})`,
            `less-than(datetime,${range.to})`,
          ],
        },
      },
    };
  },

  countByCampaign(metricId: string, range: Range) {
    return {
      data: {
        type: "metric-aggregate",
        attributes: {
          metric_id: metricId,
          measurements: ["count"],
          timezone: "UTC",
          by: ["campaign_id"], // si diera 400, prueba ["campaign_name"]
          filter: [
            `greater-or-equal(datetime,${range.from})`,
            `less-than(datetime,${range.to})`,
          ],
        },
      },
    };
  },

  revenueByFlow(metricId: string, range: Range) {
    return {
      data: {
        type: "metric-aggregate",
        attributes: {
          metric_id: metricId,
          measurements: ["sum_value"],
          timezone: "UTC",
          by: ["flow"], // si diera 400, prueba ["flow_id"]
          filter: [
            `greater-or-equal(datetime,${range.from})`,
            `less-than(datetime,${range.to})`,
          ],
        },
      },
    };
  },
};
