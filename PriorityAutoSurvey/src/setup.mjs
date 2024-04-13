export async function setup(ctx) {
    const { betterGetNextAutoSurveyHex } = await ctx.loadModule('src/betterGetNextAutoSurveyHex.mjs');
    ctx.patch(Cartography, 'getNextAutoSurveyHex').after((_, hex, nextHexes = []) => betterGetNextAutoSurveyHex(hex, nextHexes));

    ctx.patch(Cartography, 'surveyInterval').get(_ => 50);
    ctx.patch(WorldMap, 'sightRange').get(_ => 3);
    ctx.patch(WorldMap, 'surveyRange').get(_ => 2);
}
