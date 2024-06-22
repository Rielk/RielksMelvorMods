export async function setup(ctx) {
    const settings = (await ctx.loadModule('src/settings.mjs'));
    settings.setupGeneralSettings(ctx);
    ctx.patch(Player, 'getRuneCosts').after((oldCosts, spell) => {
        if (!settings.getEnabled(ctx))
            return;

        return [];
    });
}
