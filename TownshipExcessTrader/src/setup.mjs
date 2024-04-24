export async function setup(ctx) {
    ctx.onCharacterLoaded((await ctx.loadModule('src/characterStore.mjs')).onCharacterLoaded);

    const automaticTrader = await ctx.loadModule('src/automaticTrader.mjs');
    ctx.patch(Township, 'tick').after(automaticTrader.afterPatch);

    const setTradesUI = await ctx.loadModule('src/setTradesUI.mjs');
    ctx.onInterfaceReady(setTradesUI.createAutoTradeConfig);

    //conversion.unlockRequirements
    //isRequirementMet(conversion.unlockRequirements)
}
