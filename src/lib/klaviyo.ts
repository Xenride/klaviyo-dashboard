import { fetchWithRetry } from "./http";

export type Range = { from: string; to: string };

/**
 * Calcula el rango ISO dinámicamente según los días recibidos
 */
export function getISORange(days: number): Range {
  const to = new Date();
  to.setUTCHours(23, 59, 59, 999);

  const from = new Date();
  from.setUTCDate(from.getUTCDate() - days);
  from.setUTCHours(0, 0, 0, 0);

  return { from: from.toISOString(), to: to.toISOString() };
}

let chain = Promise.resolve();
const paceMs = 250;

export async function postAggregates(payload: any) {
  chain = chain.then(async () => {
    await new Promise((r) => setTimeout(r, paceMs));
    const res = await fetchWithRetry("/api/klaviyo/metric-aggregates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, {
      retries: 6,
      baseDelayMs: 600,
      maxDelayMs: 6000,
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`metric-aggregates failed: ${res.status} ${t}`);
    }
    return res.json();
  });

  return chain;
}

export const payloads = {
  // Se agregó el parámetro 'interval' y 'measurement'
  countMonthly(metricId: string, range: Range, interval: string = "month", measurement: string = "count") {
    return {
      data: {
        type: "metric-aggregate",
        attributes: {
          metric_id: metricId,
          measurements: [measurement],
          interval: interval, 
          timezone: "UTC",
          filter: [
            `greater-or-equal(datetime,${range.from})`,
            `less-than(datetime,${range.to})`,
          ],
        },
      },
    };
  },

  countByCampaign(metricId: string, range: Range, measurement: string = "count") {
    return {
      data: {
        type: "metric-aggregate",
        attributes: {
          metric_id: metricId,
          measurements: [measurement],
          timezone: "UTC",
          by: ["$attributed_message"],
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
          by: ["$attributed_flow"],
          filter: [
            `greater-or-equal(datetime,${range.from})`,
            `less-than(datetime,${range.to})`,
          ],
        },
      },
    };
  },
};