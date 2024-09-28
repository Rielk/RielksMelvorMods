const { loadModule, onInterfaceReady } = mod.getContext(import.meta);

const { ConstructionActionEvent } = await loadModule('src/construction/gameEvents.mjs');
const { ConstructionStats } = await loadModule('src/construction/statistics.mjs');
const { getRielkLangString } = await loadModule('src/language/translationManager.mjs');
const { ConstructionInterface } = await loadModule('src/interface/constructionInterface.mjs');
const { Encoder } = await loadModule('src/construction/encoder.mjs');

export class Construction extends ArtisanSkill {
    constructor(namespace, game) {
        super(namespace, 'Construction', game, ConstructionRecipe.name);
        this._media = 'assets/icon.png';
        this.baseInterval = 3000;
        this.ui = undefined;
        this.categories = new NamespaceRegistry(game.registeredNamespaces, 'ConstructionCategory');
        this.rooms = new NamespaceRegistry(game.registeredNamespaces, 'ConstructionRoom');
        this.fixtures = new NamespaceRegistry(game.registeredNamespaces, 'ConstructionFixture');
        this.hiddenRooms = new Set();

        this._actionMode = undefined;

        this.stats = new StatTracker();
        game.stats.Construction = this.stats;
    }

    initMenus() {
        this.ui = new ConstructionInterface(this);
        super.initMenus(...arguments);
    }

    get name() {
        return getRielkLangString('SKILL_NAME_Construction');
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
    get noBuildCostsMessage() {
        return getRielkLangString('TOASTS_MATERIALS_REQUIRED_TO_BUILD');
    }
    get actionItem() {
        return this.activeRecipe.product;
    }
    get masteryAction() {
        return this.activeRecipe;
    }
    get masteryBuildAction() {
        return this.activeBuildRecipe;
    }
    get unmodifiedActionQuantity() {
        return this.activeRecipe.baseQuantity;
    }
    get activeRecipe() {
        if (this.selectedRecipe === undefined)
            throw new Error('Tried to get active crafting recipe, but none is selected.');
        return this.selectedRecipe;
    }
    get activeBuildRecipe() {
        if (this.selectedFixtureRecipe === undefined)
            throw new Error('Tried to get active building recipe, but none is selected.');
        return this.selectedFixtureRecipe;
    }
    getCurrentBuildRecipeCosts() {
        return this.getRecipeCosts(this.activeBuildRecipe);
    }
    get buildActionXP() {
        return this.activeBuildRecipe.baseExperience;
    }
    get buildActionAbyssalXP() {
        return this.activeBuildRecipe.baseAbyssalExperience;
    }

    get masteryModifiedInterval() {
        return 1700;
    }

    getFixtureInterval(fixture) {
        return this.modifyInterval(this.baseInterval, fixture);
    }

    createButtonOnClick() {
        if (this.isActive && this._actionMode != 0) {
            this.stop();
        }
        this._actionMode = 0;
        super.createButtonOnClick();
        if (!this.isActive)
            this._actionMode = undefined;
    }

    registerData(namespace, data) {
        var _a, _b, _c, _d, _e;
        (_a = data.categories) === null || _a === void 0 ? void 0 : _a.forEach((categoryData) => {
            this.categories.registerObject(new ConstructionCategory(namespace, categoryData, this, this.game));
        }
        );
        (_b = data.recipes) === null || _b === void 0 ? void 0 : _b.forEach((recipeData) => {
            this.actions.registerObject(new ConstructionRecipe(namespace, recipeData, this.game, this));
        }
        );
        (_c = data.fixtureRecipes) === null || _c === void 0 ? void 0 : _c.forEach((fixtureRecipeData) => {
            this.actions.registerObject(new ConstructionFixtureRecipes(namespace, fixtureRecipeData, this.game, this));
        }
        );
        (_d = data.fixtures) === null || _d === void 0 ? void 0 : _d.forEach((fixtureData) => {
            this.fixtures.registerObject(new ConstructionFixture(namespace, fixtureData, this.game, this));
        }
        );
        (_e = data.rooms) === null || _e === void 0 ? void 0 : _e.forEach((roomData) => {
            this.rooms.registerObject(new ConstructionRoom(namespace, roomData, this.game, this));
        }
        );
        super.registerData(namespace, data);
    }
    modifyData(data) {
        var _a, _b, _c, _d;
        super.modifyData(data);
        (_a = data.recipes) === null || _a === void 0 ? void 0 : _a.forEach((modData) => {
            const recipe = this.actions.getObjectByID(modData.id);
            if (recipe === undefined)
                throw new UnregisteredDataModError(ConstructionRecipe.name, modData.id);
            recipe.applyDataModification(modData, this.game);
        }
        );
        (_d = data.fixtureRecipes) === null || _d === void 0 ? void 0 : _d.forEach((modData) => {
            const fixtureRecipe = this.actions.getObjectByID(modData.id);
            if (fixtureRecipe === undefined)
                throw new UnregisteredDataModError(ConstructionRecipe.name, modData.id);
            fixtureRecipe.applyDataModification(modData, this.game);
        }
        );
        (_c = data.fixture) === null || _c === void 0 ? void 0 : _c.forEach((modData) => {
            const fixture = this.fixtures.getObjectByID(modData.id);
            if (fixture === undefined)
                throw new UnregisteredDataModError(ConstructionRecipe.name, modData.id);
            fixture.applyDataModification(modData, this.game);
        }
        );
        (_d = data.rooms) === null || _d === void 0 ? void 0 : _d.forEach((modData) => {
            const room = this.rooms.getObjectByID(modData.id);
            if (room === undefined)
                throw new UnregisteredDataModError(ConstructionRecipe.name, modData.id);
            room.applyDataModification(modData, this.game);
        }
        );
    }
    postDataRegistration() {
        super.postDataRegistration();
        this.sortedMasteryActions = sortRecipesByCategoryAndLevel(this.actions.allObjects.filter(act => act.category.type === 'Artisan'), this.categories.allObjects);
        this.actions.forEach((action) => {
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
    renderProgressBar() {
        //handled by ui.render();
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
        costs.recordBulkItemStat(this.stats, ConstructionStats.ItemsPreserved);
    }
    recordCostConsumptionStats(costs) {
        super.recordCostConsumptionStats(costs);
        costs.recordBulkItemStat(this.stats, ConstructionStats.ItemsUsed);
    }
    onStop() {
        super.onStop();
        this._actionMode = undefined;
    }
    preAction() { }
    get actionRewards() {
        const rewards = new Rewards(this.game);
        var recipe;
        rewards.setActionInterval(this.actionInterval);
        var actionEvent;
        switch (this._actionMode) {
            case 0: {
                recipe = this.activeRecipe;
                actionEvent = new ConstructionActionEvent(this, recipe);
                const item = recipe.product;
                const qtyToAdd = this.modifyPrimaryProductQuantity(item, this.unmodifiedActionQuantity, recipe);
                rewards.addItem(item, qtyToAdd);
                this.addCurrencyFromPrimaryProductGain(rewards, item, qtyToAdd, recipe);
                actionEvent.productQuantity = qtyToAdd;
                this.stats.add(ConstructionStats.ItemsProduced, qtyToAdd);
                rewards.addXP(this, this.actionXP, recipe);
                rewards.addAbyssalXP(this, this.actionAbyssalXP, recipe);
                break;
            }
            case 1: {
                recipe = this.activeBuildRecipe;
                actionEvent = new ConstructionActionEvent(this, recipe);
                this.stats.add(ConstructionStats.FixtureProgressBuilt, 1);
                rewards.addXP(this, this.buildActionXP, recipe);
                rewards.addAbyssalXP(this, this.buildActionAbyssalXP, recipe);
                break;
            }
        }
        this.addCommonRewards(rewards, recipe);
        actionEvent.interval = this.currentActionInterval;
        this._events.emit('action', actionEvent);
        return rewards;
    }
    postAction() {
        this.stats.inc(ConstructionStats.Actions);
        this.stats.add(ConstructionStats.TimeSpent, this.currentActionInterval);
        this.renderQueue.recipeInfo = true;
        this.renderQueue.quantities = true;
    }
    action() {
        switch (this._actionMode) {
            case 0:
                super.action();
                break;
            case 1:
                this.buildAction();
                break;
            case undefined():
                break;
        }
    }

    buildAction() {
        const recipeCosts = this.getCurrentBuildRecipeCosts();
        if (!recipeCosts.checkIfOwned()) {
            this.game.combat.notifications.add({
                type: 'Player',
                args: [this, this.noCostsMessage, 'danger']
            });
            this.stop();
            return;
        }
        this.preAction();
        const preserve = rollPercentage(this.getPreservationChance(this.masteryBuildAction));
        if (preserve) {
            this.game.combat.notifications.add({
                type: 'Preserve',
                args: [this]
            });
            this.recordCostPreservationStats(recipeCosts);
        } else {
            recipeCosts.consumeCosts();
            this.recordCostConsumptionStats(recipeCosts);
        }
        const continueSkill1 = this.addActionRewards();
        const continueSkill2 = this.selectedFixtureRecipe.makeProgress();
        this.postAction();
        const nextCosts = this.getCurrentBuildRecipeCosts();
        if (continueSkill1 && continueSkill2 && nextCosts.checkIfOwned()) {
            this.startActionTimer();
        } else {
            if (!nextCosts.checkIfOwned())
                this.game.combat.notifications.add({
                    type: 'Player',
                    args: [this, this.noCostsMessage, 'danger']
                });
            this.stop();
        }
    }

    toggleBuilding(room, fixture){
        if (this.isActive) {
            if (this._actionMode == 1) {
                this.stop();
                return;
            } else if (!this.stop())
                return;
        }
        if (room == undefined || fixture == undefined)
            return;
        this._actionMode = 1;
        this.selectedRoom = room;
        this.selectedFixture = fixture;
        this.selectedFixtureRecipe = fixture.currentRecipe;
        if (this.getCurrentRecipeCosts().checkIfOwned()) {
            this.start();
        } else {
            this._actionMode = undefined;
            notifyPlayer(this, this.noBuildCostsMessage, 'danger');
        }
        
    }
    getRegistry(type) {
        switch (type) {
            case ScopeSourceType.Category:
                return this.categories;
            case ScopeSourceType.Action:
                return this.actions;
        }
    }
    onAnyLevelUp() {
        super.onAnyLevelUp();
        this.renderQueue.fictureUnlock = true;
        this.renderQueue.menu = true;
    }
    onLoad() {
        super.onLoad();
        this.renderQueue.menu = true;
        this.renderQueue.fictureUnlock = true;
        this.selectRealm(this.currentRealm);
        onInterfaceReady(async () => {
            this.ui.renderVisibleRooms();
            this.render();
        });
        if (this._actionMode == 1) {
            var recipe = this.activeBuildRecipe;
            this.ui.switchConstructionCategory(recipe.category)
            this.ui.selectFixture(recipe.fixture, recipe.fixture.room, this);
        }
        this.render();
    }
    resetActionState() {
        super.resetActionState();
        this._actionMode = undefined;
        this.selectedRoom = undefined;
        this.selectedFixture = undefined;
        this.selectedFixtureRecipe = undefined;
    }
    encode(writer) {
        super.encode(writer);
        Encoder.encode(this, writer);
        return writer;
    }

    decode(reader, saveVersion) {
        super.decode(reader, saveVersion);
        Encoder.decode(this, reader);
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
            throw new DataModificationError(ConstructionCategory.name, e, this.id);
        }
    }
    get name() {
        return getRielkLangString(`SKILL_CATEGORY_ ${this.skill.localID}_ ${this.localID}`);
    }
}

class ConstructionRecipe extends SingleProductArtisanSkillRecipe {
    constructor(namespace, data, game, skill) {
        super(namespace, data, game, skill);
        try {
        } catch (e) {
            throw new DataConstructionError(ConstructionRecipe.name, e, this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
        } catch (e) {
            throw new DataModificationError(ConstructionRecipe.name, e, this.id);
        }
    }
}

class ConstructionRoom extends RealmedObject {
    constructor(namespace, data, game, construction) {
        super(namespace, data, game);
        try {
            this._name = data.name;
            if (data.fixtures == undefined)
                throw new Error('No fixtures specified in data.')
            this.fixtures = construction.fixtures.getArrayFromIds(data.fixtures);
            this.fixtures.forEach((fixture) => {
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
            throw new DataModificationError(ConstructionRecipe.name, e, this.id);
        }
    }
    get name() {
        return getRielkLangString(`CONSTRUCTION_ROOM_NAME_ ${this.localID}`);
    }
}

class ConstructionFixture extends RealmedObject {
    constructor(namespace, data, game, construction) {
        super(namespace, data, game);
        this.currentTier = 0;
        this.progress = 0;
        try {
            this._media_folder = data.media_folder;
            if (data.recipes == undefined)
                throw new Error('No tiers specified in data.')
            var i = 0;
            this.recipes = construction.actions.getArrayFromIds(data.recipes);
            this.recipes.forEach((recipe) => {
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
            throw new DataModificationError(ConstructionFixture.name, e, this.id);
        }
    }
    get media() {
        return this.mediaForTier('icon');
    }
    get name() {
        return getRielkLangString(`CONSTRUCTION_FIXTURE_NAME_ ${this.localID}`);
    }
    mediaForTier(tier) {
        return this.getMediaURL(`${this._media_folder}/${tier}.png`);
    }
    getRecipe(tier) {
        return this.recipes[tier - 1];
    }
    get currentRecipe() {
        if (this.currentTier >= this.maxTier)
            return;
        return this.getRecipe(this.currentTier + 1);
    }
    get maxTier() {
        return this.recipes.length;
    }
    get percentProgress() {
        const recipe = this.currentRecipe;
        if (recipe == undefined)
            return;
        return (this.progress / recipe.actionCost) * 100;
    }
    get level() {
        return this.recipes[0].level;
    }
    get abyssalLevel() {
        return this.recipes[0].abyssalLevel;
    }
    upgrade() {
        this.currentTier++;
        this.progress = 0;
    }
}

class ConstructionFixtureRecipes extends CategorizedArtisanRecipe {
    constructor(namespace, data, game, skill) {
        super(namespace, data, game, skill);
        try {
            this._baseActionCost = data.baseActionCost;
        } catch (e) {
            throw new DataConstructionError(ConstructionFixtureRecipes.name, e, this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
            this._baseActionCost = data.baseActionCost;
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
