import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-[#1F2937] text-white py-12 px-6 md:px-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        <div>
          <h4 className="font-display font-bold mb-4 uppercase text-sm text-gray-400">
            {t('footer.company.title')}
          </h4>
          <p>{t('footer.company.name')}</p>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 uppercase text-sm text-gray-400">
            {t('footer.address.title')}
          </h4>
          <p>
            {t('footer.address.city')}<br />
            {t('footer.address.street')}
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 uppercase text-sm text-gray-400">
            {t('footer.phones.title')}
          </h4>
          <p>{t('footer.phones.main')}</p>
          <p>{t('footer.phones.mobile')}</p>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 uppercase text-sm text-gray-400">
            {t('footer.email.title')}
          </h4>
          <p>{t('footer.email.value')}</p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
