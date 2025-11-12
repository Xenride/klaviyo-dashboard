import { useEffect, useMemo, useRef, useState } from "react";
import { TrendingUp, MousePointerClick, Mail, DollarSign, Users } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import { KLAVIYO_METRICS } from "@/lib/klaviyoIds";
import { isoRangeUnderOneYear, postAggregates, payloads } from "@/lib/klaviyo";

type SeriesPoint = { date: string; value: number; group?: string };

function safeMapMonthly(resp: any): SeriesPoint[] {
  const json = resp && typeof resp === "object" ? resp : {};
  const dataNode = Array.isArray(json) ? { data: json } : json;
  const attrs = dataNode?.data?.attributes ?? dataNode?.attributes ?? {};
  const rows =
    attrs?.data ??
    attrs?.results ??
    (Array.isArray(dataNode?.data) ? dataNode.data : []) ??
    [];
  const topLevelDates: string[] = attrs?.dates ?? attrs?.intervals ?? [];
  const out: SeriesPoint[] = [];

  const coerceGroup = (row: any, fallback?: string) => {
    if (!row || typeof row !== "object") return fallback ?? "total";
    const candidates = [
      row.group,
      row.group_name,
      row.name,
      row.title,
      row.campaign_id,
      row.flow,
      row.metric_id,
    ];
    const found = candidates.find((c) => typeof c === "string" && c.trim());
    if (found) return found;
    if (Array.isArray(row.dimensions) && row.dimensions.length) {
      return row.dimensions.join(" · ");
    }
    if (Array.isArray(row.dimension_values) && row.dimension_values.length) {
      return row.dimension_values.join(" · ");
    }
    if (typeof row.dimension_values_display_name === "string") {
      return row.dimension_values_display_name;
    }
    if (typeof row.id === "string" && row.id.trim()) return row.id;
    return fallback ?? "total";
  };

  const coerceNumber = (val: any) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    }
    if (val && typeof val === "object") {
      const candidates = [
        val.value,
        val.count,
        val.sum_value,
        val.sum,
        val.total,
      ];
      const found = candidates.find((c) => typeof c === "number");
      if (typeof found === "number") return found;
    }
    return undefined;
  };

  const pushValues = (
    values: any[],
    dates: string[],
    group: string,
  ) => {
    values.forEach((val, idx) => {
      const numberVal = coerceNumber(val);
      const date =
        dates[idx] ??
        (typeof val === "object"
          ? val?.interval ?? val?.datetime ?? val?.date ?? val?.time
          : undefined);
      if (typeof numberVal === "number" && date) {
        out.push({ date, value: numberVal, group });
      }
    });
  };

  const flattenRow = (row: any) => {
    if (!row || typeof row !== "object") return;
    const rowDates: string[] =
      row.dates ??
      row.intervals ??
      row.datetimes ??
      row.timestamps ??
      topLevelDates;
    const group = coerceGroup(row, "total");

    // measurements format (e.g., { measurements: { count: [ ... ] } })
    if (row.measurements && typeof row.measurements === "object") {
      Object.entries(row.measurements).forEach(([measurementKey, series]) => {
        if (Array.isArray(series)) {
          pushValues(series, rowDates, group ?? measurementKey);
        } else if (series && typeof series === "object") {
          const nested =
            (Array.isArray(series.values) && series.values) ||
            (Array.isArray(series.data) && series.data);
          if (nested) {
            pushValues(nested, rowDates, group ?? measurementKey);
          } else {
            const value = coerceNumber(series);
            if (typeof value === "number") {
              const date =
                series?.interval ??
                series?.datetime ??
                series?.date ??
                series?.time ??
                rowDates[0];
              if (date) out.push({ date, value, group });
            }
          }
        }
      });
      return;
    }

    if (Array.isArray(row.intervals)) {
      row.intervals.forEach(flattenRow);
      return;
    }
    if (Array.isArray(row.series)) {
      row.series.forEach(flattenRow);
      return;
    }

    const date =
      row?.datetime || row?.date || row?.start || row?.time || rowDates[0];
    const value = coerceNumber(row);
    if (date && typeof value === "number") {
      out.push({ date, value, group });
    }
  };

  if (Array.isArray(rows)) {
    rows.forEach(flattenRow);
  } else if (rows && typeof rows === "object") {
    flattenRow(rows);
  }

  return out;
}

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [openSeries, setOpenSeries]   = useState<SeriesPoint[]>([]);
  const [clickSeries, setClickSeries] = useState<SeriesPoint[]>([]);

  const [totals, setTotals] = useState({
    opens: 0, clicks: 0, orders: 0, subscribers: 0
  });

  const [topCampaigns, setTopCampaigns] = useState<
    Array<{id:string; name:string; orders:number; opens:number; clicks:number}>
  >([]);
  const [topFlows, setTopFlows] = useState<
    Array<{id:string; name:string; revenue:number}>
  >([]);

  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    (async () => {
      try {
        const { from, to } = isoRangeUnderOneYear();

        // 1) Series mensuales (interval month; sin "by")
        const opensMonthly    = payloads.countMonthly(KLAVIYO_METRICS.openedEmail, { from, to });
        const clicksMonthly   = payloads.countMonthly(KLAVIYO_METRICS.clickedEmail, { from, to });
        const subsMonthly     = payloads.countMonthly(KLAVIYO_METRICS.subscribedEmail, { from, to });

        // 2) Agrupados por campaña
        const ordersByCamp    = payloads.countByCampaign(KLAVIYO_METRICS.placedOrder, { from, to });
        const opensByCamp     = payloads.countByCampaign(KLAVIYO_METRICS.openedEmail, { from, to });
        const clicksByCamp    = payloads.countByCampaign(KLAVIYO_METRICS.clickedEmail, { from, to });

        // 3) Revenue por flow
        const revenueByFlow   = payloads.revenueByFlow(KLAVIYO_METRICS.placedOrder, { from, to });

        // **IMPORTANTE**: No dispares en paralelo. Cada postAggregates ya va en cola + backoff.
        const opensMonthlyResp        = await postAggregates(opensMonthly);
        const clicksMonthlyResp       = await postAggregates(clicksMonthly);
        const subsMonthlyResp         = await postAggregates(subsMonthly);
        const ordersByCampaignResp    = await postAggregates(ordersByCamp);
        const opensByCampaignResp     = await postAggregates(opensByCamp);
        const clicksByCampaignResp    = await postAggregates(clicksByCamp);
        const revenueByFlowResp       = await postAggregates(revenueByFlow);

        // Series (mensual)
        const opens  = safeMapMonthly(opensMonthlyResp);
        const clicks = safeMapMonthly(clicksMonthlyResp);
        setOpenSeries(opens);
        setClickSeries(clicks);

        // Totales
        const sumVals = (arr: SeriesPoint[]) => arr.reduce((a,b)=>a + (b.value || 0), 0);
        const totalOpens  = sumVals(opens);
        const totalClicks = sumVals(clicks);
        const totalSubs   = sumVals(safeMapMonthly(subsMonthlyResp));

        // Orders desde campañas
        const ordersByCampRows = safeMapMonthly(ordersByCampaignResp);
        const totalOrders  = sumVals(ordersByCampRows);

        setTotals({
          opens: totalOpens,
          clicks: totalClicks,
          subscribers: totalSubs,
          orders: totalOrders,
        });

        // Top Campaigns
        const opensByCampRows  = safeMapMonthly(opensByCampaignResp);
        const clicksByCampRows = safeMapMonthly(clicksByCampaignResp);

        const aggCampaign = new Map<string, { id:string; name:string; orders:number; opens:number; clicks:number }>();
        const upsert = (g?:string, patch?:Partial<{orders:number; opens:number; clicks:number}>) => {
          const key = g || "(unknown)";
          const cur = aggCampaign.get(key) || { id:key, name:key, orders:0, opens:0, clicks:0 };
          aggCampaign.set(key, {
            ...cur,
            orders: cur.orders + (patch?.orders ?? 0),
            opens:  cur.opens  + (patch?.opens  ?? 0),
            clicks: cur.clicks + (patch?.clicks ?? 0),
          });
        };
        ordersByCampRows.forEach(r => upsert(r.group, { orders: r.value }));
        opensByCampRows.forEach(r  => upsert(r.group, { opens:  r.value }));
        clicksByCampRows.forEach(r => upsert(r.group, { clicks: r.value }));

        setTopCampaigns(
          Array.from(aggCampaign.values())
            .sort((a,b)=> b.orders - a.orders)
            .slice(0, 5)
        );

        // Top Flows (sum_value por flow)
        const revenueByFlowRows = safeMapMonthly(revenueByFlowResp);
        const flowAgg = new Map<string, { id:string; name:string; revenue:number }>();
        revenueByFlowRows.forEach(r => {
          const key = r.group || "(unknown flow)";
          const cur = flowAgg.get(key) || { id:key, name:key, revenue:0 };
          flowAgg.set(key, { ...cur, revenue: cur.revenue + (r.value || 0) });
        });
        setTopFlows(Array.from(flowAgg.values()).sort((a,b)=> b.revenue - a.revenue));

        setLoading(false);
      } catch (e:any) {
        setError(e?.message || "Error cargando datos");
        setLoading(false);
      }
    })();
  }, []);

  const kpis = useMemo(() => {
    const openRate  = totals.opens ? ((totals.opens / Math.max(totals.opens, 1)) * 100).toFixed(2) : "0.00";  // placeholder
    const clickRate = totals.opens ? ((totals.clicks / Math.max(totals.opens, 1)) * 100).toFixed(2) : "0.00"; // CTOR aprox
    return {
      totalOrdersLabel: totals.orders.toLocaleString(),
      openRate,
      clickRate,
      listGrowthLabel: `+${totals.subscribers.toLocaleString()}`,
    };
  }, [totals]);

  const timeSeriesData = useMemo(() => {
    const allDates = Array.from(new Set([
      ...openSeries.map(s=>s.date),
      ...clickSeries.map(s=>s.date),
    ])).sort();
    const getVal = (arr: SeriesPoint[], d: string) => arr.find(x=>x.date===d)?.value ?? 0;
    return allDates.map(d => ({
      date: new Date(d).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      opens:   getVal(openSeries, d),
      clicks:  getVal(clickSeries, d),
    }));
  }, [openSeries, clickSeries]);

  if (loading) return <div className="p-6">Cargando dashboard…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Executive Overview</h1>
        <p className="mt-1 text-muted-foreground">Monitor your key marketing metrics at a glance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Total Orders" value={kpis.totalOrdersLabel} change="+12.5%" changeType="positive" icon={DollarSign} />
        <KPICard title="Open Rate (approx)"  value={`${kpis.openRate}%`}  change="+2.3%" changeType="positive" icon={Mail} />
        <KPICard title="Click Rate (CTOR)"   value={`${kpis.clickRate}%`} change="+1.8%" changeType="positive" icon={MousePointerClick} />
        <KPICard title="List Growth"         value={kpis.listGrowthLabel} change="+8.2%" changeType="positive" icon={Users} />
      </div>

      {/* Alerts placeholder */}
      <div className="flex flex-wrap gap-2">
        {/* Ej. activar cuando conectes bounce/spam */}
        {/* <Badge variant="destructive" className="gap-1">…</Badge> */}
      </div>

      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Performance Trends</h2>
            <p className="text-sm text-muted-foreground">Opens and Clicks over time</p>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="opens"  stroke="hsl(var(--chart-2))" strokeWidth={2} name="Opens" />
            <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Clicks" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-foreground">Top Campaigns (by Orders)</h2>
          <div className="space-y-3">
            {topCampaigns.map((c, index) => {
              const openRate = c.opens ? ((c.opens / c.opens) * 100).toFixed(2) : "0.00";
              const clickRate = c.opens ? ((c.clicks / c.opens) * 100).toFixed(2) : "0.00";
              return (
                <div key={c.id} className="rounded-lg border border-border bg-card/50 p-4 transition-all hover:bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-foreground">{c.name || "(Unnamed Campaign)"}</h3>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        <span className="text-muted-foreground">Open: <span className="font-medium text-foreground">{openRate}%</span></span>
                        <span className="text-muted-foreground">CTR: <span className="font-medium text-foreground">{clickRate}%</span></span>
                        <span className="text-muted-foreground">Orders: <span className="font-medium text-foreground">{c.orders.toLocaleString()}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">{c.orders.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-border bg-gradient-card p-6 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-foreground">Top Flows (by $ from Orders)</h2>
          <div className="space-y-3">
            {topFlows.map((f, index) => (
              <div key={f.id} className="rounded-lg border border-border bg-card/50 p-4 transition-all hover:bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-foreground">{f.name || "(Unnamed Flow)"}</h3>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <span className="text-muted-foreground">Revenue: <span className="font-medium text-foreground">${f.revenue.toLocaleString()}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">${f.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Attributed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border-border bg-gradient-card p-6 shadow-card">
        <h2 className="mb-4 text-xl font-bold text-foreground">Orders vs Flow Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { name: 'Campaign Orders', value: topCampaigns.reduce((s,c)=> s + c.orders, 0) },
            { name: 'Flow Revenue ($)', value: topFlows.reduce((s,f)=> s + f.revenue, 0) },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Home;
