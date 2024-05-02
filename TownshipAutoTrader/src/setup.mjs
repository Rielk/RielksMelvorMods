export async function setup(ctx) {
    (await ctx.loadModule('src/settings.mjs')).setupGeneralSettings(ctx);

    const config = (await ctx.loadModule('src/config.mjs')).createConfig(ctx);

    const setTradesUI = await ctx.loadModule('src/setTradesUI.mjs');
    ctx.onInterfaceReady(setTradesUI.createOnInterfaceReadyFunction(config));

    const automaticTrader = await ctx.loadModule('src/automaticTrader.mjs');
    ctx.patch(Township, 'tick').after(automaticTrader.createAfterTickPatch(config));

    //conversion.unlockRequirements
    //isRequirementMet(conversion.unlockRequirements)
}
