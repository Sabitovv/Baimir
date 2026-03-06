// src/components/common/Contact.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Button,
  Box,
} from '@mui/material'

import { useCreateInquiryMutation } from '@/api/categoriesApi' 
import type { InquiryRequest } from '@/api/categoriesApi'

const LIMITS = {
  NAME: 120,
  PHONE: 30,
  EMAIL: 180,
  MESSAGE: 1000,
  SOURCE_URL: 500,
}

type FormState = {
  name: string
  phone: string
  email: string
  message: string
}

type ErrorsState = {
  name?: string
  phone?: string
  email?: string
  message?: string
}

type SnackState = {
  open: boolean
  message: string
  severity: 'success' | 'info' | 'warning' | 'error'
}

const emailRegex = /^\S+@\S+\.\S+$/
const phoneRegex = /^[0-9+()\-\s]*$/ // allows digits, plus, parentheses, dash and spaces

type ContactProps = {
  productId?: number | null
}

const Contact: React.FC<ContactProps> = ({ productId }) => {
  const { t } = useTranslation()

  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    message: '',
  })

  const [errors, setErrors] = useState<ErrorsState>({})
  const [consent, setConsent] = useState(true)

  const [snack, setSnack] = useState<SnackState>({
    open: false,
    message: '',
    severity: 'success',
  })

  const [createInquiry, { isLoading }] = useCreateInquiryMutation()

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      // clear field error on change
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const validate = (): boolean => {
    const newErrors: ErrorsState = {}

    // name required + length
    if (!form.name.trim()) {
      newErrors.name = t('home.contact.errors.name', { defaultValue: 'Введите имя' })
    } else if (form.name.length > LIMITS.NAME) {
      newErrors.name = t('home.contact.errors.name_too_long', { defaultValue: `Имя не должно превышать ${LIMITS.NAME} символов` })
    }

    // phone required + pattern + length
    if (!form.phone.trim()) {
      newErrors.phone = t('home.contact.errors.phone', { defaultValue: 'Введите телефон' })
    } else if (form.phone.length > LIMITS.PHONE) {
      newErrors.phone = t('home.contact.errors.phone_too_long', { defaultValue: `Номер не должен превышать ${LIMITS.PHONE} символов` })
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = t('home.contact.errors.phone_format', { defaultValue: 'Недопустимые символы в номере' })
    }

    // email optional but if present validate
    if (form.email?.trim()) {
      if (form.email.length > LIMITS.EMAIL) {
        newErrors.email = t('home.contact.errors.email_too_long', { defaultValue: `Email не должен превышать ${LIMITS.EMAIL} символов` })
      } else if (!emailRegex.test(form.email)) {
        newErrors.email = t('home.contact.errors.email_invalid', { defaultValue: 'Некорректный формат email' })
      }
    }

    // message optional but length limit
    if (form.message && form.message.length > LIMITS.MESSAGE) {
      newErrors.message = t('home.contact.errors.message_too_long', { defaultValue: `Сообщение не должно превышать ${LIMITS.MESSAGE} символов` })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (!consent) {
      setSnack({
        open: true,
        message: t('home.contact.errors.consent', { defaultValue: 'Нужно дать согласие на обработку данных' }),
        severity: 'warning',
      })
      return
    }

    // const payload: InquiryRequest = {
    //   name: form.name.trim(),
    //   phone: form.phone.trim(),
    //   email: form.email?.trim() || undefined,
    //   message: form.message?.trim() || undefined,
    //   sourceUrl: typeof window !== 'undefined' ? window.location.href.slice(0, LIMITS.SOURCE_URL) : undefined,
    //   productId: undefined,
    // }
    const payload: InquiryRequest = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || undefined,
      message: form.message?.trim() || undefined,
      sourceUrl: typeof window !== 'undefined' ? window.location.href.slice(0, LIMITS.SOURCE_URL) : undefined,
      ...(typeof productId === 'number' ? { productId } : {}),
    }

    try {
      await createInquiry(payload).unwrap()

      const successMessage = form.name
        ? `${form.name}, ${t('home.contact.thanks_short', { defaultValue: 'спасибо за отклик' })}. ${t('home.contact.manager_will_contact', { defaultValue: 'Менеджер свяжется с вами.' })}`
        : `${t('home.contact.thanks', { defaultValue: 'Спасибо за отклик.' })} ${t('home.contact.manager_will_contact', { defaultValue: 'Менеджер свяжется с вами.' })}`

      setSnack({ open: true, message: successMessage, severity: 'success' })
      setForm({ name: '', phone: '', email: '', message: '' })
      setConsent(true)
    } catch (err: unknown) {
      const errorObj = (err && typeof err === 'object' ? err : null) as
        | { data?: { message?: string } | unknown; error?: string }
        | null

      const errorMessage =
        (errorObj?.data &&
          typeof errorObj.data === 'object' &&
          errorObj.data !== null &&
          'message' in errorObj.data &&
          typeof (errorObj.data as { message?: unknown }).message === 'string'
          ? (errorObj.data as { message: string }).message
          : errorObj?.data
            ? JSON.stringify(errorObj.data)
            : undefined) ||
        errorObj?.error ||
        t('home.contact.errors.network', { defaultValue: 'Сетевая ошибка — проверьте подключение' })

      setSnack({ open: true, message: String(errorMessage), severity: 'error' })
    }
  }

  return (
    <Box className="w-full max-w-xl px-4" component="section" aria-labelledby="contact-heading">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <TextField
          required
          id="contact-name"
          label={t('home.contact.fields.name', { defaultValue: 'Имя' })}
          value={form.name}
          onChange={handleChange('name')}
          error={Boolean(errors.name)}
          helperText={errors.name}
          variant="outlined"
          inputProps={{ maxLength: LIMITS.NAME }}
          sx={{
            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#F58322' } },
            '& label.Mui-focused': { color: '#F58322' },
          }}
        />

        <TextField
          required
          id="contact-phone"
          label={t('home.contact.fields.phone', { defaultValue: 'Телефон' })}
          value={form.phone}
          onChange={handleChange('phone')}
          error={Boolean(errors.phone)}
          helperText={errors.phone || t('home.contact.fields.phone_hint', { defaultValue: 'Например: +7 999 123 45 67' })}
          variant="outlined"
          inputProps={{ maxLength: LIMITS.PHONE, pattern: "[0-9+()\\-\\s]*" }}
          sx={{
            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#F58322' } },
            '& label.Mui-focused': { color: '#F58322' },
          }}
        />

        <TextField
          id="contact-email"
          type="email"
          label={t('home.contact.fields.email', { defaultValue: 'Email (необязательно)' })}
          value={form.email}
          onChange={handleChange('email')}
          error={Boolean(errors.email)}
          helperText={errors.email}
          variant="outlined"
          inputProps={{ maxLength: LIMITS.EMAIL }}
          sx={{
            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#F58322' } },
            '& label.Mui-focused': { color: '#F58322' },
          }}
        />

        <TextField
          id="contact-message"
          label={t('home.contact.fields.comment', { defaultValue: 'Комментарий (необязательно)' })}
          value={form.message}
          onChange={handleChange('message')}
          variant="outlined"
          multiline
          rows={4}
          error={Boolean(errors.message)}
          helperText={errors.message ?? `${form.message.length}/${LIMITS.MESSAGE}`}
          inputProps={{ maxLength: LIMITS.MESSAGE }}
          sx={{
            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#F58322' } },
            '& label.Mui-focused': { color: '#F58322' },
          }}
        />

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

        <Box className="flex justify-start">
          <Button
            type="submit"
            variant="contained"
            sx={{ backgroundColor: '#F58322', '&:hover': { backgroundColor: '#DB741F' }, textTransform: 'uppercase' }}
            disabled={isLoading}
          >
            {isLoading ? t('home.contact.sending', { defaultValue: 'Отправка...' }) : t('home.contact.submit', { defaultValue: 'Отправить' })}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Contact
