export async function setup(ctx) {
    const getGetNextAutoSurveyHexPatches = (await ctx.loadModule('src/priorityGetNextAutoSurveyHex.mjs')).getPatches;

    const generalSettings = setupGeneralSettings(ctx);
    const getLastAutos = () => ctx.characterStorage.getItem('lastAutos');
    const setLastAutos = obj => ctx.characterStorage.setItem('lastAutos', obj);
    const getNextAutoSurveyHexPatches = getGetNextAutoSurveyHexPatches(generalSettings, getLastAutos, setLastAutos)

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
        name: 'enabled',
        label: 'Enable Priority Auto Survey',
        default: true
    });
    generalSettings.add({
        type: 'switch',
        name: 'ignore-vision',
        label: 'Ignore Vision',
        hint: 'Turn on to search for POIs outside of vision range.',
        default: false
    });
    generalSettings.add({
        type: 'switch',
        name: 'survey-hidden',
        label: 'Survey Hidden',
        hint: 'Turn on to survey tiles with hidden POIs on.',
        default: false
    });
    return generalSettings;
}