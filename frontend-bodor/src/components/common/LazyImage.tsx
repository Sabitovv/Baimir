import type { ImgHTMLAttributes } from 'react'

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    /** Image source URL — required */
    src: string
    /** Alt text for accessibility — required */
    alt: string
    /** Explicit width to reserve layout space (prevents CLS) */
    width: number | string
    /** Explicit height to reserve layout space (prevents CLS) */
    height: number | string
}

/**
 * Drop-in `<img>` replacement that enforces width/height (CLS fix)
 * and uses native lazy loading + async decoding by default.
 *
 * @example
 * <LazyImage
 *   src="/images/hero.webp"
 *   alt="Hero banner"
 *   width={1200}
 *   height={600}
 *   className="object-cover"
 * />
 */
const LazyImage = ({
    src,
    alt,
    width,
    height,
    loading = 'lazy',
    decoding = 'async',
    className = '',
    ...rest
}: LazyImageProps) => (
    <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        className={className}
        {...rest}
    />
)

export default LazyImage
