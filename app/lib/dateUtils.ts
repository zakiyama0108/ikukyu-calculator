// 振込スケジュール等で使用する、給付金の対象期間を表す型
type DateRange = {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}

// ── ママ専用 ─────────────────────────────────────────

// 産前休業開始日を返す（ママ専用）
// 産前42日間は出産予定日を含む → 開始日 = dueDate - 41日
export function getMaternityStartDate(_dueDate: string): string {
  return ''
}

// 産後休業終了日を返す（ママ専用）
// 産後休業は出産翌日を1日目として56日間 → 終了日 = dueDate + 56日
export function getPostnatalEndDate(_dueDate: string): string {
  return ''
}

// ママの育休開始日を返す（ママ専用）
// 産後休業終了日の翌日 = dueDate + 57日
export function getMamaLeaveStartDate(_dueDate: string): string {
  return ''
}

// ── パパ専用 ─────────────────────────────────────────

// 産後パパ育休の終了日を返す（パパ専用）
// 産後パパ育休は最大28日間 → 終了日 = dueDate + 27日
export function getPapaPaternityLeaveEndDate(_dueDate: string): string {
  return ''
}

// パパの通常育休開始日を返す（パパ専用）
// 産後パパ育休（28日）終了の翌日 = dueDate + 28日
export function getPapaLeaveStartDate(_dueDate: string): string {
  return ''
}

// ── 共用 ─────────────────────────────────────────────

// 育休期間を2ヶ月ブロックに分割する（ママ・パパ共用、育児休業給付金の申請単位）
// leaveStartDate: ママは getMamaLeaveStartDate、パパは getPapaLeaveStartDate の戻り値を渡す
// 残余が1ヶ月未満になる場合は前のブロックに吸収し、ブロック数を増やさない
export function splitIntoTwoMonthBlocks(_leaveStartDate: string, _leaveEndDate: string): DateRange[] {
  return []
}
