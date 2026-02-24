import { useTranslation } from 'react-i18next'
import { TextField, Checkbox, FormControlLabel } from '@mui/material'

const Contact = () => {
  const { t } = useTranslation()

  return (
    <div className="flex">

      <div className="w-full max-w-xl px-4">
        <form className="flex flex-col gap-4">

          <TextField
            label={t('home.contact.fields.name')}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#F58322', 
                },
              },
              '& label.Mui-focused': {
                color: '#F58322',
              },
            }}/>

          <TextField
            label={t('home.contact.fields.email')}
            variant="outlined"
            className="bg-white w-full text-[#939393]"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#F58322', 
                },
              },
              '& label.Mui-focused': {
                color: '#F58322',
              },
            }}
          />

          <TextField
            label={t('home.contact.fields.phone')}
            variant="outlined"
            className="bg-white w-full text-[#939393]"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#F58322', 
                },
              },
              '& label.Mui-focused': {
                color: '#F58322',
              },
            }}
/>

          <FormControlLabel
            className="self-start"
            control={
              <Checkbox
                defaultChecked
                sx={{
                  color: '#F58322',
                  '&.Mui-checked': {
                    color: '#F58322',
                  },
                }}
              />
            }
            label={
              <span className="text-xs md:text-sm text-gray-600">
                {t('home.contact.consent')}
              </span>
            }
          />

          <button
            type="submit"
            className="
              bg-[#F58322] hover:bg-[#DB741F]
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
