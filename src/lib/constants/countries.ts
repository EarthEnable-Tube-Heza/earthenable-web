/**
 * Country and Currency Constants
 *
 * Centralized list of countries and currencies for use across the application.
 * Based on ISO 3166-1 alpha-2 country codes and ISO 4217 currency codes.
 */

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string; // ISO 4217
  currencyName: string;
}

/**
 * All African countries with their currencies.
 * Ordered alphabetically by name.
 */
export const AFRICAN_COUNTRIES: Country[] = [
  { code: "DZ", name: "Algeria", currency: "DZD", currencyName: "Algerian Dinar" },
  { code: "AO", name: "Angola", currency: "AOA", currencyName: "Angolan Kwanza" },
  { code: "BJ", name: "Benin", currency: "XOF", currencyName: "West African CFA Franc" },
  { code: "BW", name: "Botswana", currency: "BWP", currencyName: "Botswana Pula" },
  { code: "BF", name: "Burkina Faso", currency: "XOF", currencyName: "West African CFA Franc" },
  { code: "BI", name: "Burundi", currency: "BIF", currencyName: "Burundian Franc" },
  { code: "CV", name: "Cabo Verde", currency: "CVE", currencyName: "Cape Verdean Escudo" },
  { code: "CM", name: "Cameroon", currency: "XAF", currencyName: "Central African CFA Franc" },
  {
    code: "CF",
    name: "Central African Republic",
    currency: "XAF",
    currencyName: "Central African CFA Franc",
  },
  { code: "TD", name: "Chad", currency: "XAF", currencyName: "Central African CFA Franc" },
  { code: "KM", name: "Comoros", currency: "KMF", currencyName: "Comorian Franc" },
  { code: "CG", name: "Congo", currency: "XAF", currencyName: "Central African CFA Franc" },
  { code: "CD", name: "Congo (DRC)", currency: "CDF", currencyName: "Congolese Franc" },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF", currencyName: "West African CFA Franc" },
  { code: "DJ", name: "Djibouti", currency: "DJF", currencyName: "Djiboutian Franc" },
  { code: "EG", name: "Egypt", currency: "EGP", currencyName: "Egyptian Pound" },
  {
    code: "GQ",
    name: "Equatorial Guinea",
    currency: "XAF",
    currencyName: "Central African CFA Franc",
  },
  { code: "ER", name: "Eritrea", currency: "ERN", currencyName: "Eritrean Nakfa" },
  { code: "SZ", name: "Eswatini", currency: "SZL", currencyName: "Swazi Lilangeni" },
  { code: "ET", name: "Ethiopia", currency: "ETB", currencyName: "Ethiopian Birr" },
  { code: "GA", name: "Gabon", currency: "XAF", currencyName: "Central African CFA Franc" },
  { code: "GM", name: "Gambia", currency: "GMD", currencyName: "Gambian Dalasi" },
  { code: "GH", name: "Ghana", currency: "GHS", currencyName: "Ghanaian Cedi" },
  { code: "GN", name: "Guinea", currency: "GNF", currencyName: "Guinean Franc" },
  { code: "GW", name: "Guinea-Bissau", currency: "XOF", currencyName: "West African CFA Franc" },
  { code: "KE", name: "Kenya", currency: "KES", currencyName: "Kenyan Shilling" },
  { code: "LS", name: "Lesotho", currency: "LSL", currencyName: "Lesotho Loti" },
  { code: "LR", name: "Liberia", currency: "LRD", currencyName: "Liberian Dollar" },
  { code: "LY", name: "Libya", currency: "LYD", currencyName: "Libyan Dinar" },
  { code: "MG", name: "Madagascar", currency: "MGA", currencyName: "Malagasy Ariary" },
  { code: "MW", name: "Malawi", currency: "MWK", currencyName: "Malawian Kwacha" },
  { code: "ML", name: "Mali", currency: "XOF", currencyName: "West African CFA Franc" },
  { code: "MR", name: "Mauritania", currency: "MRU", currencyName: "Mauritanian Ouguiya" },
  { code: "MU", name: "Mauritius", currency: "MUR", currencyName: "Mauritian Rupee" },
  { code: "MA", name: "Morocco", currency: "MAD", currencyName: "Moroccan Dirham" },
  { code: "MZ", name: "Mozambique", currency: "MZN", currencyName: "Mozambican Metical" },
  { code: "NA", name: "Namibia", currency: "NAD", currencyName: "Namibian Dollar" },
  { code: "NE", name: "Niger", currency: "XOF", currencyName: "West African CFA Franc" },
  { code: "NG", name: "Nigeria", currency: "NGN", currencyName: "Nigerian Naira" },
  { code: "RW", name: "Rwanda", currency: "RWF", currencyName: "Rwandan Franc" },
  {
    code: "ST",
    name: "São Tomé and Príncipe",
    currency: "STN",
    currencyName: "São Tomé and Príncipe Dobra",
  },
  { code: "SN", name: "Senegal", currency: "XOF", currencyName: "West African CFA Franc" },
  { code: "SC", name: "Seychelles", currency: "SCR", currencyName: "Seychellois Rupee" },
  { code: "SL", name: "Sierra Leone", currency: "SLE", currencyName: "Sierra Leonean Leone" },
  { code: "SO", name: "Somalia", currency: "SOS", currencyName: "Somali Shilling" },
  { code: "ZA", name: "South Africa", currency: "ZAR", currencyName: "South African Rand" },
  { code: "SS", name: "South Sudan", currency: "SSP", currencyName: "South Sudanese Pound" },
  { code: "SD", name: "Sudan", currency: "SDG", currencyName: "Sudanese Pound" },
  { code: "TZ", name: "Tanzania", currency: "TZS", currencyName: "Tanzanian Shilling" },
  { code: "TG", name: "Togo", currency: "XOF", currencyName: "West African CFA Franc" },
  { code: "TN", name: "Tunisia", currency: "TND", currencyName: "Tunisian Dinar" },
  { code: "UG", name: "Uganda", currency: "UGX", currencyName: "Ugandan Shilling" },
  { code: "ZM", name: "Zambia", currency: "ZMW", currencyName: "Zambian Kwacha" },
  { code: "ZW", name: "Zimbabwe", currency: "ZWL", currencyName: "Zimbabwean Dollar" },
];

/**
 * Non-African countries where EarthEnable operates.
 */
export const OTHER_EARTHENABLE_COUNTRIES: Country[] = [
  { code: "IN", name: "India", currency: "INR", currencyName: "Indian Rupee" },
];

/**
 * All countries where EarthEnable operates or may operate.
 * Combines African countries with other operational countries.
 */
export const EARTHENABLE_COUNTRIES: Country[] = [
  ...AFRICAN_COUNTRIES,
  ...OTHER_EARTHENABLE_COUNTRIES,
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Additional currencies that may be used (e.g., for international transactions)
 */
export const ADDITIONAL_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
];

/**
 * All available currencies (EarthEnable countries + additional), deduplicated
 */
export const ALL_CURRENCIES = Array.from(
  new Map(
    [
      ...EARTHENABLE_COUNTRIES.map((c) => ({
        code: c.currency,
        name: c.currencyName,
      })),
      ...ADDITIONAL_CURRENCIES,
    ].map((c) => [c.code, c])
  ).values()
).sort((a, b) => a.code.localeCompare(b.code));

/**
 * Get country by code
 */
export function getCountryByCode(code: string): Country | undefined {
  return EARTHENABLE_COUNTRIES.find((c) => c.code === code);
}

/**
 * Get currency for a country code
 */
export function getCurrencyForCountry(countryCode: string): string | undefined {
  return getCountryByCode(countryCode)?.currency;
}

/**
 * Country options for select dropdowns
 */
export const COUNTRY_OPTIONS = EARTHENABLE_COUNTRIES.map((c) => ({
  value: c.code,
  label: `${c.code} - ${c.name}`,
}));

/**
 * Currency options for select dropdowns
 */
export const CURRENCY_OPTIONS = ALL_CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.code} - ${c.name}`,
}));
