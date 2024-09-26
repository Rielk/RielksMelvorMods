const { loadModule } = mod.getContext(import.meta);

const languages = {
    'en': 'src/language/en.mjs'
};

class TranslationManager {
    async syncLang() {
        if (this.setLang == setLang)
            return;
        this.setLang = setLang;
        if (this.setLang === 'lemon' || this.setLang === 'carrot') {
            this.setLang = 'en';
        }
        const loadPath = languages[this.setLang];
        if (loadPath == undefined){
            console.error(`No language file specified for language: '${this.setLang}'`)
            this.loadedLangJson = {};
        }
        else {
            const { language } = await loadModule(loadPath);
            this.loadedLangJson = language;
        }
    }
}

const tm = new TranslationManager();
await tm.syncLang();

export function getRielkLangString(identifier) {
    const translation = tm.loadedLangJson[identifier];
    if (translation === undefined || translation === '') {
        if (DEBUGENABLED) {
            console.warn(`Tried to get unknown language string: ${identifier}`);
        }
        return `UNDEFINED TRANSLATION: (RIELK) :${identifier}`;
    }
    return translation;
}

export function templateRielkLangString(identifier, templateData) {
    return templateString(getRielkLangString(identifier), templateData);
}

export function patchTranslations(ctx) {
    const superSetLanguage = setLanguage;
    setLanguage = (...args) => {
        superSetLanguage(...args);
        tm.syncLang();
    }

    const superUpdateUIForLanguageChange = updateUIForLanguageChange;
    updateUIForLanguageChange = (...args) => {
        superUpdateUIForLanguageChange(...args);
        if (window.customElements.get('rielk-lang-string')) {
            const langStrings = document.getElementsByTagName('rielk-lang-string');
            for (let i = 0; i < langStrings.length; i++) {
                langStrings[i].updateTranslation();
            }
        }
    }

    ctx.patch(Item, 'name').get(function (patch) {
        if (this.namespace === 'rielkConstruction') 
            return getRielkLangString(`ITEM_NAME_${this.localID}`);
        return patch();
    });
    ctx.patch(Item, 'description').get(function (patch) {
        if (this.namespace === 'rielkConstruction' && this._customDescription !== undefined) 
            return getRielkLangString(`ITEM_DESCRIPTION_${this.localID}`);
        return patch();
    });
    ctx.patch(ShopPurchase, 'name').get(function (patch) {
        if (this.namespace === 'rielkConstruction' && this._customName !== undefined)
            return getRielkLangString(`SHOP_NAME_${this.localID}`);
        return patch();
    });
    ctx.patch(ShopPurchase, 'description').get(function (patch) {
        if (this.namespace === 'rielkConstruction' && this._customDescription !== undefined) 
            return getRielkLangString(`SHOP_DESCRIPTION_${this.localID}`);
        return patch();
    });
    ctx.patch(HerbloreRecipe, 'name').get(function (patch) {
        if (this.namespace === 'rielkConstruction') 
            return getRielkLangString(`POTION_NAME_${this.localID}`);
        return patch();
    });
    ctx.patch(Pet, 'name').get(function (patch) {
        if (this.namespace === 'rielkConstruction')
            return getLangString(`PET_NAME_${this.localID}`);
        return patch();
    });
}