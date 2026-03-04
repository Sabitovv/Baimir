import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextField, Checkbox, FormControlLabel } from '@mui/material'

const Contact = () => {
  const { t } = useTranslation()

  const [form, setForm] = useState({ name: '', telegram: '', comment: '' })
  const [errors, setErrors] = useState({ name: '', telegram: '' })
  const [consent, setConsent] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      if (field in errors) setErrors(prev => ({ ...prev, [field]: '' }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = { name: '', telegram: '' }
    if (!form.name.trim()) newErrors.name = t('home.contact.errors.name', { defaultValue: 'Введите имя' })
    if (!form.telegram.trim()) newErrors.telegram = t('home.contact.errors.telegram', { defaultValue: 'Введите Telegram' })

    setErrors(newErrors)
    if (newErrors.name || newErrors.telegram) return

    // Успешная отправка (можно добавить fetch/axios сюда)
    const message = form.name
      ? `${form.name}, ${t('home.contact.thanks_short', { defaultValue: 'спасибо за отклик' })}. ${t('home.contact.manager_will_contact', { defaultValue: 'Менеджер свяжется с вами.' })}`
      : `${t('home.contact.thanks', { defaultValue: 'Спасибо за отклик.' })} ${t('home.contact.manager_will_contact', { defaultValue: 'Менеджер свяжется с вами.' })}`

    setSuccessMessage(message)

    // очищаем форму (если хочешь оставить данные — закомментируй)
    setForm({ name: '', telegram: '', comment: '' })
    setConsent(true)
  }

  return (
    <div className="w-full max-w-xl px-4">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label={t('home.contact.fields.name', { defaultValue: 'Имя' })}
          value={form.name}
          onChange={handleChange('name')}
          error={Boolean(errors.name)}
          helperText={errors.name}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#F58322' } },
            '& label.Mui-focused': { color: '#F58322' }
          }}
        />

        <TextField
          label={t('home.contact.fields.telegram', { defaultValue: 'Telegram' })}
          value={form.telegram}
          onChange={handleChange('telegram')}
          error={Boolean(errors.telegram)}
          helperText={errors.telegram}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#F58322' } },
            '& label.Mui-focused': { color: '#F58322' }
          }}
        />

        <TextField
          label={t('home.contact.fields.comment', { defaultValue: 'Комментарий' })}
          value={form.comment}
          onChange={handleChange('comment')}
          variant="outlined"
          multiline
          rows={4}
          sx={{
            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#F58322' } },
            '& label.Mui-focused': { color: '#F58322' }
          }}
        />

        {/* Здесь — простое текстовое подтверждение прямо после комментария */}
        {successMessage && (
          <div className="mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
            {successMessage}
          </div>
        )}

        <FormControlLabel
          className="self-start"
          control={
            <Checkbox
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              sx={{ color: '#F58322', '&.Mui-checked': { color: '#F58322' } }}
            />
          }
          label={<span className="text-xs md:text-sm text-gray-600">{t('home.contact.consent', { defaultValue: 'Я даю согласие на обработку данных' })}</span>}
        />

        <button
          type="submit"
          className="bg-[#F58322] hover:bg-[#DB741F] text-white font-bold uppercase py-3 px-8 w-full md:w-1/2 mt-4 transition shadow-md text-sm"
        >
          {t('home.contact.submit', { defaultValue: 'Отправить' })}
        </button>
      </form>
    </div>
  )
}

export default Contact