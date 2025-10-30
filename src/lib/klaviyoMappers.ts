type AggResponse = any;

export function mapAggToSeries(resp: AggResponse, measurement = "sum_value") {
  const attrs = resp?.data?.attributes ?? resp?.attributes ?? {};
  const dates: string[] = attrs?.dates || attrs?.intervals || [];
  const dataMatrix = attrs?.data || attrs?.series || attrs?.results || {};
  const hasGroups = typeof dataMatrix === "object" && !Array.isArray(dataMatrix);
  const rows: Array<{ date: string; group: string; value: number }> = [];

  if (!dates.length) return rows;

  if (hasGroups) {
    const groups = Object.keys(dataMatrix);
    dates.forEach((d: string, i: number) => {
      groups.forEach((g) => {
        const s = dataMatrix[g];
        const v =
          (Array.isArray(s?.[measurement]) ? s[measurement][i] : undefined) ??
          s?.[i]?.[measurement] ??
          s?.[i];
        if (typeof v === "number") rows.push({ date: d, group: g, value: v });
      });
    });
  } else if (Array.isArray(dataMatrix)) {
    dates.forEach((d: string, i: number) => {
      const v = dataMatrix?.[i]?.[measurement] ?? dataMatrix?.[i];
      if (typeof v === "number") rows.push({ date: d, group: "total", value: v });
    });
  }

  return rows;
}