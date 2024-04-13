export async function setup(ctx) {
    const getGetNextAutoSurveyHexPatches = (await ctx.loadModule('src/priorityGetNextAutoSurveyHex.mjs')).getPatches;

    const generalSettings = setupGeneralSettings(ctx);
    const getIgnoreVision = () => generalSettings.get('ignore-vision');
    const getLastAutos = () => ctx.characterStorage.getItem('lastAutos');
    const setLastAutos = obj => ctx.characterStorage.setItem('lastAutos', obj);
    const getNextAutoSurveyHexPatches = getGetNextAutoSurveyHexPatches(getIgnoreVision, getLastAutos, setLastAutos)

    ctx.patch(Cartography, 'getNextAutoSurveyHex').after(getNextAutoSurveyHexPatches.afterPatch);
    ctx.patch(Cartography, 'getNextAutoSurveyHex').before(getNextAutoSurveyHexPatches.beforePatch);

    //Cheats
    //ctx.patch(Cartography, 'surveyInterval').get(_ => 50);
    //ctx.patch(WorldMap, 'sightRange').get(_ => 3);
    //ctx.patch(WorldMap, 'surveyRange').get(_ => 2);
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