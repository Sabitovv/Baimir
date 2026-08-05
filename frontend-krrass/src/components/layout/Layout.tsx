import { useState, type ReactNode } from 'react'
import Header from './Header'
import Cart from '../common/Cart'
import CartAnimation from '../animations/CartAnimation'
import { CartAnimationProvider } from '../animations/CartAnimationContext'

// Футер временно скрыт
// const Footer = lazy(() => import('./Footer'))

const Layout = ({ children }: { children: ReactNode }) => {
    const [isCartOpen, setIsCartOpen] = useState(false)
    return (
        <CartAnimationProvider>
            <div className="min-h-screen flex flex-col">
                <Header setIsCartOpen={setIsCartOpen} />
                <main className="flex-1 pt-[88px]">{children}</main>
                <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                <CartAnimation />
                {/* Футер временно скрыт
                <Suspense fallback={<footer className="min-h-[600px] md:min-h-[240px]" aria-hidden="true" />}>
                    <Footer />
                </Suspense>
                */}
            </div>
        </CartAnimationProvider>
    )
}

export default Layout
