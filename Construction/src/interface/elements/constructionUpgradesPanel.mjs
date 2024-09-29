class ConstructionUpgradesPanelElement extends HTMLElement {
    constructor() {
        super();
        this.upgradePanels = [];
        this._content = new DocumentFragment();
        this._content.append(getTemplateNode('rielk-construction-upgrades-panel-template'));
        this.upgradesContainer = getElementFromFragment(this._content, 'upgrades-container', 'div');
    }
    connectedCallback() {
        this.appendChild(this._content);
    }
    setFixture(fixture, construction) {
        while (this.upgradePanels.length > fixture.recipes.length) {
            const panel = this.upgradePanels.pop();
            this.upgradesContainer.removeChild(panel);
        }
        while (this.upgradePanels.length < fixture.recipes.length) {
            const panel = createElement('rielk-construction-modifier-display', {
                className: 'col-12 p-2',
                parent: this.upgradesContainer,
            });
            this.upgradePanels.push(panel);
        }

        fixture.recipes.forEach((recipe, i)=>{
            this.upgradePanels[i].setFixtureRecipe(recipe, construction);
        });
    }
    updateFixturesForLevel(construction) {
        this.upgradePanels.forEach((panel) => {
            panel.updatePanelForLevel(construction);
        });
    }
}
window.customElements.define('rielk-construction-upgrades-panel', ConstructionUpgradesPanelElement);
