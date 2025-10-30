import { useRevenueByFlow } from "@/hooks/useKlaviyo";

export function RevenueByFlowCard() {
  const { data = [], isLoading, error } = useRevenueByFlow();

  if (isLoading) return <div className="p-4 rounded-2xl shadow">Cargando revenue…</div>;
  if (error) return <div className="p-4 rounded-2xl shadow text-red-600">Error cargando revenue</div>;

  const groups = Array.from(new Set(data.map(r => r.group)));
  const dates = Array.from(new Set(data.map(r => r.date))).sort();

  return (
    <div className="p-4 rounded-2xl shadow">
      <h3 className="font-semibold mb-3">Revenue por Flow (últimos 12m)</h3>
      <div className="overflow-auto">
        <table className="min-w-[640px] text-sm">
          <thead><tr><th className="p-2 text-left">Fecha</th>{groups.map(g=><th key={g} className="p-2 text-right">{g}</th>)}</tr></thead>
          <tbody>
            {dates.map(d=>(
              <tr key={d} className="border-t">
                <td className="p-2">{new Date(d).toLocaleDateString()}</td>
                {groups.map(g=>{
                  const item = data.find(r=>r.date===d && r.group===g);
                  return <td key={g} className="p-2 text-right">{item?.value?.toLocaleString() ?? "-"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}