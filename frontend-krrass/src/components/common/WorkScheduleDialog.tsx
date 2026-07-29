import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useTranslation } from 'react-i18next'

import { useGetCompanySettingsQuery } from '@/api/productsApi'
import type { WorkInterval, WorkScheduleDayKey } from '@/api/productsApi'

type WorkScheduleDialogProps = {
  open: boolean
  onClose: () => void
}

const WORK_DAYS_ORDER: WorkScheduleDayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const formatIntervals = (intervals: WorkInterval[] | undefined): string => {
  if (!intervals || intervals.length === 0) return '-'
  return intervals.map((interval) => `${interval.start} - ${interval.end}`).join(', ')
}

const formatExceptionDateRange = (startDate: string, endDate: string): string => {
  if (startDate === endDate) return startDate
  return `${startDate} - ${endDate}`
}

const WorkScheduleDialog = ({ open, onClose }: WorkScheduleDialogProps) => {
  const { t } = useTranslation()
  const {
    data: companySettingsData,
    isFetching: workScheduleLoading,
    isError: isWorkScheduleError,
    refetch: refetchWorkSchedule,
  } = useGetCompanySettingsQuery()

  const workSchedule = companySettingsData?.COMPANY_WORK_SCHEDULE
  const workScheduleError = isWorkScheduleError ? t('productPage.modal.scheduleLoadError') : null

  const scheduleDayLabels: Record<WorkScheduleDayKey, string> = {
    monday: t('about.schedule.days.monday'),
    tuesday: t('about.schedule.days.tuesday'),
    wednesday: t('about.schedule.days.wednesday'),
    thursday: t('about.schedule.days.thursday'),
    friday: t('about.schedule.days.friday'),
    saturday: t('about.schedule.days.saturday'),
    sunday: t('about.schedule.days.sunday'),
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="font-bold text-gray-900">{t('about.schedule.title')}</DialogTitle>
      <DialogContent dividers>
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          {workScheduleLoading ? (
            <p className="text-sm text-gray-600">{t('productPage.modal.scheduleLoading')}</p>
          ) : workScheduleError ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600">{workScheduleError}</p>
              <Button variant="outlined" color="warning" onClick={() => refetchWorkSchedule()}>
                {t('productPage.modal.retry')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">{t('productPage.modal.timezone')}:</span>{' '}
                {workSchedule?.timezone || '-'}
              </p>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full border-collapse">
                  <tbody>
                    {WORK_DAYS_ORDER.map((day) => {
                      const daySchedule = workSchedule?.regular?.[day]
                      const dayValue = daySchedule?.isDayOff
                        ? t('about.schedule.closed')
                        : formatIntervals(daySchedule?.intervals)

                      return (
                        <tr key={day} className="border-b border-gray-200 last:border-b-0">
                          <td className="px-4 py-2 font-medium text-gray-900">{scheduleDayLabels[day]}</td>
                          <td className="px-4 py-2">{dayValue || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {workSchedule?.exceptions && workSchedule.exceptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{t('productPage.modal.exceptions')}</h4>
                  <ul className="mt-2 space-y-2">
                    {workSchedule.exceptions.map((exception, idx) => (
                      <li
                        key={`${exception.startDate}-${exception.endDate}-${idx}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                      >
                        <p className="font-medium text-gray-900">
                          {formatExceptionDateRange(exception.startDate, exception.endDate)}
                        </p>
                        {exception.note && <p>{exception.note}</p>}
                        <p>
                          {exception.isDayOff
                            ? t('about.schedule.closed')
                            : formatIntervals(exception.intervals)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="warning">
          {t('productPage.modal.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WorkScheduleDialog

