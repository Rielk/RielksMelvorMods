export async function setup(ctx) {
    (await ctx.loadModule('src/settings.mjs')).setupGeneralSettings(ctx);

    ctx.onCharacterLoaded((await ctx.loadModule('src/characterStore.mjs')).onCharacterLoaded);

    const priorityGetNextAutoSurveyHex = await ctx.loadModule('src/priorityGetNextAutoSurveyHex.mjs');
    ctx.patch(Cartography, 'getNextAutoSurveyHex').after(priorityGetNextAutoSurveyHex.afterPatch);
    ctx.patch(Cartography, 'getNextAutoSurveyHex').before(priorityGetNextAutoSurveyHex.beforePatch);
    ctx.patch(Cartography, 'startAutoSurvey').after(priorityGetNextAutoSurveyHex.startAutoSurveyPatch);
}