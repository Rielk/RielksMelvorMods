export async function setup(ctx) {
    const automaticTrader = await ctx.loadModule('src/automaticTrader.mjs');
    ctx.patch(Township, 'tick').after(automaticTrader.afterPatch);

    const setTradesUI = await ctx.loadModule('src/setTradesUI.mjs');
    ctx.onInterfaceReady(setTradesUI.createAutoTradeConfig);

    //conversion.unlockRequirements
    //isRequirementMet(conversion.unlockRequirements)
}
