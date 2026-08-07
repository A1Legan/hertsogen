import { countryCode } from '@/src/lib/countries';

/**
 * Флаг страны игрока.
 *
 * У 40% игроков страна не указана (в API приходит 'Unknown').
 * В таком случае НИЧЕГО не рисуем — пустое место читается честно,
 * а серый глобус выглядел бы как сломанная картинка.
 *
 * Картинки берутся с flagcdn.com. Это внешний сервис: если однажды
 * захочешь независимости, скачай набор флагов в public/images/flags/
 * и поменяй src здесь — больше нигде правки не понадобятся.
 *
 * Используем обычный <img>, а не next/image: флаги крошечные,
 * оптимизировать нечего, зато не нужно прописывать домен в конфиге.
 */
export function Flag({ country }: { country: string }) {
    const code = countryCode(country);

    if (!code) return null;

    return (
        // eslint-disable-next-line @next/next/no-img-element
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
