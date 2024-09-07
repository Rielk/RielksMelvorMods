const { loadModule } = mod.getContext(import.meta);

const { en }= await loadModule('src/language/en.mjs');

const languages = {
    'en': en
};

export class TranslationManager {
    init() {
        let lang = setLang;
        if (lang === 'lemon' || lang === 'carrot') {
            lang = 'en';
        }

        for (const [key, value] of Object.entries(languages[lang])) {
            loadedLangJson[key] = value;
        }
    }
}
