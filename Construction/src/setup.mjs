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
        Object.defineProperty(this, 'ctx', {
            value: ctx,
            writable: false
        });
    }

    async loadData() {
        await this.ctx.gameData.addPackage('src/data/data.json');
    }

    async createInterface() {
        const UI = new ConstructionInterface(this.ctx, game.construction);
    }
}