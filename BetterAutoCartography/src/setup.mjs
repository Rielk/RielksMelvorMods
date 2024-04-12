export async function setup(ctx) {
    const { betterGetNextAutoSurveyHex } = await ctx.loadModule('src/betterGetNextAutoSurveyHex.mjs');
    ctx.patch(Cartography, 'getNextAutoSurveyHex').after((_, hex, nextHexes = []) => betterGetNextAutoSurveyHex(hex, nextHexes));
}

// getNextAutoSurveyHexes in cartography
// surveyAuto in cartography
// this.renderQueue.poiMarkers in cartography
//updateAutoSurveyMarkers in certographyMenu