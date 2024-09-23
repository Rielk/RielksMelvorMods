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
