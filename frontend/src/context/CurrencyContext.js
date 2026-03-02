import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Get saved currency from localStorage or default to 'ZAR'
    const saved = localStorage.getItem('currency');
    return saved || 'ZAR';
  });

  const currencies = {
    ZAR: { symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
    USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
    GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    BWP: { symbol: 'P', name: 'Botswana Pula', flag: '🇧🇼' },
    NGN: { symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
    KES: { symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' }
  };

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const formatPrice = (price) => {
    const currencyData = currencies[currency];
    return `${currencyData.symbol} ${price.toFixed(2)}`;
  };

  const value = {
    currency,
    setCurrency,
    currencies,
    formatPrice,
    currentCurrency: currencies[currency]
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};