import Header from './Header'
import Footer from './Footer'
import Cart from '../common/Cart'
import { useState } from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isCartOpen, setIsCartOpen] = useState(false)
    return (
        <div className="min-h-screen flex flex-col">
            <Header setIsCartOpen={setIsCartOpen} />
            <main className="flex-1">{children}</main>
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <Footer />
        </div>
    )
}

export default Layout
