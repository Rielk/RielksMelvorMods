export async function setup(ctx) {
    ctx.onCharacterLoaded((await ctx.loadModule('src/characterStore.mjs')).onCharacterLoaded);

    const automaticTrader = await ctx.loadModule('src/automaticTrader.mjs');
    ctx.patch(Township, 'tick').after(automaticTrader.afterPatch);

    const uiMine = await ctx.loadModule('src/ui.mjs');
    ctx.loadTemplates('src/templates.html');
    ctx.onInterfaceReady(() => {
        game.township.resources.forEach((_, resource) => {
            const element = document.getElementById(`jump-to-resource-${resource}`);
            if (element) {
                const id = `auto-trade-from-resource-${resource}`;
                const uiElement = uiMine.followWithList(element, id, 'nav-main nav-main-horizontal nav-main-horizontal-override font-w400 font-size-sm mb-2 auto-convert-from-township')
                ui.create(Counter({ count: 0 }), uiElement);
            }
        });
    });

    ctx.onCharacterLoaded(() => {
        game.township.PASSIVE_TICK_LENGTH = 5;
        game.township.tickTimer._maxTicks = 5;
        game.township.tickTimer._ticksLeft = 5;
        game.township.tickTimer.tick();
    });
    ctx.patch(Township, 'tick').after(() => game.gp.set(1000000000));
}

function Counter(props) {
    return {
        $template: '#counter-component',
        count: props.count,
        inc() {
            this.count++;
        }
    };
}
