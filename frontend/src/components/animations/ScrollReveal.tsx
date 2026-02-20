import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
    children: ReactNode
    delay?: number
    duration?: number
    y?: number
    className?: string
} & Omit<HTMLMotionProps<'div'>, 'children'>

const ScrollReveal = ({
    children,
    delay = 0,
    duration = 0.6,
    y = 30,
    className,
    ...rest
}: Props) => (
    <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration, delay, ease: 'easeOut' }}
        className={className}
        {...rest}
    >
        {children}
    </motion.div>
)

export default ScrollReveal
