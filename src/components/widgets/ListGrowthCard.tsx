import { useSubscribersMonthly } from "@/hooks/useKlaviyo";

export function ListGrowthCard() {
  const { data = [], isLoading, error } = useSubscribersMonthly();
  if (isLoading) return <div className="p-4 rounded-2xl shadow">Cargando crecimiento…</div>;
  if (error) return <div className="p-4 rounded-2xl shadow text-red-600">Error cargando crecimiento</div>;

  return (
    <div className="p-4 rounded-2xl shadow">
      <h3 className="font-semibold mb-3">Nuevos Suscriptores por Mes</h3>
      <ul className="text-sm space-y-1">
        {data.map((r:any)=>(
          <li key={`${r.date}`}>
            {new Date(r.date).toLocaleDateString(undefined,{year:"numeric",month:"short"})}: <b>{r.value.toLocaleString()}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}