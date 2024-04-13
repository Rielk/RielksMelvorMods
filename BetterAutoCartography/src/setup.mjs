export async function setup(ctx) {
    const { betterGetNextAutoSurveyHex } = await ctx.loadModule('src/betterGetNextAutoSurveyHex.mjs');
    ctx.patch(Cartography, 'getNextAutoSurveyHex').after((_, hex, nextHexes = []) => betterGetNextAutoSurveyHex(hex, nextHexes));

    ctx.patch(Cartography, 'surveyInterval').get((old_val) => old_val() / 100);
    ctx.patch(WorldMap, 'sightRange').get(_ => 1000);
}
