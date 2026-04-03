import { useTranslation } from 'react-i18next'
import InstagramIcon from '@mui/icons-material/Instagram'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'
import TelegramIcon from '@mui/icons-material/Telegram'
import LinkedIn from '@mui/icons-material/LinkedIn'
import WebSite from '@mui/icons-material/Language';

import { useGetCompanySettingsQuery } from '@/api/productsApi'

type CompanySocialLink = {
  id: number | string
  platform: string
  url: string
}

type CompanySettingsWithSocial = {
  COMPANY_SOCIAL_LINKS?: {
    socials?: CompanySocialLink[]
  }
}

const getSocialIcon = (platform: string) => {
  const normalizedPlatform = platform.toLowerCase()

  if (normalizedPlatform.includes('instagram')) return <InstagramIcon fontSize="small" />
  if (normalizedPlatform.includes('whatsapp')) return <WhatsAppIcon fontSize="small" />
  if (normalizedPlatform.includes('facebook')) return <FacebookIcon fontSize="small" />
  if (normalizedPlatform.includes('youtube')) return <YouTubeIcon fontSize="small" />
  if (normalizedPlatform.includes('telegram')) return <TelegramIcon fontSize="small" />
  if (normalizedPlatform.includes('linkedin')) return <LinkedIn fontSize="small" />
  if (normalizedPlatform.includes('website') || normalizedPlatform.includes('site')) return <WebSite fontSize="small" />

  return <span className="text-xs font-semibold uppercase">{platform.slice(0, 1)}</span>
}

const Footer = () => {
  const { t } = useTranslation()
  const {data: companySettingsData,} = useGetCompanySettingsQuery()
  const social = (companySettingsData as CompanySettingsWithSocial | undefined)?.COMPANY_SOCIAL_LINKS?.socials ?? []
// const year = new Date().getFullYear()

  return (
    <footer className="bg-[#233337] text-white py-12 px-6 md:px-20 text-center md:text-left">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              {t('footer.company.title')}
            </h4>
            <p className="mt-3 text-2xl font-extrabold tracking-wide text-white">{t('footer.company.name')}</p>
            <p className="mt-4 text-sm leading-relaxed text-gray-300">
              {t('footer.address.city')}, {t('footer.address.street')}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              {social.map((data) => (
                <a
                  key={data.id}
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={data.platform}
                  title={data.platform}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#F58322] hover:text-[#F58322]"
                >
                  {getSocialIcon(data.platform)}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              {t('footer.address.title')}
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-gray-200">
              {t('footer.address.city')}
              <br />
              {t('footer.address.street')}
            </p>
          </div>

          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              {t('footer.phones.title')}
            </h4>
            <p className="mt-3 text-sm text-gray-200">{t('footer.phones.main')}</p>
            <p className="mt-1 text-sm text-gray-200">{t('footer.phones.mobile')}</p>
          </div>

          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              {t('footer.email.title')}
            </h4>
            <p className="mt-3 break-all text-sm text-gray-200">{t('footer.email.value')}</p>
          </div>
        </div>

        {/* <div className="mt-8 border-t border-white/15 pt-5 text-center text-xs text-gray-400 md:text-left">
          © {year} {t('footer.company.name')}
        </div> */}
      </div>
    </footer>
  )
}

export default Footer
