export async function setup(ctx) {
    const setTradesUI = await ctx.loadModule('src/setTradesUI.mjs');
    const config = setTradesUI.config;
    ctx.onInterfaceReady(setTradesUI.createAutoTradeConfig);

    const automaticTrader = await ctx.loadModule('src/automaticTrader.mjs');
    ctx.patch(Township, 'tick').after(automaticTrader.createAfterTickPatch(config));

    //conversion.unlockRequirements
    //isRequirementMet(conversion.unlockRequirements)
}
