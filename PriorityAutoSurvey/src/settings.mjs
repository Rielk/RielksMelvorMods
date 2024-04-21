const enabledName = 'enabled';
const ignoreVisionName = 'ignore-vision';
const surveyHiddenName = 'survey-hidden';
const generalSettingsName = 'General';

export function setupGeneralSettings(ctx) {
    const generalSettings = ctx.settings.section(generalSettingsName);
    generalSettings.add({
        type: 'switch',
        name: enabledName,
        label: 'Enable Priority Auto Survey',
        default: true
    });
    generalSettings.add({
        type: 'switch',
        name: ignoreVisionName,
        label: 'Ignore Vision',
        hint: 'Turn on to search for POIs outside of vision range.',
        default: false
    });
    generalSettings.add({
        type: 'switch',
        name: surveyHiddenName,
        label: 'Survey Hidden',
        hint: 'Turn on to survey tiles with hidden POIs on.',
        default: false
    });
}

export var getEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(enabledName);
export var getIgnoreVision = (ctx) => ctx.settings.section(generalSettingsName).get(ignoreVisionName);
export var getSurveyHidden = (ctx) => ctx.settings.section(generalSettingsName).get(surveyHiddenName);
