const { loadModule } = mod.getContext(import.meta);

const { Construction } = await loadModule('src/construction/construction.mjs');
const { ConstructionInterface } = await loadModule('src/interface/constructionInterface.mjs');
const { TranslationManager } = await loadModule('src/language/translationManager.mjs');
const { patchGameEventSystem } = await loadModule('src/construction/gameEvents.mjs');
const { patchStatistics } = await loadModule('src/construction/statistics.mjs');

export async function setup(ctx) {
    setup = new Setup(ctx);
    
    game.construction = game.registerSkill(game.registeredNamespaces.getNamespace('rielkConstruction'), Construction);

    await setup.applyPatches();
    await setup.loadData();
    await setup.createInterface();

    const tm = new TranslationManager();
    tm.init();
}

class Setup {
    constructor(ctx) {
        this.ctx = ctx;
    }

    async applyPatches() {
        patchGameEventSystem(this.ctx);
        patchStatistics(this.ctx);
        this.patchTranslations(this.ctx);
    }

    async loadData() {
        await this.ctx.gameData.addPackage('src/data/data.json');
    }

    async createInterface() {
        await this.ctx.loadTemplates('src/interface/templates/construction.html');
        const ui = new ConstructionInterface(this.ctx, game.construction);
        game.construction.ui = ui;
    }

    patchTranslations(ctx) {
        ctx.patch(Item, 'name').get(function (patch) {
            if (this.namespace === 'rielkConstruction') 
                return getLangString(`RIELK_ITEM_NAME_${this.localID}`);
            return patch();
        });
        ctx.patch(Item, 'description').get(function (patch) {
            if (this.namespace === 'rielkConstruction' && this._customDescription !== undefined) 
                return getLangString(`RIELK_ITEM_DESCRIPTION_${this.localID}`);
            return patch();
        });
        ctx.patch(ShopPurchase, 'name').get(function (patch) {
            if (this.namespace === 'rielkConstruction' && this._customName !== undefined)
                return getLangString(`RIELK_SHOP_NAME_${this.localID}`);
            return patch();
        });
        ctx.patch(ShopPurchase, 'description').get(function (patch) {
            if (this.namespace === 'rielkConstruction' && this._customDescription !== undefined) 
                return getLangString(`RIELK_SHOP_DESCRIPTION_${this.localID}`);
            return patch();
        });
        ctx.patch(HerbloreRecipe, 'name').get(function (patch) {
            if (this.namespace === 'rielkConstruction') 
                return getLangString(`RIELK_POTION_NAME_${this.localID}`);
            return patch();
        });
        ctx.patch(Pet, 'name').get(function (patch) {
            if (this.namespace === 'rielkConstruction')
                return getLangString(`RIELK_PET_NAME_${this.localID}`);
            return patch();
        });
    }
}
