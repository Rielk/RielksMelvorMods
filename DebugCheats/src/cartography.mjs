const cartographySettings = (await mod.getContext(import.meta).loadModule('src/cartographySettings.mjs'));

export function surveyIntervalPatch(old, ctx) {
    if (cartographySettings.getFastSurvey(ctx))
        return 50;
    return old();
}
export function sightRangePatch(old, ctx) {
    const sightRange = cartographySettings.getSightRange(ctx);
    if (sightRange > 0)
        return sightRange;
    return old();
}
export function surveyRangePatch(old, ctx) {
    const surveyRange = cartographySettings.getSurveyRange(ctx);
    if (surveyRange > 0)
        return surveyRange;
    return old();
}