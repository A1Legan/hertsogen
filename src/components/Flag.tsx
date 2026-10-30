import { countryCode } from '@/src/lib/countries';

export function Flag({ country }: { country: string }) {
    const code = countryCode(country);

    if (!code) return null;

    return (
        <img
            src={`https://flagcdn.com/24x18/${code}.png`}
            alt={country.replace(/-/g, ' ')}
            title={country.replace(/-/g, ' ')}
            width={24}
            height={18}
            className="inline-block h-[13px] w-[18px] border border-black/20 object-cover align-middle"
        />
    );
}
