const pasSettings = (await mod.getContext(import.meta).loadModule('src/priorityAutoSurveySettings.mjs'));

export function surveyIntervalPatch(old, ctx) {
    if (pasSettings.getFastSurvey(ctx))
        return 50;
    return old();
}
export function sightRangePatch(old, ctx) {
    const sightRange = pasSettings.getSightRange(ctx);
    if (sightRange > 0)
        return sightRange;
    return old();
}
export function surveyRangePatch(old, ctx) {
    const surveyRange = pasSettings.getSurveyRange(ctx);
    if (surveyRange > 0)
        return surveyRange;
    return old();
}