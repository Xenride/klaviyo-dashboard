// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, MousePointerClick, Mail, DollarSign, Users, Calendar } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import { KLAVIYO_METRICS } from "@/lib/klaviyoIds";
import { getISORange, postAggregates, payloads } from "@/lib/klaviyo";

type SeriesPoint = { date: string; value: number; group?: string };

// (Mantener función safeMapMonthly igual que antes...)
function safeMapMonthly(resp: any): SeriesPoint[] {
    const json = resp && typeof resp === "object" ? resp : {};
    const attrs = json?.data?.attributes ?? json?.attributes ?? {};
    const out: SeriesPoint[] = [];
    const dates = attrs?.dates;
    const dataRows = attrs?.data;

    if (Array.isArray(dates) && Array.isArray(dataRows) && dataRows.length > 0) {
        const measurements = dataRows[0]?.measurements;
        const counts = measurements?.count ?? measurements?.sum_value ?? [];
        dates.forEach((date: string, index: number) => {
            const value = Number(counts[index] ?? 0);
            if (date) out.push({ date, value }); 
        });
        if (out.length > 0) return out;
    }

    const rows = attrs?.data || attrs?.results || json?.data || [];
    const pushRow = (row: any) => {
        const date = row?.datetime || row?.date || row?.start || row?.time;
        const value = Number(row?.value ?? row?.count ?? row?.sum_value ?? 0);
        let group = row?.group || row?.campaign_id || row?.flow || row?.name;
        if (!group && row?.dimensions) group = row.dimensions.flow_id || row.dimensions.campaign_id;
        if (!group) group = row.flow_id;
        if (date) out.push({ date, value, group });
    };

    if (Array.isArray(rows)) {
        rows.forEach((r) => {
            if (Array.isArray(r?.intervals)) r.intervals.forEach(pushRow);
            else if (Array.isArray(r?.series)) r.series.forEach(pushRow);
            else pushRow(r);
        });
    }
    return out;
}

const Home = () => {
  // ESTADO DINÁMICO DE RANGO
  const [rangeDays, setRangeDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [openSeries, setOpenSeries]   = useState<SeriesPoint[]>([]);
  const [clickSeries, setClickSeries] = useState<SeriesPoint[]>([]);
  const [totals, setTotals] = useState({
    opens: 0, clicks: 0, orders: 0, subscribers: 0, received: 0 
  });

  const [topCampaigns, setTopCampaigns] = useState<any[]>([]);
  const [topFlows, setTopFlows] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const { from, to } = getISORange(rangeDays);
        
        // Ajuste inteligente de intervalo para las gráficas
        const chartInterval = rangeDays <= 30 ? "day" : "month";

        // Llamadas usando el rango dinámico
        const opensMonthly    = payloads.countMonthly(KLAVIYO_METRICS.openedEmail, { from, to }, chartInterval);
        const clicksMonthly   = payloads.countMonthly(KLAVIYO_METRICS.clickedEmail, { from, to }, chartInterval);
        const subsMonthly     = payloads.countMonthly(KLAVIYO_METRICS.subscribedEmail, { from, to }, chartInterval);
        const receivedMonthly = payloads.countMonthly(KLAVIYO_METRICS.receivedEmail, { from, to }, chartInterval);

        const ordersByCamp    = payloads.countByCampaign(KLAVIYO_METRICS.placedOrder, { from, to });
        const opensByCamp     = payloads.countByCampaign(KLAVIYO_METRICS.openedEmail, { from, to });
        const clicksByCamp    = payloads.countByCampaign(KLAVIYO_METRICS.clickedEmail, { from, to });
        const revenueByFlow   = payloads.revenueByFlow(KLAVIYO_METRICS.placedOrder, { from, to });

        // Ejecución en serie (por el pacing del server.js)
        const opensMonthlyResp        = await postAggregates(opensMonthly);
        const clicksMonthlyResp       = await postAggregates(clicksMonthly);
        const subsMonthlyResp         = await postAggregates(subsMonthly);
        const receivedMonthlyResp     = await postAggregates(receivedMonthly);
        const ordersByCampaignResp    = await postAggregates(ordersByCamp);
        const opensByCampaignResp     = await postAggregates(opensByCamp);
        const clicksByCampaignResp    = await postAggregates(clicksByCamp);
        const revenueByFlowResp       = await postAggregates(revenueByFlow);

        if (!isMounted) return;

        // Mapeo y Totales
        const opens  = safeMapMonthly(opensMonthlyResp);
        const clicks = safeMapMonthly(clicksMonthlyResp);
        setOpenSeries(opens);
        setClickSeries(clicks);

        const sumVals = (arr: SeriesPoint[]) => arr.reduce((a,b)=>a + (b.value || 0), 0);
        
        setTotals({
          opens: sumVals(opens),
          clicks: sumVals(clicks),
          subscribers: sumVals(safeMapMonthly(subsMonthlyResp)),
          orders: sumVals(safeMapMonthly(ordersByCampaignResp)),
          received: sumVals(safeMapMonthly(receivedMonthlyResp)),
        });

        // Lógica de Top Campaigns y Flows (se mantiene igual)
        const ordersByCampRows = safeMapMonthly(ordersByCampaignResp);
        const opensByCampRows  = safeMapMonthly(opensByCampaignResp);
        const clicksByCampRows = safeMapMonthly(clicksByCampaignResp);

        const aggCampaign = new Map<string, any>();
        const upsert = (g?:string, patch?:any) => {
          const key = g || "(unknown)";
          const cur = aggCampaign.get(key) || { id:key, name:key, orders:0, opens:0, clicks:0 };
          aggCampaign.set(key, { ...cur, ...patch, 
             orders: cur.orders + (patch?.orders || 0),
             opens: cur.opens + (patch?.opens || 0),
             clicks: cur.clicks + (patch?.clicks || 0)
          });
        };
        ordersByCampRows.forEach(r => upsert(r.group, { orders: r.value }));
        opensByCampRows.forEach(r  => upsert(r.group, { opens:  r.value }));
        clicksByCampRows.forEach(r => upsert(r.group, { clicks: r.value }));

        setTopCampaigns(Array.from(aggCampaign.values()).sort((a,b)=> b.orders - a.orders).slice(0, 5));

        const flowRows = safeMapMonthly(revenueByFlowResp);
        const flowAgg = new Map<string, any>();
        flowRows.forEach(r => {
          const key = r.group || "(unknown flow)";
          const cur = flowAgg.get(key) || { id:key, name:key, revenue:0 };
          flowAgg.set(key, { ...cur, revenue: cur.revenue + (r.value || 0) });
        });
        setTopFlows(Array.from(flowAgg.values()).sort((a,b)=> b.revenue - a.revenue));

        setLoading(false);
      } catch (e:any) {
        if (isMounted) {
          setError(e?.message || "Error cargando datos");
          setLoading(false);
        }
      }
    })();

    return () => { isMounted = false; };
  }, [rangeDays]); // SE RECARGA CUANDO CAMBIA EL RANGO

  const kpis = useMemo(() => {
    const totalReceived = Math.max(totals.received, 1);
    const openRate  = ((totals.opens / totalReceived) * 100).toFixed(2);
    const clickRate = totals.opens ? ((totals.clicks / totals.opens) * 100).toFixed(2) : "0.00";
    return {
      totalOrdersLabel: totals.orders.toLocaleString(),
      openRate,
      clickRate,
      listGrowthLabel: `+${totals.subscribers.toLocaleString()}`,
    };
  }, [totals]);

  const timeSeriesData = useMemo(() => {
    const allDates = Array.from(new Set([...openSeries.map(s=>s.date), ...clickSeries.map(s=>s.date)])).sort();
    return allDates.map(d => ({
      date: new Date(d).toLocaleDateString(undefined, { 
          day: rangeDays <= 14 ? "numeric" : undefined, // día solo si es rango corto
          month: "short", 
          year: rangeDays > 30 ? "2-digit" : undefined 
      }),
      opens: openSeries.find(x=>x.date===d)?.value ?? 0,
      clicks: clickSeries.find(x=>x.date===d)?.value ?? 0,
    }));
  }, [openSeries, clickSeries, rangeDays]);

  if (loading) return <div className="p-10 flex items-center justify-center">Cargando datos de {rangeDays} días...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER CON FILTRO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Executive Overview</h1>
          <p className="mt-1 text-muted-foreground">Métricas de los últimos {rangeDays} días</p>
        </div>

        {/* SELECTOR DE RANGO */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg border border-border">
          <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRangeDays(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                rangeDays === d 
                  ? "bg-background text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Orders" value={kpis.totalOrdersLabel} change="" icon={DollarSign} />
        <KPICard title="Open Rate"  value={`${kpis.openRate}%`}  change="" icon={Mail} />
        <KPICard title="Click Rate"   value={`${kpis.clickRate}%`} change="" icon={MousePointerClick} />
        <KPICard title="List Growth"  value={kpis.listGrowthLabel} change="" icon={Users} />
      </div>

      {/* GRÁFICA PRINCIPAL */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Performance Trends</h2>
            <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
            <Legend />
            <Line type="monotone" dataKey="opens"  stroke="#8884d8" strokeWidth={2} dot={rangeDays <= 30} />
            <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} dot={rangeDays <= 30} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* (Resto de los Cards de Campaigns y Flows se mantienen igual...) */}
    </div>
  );
};

export default Home;