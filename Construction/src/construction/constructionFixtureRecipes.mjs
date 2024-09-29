const { loadModule } = mod.getContext(import.meta);

const { ConstructionModifiers } = await loadModule('src/construction/constructionModifier.mjs');

export class ConstructionFixtureRecipes extends CategorizedArtisanRecipe {
    constructor(namespace, data, game, skill) {
        super(namespace, data, game, skill);
        try {
            this._baseActionCost = data.baseActionCost;
            this.modifiers = new ConstructionModifiers(data, game, `${this.id}`);
        } catch (e) {
            throw new DataConstructionError(ConstructionFixtureRecipes.name, e, this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
            this._baseActionCost = data.baseActionCost;
            this.modifiers.applyDataModification(data, game);
        }
        catch (e) {
            throw new DataModificationError(ConstructionFixtureRecipes.name, e, this.id);
        }
    }
    get media() {
        return this.fixture.mediaForTier(this.tier);
    }
    get actionCost() {
        return this._baseActionCost;
    }
    get stats() {
        return this.modifiers._stats;
    }

    makeProgress() {
        this.fixture.progress++;
        this.skill.renderQueue.menu = true;
        if (this.fixture.progress >= this.actionCost) {
            this.fixture.upgrade();
            return false;
        }
        return true;
    }
}
