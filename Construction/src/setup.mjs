const { loadModule } = mod.getContext(import.meta);

const { Construction } = await loadModule('src/construction/construction.mjs');
const { ConstructionInterface } = await loadModule('src/interface/constructionInterface.mjs');
const { TranslationManager } = await loadModule('src/language/translationManager.mjs');

export async function setup(ctx) {
    setup = new Setup(ctx);
    
    game.construction = game.registerSkill(game.registeredNamespaces.getNamespace('rielkConstruction'), Construction);

    await setup.loadData();
    await setup.createInterface();

    const tm = new TranslationManager();
    tm.init();
}

class Setup {
    constructor(ctx) {
        this.ctx = ctx;
    }

    async loadData() {
        await this.ctx.gameData.addPackage('src/data/data.json');
    }

    async createInterface() {
        const UI = new ConstructionInterface(this.ctx, game.construction);
        game.construction.UI = UI;
    }
}