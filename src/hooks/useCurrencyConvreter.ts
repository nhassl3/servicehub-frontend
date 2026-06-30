import axios from "axios"
import { useCallback, useState } from "react"

type Rates = Record<string, number>;

const rateCache = new Map<string, Promise<Rates>>();

const getExchangeRate = (fromCurrency: string): Promise<Rates> => {
	const key = fromCurrency.toLowerCase();
	const cached = rateCache.get(key);
	if (cached) return cached;

	const promise = axios
		.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${key}.json`)
		.then(response => response.data[key] as Rates)
		.catch(error => {
			rateCache.delete(key);
			throw error;
		});

	rateCache.set(key, promise);
	return promise;
}

const exchangeAmount = async ({ fromCurrency, toCurrency, amount }: { fromCurrency: string, toCurrency: string, amount: number }): Promise<string> => {
	const rates = await getExchangeRate(fromCurrency);
	const rate = rates[toCurrency.toLowerCase()];
	let locale = 'en-US';
	if (toCurrency.toLowerCase() === 'rub') {
		locale = 'ru-RU';
	}
	return new Intl.NumberFormat(locale, {style: 'currency', currency: toCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount * rate);
}

function useCurrencyConverter(fc: string = 'usd', pd: Date = new Date()) {
	const [currencies, setCurrencies] = useState({});

	const exchangeRates = useCallback(async (toCurrency: string, amount: number): Promise<string> => {
		try {
			return await exchangeAmount({ fromCurrency: fc, toCurrency, amount });
		} catch {
			return "0.00";
		}
	}, [fc]);

	const currencyInfo = useCallback(async ({ fromCurrency = fc, podate = pd }: { fromCurrency: string, podate: Date }) => {
		const response = await axios.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${podate.toISOString().split('T')[0]}/v1/currencies/${fromCurrency.toLowerCase()}.json`);
		setCurrencies(response.data[fromCurrency.toLowerCase()]);
	}, [fc, pd]);

	return { currencies, currencyInfo, exchangeRates };
}

export default useCurrencyConverter;
