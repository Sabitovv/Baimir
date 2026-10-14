type ProductPriceProps = {
  price: string;
  oldPrice?: string | null;
  variant?: 'default' | 'compact' | 'mini' | 'catalog' | 'cart';
};

const sizes = {
  default: { current: 'text-base', previous: 'text-xs' },
  compact: { current: 'text-base', previous: 'text-[10px]' },
  mini: { current: 'text-[11px]', previous: 'text-[8px]' },
  catalog: { current: 'text-lg', previous: 'text-[13px]' },
  cart: { current: 'text-sm text-[#F58322]', previous: 'text-xs' },
};

// The currency must stay with the amount even outside the no-wrap price line.
const keepCurrency = (text: string) => text.replace(/ +₸$/, '\u00a0₸');

const ProductPrice = ({ price, oldPrice, variant = 'default' }: ProductPriceProps) => (
  <div className="product-price flex w-full min-w-0 flex-col items-start gap-0.5">
    {oldPrice && (
      <del className={`block whitespace-nowrap font-medium leading-tight text-gray-500 decoration-gray-400 tabular-nums ${sizes[variant].previous}`}>
        {keepCurrency(oldPrice)}
      </del>
    )}
    <span className={`block max-w-full font-extrabold leading-tight tracking-tight tabular-nums ${variant === 'cart' ? '' : 'text-gray-900'} ${price.endsWith('₸') ? 'whitespace-nowrap' : ''} ${sizes[variant].current}`}>
      {keepCurrency(price)}
    </span>
  </div>
);

export default ProductPrice;
