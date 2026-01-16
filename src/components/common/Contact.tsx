import { useTranslation } from 'react-i18next'
import { TextField, Checkbox, FormControlLabel } from '@mui/material'

const Contact = () => {
  const { t } = useTranslation()

  return (
    <div className="flex">
      
      {/* WRAPPER */}
      <div className="w-full max-w-xl px-4">
        <form className="flex flex-col items-center gap-4">

          <TextField
            label={t('home.contact.fields.name')}
            variant="outlined"
            className="bg-white w-full text-[#939393]"
          />

          <TextField
            label={t('home.contact.fields.email')}
            variant="outlined"
            className="bg-white w-full text-[#939393]"
          />

          <TextField
            label={t('home.contact.fields.phone')}
            variant="outlined"
            className="bg-white w-full text-[#939393]"
          />

          <FormControlLabel
            className="self-start"
            control={
              <Checkbox
                defaultChecked
                sx={{
                  color: '#F05023',
                  '&.Mui-checked': {
                    color: '#F05023',
                  },
                }}
              />
            }
            label={
              <span className="text-xs md:text-sm text-gray-600 font-manrope">
                {t('home.contact.consent')}
              </span>
            }
          />

          <button
            type="submit"
            className="
              bg-[#F05023] hover:bg-[#d1401b]
              text-white font-bold uppercase
              py-3 px-8
              w-full md:w-1/2
              mt-4
              transition shadow-md
              text-sm
            "
          >
            {t('home.contact.submit')}
          </button>

        </form>
      </div>
    </div>
  )
}

export default Contact
