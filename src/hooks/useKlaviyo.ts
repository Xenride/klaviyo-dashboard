import { useQuery } from "@tanstack/react-query";
import { KLAVIYO_METRICS } from "@/lib/klaviyoIds";
import { isoRangeUnderOneYear, postAggregates, payloads } from "@/lib/klaviyo";
import { mapAggToSeries } from "@/lib/klaviyoMappers";

export function useRevenueByFlow() {
  return useQuery({
    queryKey: ["klaviyo","revenueByFlow"],
    queryFn: async () => {
      const range = isoRangeUnderOneYear();
      const resp = await postAggregates(payloads.revenueByFlow(KLAVIYO_METRICS.placedOrder, range));
      return mapAggToSeries(resp, "sum_value");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCampaignOpensClicks() {
  return useQuery({
    queryKey: ["klaviyo","campaignOpensClicks"],
    queryFn: async () => {
      const range = isoRangeUnderOneYear(); // o 30d si prefieres
      const [opens, clicks] = await Promise.all([
        postAggregates(payloads.countByCampaign(KLAVIYO_METRICS.openedEmail, range)),
        postAggregates(payloads.countByCampaign(KLAVIYO_METRICS.clickedEmail, range)),
      ]);
      return {
        opens: mapAggToSeries(opens, "count"),
        clicks: mapAggToSeries(clicks, "count"),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscribersMonthly() {
  return useQuery({
    queryKey: ["klaviyo","subscribersMonthly"],
    queryFn: async () => {
      const range = isoRangeUnderOneYear();
      const resp = await postAggregates(payloads.countMonthly(KLAVIYO_METRICS.subscribedEmail, range));
      return mapAggToSeries(resp, "count");
    },
    staleTime: 10 * 60 * 1000,
  });
}