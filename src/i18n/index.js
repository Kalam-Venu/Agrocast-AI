import { te } from './translations/te';
import { en } from './translations/en';

export const translations = {
  te,
  en,
};

export function getTranslation(lang, path) {
  const dictionary = translations[lang] || translations.te;
  const parts = path.split('.');
  let current = dictionary;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to Telugu dictionary
      let fallback = translations.te;
      for (const fPart of parts) {
        if (fallback && typeof fallback === 'object' && fPart in fallback) {
          fallback = fallback[fPart];
        } else {
          return path;
        }
      }
      return fallback || path;
    }
  }
  return current || path;
}
