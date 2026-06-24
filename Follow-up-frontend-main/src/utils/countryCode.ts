// Country codes list with minimum phone number length (without country code)
export interface CountryCode {
    code: string;
    country: string;
    name: string;
    minLength: number;
    region?: string;
}

export const countryCodes: CountryCode[] = [
    // ========== ASIA ==========
    { code: "+880", country: "BD", name: "Bangladesh", minLength: 10, region: "Asia" },
    { code: "+91", country: "IN", name: "India", minLength: 10, region: "Asia" },
    { code: "+86", country: "CN", name: "China", minLength: 11, region: "Asia" },
    { code: "+81", country: "JP", name: "Japan", minLength: 10, region: "Asia" },
    { code: "+82", country: "KR", name: "South Korea", minLength: 10, region: "Asia" },
    { code: "+65", country: "SG", name: "Singapore", minLength: 8, region: "Asia" },
    { code: "+60", country: "MY", name: "Malaysia", minLength: 9, region: "Asia" },
    { code: "+62", country: "ID", name: "Indonesia", minLength: 9, region: "Asia" },
    { code: "+66", country: "TH", name: "Thailand", minLength: 9, region: "Asia" },
    { code: "+84", country: "VN", name: "Vietnam", minLength: 9, region: "Asia" },
    { code: "+63", country: "PH", name: "Philippines", minLength: 10, region: "Asia" },
    { code: "+92", country: "PK", name: "Pakistan", minLength: 10, region: "Asia" },
    { code: "+94", country: "LK", name: "Sri Lanka", minLength: 9, region: "Asia" },
    { code: "+95", country: "MM", name: "Myanmar", minLength: 8, region: "Asia" },
    { code: "+93", country: "AF", name: "Afghanistan", minLength: 9, region: "Asia" },
    { code: "+961", country: "LB", name: "Lebanon", minLength: 8, region: "Asia" },
    { code: "+962", country: "JO", name: "Jordan", minLength: 9, region: "Asia" },
    { code: "+964", country: "IQ", name: "Iraq", minLength: 10, region: "Asia" },
    { code: "+965", country: "KW", name: "Kuwait", minLength: 8, region: "Asia" },
    { code: "+966", country: "SA", name: "Saudi Arabia", minLength: 9, region: "Asia" },
    { code: "+971", country: "AE", name: "United Arab Emirates", minLength: 9, region: "Asia" },
    { code: "+972", country: "IL", name: "Israel", minLength: 9, region: "Asia" },
    { code: "+973", country: "BH", name: "Bahrain", minLength: 8, region: "Asia" },
    { code: "+974", country: "QA", name: "Qatar", minLength: 8, region: "Asia" },
    { code: "+975", country: "BT", name: "Bhutan", minLength: 8, region: "Asia" },
    { code: "+976", country: "MN", name: "Mongolia", minLength: 8, region: "Asia" },
    { code: "+977", country: "NP", name: "Nepal", minLength: 10, region: "Asia" },
    { code: "+992", country: "TJ", name: "Tajikistan", minLength: 9, region: "Asia" },
    { code: "+993", country: "TM", name: "Turkmenistan", minLength: 8, region: "Asia" },
    { code: "+994", country: "AZ", name: "Azerbaijan", minLength: 9, region: "Asia" },
    { code: "+996", country: "KG", name: "Kyrgyzstan", minLength: 9, region: "Asia" },
    { code: "+998", country: "UZ", name: "Uzbekistan", minLength: 9, region: "Asia" },
    { code: "+850", country: "KP", name: "North Korea", minLength: 8, region: "Asia" },
    { code: "+852", country: "HK", name: "Hong Kong", minLength: 8, region: "Asia" },
    { code: "+853", country: "MO", name: "Macau", minLength: 8, region: "Asia" },
    { code: "+886", country: "TW", name: "Taiwan", minLength: 9, region: "Asia" },
    { code: "+855", country: "KH", name: "Cambodia", minLength: 9, region: "Asia" },
    { code: "+856", country: "LA", name: "Laos", minLength: 8, region: "Asia" },
    { code: "+673", country: "BN", name: "Brunei", minLength: 7, region: "Asia" },
    { code: "+670", country: "TL", name: "East Timor", minLength: 8, region: "Asia" },
    { code: "+98", country: "IR", name: "Iran", minLength: 10, region: "Asia" },
    { code: "+90", country: "TR", name: "Turkey", minLength: 10, region: "Asia" },
    { code: "+7", country: "KZ", name: "Kazakhstan", minLength: 10, region: "Asia" },
    { code: "+7", country: "RU", name: "Russia", minLength: 10, region: "Asia" },
    { code: "+374", country: "AM", name: "Armenia", minLength: 8, region: "Asia" },
    { code: "+995", country: "GE", name: "Georgia", minLength: 9, region: "Asia" },
    { code: "+960", country: "MV", name: "Maldives", minLength: 7, region: "Asia" },
    { code: "+967", country: "YE", name: "Yemen", minLength: 9, region: "Asia" },
    { code: "+968", country: "OM", name: "Oman", minLength: 8, region: "Asia" },
    { code: "+970", country: "PS", name: "Palestine", minLength: 9, region: "Asia" },
    { code: "+963", country: "SY", name: "Syria", minLength: 9, region: "Asia" },

    // ========== NORTH AMERICA ==========
    { code: "+1", country: "US", name: "United States", minLength: 10, region: "North America" },
    { code: "+1", country: "CA", name: "Canada", minLength: 10, region: "North America" },
    { code: "+52", country: "MX", name: "Mexico", minLength: 10, region: "North America" },
    { code: "+1", country: "JM", name: "Jamaica", minLength: 10, region: "North America" },
    { code: "+1", country: "BS", name: "Bahamas", minLength: 10, region: "North America" },
    { code: "+1", country: "BB", name: "Barbados", minLength: 10, region: "North America" },
    { code: "+1", country: "AG", name: "Antigua and Barbuda", minLength: 10, region: "North America" },
    { code: "+1", country: "GD", name: "Grenada", minLength: 10, region: "North America" },
    { code: "+1", country: "DM", name: "Dominica", minLength: 10, region: "North America" },
    { code: "+1", country: "LC", name: "Saint Lucia", minLength: 10, region: "North America" },
    { code: "+1", country: "VC", name: "Saint Vincent", minLength: 10, region: "North America" },
    { code: "+1", country: "TT", name: "Trinidad and Tobago", minLength: 10, region: "North America" },
    { code: "+501", country: "BZ", name: "Belize", minLength: 7, region: "North America" },
    { code: "+502", country: "GT", name: "Guatemala", minLength: 8, region: "North America" },
    { code: "+503", country: "SV", name: "El Salvador", minLength: 8, region: "North America" },
    { code: "+504", country: "HN", name: "Honduras", minLength: 8, region: "North America" },
    { code: "+505", country: "NI", name: "Nicaragua", minLength: 8, region: "North America" },
    { code: "+506", country: "CR", name: "Costa Rica", minLength: 8, region: "North America" },
    { code: "+507", country: "PA", name: "Panama", minLength: 8, region: "North America" },
    { code: "+509", country: "HT", name: "Haiti", minLength: 8, region: "North America" },
    { code: "+53", country: "CU", name: "Cuba", minLength: 8, region: "North America" },
    { code: "+1", country: "DO", name: "Dominican Republic", minLength: 10, region: "North America" },

    // ========== SOUTH AMERICA ==========
    { code: "+55", country: "BR", name: "Brazil", minLength: 10, region: "South America" },
    { code: "+54", country: "AR", name: "Argentina", minLength: 10, region: "South America" },
    { code: "+57", country: "CO", name: "Colombia", minLength: 10, region: "South America" },
    { code: "+51", country: "PE", name: "Peru", minLength: 9, region: "South America" },
    { code: "+56", country: "CL", name: "Chile", minLength: 9, region: "South America" },
    { code: "+58", country: "VE", name: "Venezuela", minLength: 10, region: "South America" },
    { code: "+591", country: "BO", name: "Bolivia", minLength: 8, region: "South America" },
    { code: "+593", country: "EC", name: "Ecuador", minLength: 9, region: "South America" },
    { code: "+595", country: "PY", name: "Paraguay", minLength: 9, region: "South America" },
    { code: "+597", country: "SR", name: "Suriname", minLength: 7, region: "South America" },
    { code: "+598", country: "UY", name: "Uruguay", minLength: 8, region: "South America" },
    { code: "+592", country: "GY", name: "Guyana", minLength: 7, region: "South America" },

    // ========== EUROPE ==========
    { code: "+44", country: "GB", name: "United Kingdom", minLength: 10, region: "Europe" },
    { code: "+49", country: "DE", name: "Germany", minLength: 10, region: "Europe" },
    { code: "+33", country: "FR", name: "France", minLength: 10, region: "Europe" },
    { code: "+39", country: "IT", name: "Italy", minLength: 9, region: "Europe" },
    { code: "+34", country: "ES", name: "Spain", minLength: 9, region: "Europe" },
    { code: "+31", country: "NL", name: "Netherlands", minLength: 9, region: "Europe" },
    { code: "+32", country: "BE", name: "Belgium", minLength: 9, region: "Europe" },
    { code: "+41", country: "CH", name: "Switzerland", minLength: 9, region: "Europe" },
    { code: "+43", country: "AT", name: "Austria", minLength: 10, region: "Europe" },
    { code: "+45", country: "DK", name: "Denmark", minLength: 8, region: "Europe" },
    { code: "+46", country: "SE", name: "Sweden", minLength: 9, region: "Europe" },
    { code: "+47", country: "NO", name: "Norway", minLength: 8, region: "Europe" },
    { code: "+48", country: "PL", name: "Poland", minLength: 9, region: "Europe" },
    { code: "+351", country: "PT", name: "Portugal", minLength: 9, region: "Europe" },
    { code: "+30", country: "GR", name: "Greece", minLength: 10, region: "Europe" },
    { code: "+353", country: "IE", name: "Ireland", minLength: 9, region: "Europe" },
    { code: "+358", country: "FI", name: "Finland", minLength: 9, region: "Europe" },
    { code: "+354", country: "IS", name: "Iceland", minLength: 7, region: "Europe" },
    { code: "+372", country: "EE", name: "Estonia", minLength: 8, region: "Europe" },
    { code: "+371", country: "LV", name: "Latvia", minLength: 8, region: "Europe" },
    { code: "+370", country: "LT", name: "Lithuania", minLength: 8, region: "Europe" },
    { code: "+36", country: "HU", name: "Hungary", minLength: 9, region: "Europe" },
    { code: "+420", country: "CZ", name: "Czech Republic", minLength: 9, region: "Europe" },
    { code: "+421", country: "SK", name: "Slovakia", minLength: 9, region: "Europe" },
    { code: "+385", country: "HR", name: "Croatia", minLength: 9, region: "Europe" },
    { code: "+386", country: "SI", name: "Slovenia", minLength: 8, region: "Europe" },
    { code: "+387", country: "BA", name: "Bosnia and Herzegovina", minLength: 8, region: "Europe" },
    { code: "+389", country: "MK", name: "North Macedonia", minLength: 8, region: "Europe" },
    { code: "+359", country: "BG", name: "Bulgaria", minLength: 9, region: "Europe" },
    { code: "+40", country: "RO", name: "Romania", minLength: 10, region: "Europe" },
    { code: "+355", country: "AL", name: "Albania", minLength: 9, region: "Europe" },
    { code: "+381", country: "RS", name: "Serbia", minLength: 9, region: "Europe" },
    { code: "+382", country: "ME", name: "Montenegro", minLength: 8, region: "Europe" },
    { code: "+383", country: "XK", name: "Kosovo", minLength: 8, region: "Europe" },
    { code: "+380", country: "UA", name: "Ukraine", minLength: 9, region: "Europe" },
    { code: "+375", country: "BY", name: "Belarus", minLength: 9, region: "Europe" },
    { code: "+373", country: "MD", name: "Moldova", minLength: 8, region: "Europe" },
    { code: "+356", country: "MT", name: "Malta", minLength: 8, region: "Europe" },
    { code: "+357", country: "CY", name: "Cyprus", minLength: 8, region: "Europe" },
    { code: "+352", country: "LU", name: "Luxembourg", minLength: 9, region: "Europe" },
    { code: "+350", country: "GI", name: "Gibraltar", minLength: 8, region: "Europe" },
    { code: "+377", country: "MC", name: "Monaco", minLength: 9, region: "Europe" },
    { code: "+378", country: "SM", name: "San Marino", minLength: 10, region: "Europe" },
    { code: "+376", country: "AD", name: "Andorra", minLength: 6, region: "Europe" },
    { code: "+39", country: "VA", name: "Vatican City", minLength: 9, region: "Europe" },

    // ========== AFRICA ==========
    { code: "+27", country: "ZA", name: "South Africa", minLength: 9, region: "Africa" },
    { code: "+20", country: "EG", name: "Egypt", minLength: 10, region: "Africa" },
    { code: "+234", country: "NG", name: "Nigeria", minLength: 10, region: "Africa" },
    { code: "+254", country: "KE", name: "Kenya", minLength: 9, region: "Africa" },
    { code: "+233", country: "GH", name: "Ghana", minLength: 9, region: "Africa" },
    { code: "+212", country: "MA", name: "Morocco", minLength: 9, region: "Africa" },
    { code: "+213", country: "DZ", name: "Algeria", minLength: 9, region: "Africa" },
    { code: "+216", country: "TN", name: "Tunisia", minLength: 8, region: "Africa" },
    { code: "+218", country: "LY", name: "Libya", minLength: 9, region: "Africa" },
    { code: "+249", country: "SD", name: "Sudan", minLength: 9, region: "Africa" },
    { code: "+251", country: "ET", name: "Ethiopia", minLength: 9, region: "Africa" },
    { code: "+255", country: "TZ", name: "Tanzania", minLength: 9, region: "Africa" },
    { code: "+256", country: "UG", name: "Uganda", minLength: 9, region: "Africa" },
    { code: "+257", country: "BI", name: "Burundi", minLength: 8, region: "Africa" },
    { code: "+250", country: "RW", name: "Rwanda", minLength: 9, region: "Africa" },
    { code: "+260", country: "ZM", name: "Zambia", minLength: 9, region: "Africa" },
    { code: "+263", country: "ZW", name: "Zimbabwe", minLength: 9, region: "Africa" },
    { code: "+264", country: "NA", name: "Namibia", minLength: 9, region: "Africa" },
    { code: "+265", country: "MW", name: "Malawi", minLength: 9, region: "Africa" },
    { code: "+266", country: "LS", name: "Lesotho", minLength: 8, region: "Africa" },
    { code: "+267", country: "BW", name: "Botswana", minLength: 8, region: "Africa" },
    { code: "+268", country: "SZ", name: "Eswatini", minLength: 8, region: "Africa" },
    { code: "+236", country: "CF", name: "Central African Republic", minLength: 8, region: "Africa" },
    { code: "+235", country: "TD", name: "Chad", minLength: 8, region: "Africa" },
    { code: "+237", country: "CM", name: "Cameroon", minLength: 9, region: "Africa" },
    { code: "+238", country: "CV", name: "Cape Verde", minLength: 7, region: "Africa" },
    { code: "+239", country: "ST", name: "São Tomé and Príncipe", minLength: 7, region: "Africa" },
    { code: "+240", country: "GQ", name: "Equatorial Guinea", minLength: 9, region: "Africa" },
    { code: "+241", country: "GA", name: "Gabon", minLength: 8, region: "Africa" },
    { code: "+242", country: "CG", name: "Republic of the Congo", minLength: 9, region: "Africa" },
    { code: "+243", country: "CD", name: "DR Congo", minLength: 9, region: "Africa" },
    { code: "+244", country: "AO", name: "Angola", minLength: 9, region: "Africa" },
    { code: "+245", country: "GW", name: "Guinea-Bissau", minLength: 7, region: "Africa" },
    { code: "+220", country: "GM", name: "Gambia", minLength: 7, region: "Africa" },
    { code: "+221", country: "SN", name: "Senegal", minLength: 9, region: "Africa" },
    { code: "+222", country: "MR", name: "Mauritania", minLength: 8, region: "Africa" },
    { code: "+223", country: "ML", name: "Mali", minLength: 8, region: "Africa" },
    { code: "+224", country: "GN", name: "Guinea", minLength: 9, region: "Africa" },
    { code: "+225", country: "CI", name: "Ivory Coast", minLength: 10, region: "Africa" },
    { code: "+226", country: "BF", name: "Burkina Faso", minLength: 8, region: "Africa" },
    { code: "+227", country: "NE", name: "Niger", minLength: 8, region: "Africa" },
    { code: "+228", country: "TG", name: "Togo", minLength: 8, region: "Africa" },
    { code: "+229", country: "BJ", name: "Benin", minLength: 8, region: "Africa" },
    { code: "+230", country: "MU", name: "Mauritius", minLength: 8, region: "Africa" },
    { code: "+231", country: "LR", name: "Liberia", minLength: 8, region: "Africa" },
    { code: "+232", country: "SL", name: "Sierra Leone", minLength: 8, region: "Africa" },
    { code: "+252", country: "SO", name: "Somalia", minLength: 8, region: "Africa" },
    { code: "+253", country: "DJ", name: "Djibouti", minLength: 8, region: "Africa" },
    { code: "+258", country: "MZ", name: "Mozambique", minLength: 9, region: "Africa" },
    { code: "+261", country: "MG", name: "Madagascar", minLength: 9, region: "Africa" },
    { code: "+262", country: "RE", name: "Réunion", minLength: 9, region: "Africa" },
    { code: "+269", country: "KM", name: "Comoros", minLength: 7, region: "Africa" },
    { code: "+290", country: "SH", name: "Saint Helena", minLength: 4, region: "Africa" },
    { code: "+291", country: "ER", name: "Eritrea", minLength: 7, region: "Africa" },

    // ========== OCEANIA ==========
    { code: "+61", country: "AU", name: "Australia", minLength: 9, region: "Oceania" },
    { code: "+64", country: "NZ", name: "New Zealand", minLength: 8, region: "Oceania" },
    { code: "+679", country: "FJ", name: "Fiji", minLength: 7, region: "Oceania" },
    { code: "+678", country: "VU", name: "Vanuatu", minLength: 7, region: "Oceania" },
    { code: "+677", country: "SB", name: "Solomon Islands", minLength: 7, region: "Oceania" },
    { code: "+676", country: "TO", name: "Tonga", minLength: 7, region: "Oceania" },
    { code: "+675", country: "PG", name: "Papua New Guinea", minLength: 8, region: "Oceania" },
    { code: "+686", country: "KI", name: "Kiribati", minLength: 5, region: "Oceania" },
    { code: "+687", country: "NC", name: "New Caledonia", minLength: 6, region: "Oceania" },
    { code: "+688", country: "TV", name: "Tuvalu", minLength: 5, region: "Oceania" },
    { code: "+689", country: "PF", name: "French Polynesia", minLength: 6, region: "Oceania" },
    { code: "+691", country: "FM", name: "Micronesia", minLength: 7, region: "Oceania" },
    { code: "+692", country: "MH", name: "Marshall Islands", minLength: 7, region: "Oceania" },
    { code: "+684", country: "AS", name: "American Samoa", minLength: 7, region: "Oceania" },
    { code: "+685", country: "WS", name: "Samoa", minLength: 5, region: "Oceania" },
    { code: "+683", country: "NU", name: "Niue", minLength: 4, region: "Oceania" },
];

/**
 * Minimum national-number length (digits without country prefix) for an ISO country code.
 * Use this when the UI selects by country (US vs CA) so shared dial codes (+1, +7, +39) resolve correctly.
 */
export const getMinLengthForCountryIso = (iso: string): number => {
    const country = countryCodes.find((c) => c.country === iso);
    return country?.minLength ?? 8;
};

/**
 * Get minimum phone number length for a dial code.
 * Ambiguous when several countries share one code (e.g. +1); prefer getMinLengthForCountryIso when possible.
 * @param countryCode - The country code (e.g., "+880", "+1")
 * @returns Minimum length required for the phone number (default: 8)
 */
export const getMinLengthForCountry = (countryCode: string): number => {
    const country = countryCodes.find((c) => c.code === countryCode);
    return country?.minLength ?? 8;
};

/**
 * Get countries by region
 * @param region - The region name (e.g., "Asia", "Europe", "North America")
 * @returns Array of country codes for the specified region
 */
export const getCountriesByRegion = (region: string): CountryCode[] => {
    return countryCodes.filter((c) => c.region === region);
};

/**
 * Get all available regions
 * @returns Array of unique region names
 */
export const getRegions = (): string[] => {
    const regions = countryCodes
        .map((c) => c.region)
        .filter((r): r is string => r !== undefined);
    return Array.from(new Set(regions)).sort();
};
