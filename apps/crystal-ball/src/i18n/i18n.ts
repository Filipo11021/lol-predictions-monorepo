import { en } from './en';
import { pl } from './pl';

export const translation = {
	pl,
	en,
};

export type Translation = typeof translation.pl;

export function isLocale(str: string): str is keyof typeof translation {
	return str in translation;
}

export function changeLocale(locale: keyof typeof translation) {
	document.cookie = `locale=${locale}`;
}

export function getLocale() {}
