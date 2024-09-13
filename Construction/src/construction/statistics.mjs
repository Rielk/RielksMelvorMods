export var ConstructionStats;
(function (ConstructionStats) {
    ConstructionStats[ConstructionStats["ItemsProduced"] = 0] = "ItemsProduced";
    ConstructionStats[ConstructionStats["TimeSpent"] = 1] = "TimeSpent";
    ConstructionStats[ConstructionStats["ItemsUsed"] = 2] = "ItemsUsed";
    ConstructionStats[ConstructionStats["ItemsPreserved"] = 3] = "ItemsPreserved";
    ConstructionStats[ConstructionStats["Actions"] = 4] = "Actions";
}
)(ConstructionStats || (ConstructionStats = {}));

class ConstructionStatTracker {
    constructor(ctx) {
        this.characterStorage = ctx.characterStorage;
        this.stats = new Map();
        this.wasMutated = false;
    }
    add(stat, qty) {
        var _a;
        this.stats.set(stat, ((_a = this.stats.get(stat)) !== null && _a !== void 0 ? _a : 0) + qty);
    }
    set(stat, value) {
        if (value !== 0) {
            this.stats.set(stat, value);
        } else {
            this.remove(stat);
        }
        this.wasMutated = true;
        this.characterStorage.setItem(ConstructionStats[stat], value);
    }
    inc(stat) {
        this.add(stat, 1);
    }
    get(stat) {
        var _a;
        return (_a = this.stats.get(stat)) !== null && _a !== void 0 ? _a : 0;
    }
    getSum(stats) {
        return stats.reduce((sum, stat) => {
            return this.get(stat) + sum;
        }
            , 0);
    }
    remove(stat) {
        this.stats.delete(stat);
        this.wasMutated = true;
        this.characterStorage.removeItem(ConstructionStats[stat]);
    }
    loadstats() {
        for (const [name, number] of Object.entries(ConstructionStats))
            if (typeof name === "string")
                this.stats[number] = this.characterStorage.getItem(name);
    }
}

export function patchStatistics(ctx) {
    const tracker = new ConstructionStatTracker(ctx);
    ctx.onCharacterLoaded(async () => {
        tracker.loadstats();
    });
    game.stats.Construction = tracker;
}
