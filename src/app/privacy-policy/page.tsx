import type { Metadata } from 'next';
import { Shell, PageHeading } from '@/src/components/Shell';

export const metadata: Metadata = {
    title: 'Политика конфиденциальности',
};

/**
 * ЗАГОТОВКА. Текст перенесён из прототипа в сокращённом виде.
 * Перед публичным запуском его стоит показать кому-то, кто разбирается
 * в требованиях к таким документам — я не юрист и он не проверен.
 */
export default function PrivacyPolicyPage() {
    return (
        <Shell>
            <PageHeading title="Политика конфиденциальности" />

            <div className="space-y-6 p-4 text-gray-700 sm:p-6">
                <p>
                    Сайт H&amp;CR не требует регистрации и не собирает персональные данные
                    посетителей: мы не просим указывать имя, почту или другие сведения.
                </p>

                <div>
                    <h2 className="mb-2 font-bold text-gray-900">Данные игроков</h2>
                    <p>
                        Никнеймы, страны и результаты игроков берутся из открытого API{' '}
                        <a
                            href="https://demonlist.org/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-orange-600 underline"
                        >
                            Global Demonlist
                        </a>{' '}
                        и отображаются в том виде, в каком опубликованы там. Если вы игрок и
                        хотите, чтобы ваши данные не показывались у нас, напишите нам в Telegram.
                    </p>
                </div>

                <div>
                    <h2 className="mb-2 font-bold text-gray-900">Внешние сервисы</h2>
                    <p>
                        На страницах используются изображения с YouTube (превью прохождений) и
                        flagcdn.com (флаги стран). При загрузке этих изображений ваш браузер
                        обращается к серверам соответствующих сервисов.
                    </p>
                </div>

                <div>
                    <h2 className="mb-2 font-bold text-gray-900">Связь</h2>
                    <p>
                        По любым вопросам:{' '}
                        <a
                            href="https://t.me/hertzogen2007"
                            className="text-orange-600 underline"
                        >
                            Telegram
                        </a>
                        .
                    </p>
                </div>
            </div>
        </Shell>
    );
}
