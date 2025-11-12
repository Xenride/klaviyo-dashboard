type AggResponse = any;

export function mapAggToSeries(resp: AggResponse, measurement = "sum_value") {
  const attrs = resp?.data?.attributes ?? resp?.attributes ?? {};
  const dates: string[] = attrs?.dates || attrs?.intervals || [];
  const dataMatrix = attrs?.data || attrs?.series || attrs?.results || {};
  const hasGroups = typeof dataMatrix === "object" && !Array.isArray(dataMatrix);
  const rows: Array<{ date: string; group: string; value: number }> = [];

  const coerceDate = (entry: any, idx: number) =>
    entry?.interval ??
    entry?.datetime ??
    entry?.date ??
    entry?.timestamp ??
    dates[idx];

  const coerceValue = (entry: any) => {
    if (typeof entry === "number") return entry;
    if (!entry || typeof entry !== "object") return undefined;
    if (typeof entry[measurement] === "number") return entry[measurement];
    if (typeof entry.value === "number") return entry.value;
    if (typeof entry.count === "number") return entry.count;
    if (typeof entry.sum === "number") return entry.sum;
    if (typeof entry.total === "number") return entry.total;
    if (Array.isArray(entry?.values)) {
      // algunos responses devuelven values: number[]
      const numeric = entry.values.find((v: any) => typeof v === "number");
      if (typeof numeric === "number") return numeric;
    }
    return undefined;
  };

  const pushRowsFromArray = (items: any[], group: string) => {
    items.forEach((entry, idx) => {
      // Si la serie viene como { [measurement]: number[] }
      if (
        entry &&
        typeof entry === "object" &&
        Array.isArray(entry[measurement]) &&
        dates.length
      ) {
        entry[measurement].forEach((val: any, innerIdx: number) => {
          if (typeof val === "number") {
            const date = dates[innerIdx];
            if (date) rows.push({ date, group, value: val });
          }
        });
        return;
      }

      const value = coerceValue(entry);
      const date = coerceDate(entry, idx);
      if (typeof value === "number" && date) {
        rows.push({ date, group, value });
      }
    });
  };

  if (hasGroups && dates.length) {
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
  } else if (hasGroups) {
    Object.entries(dataMatrix).forEach(([group, series]) => {
      if (Array.isArray(series)) pushRowsFromArray(series, group);
      else if (Array.isArray(series?.data)) pushRowsFromArray(series.data, group);
    });
  } else if (Array.isArray(dataMatrix) && dates.length) {
    dates.forEach((d: string, i: number) => {
      const v = dataMatrix?.[i]?.[measurement] ?? dataMatrix?.[i];
      if (typeof v === "number") rows.push({ date: d, group: "total", value: v });
    });
  } else {
    // Fallback: cuando no hay dates[] o la estructura es distinta
    if (hasGroups) {
      Object.entries(dataMatrix).forEach(([group, series]) => {
        if (Array.isArray(series)) pushRowsFromArray(series, group);
        else if (Array.isArray(series?.data)) pushRowsFromArray(series.data, group);
      });
    } else if (Array.isArray(dataMatrix?.data)) {
      pushRowsFromArray(dataMatrix.data, "total");
    } else if (Array.isArray(attrs?.results)) {
      pushRowsFromArray(attrs.results, "total");
    } else if (Array.isArray(attrs?.data)) {
      pushRowsFromArray(attrs.data, "total");
    }
  }

  return rows;
}