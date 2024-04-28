import { cookies } from 'next/headers';
import { isLocale, translation } from './i18n';

export function getServerTranslation() {
	const locale = getServerLocale();

	return translation[locale];
}

export function getServerLocale() {
	const locale = cookies().get('locale')?.value;

	if (typeof locale === 'string' && isLocale(locale)) {
		return locale;
	}

	return 'pl';
}
