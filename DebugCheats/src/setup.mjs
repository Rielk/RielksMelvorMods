export async function setup(ctx) {
    const goldSettings = await ctx.loadModule('src/goldSettings.mjs');
    goldSettings.setupSettings(ctx);
    (await ctx.loadModule('src/cartographySettings.mjs')).setupSettings(ctx);

    const gold = await ctx.loadModule('src/gold.mjs');
    goldSettings.registerForSetGold(() => gold.setGold(ctx));

    const cartography = await ctx.loadModule('src/cartography.mjs');
    ctx.patch(Cartography, 'surveyInterval').get(o => cartography.surveyIntervalPatch(o, ctx));
    ctx.patch(WorldMap, 'sightRange').get(o => cartography.sightRangePatch(o, ctx));
    ctx.patch(WorldMap, 'surveyRange').get(o => cartography.surveyRangePatch(o, ctx));
}