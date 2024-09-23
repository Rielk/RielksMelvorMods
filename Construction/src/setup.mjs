const { loadModule } = mod.getContext(import.meta);

const { Construction } = await loadModule('src/construction/construction.mjs');
const { ConstructionInterface } = await loadModule('src/interface/constructionInterface.mjs');
const { patchTranslations } = await loadModule('src/language/translationManager.mjs');
const { patchGameEventSystem } = await loadModule('src/construction/gameEvents.mjs');
const { patchStatistics } = await loadModule('src/construction/statistics.mjs');

export async function setup(ctx) {
    setup = new Setup(ctx);
    
    game.construction = game.registerSkill(game.registeredNamespaces.getNamespace('rielkConstruction'), Construction);

    await setup.applyPatches();
    await setup.loadData();
    await setup.createInterface();
}

class Setup {
    constructor(ctx) {
        this.ctx = ctx;
    }

    async applyPatches() {
        patchGameEventSystem(this.ctx);
        patchStatistics(this.ctx);
        patchTranslations(this.ctx);
    }

    async loadData() {
        await this.ctx.gameData.addPackage('src/data/data.json');
    }

    async createInterface() {
        await this.ctx.loadTemplates('src/interface/templates/construction.html');
        const ui = new ConstructionInterface(this.ctx, game.construction);
        game.construction.ui = ui;
    }
}
