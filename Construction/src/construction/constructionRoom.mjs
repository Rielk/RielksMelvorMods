const { loadModule } = mod.getContext(import.meta);

const { getRielkLangString } = await loadModule('src/language/translationManager.mjs');

export class ConstructionRoom extends RealmedObject {
    constructor(namespace, data, game, construction) {
        super(namespace, data, game);
        try {
            this._name = data.name;
            if (data.fixtures == undefined)
                throw new Error('No fixtures specified in data.');
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
            throw new DataModificationError(ConstructionRoom.name, e, this.id);
        }
    }
    get name() {
        return getRielkLangString(`CONSTRUCTION_ROOM_NAME_ ${this.localID}`);
    }
}
