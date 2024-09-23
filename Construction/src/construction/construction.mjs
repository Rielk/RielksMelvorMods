const { loadModule, characterStorage, onCharacterLoaded, onInterfaceReady } = mod.getContext(import.meta);

const { ConstructionActionEvent } = await loadModule('src/construction/gameEvents.mjs');
const { ConstructionStats } = await loadModule('src/construction/statistics.mjs');

export class Construction extends ArtisanSkill {
    constructor(namespace, game) {
        super(namespace, 'Construction', game, ConstructionRecipe.name);
        this._media = 'assets/icon.png';
        this.baseInterval = 3000;
        this.ui = undefined;
        this.categories = new NamespaceRegistry(game.registeredNamespaces, 'ConstructionCategory');
        this.rooms = new NamespaceRegistry(game.registeredNamespaces,'ConstructionRoom');
        this.fixtures = new NamespaceRegistry(game.registeredNamespaces,'ConstructionFixture');
        this.fixtureRecipes = new NamespaceRegistry(game.registeredNamespaces,'ConstructionFixtureRecipes');
        this.hiddenRooms = new Set();
    }

    get renderQueue() {
        return this.ui.renderQueue;
    }

    isMasteryActionUnlocked(action) {
        return this.isBasicSkillRecipeUnlocked(action);
    }

    get selectionTabs() {
        return this.ui.constructionSelectionTabs;
    }

    get menu() {
        return this.ui.constructionArtisanMenu;
    }
    get categoryMenu() {
        return this.ui.constructionCategoryMenu;
    }
    get noCostsMessage() {
        return getLangString('TOASTS_MATERIALS_REQUIRED_TO_CRAFT');
    }
    get actionItem() {
        return this.activeRecipe.product;
    }
    get unmodifiedActionQuantity() {
        return this.activeRecipe.baseQuantity;
    }
    get activeRecipe() {
        if (this.selectedRecipe === undefined)
            throw new Error('Tried to get active crafting recipe, but none is selected.');
        return this.selectedRecipe;
    }
    get masteryModifiedInterval() {
        return 1700;
    }

    getFixtureInterval(fixture) {
        return this.actionInterval;
    }

    registerData(namespace, data) {
        var _a, _b, _c, _d, _e;
        (_a = data.categories) === null || _a === void 0 ? void 0 : _a.forEach((categoryData)=>{
            this.categories.registerObject(new ConstructionCategory(namespace,categoryData,this,this.game));
        }
        );
        (_b = data.recipes) === null || _b === void 0 ? void 0 : _b.forEach((recipeData)=>{
            this.actions.registerObject(new ConstructionRecipe(namespace,recipeData,this.game,this));
        }
        );
        (_c = data.fixtureRecipes ) === null || _c === void 0 ? void 0 : _c.forEach((fixtureRecipeData)=>{
            this.fixtureRecipes.registerObject(new ConstructionFixtureRecipes(namespace,fixtureRecipeData,this.game));
        }
        );
        (_d = data.fixtures ) === null || _d === void 0 ? void 0 : _d.forEach((fixtureData)=>{
            this.fixtures.registerObject(new ConstructionFixture(namespace,fixtureData,this.game,this));
        }
        );
        (_e = data.rooms) === null || _e === void 0 ? void 0 : _e.forEach((roomData)=>{
            this.rooms.registerObject(new ConstructionRoom(namespace,roomData,this.game,this));
        }
        );
        super.registerData(namespace, data);
    }
    modifyData(data) {
        var _a, _b, _c;
        super.modifyData(data);
        (_a = data.recipes) === null || _a === void 0 ? void 0 : _a.forEach((modData)=>{
            const recipe = this.actions.getObjectByID(modData.id);
            if (recipe === undefined)
                throw new UnregisteredDataModError(ConstructionRecipe.name, modData.id);
            recipe.applyDataModification(modData, this.game);
        }
        );
        (_b = data.rooms) === null || _b === void 0 ? void 0 : _b.forEach((modData)=>{
            const room = this.actions.getObjectByID(modData.id);
            if (room === undefined)
                throw new UnregisteredDataModError(ConstructionRecipe.name, modData.id);
            room.applyDataModification(modData, this.game);
        }
        );
        (_c = data.fixture) === null || _c === void 0 ? void 0 : _c.forEach((modData)=>{
            const fixture = this.actions.getObjectByID(modData.id);
            if (fixture === undefined)
                throw new UnregisteredDataModError(ConstructionRecipe.name, modData.id);
            fixture.applyDataModification(modData, this.game);
        }
        );
        (_d = data.fixtureRecipes) === null || _d === void 0 ? void 0 : _d.forEach((modData)=>{
            const fixtureRecipe = this.actions.getObjectByID(modData.id);
            if (fixtureRecipe === undefined)
                throw new UnregisteredDataModError(ConstructionRecipe.name, modData.id);
            fixtureRecipe.applyDataModification(modData, this.game);
        }
        );
        this.fixtures.forEach((fixture)=> {
            fixture.finaliseTiers();
        });
    }
    postDataRegistration() {
        super.postDataRegistration();
        this.sortedMasteryActions = sortRecipesByCategoryAndLevel(this.actions.allObjects, this.categories.allObjects);
        this.actions.forEach((action)=>{
            if (action.abyssalLevel > 0)
                this.abyssalMilestones.push(action);
            else
                this.milestones.push(action);
        }
        );
        this.sortMilestones();
    }
    onRealmChange() {
        super.onRealmChange();
        this.renderQueue.roomRealmVisibility = true;
        if (this.isActive)
            this.renderQueue.progressBar = true;
    }
    render() {
        super.render();
        this.ui.render();
    }
    getActionModifierQueryParams(action) {
        const scope = super.getActionModifierQueryParams(action);
        if (action instanceof ConstructionRecipe) {
            scope.category = action.category;
            scope.subcategory = action.subcategory;
        }
        return scope;
    }
    onMasteryLevelUp(action, oldLevel, newLevel) {
        super.onMasteryLevelUp(action, oldLevel, newLevel);
        if (this.selectedRecipe === action)
            this.renderQueue.selectedRecipe = true;
    }
    recordCostPreservationStats(costs) {
        super.recordCostPreservationStats(costs);
        costs.recordBulkItemStat(this.game.stats.Construction, ConstructionStats.ItemsPreserved);
    }
    recordCostConsumptionStats(costs) {
        super.recordCostConsumptionStats(costs);
        costs.recordBulkItemStat(this.game.stats.Construction, ConstructionStats.ItemsUsed);
    }
    preAction() {}
    get actionRewards() {
        const rewards = new Rewards(this.game);
        const recipe = this.activeRecipe;
        rewards.setActionInterval(this.actionInterval);
        const actionEvent = new ConstructionActionEvent(this,recipe);
        const item = recipe.product;
        const qtyToAdd = this.modifyPrimaryProductQuantity(item, this.unmodifiedActionQuantity, recipe);
        rewards.addItem(item, qtyToAdd);
        this.addCurrencyFromPrimaryProductGain(rewards, item, qtyToAdd, recipe);
        actionEvent.productQuantity = qtyToAdd;
        this.game.stats.Construction.add(ConstructionStats.ItemsProduced, qtyToAdd);
        rewards.addXP(this, this.actionXP, recipe);
        rewards.addAbyssalXP(this, this.actionAbyssalXP, recipe);
        this.addCommonRewards(rewards, recipe);
        actionEvent.interval = this.currentActionInterval;
        this._events.emit('action', actionEvent);
        return rewards;
    }
    postAction() {
        this.game.stats.Construction.inc(ConstructionStats.Actions);
        this.game.stats.Construction.add(ConstructionStats.TimeSpent, this.currentActionInterval);
        this.renderQueue.recipeInfo = true;
        this.renderQueue.quantities = true;
    }

    getRegistry(type) {
        switch (type) {
        case ScopeSourceType.Category:
            return this.categories;
        case ScopeSourceType.Action:
            return this.actions;
        case ScopeSourceType.Subcategory:
            return this.subcategories;
        }
    }

    onLoad() {
        super.onLoad();
        this.renderQueue.menu = true;
        this.renderQueue.fictureUnlock = true;
        this.selectRealm(this.currentRealm);
        onCharacterLoaded(async () => {
            const hrData = characterStorage.getItem('HiddenRooms');
            if (hrData !== undefined){
                hrData.forEach(roomID => {
                    const room = this.rooms.getObjectByID(roomID)
                    if (room !== undefined)
                        this.hiddenRooms.add(room);
                });
            }
        });
        onInterfaceReady(async() => {
            this.ui.renderVisibleRooms();
            this.render();
        });
        this.render();
    }
    encode(writer) {
        super.encode(writer);
        if (this.hiddenRooms.size > 0) {
            const hrData = Array.from(Array.from(this.hiddenRooms).map(r => r.id));
            characterStorage.setItem('HiddenRooms', hrData);
        }
        else
            characterStorage.removeItem('HiddenRooms');
    }
}

class ConstructionCategory extends SkillCategory {
    constructor(namespace, data, skill, game) {
        super(namespace, data, skill, game);
        try {
            this.type = data.type;
        } catch (e) {
            throw new DataConstructionError(ConstructionCategory.name, e, this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
            this.type = data.type;
        } catch (e) {
            throw new DataModificationError(ConstructionCategory.name,e,this.id);
        }
    }
}

class ConstructionRecipe extends SingleProductArtisanSkillRecipe {
    constructor(namespace, data, game, skill) {
        super(namespace, data, game, skill);
        try {
        } catch (e) {
            throw new DataConstructionError(ConstructionRecipe.name,e,this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
        } catch (e) {
            throw new DataModificationError(ConstructionRecipe.name,e,this.id);
        }
    }
}

class ConstructionRoom extends RealmedObject {
    constructor(namespace, data, game, construction) {
        super(namespace, data, game);
        try {
            if (data.fixtures == undefined)
                throw new Error('No fixtures specified in data.')
            this.fixtures = construction.fixtures.getArrayFromIds(data.fixtures);
            this.fixtures.forEach((fixture)=>{
                if (fixture.room !== undefined)
                    throw new Error(`ConstructionFixture with id: ${fixture.id} is already assigned to a ConstructionRoom.`);
                fixture.room = this;
            });
        } catch (e) {
            throw new DataConstructionError(ConstructionRoom.name, e, this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
        } catch (e) {
            throw new DataModificationError(ConstructionRecipe.name,e,this.id);
        }
    }
}

class ConstructionFixture extends RealmedObject {
    constructor(namespace, data, game, construction) {
        super(namespace, data, game);
        try {
            this._media_folder = data.media_folder;
            if (data.recipes == undefined)
                throw new Error('No tiers specified in data.')
            var i = 0;
            this.recipes = construction.fixtureRecipes.getArrayFromIds(data.recipes);
            this.recipes.forEach((recipe)=>{
                i += 1;
                if (recipe.fixture !== undefined)
                    throw new Error(`ConstructionFixtureRecipes with id: ${recipe.id} is already set to a ConstructionFixture.`);
                recipe.fixture = this;
                recipe.tier = i;
            });
        } catch (e) {
            throw new DataConstructionError(ConstructionFixture.name, e, this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
            this._media_folder = data.media;
        } catch (e) {
            throw new DataModificationError(ConstructionFixture.name,e,this.id);
        }
    }
    get media() {
        return this.mediaForTier('icon');
    }
    mediaForTier(tier) {
        return this.getMediaURL(`${this._media_folder}/${tier}.png`);
    }
    getRecipe(tier) {
        return this.recipes[tier-1];
    }
}

class ConstructionFixtureRecipes extends ArtisanSkillRecipe { 
    constructor(namespace, data, game) {
        super(namespace, data, game);
        try {
            this.baseActionCost = data.baseActionCost;
        } catch (e) {
            throw new DataConstructionError(ConstructionFixtureRecipes.name, e, this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
            this.baseActionCost = data.baseActionCost;
        }
        catch (e) {
            throw new DataModificationError(ConstructionFixtureRecipes.name, e, this.id);
        }
    }
    get media() {
        return this.fixture.mediaForTier(this.tier);
    }
}
