export async function setup(ctx) {
    const settings = (await ctx.loadModule('src/settings.mjs'));
    settings.setupGeneralSettings(ctx);

    //Ammunition
    ctx.patch(PlayerModifierTable, 'getAmmoPreservationChance').after((oldChance) => {
        if (!settings.getAmmoEnabled(ctx))
            return;
        return 100;
    });

    //Rune
    ctx.patch(PlayerModifierTable, 'getRunePreservationChance').after((oldChance) => {
        if (!settings.getRuneEnabled(ctx))
            return;
        return 100;
    });

    //Prayer
    ctx.patch(Player, 'consumePrayerPoints').before((amount, isUnholy) => {
        if (!settings.getPrayEnabled(ctx))
            return;
        return [0, isUnholy];
    });
    ctx.patch(Player, 'consumeSoulPoints').before((amount) => {
        if (!settings.getPrayEnabled(ctx))
            return;
        return [0];
    });

    //Food
    ctx.patch(PlayerModifierTable, 'getFoodPreservationChance').after((oldChance) => {
        if (!settings.getFoodEnabled(ctx))
            return;
        return 100;
    });

    //Summoning Tablet
    ctx.patch(Player, 'getSummoningTabletPreservationChance').after((oldChance) => {
        if (!settings.getSTabEnabled(ctx))
            return;
        return 100;
    });

    //Consumables
    ctx.patch(Player, 'getConsumablePreservationChance').after((oldChance) => {
        if (!settings.getConsEnabled(ctx))
            return;
        return 100;
    });

    //Potions
    const prevChargesStr = ctx.namespace + ':previousCharges';
    const prevStatStr = ctx.namespace + ':previousStat';
    ctx.patch(PotionManager, 'consumeChargeForAction').before(function (e, action) {
        if (!settings.getPotiEnabled(ctx))
            return;
        const potion = this.activePotions.get(action);
        e[prevStatStr] = this.game.stats.Herblore.get(HerbloreStats.ChargesUsed);
        e[prevChargesStr] = potion.charges;
        if (potion.charges <= 1)
            potion.charges = 10;
    });
    ctx.patch(PotionManager, 'consumeChargeForAction').after(function (_, e, action) {
        const prevStat = e[prevStatStr];
        if (prevStat != undefined)
            this.game.stats.Herblore.set(HerbloreStats.ChargesUsed, prevStat);
        const prevCharges = e[prevChargesStr];
        if (prevCharges != undefined) {
            const potion = this.activePotions.get(action);
            potion.charges = prevCharges;
        }
    });
}
