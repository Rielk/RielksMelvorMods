export async function setup(ctx) {
    const { betterGetNextAutoSurveyHex } = await ctx.loadModule('src/betterGetNextAutoSurveyHex.mjs');
    ctx.patch(Cartography, 'getNextAutoSurveyHex').after((_, hex, nextHexes = []) => betterGetNextAutoSurveyHex(hex, nextHexes));

    ctx.patch(Cartography, 'surveyInterval').get((old_val) => old_val() / 100);
}

// getNextAutoSurveyHexes in cartography
// surveyAuto in cartography
// this.renderQueue.poiMarkers in cartography
//updateAutoSurveyMarkers in certographyMenu