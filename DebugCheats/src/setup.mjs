export async function setup(ctx) {
    (await ctx.loadModule('src/priorityAutoSurveySettings.mjs')).setupSettings(ctx);

    const pasModule = await ctx.loadModule('src/priorityAutoSurvey.mjs');
    ctx.patch(Cartography, 'surveyInterval').get(o => pasModule.surveyIntervalPatch(o, ctx));
    ctx.patch(WorldMap, 'sightRange').get(o => pasModule.sightRangePatch(o, ctx));
    ctx.patch(WorldMap, 'surveyRange').get(o => pasModule.surveyRangePatch(o, ctx));
}