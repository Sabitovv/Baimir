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
import { useProductCollectionPlacement } from '@/features/productCollections/useProductCollectionPlacement'
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
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const desktopSearchRef = useRef<HTMLDivElement | null>(null)
  const mobileTopSearchRef = useRef<HTMLDivElement | null>(null)
  const mobileSearchToggleRef = useRef<HTMLButtonElement | null>(null)
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
      const mobileTopContains = mobileTopSearchRef.current?.contains(target)
      const mobileToggleContains = mobileSearchToggleRef.current?.contains(target)
      const mobileContains = mobileSearchRef.current?.contains(target)

      if (!desktopContains && !mobileTopContains && !mobileToggleContains && !mobileContains) {
        setIsSearchOpen(false)
        setIsMobileSearchVisible(false)
      }
    }

    const onScroll = () => {
      setIsSearchOpen(false)
      setIsMobileSearchVisible(false)
    }

    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!isMobileSearchVisible || open) return
    const timeoutId = window.setTimeout(() => {
      mobileInputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [isMobileSearchVisible, open])

  const shouldSearch = debouncedQuery.length >= 1
  const { data: searchData, isFetching: isSearchFetching } = useSearchProductsQuery(
    shouldSearch
      ? { query: debouncedQuery, page: 0, size: 20, sort: 'id,DESC' }
      : skipToken,
  )
  const searchResults = (searchData?.content ?? []).slice(0, 12)
  const shouldLoadEmptySuggestions =
    isSearchOpen && (!shouldSearch || (shouldSearch && !isSearchFetching && searchResults.length === 0))
  const {
    products: emptyStateProducts,
    isFetching: isEmptyStateFetching,
  } = useProductCollectionPlacement('SEARCH_EMPTY_STATE_COLLECTION', {
    lang: i18n.language,
    maxItems: 12,
    skip: !shouldLoadEmptySuggestions,
  })
  const hasEmptyStateSuggestions = emptyStateProducts.length > 0
  const shouldRenderEmptyStateSuggestions = shouldLoadEmptySuggestions
    && (isEmptyStateFetching || hasEmptyStateSuggestions)

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
    setIsMobileSearchVisible(false)
  }

  const clearSearch = () => {
    setSearchValue('')
    setDebouncedQuery('')
    setIsSearchOpen(false)
  }

  const submitSearch = () => {
    if (searchResults[0]) {
      handleSearchSelect(searchResults[0].slug)
    }
  }

  const toggleMobileSearch = () => {
    const isActive = isMobileSearchVisible || isSearchOpen

    if (isActive) {
      setIsMobileSearchVisible(false)
      setIsSearchOpen(false)
      setSearchValue('')
      setDebouncedQuery('')
      return
    }

    if (open) setOpen(false)
    setIsMobileSearchVisible(true)
    setIsSearchOpen(true)
  }

  const handleSearchSelect = (slug: string) => {
    navigate(`/catalog/product/${slug}`)
    setSearchValue('')
    setDebouncedQuery('')
    setIsSearchOpen(false)
    setOpen(false)
    setIsMobileSearchVisible(false)
  }

  const renderDesktopSearchDropdown = () => {
    if (!isSearchOpen) return null

    return (
      <div className='absolute left-0 top-full mt-2 z-[120] w-[460px] 2xl:w-[560px] 3xl:w-[640px] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl'>
        {shouldSearch && isSearchFetching && (
          <div className="px-4 py-3 text-sm text-gray-500">{t('header.searchLoading')}</div>
        )}

        {shouldRenderEmptyStateSuggestions && (
          <div className='px-3 py-3'>
            <div className='max-h-[460px] overflow-y-auto pr-1'>
              {isEmptyStateFetching && (
                <div className='px-2 py-2 text-xs text-gray-500'>{t('header.searchLoading')}</div>
              )}
              {!isEmptyStateFetching && hasEmptyStateSuggestions && (
                <>
                  <p className='px-1 pt-2 pb-2 text-xs font-semibold uppercase tracking-[0.05em] text-gray-800'>
                    Может вас заинтересует
                  </p>
                  <ul className='overflow-y-auto py-1'>
                    {emptyStateProducts.map((product) => (
                      <li key={product.id}>
                        <button
                          type='button'
                          onClick={() => handleSearchSelect(product.slug)}
                          className='flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-100'
                        >
                          <img
                            src={product.coverImage || 'https://placehold.co/56x56?text=No+Image'}
                            alt={product.name}
                            className='h-12 w-12 rounded-lg object-cover'
                          />
                          <span className='min-w-0 flex-1'>
                            <span className='block truncate text-sm font-semibold text-gray-900'>
                              {product.name}
                            </span>
                            <span className='block text-xs text-[#DB741F]'>
                              {formatPrice(product.price)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {shouldSearch && !isSearchFetching && searchResults.length > 0 && (
          <ul className='max-h-[520px] overflow-y-auto py-2 pr-1'>
            {searchResults.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSearchSelect(product.slug)}
                  className='flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-gray-100'
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
            <li className='h-2' aria-hidden='true' />
          </ul>
        )}
      </div>
    )
  }

  const renderMobileDropdown = () => {
    if (!isSearchOpen) return null

    return (
      <div className="mt-2 overflow-hidden rounded-xl border border-white/15 bg-[#0F1115]/95 text-white shadow-2xl backdrop-blur">
        {shouldSearch && isSearchFetching && (
          <div className="px-4 py-3 text-sm text-gray-300">{t('header.searchLoading')}</div>
        )}

        {shouldSearch && !isSearchFetching && searchResults.length > 0 && (
          <ul className="max-h-[460px] overflow-y-auto py-2">
            {searchResults.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSearchSelect(product.slug)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/10 active:bg-white/15"
                >
                  <img
                    src={product.coverImage || 'https://placehold.co/56x56?text=No+Image'}
                    alt={product.name}
                    className="hidden min-[380px]:block h-10 w-10 rounded-md object-cover shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{product.name}</span>
                    <span className="block text-xs text-[#F7A35C]">{formatPrice(product.price)}</span>
                  </span>
                </button>
              </li>
            ))}
            <li className="h-1" aria-hidden="true" />
          </ul>
        )}

        {shouldRenderEmptyStateSuggestions && (
          <div className="px-3 py-3">
            <div className="max-h-[420px] overflow-y-auto">
              {isEmptyStateFetching && (
                <div className="px-2 py-2 text-xs text-gray-300">{t('header.searchLoading')}</div>
              )}

              {!isEmptyStateFetching && hasEmptyStateSuggestions && (
                <>
                  <p className="px-1 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-400">
                    Может вас заинтересует
                  </p>
                  <ul className="overflow-y-auto py-1">
                    {emptyStateProducts.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleSearchSelect(product.slug)}
                          className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-white/10 active:bg-white/15"
                        >
                          <img
                            src={product.coverImage || 'https://placehold.co/56x56?text=No+Image'}
                            alt={product.name}
                            className="hidden min-[380px]:block h-10 w-10 rounded-md object-cover shrink-0"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-white">
                              {product.name}
                            </span>
                            <span className="block text-xs text-[#F7A35C]">
                              {formatPrice(product.price)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderMobileDrawerDropdown = () => {
    if (!isSearchOpen || !open) return null

    return (
      <div className="absolute left-0 right-0 top-full mt-2 z-[120] overflow-hidden rounded-xl border border-white/15 bg-[#0F1115]/95 text-white shadow-2xl backdrop-blur">
        {shouldSearch && isSearchFetching && (
          <div className="px-4 py-3 text-sm text-gray-300">{t('header.searchLoading')}</div>
        )}

        {shouldSearch && !isSearchFetching && searchResults.length > 0 && (
          <ul className="max-h-[460px] overflow-y-auto py-2">
            {searchResults.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSearchSelect(product.slug)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/10 active:bg-white/15"
                >
                  <img
                    src={product.coverImage || 'https://placehold.co/56x56?text=No+Image'}
                    alt={product.name}
                    className="hidden min-[380px]:block h-10 w-10 rounded-md object-cover shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{product.name}</span>
                    <span className="block text-xs text-[#F7A35C]">{formatPrice(product.price)}</span>
                  </span>
                </button>
              </li>
            ))}
            <li className="h-1" aria-hidden="true" />
          </ul>
        )}

        {shouldRenderEmptyStateSuggestions && (
          <div className="px-3 py-3">
            <div className="max-h-[420px] overflow-y-auto">
              {isEmptyStateFetching && (
                <div className="px-2 py-2 text-xs text-gray-300">{t('header.searchLoading')}</div>
              )}

              {!isEmptyStateFetching && hasEmptyStateSuggestions && (
                <>
                  <p className="px-1 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-400">
                    Может вас заинтересует
                  </p>
                  <ul className="overflow-y-auto py-1">
                    {emptyStateProducts.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleSearchSelect(product.slug)}
                          className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-white/10 active:bg-white/15"
                        >
                          <img
                            src={product.coverImage || 'https://placehold.co/56x56?text=No+Image'}
                            alt={product.name}
                            className="hidden min-[380px]:block h-10 w-10 rounded-md object-cover shrink-0"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-white">
                              {product.name}
                            </span>
                            <span className="block text-xs text-[#F7A35C]">
                              {formatPrice(product.price)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full h-[88px] z-50 text-white overflow-visible bg-[#141414] font-manrope">
      <div className="hidden xl:flex h-full max-w-[1920px] mx-auto px-6 2xl:px-[90px] items-center justify-between">
        <div className="flex items-center gap-4 2xl:gap-8">
          <Link to="/" className="shrink-0">
            <EditableImage imageKey="header_main_logo" fallbackSrc={logo} alt="Baymir Logo" className="h-12 2xl:h-15" />
          </Link>

          <div
            ref={desktopSearchRef}
            className="relative hidden 2xl:flex items-center w-[320px] 2xl:w-[400px] 3xl:w-[450px] h-10"
          >
            <div
              className={`${
                isSearchOpen
                  ? 'absolute left-0 top-1/2 z-[110] flex h-12 w-[460px] 2xl:w-[560px] 3xl:w-[640px] -translate-y-1/2 items-center rounded-lg border border-white/40 bg-black/90 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all focus-within:border-[#F58322] focus-within:shadow-[0_0_0_3px_rgba(245,131,34,0.2)]'
                  : 'flex h-10 w-full items-center border border-white/70 bg-black/30'
              }`}
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
                className={`flex-1 bg-transparent text-white outline-none ${
                  isSearchOpen
                    ? 'px-5 text-base placeholder:text-gray-300'
                    : 'px-4 text-sm placeholder:text-gray-400'
                }`}
              />
              {searchValue.length > 0 && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  title="Clear search"
                  className={`transition-colors ${
                    isSearchOpen ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </button>
              )}
              <button
                type="button"
                className={`${
                  isSearchOpen
                    ? 'ml-3 h-full px-5 border-l border-white/30 text-gray-100 hover:text-[#F7A35C]'
                    : 'px-4 border-l border-white/70 text-white'
                } transition-colors`}
                onClick={submitSearch}
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </button>
              {isSearchOpen && (
                <span className="pointer-events-none absolute right-16 hidden 3xl:block rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-300">
                  Esc
                </span>
              )}
            </div>
            {renderDesktopSearchDropdown()}
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
      {isSearchOpen && !isMobileSearchVisible && (
        <button
          type="button"
          aria-label="Close search"
          onClick={closeSearch}
          className="hidden 2xl:block fixed inset-0 z-[80] bg-black/20 backdrop-blur-[1px]"
        />
      )}
      <div className="xl:hidden flex items-center justify-between h-full px-4 bg-black/60 backdrop-blur">
        <Link to="/">
          <EditableImage imageKey="header_mobile_logo" fallbackSrc={logo} alt="Baymir Logo" className="h-8" />
        </Link>

        <div className="flex items-center gap-3">
          <button
            ref={mobileSearchToggleRef}
            onClick={toggleMobileSearch}
            aria-label={t('header.search')}
            title={t('header.search')}
            className={`transition-colors ${isMobileSearchVisible ? 'text-[#F58322]' : 'text-white hover:text-[#DB741F]'}`}
          >
            <SearchIcon sx={{ fontSize: 26 }} />
          </button>
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
          <button onClick={() => { setOpen(true); setIsMobileSearchVisible(false); setIsSearchOpen(false) }}>
            <MenuIcon sx={{ fontSize: 28 }} />
          </button>
        </div>
      </div>
      {isMobileSearchVisible && (
        <div
          ref={mobileTopSearchRef}
          className="xl:hidden fixed top-[88px] left-0 right-0 z-[60] px-4 pt-2 pb-3 bg-[#141414]/95 backdrop-blur-md border-b border-white/10"
        >
          <div className="flex items-center h-11 border border-white/30 rounded-lg bg-black/30 transition-colors focus-within:border-[#F58322]">
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
              className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-gray-400 outline-none"
            />
            {searchValue.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                className="mr-1 text-gray-300 hover:text-white"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            )}
            <button
              type="button"
              onClick={submitSearch}
              className="mr-2 text-gray-200 hover:text-white"
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
          {renderMobileDropdown()}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 bg-black text-white z-50 overflow-y-auto">
          <div className="flex items-center justify-between h-[88px] px-4 border-b border-white/10">
            <EditableImage imageKey="header_drawer_logo" fallbackSrc={logo} className="h-8" alt="Logo" />
            <button onClick={() => setOpen(false)}>
              <CloseIcon sx={{ fontSize: 28 }} />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-8">
            <div ref={mobileSearchRef} className="relative">
              <div className="flex items-center h-11 border border-white/30 rounded-lg bg-black/30 transition-colors focus-within:border-[#F58322]">
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
                className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-gray-400 outline-none"
              />
              {searchValue.length > 0 && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mr-1 text-gray-300 hover:text-white"
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </button>
              )}
              <button
                type="button"
                onClick={submitSearch}
                className="mr-2 text-gray-200 hover:text-white"
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </button>
              </div>
              {renderMobileDrawerDropdown()}
            </div>

            <nav className="flex flex-col gap-6 text-xl uppercase font-bold tracking-wider">
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
                className={`text-lg font-bold ${getLangClass('ru')}`}
              >
                {t('header.languages.ru')}
              </button>
              <button
                onClick={() => { changeLanguage('kz'); setOpen(false); }}
                className={`text-lg font-bold ${getLangClass('kz')}`}
              >
                {t('header.languages.kz')}
              </button>
              <button
                onClick={() => { changeLanguage('en'); setOpen(false); }}
                className={`text-lg font-bold ${getLangClass('en')}`}
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
