import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
    children: ReactNode
    staggerDelay?: number
    className?: string
}

const StaggerContainer = ({
    children,
    staggerDelay = 0.08,
    className,
}: Props) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
            hidden: {},
            visible: { transition: { staggerChildren: staggerDelay } },
        }}
        className={className}
    >
        {children}
    </motion.div>
)

export default StaggerContainer
