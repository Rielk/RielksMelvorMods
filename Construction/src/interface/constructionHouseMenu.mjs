export class ConstructionHouseMenu {
    constructor(container, construction) {
        this.roomPanels = new Map();
        this.activeRoom = undefined;
        construction.rooms.forEach((room)=>{
            const roomPanel = createElement('rielk-construction-room-panel', {
                className: 'col-12 col-xl-6',
                parent: container
            });
            roomPanel.setRoom(room, construction);
            this.roomPanels.set(room, roomPanel);
        }
        );
    }
    hideRoomPanel(room) {
        const panel = this.roomPanels.get(room);
        if (panel === undefined)
            return;
        panel.hide();
    }
    showRoomPanel(room) {
        const panel = this.roomPanels.get(room);
        if (panel === undefined)
            return;
        panel.show();
    }
    hideRoom(room) {
        const panel = this.roomPanels.get(room);
        if (panel === undefined)
            return;
        hideElement(panel);
    }
    showRoom(room) {
        const panel = this.roomPanels.get(room);
        if (panel === undefined)
            return;
        showElement(panel);
    }
    updateFixturesForLevel(construction) {
        this.roomPanels.forEach((panel,room)=>{
            panel.updateFixturesForLevel(construction, room);
        }
        );
    }
    updateFixtureButtons(game) {
        this.roomPanels.forEach((panel)=>{
            panel.updateFixtureButtons(game);
        }
        );
    }
    selectFixture(fixture, room, construction) {
        const panel = this.roomPanels.get(room);
        if (panel === undefined)
            return;
        panel.selectFixture(room, fixture, construction);
    }
    updateAllRoomPanels(construction) {
        this.roomPanels.forEach((panel,room)=>{
            panel.updateRoomInfo(construction);
        }
        );
    }
    setStopButton(construction, room) {
        const panel = this.roomPanels.get(room);
        this.removeStopButton(construction);
        if (panel === undefined)
            return;
        this.activeRoom = room;
        panel.setStopButton(construction);
    }
    removeStopButton(construction) {
        var _a;
        const room = this.activeRoom;
        if (room !== undefined) {
            (_a = this.roomPanels.get(room)) === null || _a === void 0 ? void 0 : _a.removeStopButton(construction, room);
        }
        this.activeRoom = undefined;
    }
    getProgressBar(room) {
        var _a;
        return (_a = this.roomPanels.get(room)) === null || _a === void 0 ? void 0 : _a.progressBar;
    }
}

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
        this.fixtureNavs.forEach((fixtureNav,fixture)=>{
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
        this.startButton.textContent = getLangString('MENU_TEXT_STOP_RIELK_CONSTRUCTION');
        this.startButton.classList.remove('btn-success');
        this.startButton.classList.add('btn-danger');
        this.startButton.onclick = ()=>construction.stop();
    }
    removeStopButton(construction, room) {
        this.startButton.textContent = getLangString('MENU_TEXT_PICKPOCKET');
        this.startButton.classList.remove('btn-danger');
        this.startButton.classList.add('btn-success');
        const fixture = this.selectedFixture;
        if (fixture !== undefined)
            this.startButton.onclick = ()=>construction.startThieving(room, fixture);
    }
}
window.customElements.define('rielk-construction-room-panel', ConstructionRoomPanelElement);
class ConstructionFixtureNavElement extends HTMLElement {
    constructor() {
        super();
        this._content = new DocumentFragment();
        this._content.append(getTemplateNode('rielk-construction-fixture-nav-template'));
        this.button = getElementFromFragment(this._content, 'button', 'a');
        this.buttonContent = getElementFromFragment(this._content, 'button-content', 'div');
        this.fixtureImage = getElementFromFragment(this._content, 'fixture-image', 'img');
        this.fixtureName = getElementFromFragment(this._content, 'fixture-name', 'span');
        this.masteryDisplay = getElementFromFragment(this._content, 'mastery-display', 'compact-mastery-display');
        this.unlock = getElementFromFragment(this._content, 'unlock', 'div');
        this.level = getElementFromFragment(this._content, 'level', 'span');
        this.abyssalLevel = getElementFromFragment(this._content, 'abyssal-level', 'span');
    }
    connectedCallback() {
        this.appendChild(this._content);
    }
    setFixture(fixture, construction) {
        this.fixtureImage.src = fixture.media;
        this.fixtureName.textContent = fixture.name;
        this.masteryDisplay.setMastery(construction, fixture);
        this.level.textContent = '';
        this.level.append(...templateLangStringWithNodes('MENU_TEXT_UNLOCKED_AT', {
            skillImage: createElement('img', {
                className: 'skill-icon-xs mr-1',
                attributes: [['src', construction.media]]
            }),
        }, {
            level: `${fixture.level}`
        }, false));
        this.abyssalLevel.textContent = '';
        if (fixture.abyssalLevel >= 1) {
            this.abyssalLevel.append(...templateLangStringWithNodes('UNLOCKED_AT_ABYSSAL_LEVEL', {
                skillImage: createElement('img', {
                    className: 'skill-icon-xs mr-1',
                    attributes: [['src', construction.media]],
                }),
            }, {
                level: `${fixture.abyssalLevel}`
            }, false));
            showElement(this.abyssalLevel);
        } else {
            hideElement(this.abyssalLevel);
        }
    }
    updateFixture(fixture, game) {
    }
    setLocked(fixture, construction) {
        hideElement(this.buttonContent);
        this.buttonContent.classList.remove('d-flex');
        toggleDangerSuccess(this.level, construction.level >= fixture.level);
        toggleDangerSuccess(this.abyssalLevel, construction.abyssalLevel >= fixture.abyssalLevel);
        showElement(this.unlock);
        this.button.onclick = null;
    }
    setUnlocked(callback) {
        showElement(this.buttonContent);
        this.buttonContent.classList.add('d-flex');
        hideElement(this.unlock);
        this.button.onclick = callback;
    }
}
window.customElements.define('rielk-construction-fixture-nav', ConstructionFixtureNavElement);
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
