const lastAutosName = 'lastAutos';

export function onCharacterLoaded(ctx) {
    let lastAutos = ctx.characterStorage.getItem(lastAutosName);
    if (lastAutos === undefined) {
        lastAutos = {
            actual: {
                q: undefined,
                r: undefined
            },
            render: {
                q: undefined,
                r: undefined
            }
        };
        setLastAutos(ctx, lastAutos);
    }
}

export function getLastAutos(ctx) {
    return ctx.characterStorage.getItem(lastAutosName);
};

export function setLastAutos(ctx, obj) {
    return ctx.characterStorage.setItem(lastAutosName, obj);
}
