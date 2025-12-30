// src/hooks/useKlaviyo.ts
import { useQuery } from "@tanstack/react-query";
import { KLAVIYO_METRICS } from "@/lib/klaviyoIds";
import { getISORange, postAggregates, payloads } from "@/lib/klaviyo";
import { mapAggToSeries } from "@/lib/klaviyoMappers";

export function useRevenueByFlow(days: number = 30) {
  return useQuery({
    // Se agrega 'days' a la llave para que el cache sea independiente por rango
    queryKey: ["klaviyo", "revenueByFlow", days], 
    queryFn: async () => {
      const range = getISORange(days);
      const resp = await postAggregates(payloads.revenueByFlow(KLAVIYO_METRICS.placedOrder, range));
      return mapAggToSeries(resp, "sum_value");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCampaignOpensClicks(days: number = 30) {
  return useQuery({
    queryKey: ["klaviyo", "campaignOpensClicks", days],
    queryFn: async () => {
      const range = getISORange(days);
      const [opens, clicks] = await Promise.all([
        postAggregates(payloads.countByCampaign(KLAVIYO_METRICS.openedEmail, range, "unique")),
        postAggregates(payloads.countByCampaign(KLAVIYO_METRICS.clickedEmail, range, "unique")),
      ]);
      return {
        opens: mapAggToSeries(opens, "unique"),
        clicks: mapAggToSeries(clicks, "unique"),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscribersMonthly(days: number = 30) {
  return useQuery({
    queryKey: ["klaviyo", "subscribersMonthly", days],
    queryFn: async () => {
      const range = getISORange(days);
      // Para suscriptores, si el rango es corto (< 31 días) usamos 'day'
      const interval = days <= 30 ? "day" : "month";
      const resp = await postAggregates(payloads.countMonthly(KLAVIYO_METRICS.subscribedEmail, range, interval));
      return mapAggToSeries(resp, "count");
    },
    staleTime: 10 * 60 * 1000,
  });
}