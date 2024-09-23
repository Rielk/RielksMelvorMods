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
        const { language } = await loadModule(languages[this.setLang]);
        this.loadedLangJson = language;
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
        return `UNDEFINED TRANSLATION: :${identifier}`;
    }
    return translation;
}

export function patchTranslations(ctx) {
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