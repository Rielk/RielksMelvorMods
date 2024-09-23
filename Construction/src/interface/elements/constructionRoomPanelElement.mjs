const { loadModule } = mod.getContext(import.meta);

const { getRielkLangString } = await loadModule('src/language/translationManager.mjs');

class ConstructionRoomPanelElement extends HTMLElement {
    constructor() {
        super();
        this.fixtureNavs = new Map();
        this._content = new DocumentFragment();
        this._content.append(getTemplateNode('rielk-construction-room-panel-template'));
        this.header = getElementFromFragment(this._content, 'header', 'div');
        this.eyeIcon = getElementFromFragment(this._content, 'eye-icon', 'i');
        this.roomName = getElementFromFragment(this._content, 'room-name', 'span');
        this.targetContainer = getElementFromFragment(this._content, 'target-container', 'div');
        this.infoContainer = getElementFromFragment(this._content, 'info-container', 'div');
        this.infoSkillName = getElementFromFragment(this._content, 'info-skill-name', 'small');
        this.infoBoxName = getElementFromFragment(this._content, 'info-box-name', 'span');
        this.infoBoxImage = getElementFromFragment(this._content, 'info-box-image', 'img');
        this.infoBox = getElementFromFragment(this._content, 'info-box', 'rielk-construction-info-box');
        this.startButton = getElementFromFragment(this._content, 'start-button', 'button');
        this.dropsButton = getElementFromFragment(this._content, 'drops-button', 'button');
        this.progressBar = getElementFromFragment(this._content, 'progress-bar', 'progress-bar');
    }
    connectedCallback() {
        this.appendChild(this._content);
    }

    setRoom(room, construction) {
        this.infoSkillName.textContent = construction.name;
        this.roomName.textContent = room.name;
        this.header.onclick = ()=>construction.ui.onRoomHeaderClick(room);
        room.fixtures.forEach((fixture)=>{
            const fixtureNav = createElement('rielk-construction-fixture-nav', {
                parent: this.targetContainer
            });
            fixtureNav.setFixture(fixture, construction);
            this.fixtureNavs.set(fixture, fixtureNav);
        }
        );
    }
    hide() {
        hideElement(this.targetContainer);
        hideElement(this.infoContainer);
        this.eyeIcon.classList.remove('fa-eye');
        this.eyeIcon.classList.add('fa-eye-slash');
    }
    show() {
        showElement(this.targetContainer);
        showElement(this.infoContainer);
        this.eyeIcon.classList.remove('fa-eye-slash');
        this.eyeIcon.classList.add('fa-eye');
    }
    updateFixturesForLevel(construction, room) {
        this.fixtureNavs.forEach((fixtureNav,fixture)=>{ //Fixtures don't have a .level
            if (construction.level >= fixture.level && construction.abyssalLevel >= fixture.abyssalLevel) {
                fixtureNav.setUnlocked(()=>this.selectFixture(room, fixture, construction));
            } else {
                fixtureNav.setLocked(fixture, construction);
            }
        }
        );
    }
    updateFixtureButtons(game) {
        this.fixtureNavs.forEach((nav,fixture)=>{
            nav.updateFixture(fixture, game);
        }
        );
    }
    selectFixture(room, fixture, construction) {
        if (!construction.ui.onFixturePanelSelection(fixture, room))
            return;
        this.selectedFixture = fixture;
        this.updateRoomInfo(construction);
        this.startButton.onclick = ()=>construction.startThieving(room, fixture);
        this.dropsButton.onclick = ()=>construction.fireFixtureDropsModal(room, fixture);
    }
    updateRoomInfo(construction) {
        if (this.selectedFixture !== undefined) {
            showElement(this.infoBox);
            this.infoBox.classList.add('d-flex');
            showElement(this.startButton);
            showElement(this.dropsButton);
            showElement(this.infoBoxImage);
            this.updateFixtureInfo(construction, this.selectedFixture);
        } else {
            this.infoBoxName.textContent = '-';
            hideElement(this.infoBox);
            this.infoBox.classList.remove('d-flex');
            hideElement(this.startButton);
            hideElement(this.dropsButton);
            hideElement(this.infoBoxImage);
        }
    }
    updateFixtureInfo(construction, fixture) {
        this.infoBoxName.textContent = fixture.name;
        this.infoBoxImage.src = fixture.media;
        this.infoBox.setFixture(construction, fixture);
    }
    setStopButton(construction) {
        this.startButton.textContent = getRielkLangString('MENU_TEXT_STOP_RIELK_CONSTRUCTION');
        this.startButton.classList.remove('btn-success');
        this.startButton.classList.add('btn-danger');
        this.startButton.onclick = ()=>construction.stop();
    }
    removeStopButton(construction, room) {
        this.startButton.textContent = getRielkLangString('MENU_TEXT_PICKPOCKET');
        this.startButton.classList.remove('btn-danger');
        this.startButton.classList.add('btn-success');
        const fixture = this.selectedFixture;
        if (fixture !== undefined)
            this.startButton.onclick = ()=>construction.startThieving(room, fixture);
    }
}
window.customElements.define('rielk-construction-room-panel', ConstructionRoomPanelElement);
