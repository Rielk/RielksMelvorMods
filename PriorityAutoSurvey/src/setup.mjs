export async function setup(ctx) {
    const getNextAutoSurveyHexPatch = (await ctx.loadModule('src/priorityGetNextAutoSurveyHex.mjs')).getPatch;
    const generalSettings = setupGeneralSettings(ctx);

    const getIgnoreVision = () => generalSettings.get('ignore-vision');
    ctx.patch(Cartography, 'getNextAutoSurveyHex').after(getNextAutoSurveyHexPatch(getIgnoreVision));

    ctx.patch(Cartography, 'surveyInterval').get(_ => 50);
    ctx.patch(WorldMap, 'sightRange').get(_ => 3);
    ctx.patch(WorldMap, 'surveyRange').get(_ => 2);
}

function setupGeneralSettings(ctx) {
    const generalSettings = ctx.settings.section('General');
    generalSettings.add({
        type: 'switch',
        name: 'ignore-vision',
        label: 'Ignore Vision',
        hint: 'Turn on to search for POIs outside of vision range.',
        default: false
    });
    return generalSettings;
}