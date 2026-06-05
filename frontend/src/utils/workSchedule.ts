import type { CompanyWorkSchedule, WorkDaySchedule, WorkScheduleDayKey } from '@/api/productsApi'

type ZonedNow = {
  dateIso: string
  weekday: WorkScheduleDayKey
  minutes: number
}

const WEEKDAY_MAP: Record<string, WorkScheduleDayKey> = {
  monday: 'monday',
  tuesday: 'tuesday',
  wednesday: 'wednesday',
  thursday: 'thursday',
  friday: 'friday',
  saturday: 'saturday',
  sunday: 'sunday',
}

const getZonedNow = (timezone?: string): ZonedNow | null => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const parts = formatter.formatToParts(new Date())
    const readPart = (type: Intl.DateTimeFormatPartTypes): string =>
      parts.find((part) => part.type === type)?.value ?? ''

    const year = readPart('year')
    const month = readPart('month')
    const day = readPart('day')
    const weekdayRaw = readPart('weekday').toLowerCase()
    const hour = Number(readPart('hour'))
    const minute = Number(readPart('minute'))
    const weekday = WEEKDAY_MAP[weekdayRaw]

    if (!year || !month || !day || !weekday || Number.isNaN(hour) || Number.isNaN(minute)) {
      return null
    }

    return {
      dateIso: `${year}-${month}-${day}`,
      weekday,
      minutes: hour * 60 + minute,
    }
  } catch {
    return null
  }
}

const parseMinutes = (value: string): number | null => {
  const [hh, mm] = value.split(':')
  const hour = Number(hh)
  const minute = Number(mm)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return hour * 60 + minute
}

const isWithinWorkingDayBounds = (
  daySchedule: WorkDaySchedule,
  nowMinutes: number,
): boolean | null => {
  if (daySchedule.isDayOff) return false
  if (!Array.isArray(daySchedule.intervals) || daySchedule.intervals.length === 0) return false

  const parsedIntervals = daySchedule.intervals
    .map((interval) => ({
      start: parseMinutes(interval.start),
      end: parseMinutes(interval.end),
    }))
    .filter(
      (interval): interval is { start: number; end: number } =>
        interval.start !== null && interval.end !== null && interval.start <= interval.end,
    )

  if (parsedIntervals.length === 0) return null

  const firstStart = Math.min(...parsedIntervals.map((interval) => interval.start))
  const lastEnd = Math.max(...parsedIntervals.map((interval) => interval.end))

  return nowMinutes >= firstStart && nowMinutes <= lastEnd
}

const getScheduleForDate = (schedule: CompanyWorkSchedule, dateIso: string, weekday: WorkScheduleDayKey): WorkDaySchedule | null => {
  const matchedException = schedule.exceptions?.find((exception) => dateIso >= exception.startDate && dateIso <= exception.endDate)

  if (matchedException) {
    return {
      isDayOff: matchedException.isDayOff,
      intervals: matchedException.intervals ?? [],
    }
  }

  return schedule.regular?.[weekday] ?? null
}

export const isCompanyWorkingNow = (schedule?: CompanyWorkSchedule | null): boolean | null => {
  if (!schedule) return null

  const now = getZonedNow(schedule.timezone)
  if (!now) return null

  const daySchedule = getScheduleForDate(schedule, now.dateIso, now.weekday)
  if (!daySchedule) return null

  return isWithinWorkingDayBounds(daySchedule, now.minutes)
}
