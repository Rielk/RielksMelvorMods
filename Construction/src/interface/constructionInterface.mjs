const { loadModule } = mod.getContext(import.meta);

const { ConstructionHouseMenu } = await loadModule('src/interface/constructionHouseMenu.mjs');
const { getRielkLangString } = await loadModule('src/language/translationManager.mjs');

export class ConstructionInterface {
    constructor(construction) {
        this.renderQueue = new ConstructionRenderQueue();
        this.construction = construction;

        this.constructionSelectionTabs = new Map();

        const frag = new DocumentFragment();
        frag.append(getTemplateNode('rielk-construction-template'));
        document.getElementById('main-container').append(...frag.children);
        this.constructionCategoryMenu = document.getElementById('rielk-construction-category-menu');
        this.constructionArtisanMenu = document.getElementById('rielk-construction-artisan-menu',);

        this.constructionCategoryMenu.addOptions(construction.categories.allObjects, getRielkLangString('MENU_TEXT_SELECT_CONSTRUCTION_CATEGORY'), this.switchConstructionCategory(this));
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
        this.constructionArtisanElement = document.getElementById('rielk-construction-artisan-element');
        this.constructionHouseMenu = new ConstructionHouseMenu(this.constructionHouseElement, construction);
    }

    switchConstructionCategory(ui) {
        return (category) => {
            switch (category.type) {
                case 'House':
                    showElement(ui.constructionHouseElement);
                    hideElement(ui.constructionArtisanElement);
                    switchToCategory(ui.constructionSelectionTabs)(category)
                    break;
                case 'Artisan':
                    showElement(ui.constructionArtisanElement);
                    hideElement(ui.constructionHouseElement);
                    switchToCategory(ui.constructionSelectionTabs)(category)
                    break;
            }
        };
    }

    render() {
        this.renderMenu();
        this.renderProgressBar();
        this.renderStopButton();
        this.renderFixtureUnlock();
        this.renderRoomRealmVisibility();
    }

    renderFixtureUnlock() {
        if (!this.renderQueue.fictureUnlock)
            return;
        if (this.constructionHouseMenu == undefined)
            return;
        this.constructionHouseMenu.updateFixturesForLevel(this);
        this.renderQueue.fictureUnlock = false;
    }
    renderRoomRealmVisibility() {
        if (!this.renderQueue.roomRealmVisibility)
            return;
        if (this.constructionHouseMenu == undefined)
            return;
        this.construction.rooms.forEach((room) => {
            room.realm === this.construction.currentRealm ? this.constructionHouseMenu.showRoom(room) : this.constructionHouseMenu.hideRoom(room);
        }
        );
        this.renderQueue.roomRealmVisibility = false;
    }
    renderMenu() {
        if (this.constructionHouseMenu == undefined)
            return;
        if (this.renderQueue.menu) {
            this.constructionHouseMenu.updateAllRoomPanels(this);
            this.constructionHouseMenu.updateFixtureButtons(this.game);
        }
        this.renderQueue.menu = false;
    }
    renderStopButton() {
        if (this.renderQueue.stopButton) {
            if (this.isActive && this.currentRoom !== undefined)
                this.constructionHouseMenu.setStopButton(this, this.currentRoom);
            else
                this.constructionHouseMenu.removeStopButton(this);
        }
        this.renderQueue.stopButton = false;
    }
    renderProgressBar() {
        var _a;
        if (!this.renderQueue.progressBar)
            return;
        if (this.lastActiveRoomProgressBar !== undefined) {
            (_a = this.constructionHouseMenu.getProgressBar(this.lastActiveRoomProgressBar)) === null || _a === void 0 ? void 0 : _a.stopAnimation();
            this.lastActiveRoomProgressBar = undefined;
        }
        if (this.currentRoom === undefined)
            return;
        const progressBar = this.constructionHouseMenu.getProgressBar(this.currentRoom);
        if (progressBar !== undefined) {
            if (this.isActive) {
                if (this.stunState === 1) {
                    progressBar.setStyle('bg-danger');
                    progressBar.animateProgressFromTimer(this.stunTimer);
                } else {
                    progressBar.setStyle('bg-info');
                    progressBar.animateProgressFromTimer(this.actionTimer);
                }
                this.lastActiveRoomProgressBar = this.currentRoom;
            } else {
                progressBar.stopAnimation();
                this.lastActiveRoomProgressBar = undefined;
            }
        }
        this.renderQueue.progressBar = false;
    }
    renderVisibleRooms() {
        this.construction.rooms.forEach((room) => {
            if (this.construction.hiddenRooms.has(room)) {
                this.hideRoomPanel(room);
            } else {
                this.showRoomPanel(room);
            }
        }
        );
    }
    onRoomHeaderClick(room) {
        if (this.construction.hiddenRooms.has(room)) {
            this.construction.hiddenRooms.delete(room);
            this.showRoomPanel(room);
        } else {
            this.construction.hiddenRooms.add(room);
            this.hideRoomPanel(room);
        }
    }
    onFixturePanelSelection(fixture, room) {
        if (this.construction.isActive && room === this.construction.currentRoom && fixture !== this.construction.currentFixture) {
            return this.construction.stop();
        } else {
            return true;
        }
    }
    hideRoomPanel(room) {
        return this.constructionHouseMenu.hideRoomPanel(room)
    }
    showRoomPanel(room) {
        return this.constructionHouseMenu.showRoomPanel(room)
    }
}

class ConstructionRenderQueue extends ArtisanSkillRenderQueue {
    constructor() {
        super(...arguments);
        this.menu = false;
        this.stopButton = false;
        this.fixtureUnlock = false;
        this.roomRealmVisibility = false;
    }
}
