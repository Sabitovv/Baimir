import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const AboutPage = () => {
  const { t } = useTranslation()

  const stats = [
    { value: '15+', label: t('about.stats.years') },
    { value: '5000+', label: t('about.stats.warehouse') },
    { value: '3500+', label: t('about.stats.items') },
    { value: '2012', label: t('about.stats.since') },
  ]

  const advantages = [
    {
      title: t('about.advantages.expertise.title'),
      text: t('about.advantages.expertise.text'),
    },
    {
      title: t('about.advantages.engineers.title'),
      text: t('about.advantages.engineers.text'),
    },
    {
      title: t('about.advantages.stock.title'),
      text: t('about.advantages.stock.text'),
    },
    {
      title: t('about.advantages.speed.title'),
      text: t('about.advantages.speed.text'),
    },
  ]

  const schedule = [
    { day: t('about.schedule.days.monday'), hours: '08:00 - 17:00', breakTime: '13:00 - 14:00' },
    { day: t('about.schedule.days.tuesday'), hours: '08:00 - 17:00', breakTime: '13:00 - 14:00' },
    { day: t('about.schedule.days.wednesday'), hours: '08:00 - 17:00', breakTime: '13:00 - 14:00' },
    { day: t('about.schedule.days.thursday'), hours: '08:00 - 17:00', breakTime: '13:00 - 14:00' },
    { day: t('about.schedule.days.friday'), hours: '08:00 - 17:00', breakTime: '13:00 - 14:00' },
    { day: t('about.schedule.days.saturday'), hours: t('about.schedule.closed') },
    { day: t('about.schedule.days.sunday'), hours: t('about.schedule.closed') },
  ]

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 mt-6 sm:mt-8 md:mt-12">
        <aside className="hidden lg:block w-full">
          <CategoriesMenu />
        </aside>

        <main className="w-full min-w-0 relative">
          <ScrollReveal>
            <section className="relative overflow-hidden rounded-2xl border border-[#F58322]/25 bg-gradient-to-br from-[#fff3e9] via-[#ffffff] to-[#f3f6fa] p-5 sm:p-8 lg:p-10 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 lg:gap-10 items-center">
              <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-[#F58322]/20 blur-2xl" />
              <div className="absolute -bottom-20 right-8 w-56 h-56 rounded-full bg-[#0b5fa1]/10 blur-3xl" />
              <motion.div
                className="absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                animate={{ x: ['0%', '250%'] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <motion.p
                  className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#F58322] font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
                >
                  {t('about.hero.kicker')}
                </motion.p>
                <motion.h1
                  className="mt-3 font-oswald text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase text-[#F58322] leading-tight"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
                >
                  {t('about.hero.title')}
                </motion.h1>
                <motion.p
                  className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
                >
                  {t('about.hero.description')}
                </motion.p>
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-xl border border-white/60 shadow-[0_20px_45px_-24px_rgba(20,20,20,0.45)] z-10"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
                whileHover={{ y: -2 }}
              >
                <img
                  src="https://images.satu.kz/109556578_109556578.jpg"
                  alt={t('about.hero.imageAlt')}
                  className="w-full h-[260px] sm:h-[360px] lg:h-[420px] object-cover scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />
              </motion.div>
            </section>
          </ScrollReveal>

          <section className="mt-12 sm:mt-16 lg:mt-20">
            <ScrollReveal>
              <h2 className="font-oswald text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase text-gray-900">
                {t('about.stats.title')}
              </h2>
            </ScrollReveal>

            <StaggerContainer className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((item) => (
                <StaggerItem key={item.label} className="relative overflow-hidden bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-[0_18px_30px_-26px_rgba(0,0,0,0.55)] hover:-translate-y-0.5 transition-transform">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F58322] to-[#DB741F]" />
                  <p className="font-oswald text-3xl sm:text-4xl text-[#F58322]">{item.value}</p>
                  <p className="mt-2 text-sm sm:text-base text-gray-700 leading-snug">{item.label}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          <section className="mt-12 sm:mt-16 lg:mt-20">
            <ScrollReveal>
              <h2 className="font-oswald text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase text-[#F58322]">
                {t('about.advantages.title')}
              </h2>
            </ScrollReveal>

            <StaggerContainer className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {advantages.map((item, index) => (
                <StaggerItem
                  key={item.title}
                  className={`rounded-xl p-6 sm:p-7 text-white border border-white/10 ${
                    index % 2 === 0
                      ? 'bg-gradient-to-br from-[#141414] to-[#20262a]'
                      : 'bg-gradient-to-br from-[#1e252b] to-[#141414]'
                  } shadow-[0_18px_32px_-24px_rgba(20,20,20,0.9)]`}
                >
                  <h3 className="font-oswald text-xl sm:text-2xl uppercase">{item.title}</h3>
                  <p className="mt-3 text-sm sm:text-base text-gray-200 leading-relaxed">{item.text}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          <ScrollReveal className="mt-12 sm:mt-16 lg:mt-20 relative overflow-hidden bg-gradient-to-r from-[#141414] via-[#1d2328] to-[#0f1418] border border-gray-700 rounded-2xl p-6 sm:p-8">
            <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full border border-[#F58322]/25" />
            <div className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-[#F58322]/8 blur-2xl" />

            <h2 className="relative z-10 font-oswald text-2xl sm:text-3xl uppercase text-white">
              {t('about.brands.title')}
            </h2>
            <p className="relative z-10 mt-3 text-sm sm:text-base text-gray-200 leading-relaxed max-w-4xl">
              {t('about.brands.description')}
            </p>
            <div className="relative z-10 mt-6 flex flex-wrap gap-3">
              {['Bodor', 'Krrass', 'LOCK'].map((brand) => (
                <span
                  key={brand}
                  className="px-4 py-2 rounded-full border border-[#F58322]/45 text-[#ffd7b8] bg-[#F58322]/15 font-semibold"
                >
                  {brand}
                </span>
              ))}
            </div>
          </ScrollReveal>

          <section className="mt-12 sm:mt-16 lg:mt-20 mb-16 sm:mb-20 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ScrollReveal className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-[0_18px_30px_-26px_rgba(0,0,0,0.55)]">
              <h2 className="font-oswald text-2xl sm:text-3xl uppercase text-gray-900">
                {t('about.schedule.title')}
              </h2>
              <div className="mt-6 space-y-3">
                {schedule.map((item) => (
                  <div key={item.day} className="grid grid-cols-[1fr_auto] gap-4 items-start border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                    <p className="font-semibold text-gray-900">{item.day}</p>
                    <div className="text-right text-sm sm:text-base text-gray-700">
                      <p>{item.hours}</p>
                      {item.breakTime ? <p className="text-gray-500">{t('about.schedule.break')}: {item.breakTime}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15} className="relative overflow-hidden bg-[#141414] text-white rounded-xl p-6 sm:p-8 border border-gray-700 shadow-[0_22px_35px_-24px_rgba(20,20,20,0.95)]">
              <div className="absolute -top-16 right-0 w-44 h-44 rounded-full bg-[#F58322]/15 blur-2xl" />
              <h2 className="font-oswald text-2xl sm:text-3xl uppercase">{t('about.contacts.title')}</h2>
              <p className="mt-4 text-gray-300">{t('about.contacts.address')}</p>

              <div className="mt-6 space-y-2">
                <a href="tel:+77080055085" className="block text-lg sm:text-xl hover:text-[#F58322] transition-colors">
                  +7 (708) 005-50-85
                </a>
                <a href="tel:+77272208707" className="block text-lg sm:text-xl hover:text-[#F58322] transition-colors">
                  +7 (727) 220-87-07
                </a>
                <a href="mailto:baymir@inbox.ru" className="block text-base sm:text-lg text-gray-300 hover:text-[#F58322] transition-colors">
                  baymir@inbox.ru
                </a>
                <a href="https://baymir.kz" target="_blank" rel="noreferrer" className="block text-base sm:text-lg text-gray-300 hover:text-[#F58322] transition-colors">
                  baymir.kz
                </a>
              </div>

              <p className="mt-8 text-sm sm:text-base text-gray-300 leading-relaxed">
                {t('about.contacts.cta')}
              </p>
            </ScrollReveal>
          </section>

          <ScrollReveal className="mb-16 sm:mb-20 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-[0_18px_30px_-26px_rgba(0,0,0,0.55)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-7 py-4 border-b border-gray-100">
              <h2 className="font-oswald text-2xl sm:text-3xl uppercase text-gray-900">
                {t('about.map.title')}
              </h2>
              <a
                href="https://2gis.kz/almaty/firm/70000001037135847"
                target="_blank"
                rel="noreferrer"
                className="text-sm sm:text-base font-semibold text-[#F58322] hover:text-[#DB741F] transition-colors"
              >
                {t('about.map.openIn2gis')}
              </a>
            </div>

            <iframe
              title={t('about.map.title')}
              src="https://widgets.2gis.com/widget?type=firmsonmap&options=%7B%22pos%22%3A%7B%22lat%22%3A43.343485%2C%22lon%22%3A76.809331%2C%22zoom%22%3A16%7D%2C%22opt%22%3A%7B%22city%22%3A%22almaty%22%7D%2C%22org%22%3A%2270000001037135847%22%7D"
              width="100%"
              height="420"
              loading="lazy"
              className="w-full"
            />
          </ScrollReveal>
        </main>
      </div>
    </PageContainer>
  )
}

export default AboutPage
