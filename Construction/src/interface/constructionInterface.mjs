const { loadModule } = mod.getContext(import.meta);

const { ConstructionHouseMenu } = await loadModule('src/interface/constructionHouseMenu.mjs');

export class ConstructionInterface {
    constructor(ctx, construction) {
        this.ctx = ctx;

        this.constructionSelectionTabs = new Map();

        this.ctx.onInterfaceAvailable(async () => {
            await this.ctx.loadStylesheet('src/interface/construction-styles.css');

            const frag = new DocumentFragment();
            frag.append(getTemplateNode('rielk-construction-template'));
            document.getElementById('main-container').append(...frag.children);
            this.constructionCategoryMenu = document.getElementById('rielk-construction-category-menu');
            this.constructionArtisanMenu = document.getElementById('rielk-construction-artisan-menu',);
        });

        this.ctx.onCharacterLoaded(async () => {
            this.constructionCategoryMenu.addOptions(construction.categories.allObjects, getLangString('MENU_TEXT_SELECT_CONSTRUCTION_CATEGORY'), this.switchConstructionCategory(this));
            this.constructionArtisanMenu.init(construction);
            const constructionCategoryContainer = document.getElementById('rielk-construction-category-container');
            construction.categories.forEach((category) => {
                if (category.type !== 'Artisan')
                    return;
                const recipes = construction.actions.filter((r) => r.category === category);
                recipes.sort(BasicSkillRecipe.sortByLevels);
                const tab = createElement('recipe-selection-tab', {
                    className: 'col-12 col-md-8 d-none',
                    attributes: [['data-option-tag-name', 'rielk-construction-recipe-option']],
                    parent: constructionCategoryContainer,
                });
                tab.setRecipes(recipes, construction);
                this.constructionSelectionTabs.set(category, tab);
            });
            this.constructionHouseElement = document.getElementById('rielk-construction-house-element');
            this.constructionHouseMenu = new ConstructionHouseMenu(this.constructionHouseElement, construction);
        });
    }

    switchConstructionCategory(ui) {
        return (category) => {
            switch (category.type) {
                case 'House':
                    showElement(ui.constructionHouseElement);
                    hideElement(ui.constructionArtisanMenu);
                    switchToCategory(ui.constructionSelectionTabs)(category)
                    break;
                case 'Artisan':
                    showElement(ui.constructionArtisanMenu);
                    hideElement(ui.constructionHouseElement);
                    switchToCategory(ui.constructionSelectionTabs)(category)
                    break;
            }
        };
    }
}

class ConstructionRecipeOptionElement extends ItemRecipeOptionElement {
    setUnlocked(recipe) {
        super.setUnlocked(recipe);
        this.unlocked.onclick = ()=>game.construction.selectRecipeOnClick(recipe);
    }
    getRecipeIngredients(recipe) {
        return game.construction.getRecipeCosts(recipe);
    }
}
window.customElements.define('rielk-construction-recipe-option', ConstructionRecipeOptionElement);
