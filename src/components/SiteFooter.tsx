import Link from 'next/link';
import Image from 'next/image';

export function SiteFooter() {
    return (
        <footer className="mt-0 border-t-2 border-black bg-[#1a1a1a] py-12 text-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
                <Link href="/" className="opacity-60 transition-opacity hover:opacity-100">
                    <Image
                        src="/logo.png"
                        alt="H&CR"
                        width={160}
                        height={64}
                        style={{ width: 'auto', height: '3rem' }}
                        className="sm:!h-16"
                    />
                </Link>

                <div className="flex flex-wrap justify-center gap-6">
                    <a
                        href="https://t.me/hertzogen2007"
                        className="text-base font-bold uppercase text-gray-400 transition-colors hover:text-orange-500 sm:text-lg"
                    >
                        Telegram
                    </a>
                    <a
                        href="https://www.youtube.com/@hertzogen"
                        className="text-base font-bold uppercase text-gray-400 transition-colors hover:text-orange-500 sm:text-lg"
                    >
                        YouTube
                    </a>
                    <a
                        href="https://demonlist.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-base font-bold uppercase text-gray-400 transition-colors hover:text-orange-500 sm:text-lg"
                    >
                        demonlist
                    </a>
                </div>

                <Link
                    href="/privacy-policy"
                    className="text-sm text-gray-500 underline transition-colors hover:text-white"
                >
                    Privacy Policy
                </Link>
            </div>

            <p className="px-6 py-3 text-center text-sm text-gray-500 sm:px-12 md:text-left">
                © 2026 H&amp;CR hertzogen. Данные списка — Global Demonlist.
            </p>
        </footer>
    );
}
