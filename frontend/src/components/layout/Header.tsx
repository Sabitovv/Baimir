import { useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { skipToken } from '@reduxjs/toolkit/query'
import SearchIcon from '@mui/icons-material/Search'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import logo from '@/assets/header/oldBg.svg'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import { useAppSelector } from '@/app/hooks'
import { useSearchProductsQuery } from '@/api/productsApi'
import { EditableImage } from '@/zustand/EditableImage'
//#F58322
//#DB741F

type HeaderProps = {
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(price)
}

const Header = ({ setIsCartOpen }: HeaderProps) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const desktopSearchRef = useRef<HTMLDivElement | null>(null)
  const mobileSearchRef = useRef<HTMLDivElement | null>(null)
  const desktopInputRef = useRef<HTMLInputElement | null>(null)
  const mobileInputRef = useRef<HTMLInputElement | null>(null)
  const cartItems = useAppSelector((state) => state.cart.items)
  const compareItems = useAppSelector((state) => state.compare.items)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const compareCount = compareItems.length

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchValue.trim())
    }, 450)

    return () => window.clearTimeout(timeoutId)
  }, [searchValue])

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const desktopContains = desktopSearchRef.current?.contains(target)
      const mobileContains = mobileSearchRef.current?.contains(target)

      if (!desktopContains && !mobileContains) {
        setIsSearchOpen(false)
      }
    }

    const onScroll = () => {
      setIsSearchOpen(false)
    }

    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const shouldSearch = debouncedQuery.length >= 2
  const { data: searchData, isFetching: isSearchFetching } = useSearchProductsQuery(
    shouldSearch
      ? { query: debouncedQuery, page: 0, size: 20, sort: 'id,DESC' }
      : skipToken,
  )
  const searchResults = (searchData?.content ?? []).slice(0, 8)

  const navItems = [
    { id: 'catalog', path: '/catalog' },
    // { id: 'technologies', path: '/technology' },
    // { id: 'demo', path: '/demo' },
    { id: 'production', path: '/production' },
    { id: 'storage', path: '/storage' },
    { id: 'service', path: '/service' },
    { id: 'blog', path: '/blog' },
    { id: 'about', path: '/about' },
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const getLangClass = (lng: string) => {
    return i18n.language === lng
      ? 'text-[#F58322] font-bold border-b border-[#F58322]'
      : 'text-white hover:text-[#F58322] transition-colors'
  }

  const closeSearch = () => {
    setIsSearchOpen(false)
  }

  const handleSearchSelect = (slug: string) => {
    navigate(`/catalog/product/${slug}`)
    setSearchValue('')
    setDebouncedQuery('')
    setIsSearchOpen(false)
    setOpen(false)
  }

  const getDropdownStyle = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (!inputRef.current) return {}
    const rect = inputRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const maxHeight = viewportHeight - rect.bottom - 16
    
    return {
      top: rect.bottom + 8,
      left: rect.left,
      right: window.innerWidth - rect.right,
      maxHeight: `${Math.min(maxHeight, 500)}px`,
    }
  }

  const renderSearchDropdown = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (!isSearchOpen) return null

    const dropdownStyle = getDropdownStyle(inputRef)

    return (
      <div 
        className="fixed z-[100] rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl"
        style={dropdownStyle}
      >
        {!shouldSearch && (
          <div className="px-4 py-3 text-sm text-gray-500">{t('header.searchStartTyping')}</div>
        )}

        {shouldSearch && isSearchFetching && (
          <div className="px-4 py-3 text-sm text-gray-500">{t('header.searchLoading')}</div>
        )}

        {shouldSearch && !isSearchFetching && searchResults.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500">{t('header.searchNoResults')}</div>
        )}

        {shouldSearch && !isSearchFetching && searchResults.length > 0 && (
          <ul className="overflow-y-auto py-2">
            {searchResults.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSearchSelect(product.slug)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-gray-100"
                >
                  <img
                    src={product.coverImage || 'https://placehold.co/56x56?text=No+Image'}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-gray-900">{product.name}</span>
                    <span className="block text-xs text-[#DB741F]">{formatPrice(product.price)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full h-[88px] z-50 text-white overflow-x-hidden bg-[#141414] font-manrope">
      <div className="hidden xl:flex h-full max-w-[1920px] mx-auto px-6 2xl:px-[90px] items-center justify-between">
        <div className="flex items-center gap-4 2xl:gap-8">
          <Link to="/" className="shrink-0">
            <EditableImage imageKey="header_main_logo" fallbackSrc={logo} alt="Baymir Logo" className="h-12 2xl:h-15" />
          </Link>

          <div
            ref={desktopSearchRef}
            className="relative hidden 2xl:flex items-center w-[320px] 2xl:w-[400px] 3xl:w-[450px] h-10 border border-white/70 bg-black/30"
          >
            <input
              ref={desktopInputRef}
              placeholder={t('header.search')}
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  closeSearch()
                }
                if (event.key === 'Enter' && searchResults[0]) {
                  handleSearchSelect(searchResults[0].slug)
                }
              }}
              className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-gray-400 outline-none"
            />
            <button
              type="button"
              className="px-4 border-l border-white/70"
              onClick={() => {
                if (searchResults[0]) {
                  handleSearchSelect(searchResults[0].slug)
                }
              }}
            >
              <SearchIcon sx={{ color: 'white', fontSize: 20 }} />
            </button>
            {renderSearchDropdown(desktopInputRef)}
          </div>
        </div>

        <nav className="flex items-center gap-3 2xl:gap-5 text-[13px] 2xl:text-xs uppercase font-bold tracking-wider 2xl:tracking-widest whitespace-nowrap shrink-0">
          {navItems.map((key) => (
            <NavLink
              key={key.id}
              to={key.path}
              className={({ isActive }) =>
                isActive ? 'text-[#F58322]' : 'hover:text-[#DB741F] transition-colors'
              }
            >
              {t(`header.nav.${key.id}`)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 2xl:gap-6 shrink-0">

          <div className="flex items-center gap-2 text-xs 2xl:text-sm font-bold uppercase shrink-0">
            <button
              onClick={() => changeLanguage('ru')}
              className={getLangClass('ru')}
            >
              RU
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={() =>changeLanguage('kz')}
              className={getLangClass('kz')}
            >
              KZ
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={() => changeLanguage('en')}
              className={getLangClass('en')}
            >
              EN
            </button>
          </div>
          {/* <button className="border border-white px-3 py-2 2xl:py-2.5 text-[10px] 2xl:text-xs font-bold uppercase tracking-widest hover:bg-[#DB741F] transition-colors shrink-0">
            {t('header.cta')}
          </button> */}
          <button onClick={() => setIsCartOpen(true)} className="relative" data-cart-button-desktop>
            <ShoppingCartIcon className="hover:text-[#DB741F]" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F58322] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <Link to="/compare" className="relative" aria-label={t('compare.open')} title={t('compare.open')}>
            <CompareArrowsIcon className="hover:text-[#DB741F]" />
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F58322] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {compareCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="xl:hidden flex items-center justify-between h-full px-4 bg-black/60 backdrop-blur">
        <Link to="/">
          <EditableImage imageKey="header_mobile_logo" fallbackSrc={logo} alt="Baymir Logo" className="h-8" />
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsCartOpen(true)} className="relative" data-cart-button-mobile>
            <ShoppingCartIcon sx={{ fontSize: 26 }} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F58322] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <Link to="/compare" className="relative" aria-label={t('compare.open')} title={t('compare.open')}>
            <CompareArrowsIcon sx={{ fontSize: 26 }} />
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F58322] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {compareCount}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(true)}>
            <MenuIcon sx={{ fontSize: 28 }} />
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black text-white z-50 overflow-y-auto">
          <div className="flex items-center justify-between h-[88px] px-4 border-b border-white/10">
            <EditableImage imageKey="header_drawer_logo" fallbackSrc={logo} className="h-8" alt="Logo" />
            <button onClick={() => setOpen(false)}>
              <CloseIcon sx={{ fontSize: 28 }} />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-8">
            <div ref={mobileSearchRef} className="relative flex items-center h-12 border border-white/30">
              <input
                ref={mobileInputRef}
                placeholder={t('header.search')}
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value)
                  setIsSearchOpen(true)
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    closeSearch()
                  }
                  if (event.key === 'Enter' && searchResults[0]) {
                    handleSearchSelect(searchResults[0].slug)
                  }
                }}
                className="flex-1 bg-transparent px-4 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (searchResults[0]) {
                    handleSearchSelect(searchResults[0].slug)
                  }
                }}
                className="mr-2"
              >
                <SearchIcon />
              </button>
              {renderSearchDropdown(mobileInputRef)}
            </div>

            <nav className="flex flex-col gap-6 text-xl uppercase font-oswald font-600">
              {navItems.map((key) => (
                <NavLink
                  key={key.id}
                  to={key.path}
                  onClick={() => setOpen(false)}
                  className="hover:text-[#DB741F] transition-colors"
                >
                  {t(`header.nav.${key.id}`)}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center justify-center gap-6 mt-4 pt-6 border-t border-white/10">
              <button
                onClick={() => { changeLanguage('ru'); setOpen(false); }}
                className={`text-lg font-oswald ${getLangClass('ru')}`}
              >
                {t('header.languages.ru')}
              </button>
              <button
                onClick={() => { changeLanguage('kz'); setOpen(false); }}
                className={`text-lg font-oswald ${getLangClass('kz')}`}
              >
                {t('header.languages.kz')}
              </button>
              <button
                onClick={() => { changeLanguage('en'); setOpen(false); }}
                className={`text-lg font-oswald ${getLangClass('en')}`}
              >
                {t('header.languages.en')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
