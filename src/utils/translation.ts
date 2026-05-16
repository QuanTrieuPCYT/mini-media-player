import translations from '../translations';
import { HomeAssistant } from '../types';

const DEFAULT_LANG = 'en';

const getNestedProp = (obj, path) => path.split('.').reduce((p, c) => (p && p[c]) || null, obj);

const translation = (hass: HomeAssistant, label: string, hassLabel?: string, fallback = 'unknown'): string => {
  const lang = (hass.selectedLanguage || hass.language || DEFAULT_LANG) as string;
  const l639 = lang.split('-')[0];
  const resources = hass.resources || {};
  return (
    (translations[lang] && getNestedProp(translations[lang], label)) ||
    (resources[lang] && hassLabel && resources[lang][hassLabel]) ||
    (translations[l639] && getNestedProp(translations[l639], label)) ||
    (resources[l639] && hassLabel && resources[l639][hassLabel]) ||
    getNestedProp(translations[DEFAULT_LANG], label) ||
    fallback
  );
};

export default translation;
