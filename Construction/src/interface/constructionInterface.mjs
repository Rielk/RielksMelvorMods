export class ConstructionInterface {
    constructor(ctx, construction) {
        this.ctx = ctx;
        this.construction = construction;

        this.constructionSelectionTabs = new Map();

        this.ctx.onInterfaceAvailable(async () => {
            await this.ctx.loadStylesheet('src/interface/construction-styles.css');

            const frag = new DocumentFragment();
            frag.append(getTemplateNode('rielk-construction-template'));
            document.getElementById('main-container').append(...frag.children);
            this.constructionCategoryMenu = document.getElementById('construction-category-menu');
            this.constructionArtisanMenu = document.getElementById('construction-artisan-menu',);
        });

        this.ctx.onCharacterLoaded(async () => {
            this.constructionCategoryMenu.addOptions(game.construction.categories.allObjects, getLangString('MENU_TEXT_SELECT_CONSTRUCTION_CATEGORY'), switchToCategory(this.constructionSelectionTabs));
            this.constructionArtisanMenu.init(game.construction);
            const constructionCategoryContainer = document.getElementById('construction-category-container');
            this.construction.categories.forEach((category) => {
                const recipes = game.construction.actions.filter((r) => r.category === category);
                recipes.sort(BasicSkillRecipe.sortByLevels);
                const tab = createElement('recipe-selection-tab', {
                    className: 'col-12 col-md-8 d-none',
                    attributes: [['data-option-tag-name', 'construction-recipe-option']],
                    parent: constructionCategoryContainer,
                });
                tab.setRecipes(recipes, game.construction);
                this.constructionSelectionTabs.set(category, tab);
            });
        });
    }

    switchConstructionCategory(category) {
        switch (category.type) {
            case 'Creation':
                showElement();
                hideElement();
                break;
            case 'Room':
                showElement();
                hideElement();
                break;
        }
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
window.customElements.define('construction-recipe-option', ConstructionRecipeOptionElement);