function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatDateYYYYMMDD(d = new Date()) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function todayStr() {
  return formatDateYYYYMMDD(new Date());
}

export function addDaysStr(dateStr, deltaDays) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return formatDateYYYYMMDD(dt);
}
