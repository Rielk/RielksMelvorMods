export class Construction extends Skill {
    //To add action, add passiveTick or activeTick property to Construction class.

    constructor(namespace, game) {
        super(namespace, 'Construction', game);

        this._media = 'assets/icon.png';
        this.renderQueue = new ConstructionRenderQueue();
        this.isActive = false;
    }
}

class ConstructionRenderQueue extends SkillRenderQueue {
    constructor() {
        super(...arguments);
    }
}