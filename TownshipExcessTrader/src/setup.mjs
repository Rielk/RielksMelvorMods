export async function setup(ctx) {
    ctx.patch(Township, 'tick').before(getNextAutoSurveyHexPatches.beforePatch);

    //game.township.resources.forEach((resource)=>{
    // let amount = resource.generation;
}