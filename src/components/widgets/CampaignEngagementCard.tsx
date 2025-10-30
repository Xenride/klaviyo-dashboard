import { useCampaignOpensClicks } from "@/hooks/useKlaviyo";

export function CampaignEngagementCard() {
  const { data, isLoading, error } = useCampaignOpensClicks();
  const opens = data?.opens ?? [];
  const clicks = data?.clicks ?? [];

  if (isLoading) return <div className="p-4 rounded-2xl shadow">Cargando engagement…</div>;
  if (error) return <div className="p-4 rounded-2xl shadow text-red-600">Error cargando engagement</div>;

  const openByC = opens.reduce((a,r)=>(a[r.group]=(a[r.group]||0)+r.value,a),{} as Record<string,number>);
  const clickByC = clicks.reduce((a,r)=>(a[r.group]=(a[r.group]||0)+r.value,a),{} as Record<string,number>);
  const campaigns = Array.from(new Set([...Object.keys(openByC), ...Object.keys(clickByC)]));

  return (
    <div className="p-4 rounded-2xl shadow">
      <h3 className="font-semibold mb-3">Aperturas/Clicks por Campaña (12m)</h3>
      <table className="min-w-[560px] text-sm">
        <thead><tr><th className="p-2 text-left">Campaña</th><th className="p-2 text-right">Aperturas</th><th className="p-2 text-right">Clicks</th><th className="p-2 text-right">CTR</th></tr></thead>
        <tbody>
          {campaigns.map(c=>{
            const o=openByC[c]||0, k=clickByC[c]||0, ctr = o? (k/o)*100 : 0;
            return (
              <tr key={c} className="border-t">
                <td className="p-2">{c}</td>
                <td className="p-2 text-right">{o.toLocaleString()}</td>
                <td className="p-2 text-right">{k.toLocaleString()}</td>
                <td className="p-2 text-right">{ctr.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs mt-2 opacity-70">Tip: para tasas idénticas al UI, usa “Received Email” como base (Reporting API).</p>
    </div>
  );
}