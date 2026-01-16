import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NavLink } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import logo from '@/assets/log.png'

const Header = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const navItems = [
    { id: 'technologies', path: 'Technology' },
    { id: 'demo', path: 'demo' },
    { id: 'production', path: 'production' },
    { id: 'warehouse', path: 'warehouse' },
    { id: 'service', path: 'service' },
    { id: 'blog', path: 'Blog' },
    { id: 'contacts', path: 'contacts' },
]

  return (
    <header className="w-full h-[88px] z-50 text-white overflow-x-hidden bg-[#141414]" >

    <div className="hidden lg:flex h-full max-w-[1920px] mx-auto px-6 xl:px-[90px] items-center justify-between" >

      <Link to="/" className="shrink-0">
        <img src={logo} alt="Baymir Logo" className="h-9"/>
      </Link>

      <div className="flex items-center gap-8" >

        <div className="hidden xl:flex items-center w-[300px] h-10 border border-white/70 bg-black/30" >
          <input
            placeholder={t('header.search')}
            className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-gray-400 outline-none font-manrope"
          />
          <button className="px-4 border-l border-white/70">
            <SearchIcon sx={{ color: 'white', fontSize: 20 }} />
          </button>
        </div>

        <nav className="flex gap-4 text-xs uppercase font-manrope font-700 tracking-widest whitespace-nowrap">
          {navItems.map((key) => (
            <NavLink
              key={key.id}
              to={`/${key.path}`}
              className={({ isActive }) =>
                isActive
                  ? 'text-[#F05023]'
                  : 'hover:text-[#F05023]'
              }
            >
              {t(`header.nav.${key.id}`)}
            </NavLink>
          ))}
        </nav>
      </div>
        
      <button className="border border-white px-3 py-2.5 text-xs font-manrope font-700 uppercase tracking-widest hover:bg-[#F05023] transition shrink-0">
        {t('header.cta')}
      </button>
    </div>

      <div className="lg:hidden flex items-center justify-between h-full px-4 bg-black/60 backdrop-blur">

        <Link to="/">
          <img src={logo} alt="Baymir Logo" className="h-8" />
        </Link>

        <button onClick={() => setOpen(true)}>
          <MenuIcon sx={{ fontSize: 28 }} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black text-white z-50">

          <div className="flex items-center justify-between h-[88px] px-4 border-b border-white/10">
            <img src={logo} className="h-8" />
            <button onClick={() => setOpen(false)}>
              <CloseIcon sx={{ fontSize: 28 }} />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-8">

            <div className="flex items-center h-12 border border-white/30">
              <input
                placeholder={t('header.search')}
                className="flex-1 bg-transparent px-4 outline-none font-manrope"
              />
              <SearchIcon sx={{ marginRight: 12 }} />
            </div>

            <nav className="flex flex-col gap-6 text-xl uppercase font-oswald font-600">
              {[
                'technologies',
                'demo',
                'production',
                'warehouse',
                'service',
                'about',
                'contacts'
              ].map((key) => (
                <Link
                  key={key}
                  to={`/${key}`}
                  onClick={() => setOpen(false)}
                  className="hover:text-[#F05023]"
                >
                  {t(`header.nav.${key}`)}
                </Link>
              ))}
            </nav>

            <button className="mt-6 border border-white py-4 uppercase font-oswald font-600 tracking-widest hover:bg-[#F05023]">
              {t('header.cta')}
            </button>

          </div>
        </div>
      )}

    </header>
  )
}

export default Header
