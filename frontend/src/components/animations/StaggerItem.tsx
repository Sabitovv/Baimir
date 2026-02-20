import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
    children: ReactNode
    className?: string
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
}

const StaggerItem = ({ children, className }: Props) => (
    <motion.div variants={itemVariants} className={className}>
        {children}
    </motion.div>
)

export default StaggerItem
