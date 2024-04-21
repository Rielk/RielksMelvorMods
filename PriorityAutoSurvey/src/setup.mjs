export async function setup(ctx) {
    (await ctx.loadModule('src/settings.mjs')).setupGeneralSettings(ctx);

    ctx.onCharacterLoaded((await ctx.loadModule('src/characterStore.mjs')).onCharacterLoaded);

    const priorityGetNextAutoSurveyHex = await ctx.loadModule('src/priorityGetNextAutoSurveyHex.mjs');
    ctx.patch(Cartography, 'getNextAutoSurveyHex').after(priorityGetNextAutoSurveyHex.afterPatch);
    ctx.patch(Cartography, 'getNextAutoSurveyHex').before(priorityGetNextAutoSurveyHex.beforePatch);

    //Cheats
    //ctx.patch(Cartography, 'surveyInterval').get(_ => 50);
    //ctx.patch(WorldMap, 'sightRange').get(_ => 3);
    //ctx.patch(WorldMap, 'surveyRange').get(_ => 2);
}