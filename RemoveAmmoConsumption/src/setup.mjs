export async function setup(ctx) {
    const settings = (await ctx.loadModule('src/settings.mjs'));
    settings.setupGeneralSettings(ctx);
    ctx.patch(PlayerModifierTable, 'getAmmoPreservationChance').after((oldChance) => {
        if (!settings.getEnabled(ctx))
            return;

        return 100;
    });
}
