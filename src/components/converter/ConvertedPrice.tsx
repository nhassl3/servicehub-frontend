import { useEffect, useState } from 'react'

export function ConvertedPrice({
  price,
  currency,
  exchangeRates,
}: {
  price: number;
  currency: string;
  exchangeRates: (toCurrency: string, amount: number) => Promise<string>;
}) {
  const [converted, setConverted] = useState<string>('0.00');

  useEffect(() => {
    if (price == null || price === 0) {
      setConverted('0.00');
      return;
    }
    let cancelled = false;
    exchangeRates(currency, price).then(c => {
      if (!cancelled) setConverted(c);
    });
    return () => { cancelled = true; };
  }, [price, currency, exchangeRates]);

  return <>{converted}</>;
}
