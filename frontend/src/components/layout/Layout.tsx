import Header from './Header'
import Footer from './Footer'
import Cart from '../common/Cart'
import CartAnimation from '../animations/CartAnimation'
import { CartAnimationProvider } from '../animations/CartAnimationContext'
import { useState } from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isCartOpen, setIsCartOpen] = useState(false)
    return (
        <CartAnimationProvider>
            <div className="min-h-screen flex flex-col">
                <Header setIsCartOpen={setIsCartOpen} />
                <main className="flex-1 pt-[88px]">{children}</main>
                <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                <CartAnimation />
                <Footer />
            </div>
        </CartAnimationProvider>
    )
}

export default Layout
