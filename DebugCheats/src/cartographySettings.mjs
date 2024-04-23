const fastSurveyName = 'fast-survey';
const sightRangeName = 'sight-range';
const surveyRangeName = 'survey-range';
const settingsName = 'Cartography';

export function setupSettings(ctx) {
    const generalSettings = ctx.settings.section(settingsName);
    generalSettings.add({
        type: 'switch',
        name: fastSurveyName,
        label: 'Enable Fast Survey',
        default: false
    });
    generalSettings.add({
        type: 'number',
        name: sightRangeName,
        label: 'Sight Range',
        hint: 'Set Sight Range',
        default: undefined
    });
    generalSettings.add({
        type: 'number',
        name: surveyRangeName,
        label: 'Survey Range',
        hint: 'Set Survey Range',
        default: undefined
    });
}

export var getFastSurvey = (ctx) => ctx.settings.section(settingsName).get(fastSurveyName);
export var getSightRange = (ctx) => ctx.settings.section(settingsName).get(sightRangeName);
export var getSurveyRange = (ctx) => ctx.settings.section(settingsName).get(surveyRangeName);
