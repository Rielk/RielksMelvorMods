export async function setup(ctx) {
    const settings = (await ctx.loadModule('src/settings.mjs'));
    settings.setupGeneralSettings(ctx);
    ctx.patch(Player, 'getRuneCosts').after(function(spell) { //function not arrow function for 'this' context
        if (!settings.getEnabled(ctx))
            return;

        return [];
    });
}
