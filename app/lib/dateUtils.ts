// 振込スケジュール等で使用する、給付金の対象期間を表す型
type DateRange = {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}

// タイムゾーンの影響を排除するため、日付の演算はすべて UTC で行う
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// days に負の値を渡すと減算になる
function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400 * 1000)
}

// 月を超えた分は翌月に繰り越す（例: 1/31 + 1ヶ月 = 3/2 or 3/3）
function addMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()))
}

// ── ママ専用 ─────────────────────────────────────────

// 産前休業開始日を返す（ママ専用）
// 産前42日間は出産予定日を含む → 開始日 = dueDate - 41日
export function getMaternityStartDate(dueDate: string): string {
  return formatDate(addDays(parseDate(dueDate), -41))
}

// 産後休業終了日を返す（ママ専用）
// 産後休業は出産翌日を1日目として56日間 → 終了日 = dueDate + 56日
export function getPostnatalEndDate(dueDate: string): string {
  return formatDate(addDays(parseDate(dueDate), 56))
}

// ママの育休開始日を返す（ママ専用）
// 産後休業終了日の翌日 = dueDate + 57日
export function getMamaLeaveStartDate(dueDate: string): string {
  return formatDate(addDays(parseDate(dueDate), 57))
}

// ── パパ専用 ─────────────────────────────────────────

// 産後パパ育休の終了日を返す（パパ専用）
// 産後パパ育休は最大28日間 → 終了日 = dueDate + 27日
export function getPapaPaternityLeaveEndDate(dueDate: string): string {
  return formatDate(addDays(parseDate(dueDate), 27))
}

// パパの通常育休開始日を返す（パパ専用）
// 産後パパ育休（28日）終了の翌日 = dueDate + 28日
export function getPapaLeaveStartDate(dueDate: string): string {
  return formatDate(addDays(parseDate(dueDate), 28))
}

// ── 共用 ─────────────────────────────────────────────

// 育休期間を2ヶ月ブロックに分割する（ママ・パパ共用、育児休業給付金の申請単位）
// leaveStartDate: ママは getMamaLeaveStartDate、パパは getPapaLeaveStartDate の戻り値を渡す
// 残余が1ヶ月未満になる場合は前のブロックに吸収し、ブロック数を増やさない
export function splitIntoTwoMonthBlocks(leaveStartDate: string, leaveEndDate: string): DateRange[] {
  const blocks: DateRange[] = []
  let current = parseDate(leaveStartDate)
  const end = parseDate(leaveEndDate)

  while (true) {
    const nextStart = addMonths(current, 2)

    if (nextStart > end) {
      // 残り全体が2ヶ月未満 → このブロックで全期間を収める
      blocks.push({ startDate: formatDate(current), endDate: leaveEndDate })
      break
    }

    // 次の2ヶ月ブロックの後に残る期間が1ヶ月未満なら吸収して終了
    if (addMonths(nextStart, 1) > end) {
      blocks.push({ startDate: formatDate(current), endDate: leaveEndDate })
      break
    }

    blocks.push({ startDate: formatDate(current), endDate: formatDate(addDays(nextStart, -1)) })
    current = nextStart
  }

  return blocks
}
