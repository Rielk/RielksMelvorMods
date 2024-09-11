export class Construction extends ArtisanSkill {
    constructor(namespace, game) {
        super(namespace, 'Construction', game, ConstructionRecipe.name);
        this._media = 'assets/icon.png';
        this.baseInterval = 3000;
        this.UI = undefined;
        this.renderQueue = new ArtisanSkillRenderQueue();
        this.categories = new NamespaceRegistry(game.registeredNamespaces, 'ConstructionCategory');
        this.subcategories = new NamespaceRegistry(game.registeredNamespaces,'ConstructionSubcategory');
    }

    isMasteryActionUnlocked(action) {
        return this.isBasicSkillRecipeUnlocked(action);
    }

    get selectionTabs() {
        return this.UI.constructionSelectionTabs;
    }

    get menu() {
        return this.UI.constructionArtisanMenu;
    }
    get categoryMenu() {
        return this.UI.constructionCategoryMenu;
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

    registerData(namespace, data) {
        var _a, _b, _c;
        (_a = data.categories) === null || _a === void 0 ? void 0 : _a.forEach((categoryData)=>{
            this.categories.registerObject(new ConstructionCategory(namespace,categoryData,this,this.game));
        }
        );
        (_b = data.subcategories) === null || _b === void 0 ? void 0 : _b.forEach((subcategoryData)=>{
            this.subcategories.registerObject(new SkillSubcategory(namespace,subcategoryData));
        }
        );
        (_c = data.recipes) === null || _c === void 0 ? void 0 : _c.forEach((recipeData)=>{
            this.actions.registerObject(new ConstructionRecipe(namespace,recipeData,this.game,this));
        }
        );
        super.registerData(namespace, data);
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
}

class ConstructionCategory extends SkillCategory {
    constructor(namespace, data, skill, game) {
        super(namespace, data, skill, game);
        this.type = data.type;
        if (this.type == 'Room')
            this.room = data.room
    }
}

class ConstructionRecipe extends SingleProductArtisanSkillRecipe {
    constructor(namespace, data, game, skill) {
        super(namespace, data, game, skill);
        try {
            if (data.subcategoryID !== undefined)
                this.subcategory = skill.subcategories.getObjectSafe(data.subcategoryID);
        } catch (e) {
            throw new DataConstructionError(ConstructionRecipe.name,e,this.id);
        }
    }
    applyDataModification(data, game) {
        super.applyDataModification(data, game);
        try {
            if (data.subcategoryID !== undefined)
                this.subcategory = game.smithing.subcategories.getObjectSafe(data.subcategoryID);
        } catch (e) {
            throw new DataModificationError(ConstructionRecipe.name,e,this.id);
        }
    }
}
