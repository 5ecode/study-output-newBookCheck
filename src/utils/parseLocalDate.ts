/* ローカル日付に変換（UTC扱いによる日付のズレ対応）
-------------------------------------------- */
export function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}
