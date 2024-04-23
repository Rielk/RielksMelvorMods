const goldQuantityName = 'gold-quantity';
const setGoldName = 'set-gold';
const settingsName = 'Gold';

export function setupSettings(ctx) {
    const settings = ctx.settings.section(settingsName);
    settings.add({
        type: 'number',
        name: goldQuantityName,
        label: 'Gold',
        default: 1000000000
    });
    settings.add({
        type: 'button',
        name: setGoldName,
        display: 'Set Gold',
        onClick: triggerSetGold
    });
}

export var getGoldQuantity = (ctx) => ctx.settings.section(settingsName).get(goldQuantityName);

export var registerForSetGold = (func) => {
    if (!setGoldFuncs.includes(func))
        setGoldFuncs.push(func);
}
const setGoldFuncs = [];
function triggerSetGold() {
    setGoldFuncs.forEach(func => func());
}
