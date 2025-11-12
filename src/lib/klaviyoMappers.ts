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
    const stats = entry.statistics?.[measurement];
    if (typeof stats?.value === "number") return stats.value;
    if (typeof stats?.count === "number") return stats.count;
    if (typeof stats?.sum === "number") return stats.sum;
    if (stats?.values && Array.isArray(stats.values)) {
      const firstStat = stats.values.find(
        (v: any) => typeof v === "number" || typeof v?.value === "number",
      );
      if (typeof firstStat === "number") return firstStat;
      if (typeof firstStat?.value === "number") return firstStat.value;
    }
    if (Array.isArray(entry?.values)) {
      const firstValue = entry.values.find(
        (v: any) => typeof v === "number" || typeof v?.value === "number",
      );
      if (typeof firstValue === "number") return firstValue;
      if (typeof firstValue?.value === "number") return firstValue.value;
    }
    return undefined;
  };

  const pushRowsFromArray = (items: any[], group: string) => {
    items.forEach((entry, idx) => {
      if (Array.isArray(entry?.data)) {
        const nestedGroup =
          entry?.group ??
          entry?.metric_id ??
          entry?.name ??
          entry?.dimension ??
          group;
        pushRowsFromArray(entry.data, String(nestedGroup ?? group));
        return;
      }

      if (entry?.statistics?.[measurement]?.values) {
        const statValues = entry.statistics[measurement].values;
        if (Array.isArray(statValues)) {
          statValues.forEach((item: any, innerIdx: number) => {
            const value = coerceValue(item);
            const date = coerceDate(item, innerIdx);
            if (typeof value === "number" && date) {
              rows.push({
                date,
                group: String(entry?.group ?? group ?? "total"),
                value,
              });
            }
          });
          return;
        }
      }

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
        rows.push({ date, group: String(group ?? "total"), value });
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
  } else if (Array.isArray(dataMatrix)) {
    if (dates.length) {
      dates.forEach((d: string, i: number) => {
        const v = dataMatrix?.[i]?.[measurement] ?? dataMatrix?.[i];
        if (typeof v === "number") rows.push({ date: d, group: "total", value: v });
      });
    } else {
      pushRowsFromArray(dataMatrix, "total");
    }
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