const lastAutosName = 'lastAutos';
const lastManualName = 'lastManual';

export function onCharacterLoaded(ctx) {
    let lastAutos = getLastAutos(ctx);
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

    let lastManual = getLastManual(ctx);
    if (lastManual === undefined) {
        lastManual = {
            q: undefined,
            r: undefined
        }
        setLastManual(ctx, lastManual);
    }
}

export function getLastAutos(ctx) {
    return ctx.characterStorage.getItem(lastAutosName);
};

export function setLastAutos(ctx, obj) {
    return ctx.characterStorage.setItem(lastAutosName, obj);
}

export function getLastManual(ctx) {
    return ctx.characterStorage.getItem(lastManualName);
};

export function setLastManual(ctx, obj) {
    return ctx.characterStorage.setItem(lastManualName, obj);
}
