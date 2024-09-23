class ConstructionInfoBoxElement extends HTMLElement {
    constructor() {
        super();
        this._content = new DocumentFragment();
        this._content.append(getTemplateNode('rielk-construction-info-box-template'));
        this.xp = getElementFromFragment(this._content, 'xp', 'xp-icon');
        this.abyssalXP = getElementFromFragment(this._content, 'abyssal-xp', 'abyssal-xp-icon');
        this.interval = getElementFromFragment(this._content, 'interval', 'interval-icon');
    }
    connectedCallback() {
        this.appendChild(this._content);
    }
    setFixture(construction, fixture) {
        this.xp.setXP(Math.floor(construction.modifyXP(fixture.baseExperience)), fixture.baseExperience);
        this.xp.setSources(construction.getXPSources(fixture));
        const interval = construction.getFixtureInterval(fixture);
        this.interval.setInterval(interval, construction.getIntervalSources(fixture));
        this.abyssalXP.setXP(Math.floor(construction.modifyAbyssalXP(fixture.baseAbyssalExperience)), fixture.baseAbyssalExperience);
        this.abyssalXP.setSources(construction.getAbyssalXPSources(fixture));
        if (fixture.baseAbyssalExperience > 0)
            showElement(this.abyssalXP);
        else
            hideElement(this.abyssalXP);
    }
}
window.customElements.define('rielk-construction-info-box', ConstructionInfoBoxElement);
