const { loadModule, loadTemplates, loadStylesheet } = mod.getContext(import.meta);

const { Construction } = await loadModule('src/construction/construction.mjs');
const { patchTranslations } = await loadModule('src/language/translationManager.mjs');
const { patchGameEventSystem } = await loadModule('src/construction/gameEvents.mjs');

export async function setup(ctx) {
    setup = new Setup(ctx);
    await setup.loadInterfaceElements();
    
    game.construction = game.registerSkill(game.registeredNamespaces.getNamespace('rielkConstruction'), Construction);

    await setup.applyPatches();
    await setup.loadData();
}

class Setup {
    constructor(ctx) {
        this.ctx = ctx;
    }

    async loadInterfaceElements() {
        await loadStylesheet('src/interface/construction-styles.css');

        await loadTemplates('src/interface/templates/construction.html');

        await loadModule('src/interface/elements/constructionFixtureNavElement.mjs');
        await loadModule('src/interface/elements/constructionModifierDisplay.mjs');
        await loadModule('src/interface/elements/constructionRecipeOptionElement.mjs');
        await loadModule('src/interface/elements/constructionRoomPanelElement.mjs');
        await loadModule('src/interface/elements/constructionUpgradesPanel.mjs');
        await loadModule('src/interface/elements/rielkLangStringElement.mjs');
    }

    async applyPatches() {
        patchGameEventSystem(this.ctx);
        patchTranslations(this.ctx);
    }

    async loadData() {
        await this.ctx.gameData.addPackage('src/data/data.json');
    }
}
