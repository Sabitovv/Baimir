import { useTranslation } from 'react-i18next'
import InstagramIcon from '@mui/icons-material/Instagram'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/baymir.kz?utm_source=qr&igsh=MWNvOWR2YjJvczhxNQ==',
    icon: InstagramIcon,
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/77080065085?text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C!%20%D0%9C%D0%B5%D0%BD%D1%8F%20%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D0%B5%D1%82%20%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D1%81%20%D0%92%D0%B0%D1%88%D0%B5%D0%B3%D0%BE%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0:%20https://baymir.kz/about_us',
    icon: WhatsAppIcon,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/tech.baymir/',
    icon: FacebookIcon,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UCEYv-_jo8UrIls7QiGUaGag ',
    icon: YouTubeIcon,
  },
] as const

const Footer = () => {
  const { t } = useTranslation()
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
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  title={name}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#F58322] hover:text-[#F58322]"
                >
                  <Icon fontSize="small" />
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
