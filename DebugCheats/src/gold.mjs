const goldSettings = (await mod.getContext(import.meta).loadModule('src/goldSettings.mjs'));

export function setGold(ctx) {
    game.gp.set(goldSettings.getGoldQuantity(ctx));
}