const ctx = mod.getContext(import.meta);
const settings = (await ctx.loadModule('src/settings.mjs'));

export function createAfterTickPatch(config) {
    return (ret) => {
        autoTrade(config, config.enabledResources);
        return ret;
    };
}

export function autoTrade(config, resources) {
    resources.forEach((resource) => {
        autoTradeResource(config, resource);
    });
}

function autoTradeResource(config, resource) {
    //Get current states
    const conversions = config.enabledConversionsForResource(resource.id);
    const pendingConversions = [];
    conversions.forEach(conversion => {
        if (!isRequirementMet(conversion.unlockRequirements))
            return;

        const item = conversion.item;
        const ratio = game.township.getBaseConvertFromTownshipRatio(conversion);
        const currentQuantity = getQuantityOfItemAndUpgrades(item);

        pendingConversions.push({
            conversion: conversion,
            currentQuantity: currentQuantity,
            ratio: ratio,
            amountToAdd: 0
        });
    });
    if (pendingConversions.length === 0)
        return;

    //Calculate Spending
    const tradeMode = config.getResourceTradeMode(resource.id);
    let resourceAtStart = Math.max(0, resource.amount - config.getResourceLimit(resource.id));
    var buyingConversions;
    switch (tradeMode) {
        case config.TradeModes.buyEqualCost:
            buyingConversions = equalCostBuying(resourceAtStart, pendingConversions);
            break;
        case config.TradeModes.buyEqualQuantity:
            buyingConversions = equalQuantityBuying(resourceAtStart, pendingConversions);
            break;
        default:
        case config.TradeModes.lowestQuantity:
            buyingConversions = lowestQuantityBuying(resourceAtStart, pendingConversions);
            break;
    }

    //Commit Purchases
    buyingConversions.forEach(c => {
        if (c.amountToAdd <= 0)
            return;
        game.township.convertQty = Math.floor(c.amountToAdd);
        game.township.processConversionFromTownship(c.conversion, resource);
    });
}

function equalCostBuying(resourceAtStart, pendingConversions) {
    const resourcePerItem = Math.floor(resourceAtStart / pendingConversions.length);

    const buyingConversions = [];
    while (pendingConversions.length > 0) {
        const item = pendingConversions.pop();
        const amountToBuy = item.ratio === 0 ? 0 : Math.floor(resourcePerItem / item.ratio);
        item.amountToAdd = amountToBuy;
        buyingConversions.push(item);
    }
    return buyingConversions;
}

function equalQuantityBuying(resourceAtStart, pendingConversions) {
    const totalRatio = pendingConversions.reduce((a, i) =>  a + i.ratio , 0);
    const maxCanBuy = totalRatio === 0 ? 0 : Math.floor(resourceAtStart / totalRatio);

    const buyingConversions = [];
    while (pendingConversions.length > 0) {
        const item = pendingConversions.pop();
        item.amountToAdd = maxCanBuy;
        buyingConversions.push(item);
    }
    return buyingConversions;
}

function lowestQuantityBuying(resourceAtStart, pendingConversions) {
    pendingConversions.sort((a, b) => b.currentQuantity - a.currentQuantity);

    let resourceToSpend = resourceAtStart;
    const buyingConversions = [];
    while (pendingConversions.length > 0) {
        buyingConversions.push(pendingConversions.pop());
        const totalRatio = buyingConversions.reduce((a, i) => a + i.ratio, 0);
        const qtyLimit = pendingConversions.slice(-1)[0]?.currentQuantity; //Will be undefined on final pass
        const currentTotal = buyingConversions[0].currentQuantity + buyingConversions[0].amountToAdd;
        const maxCanBuy = totalRatio === 0 ? 0 : Math.floor(resourceToSpend / totalRatio);
        var qtyToBuy;
        if (qtyLimit === undefined)
            qtyToBuy = maxCanBuy;
        else
            qtyToBuy = Math.min(maxCanBuy, qtyLimit - currentTotal);
        buyingConversions.forEach(i => i.amountToAdd += qtyToBuy);
        resourceToSpend -= qtyToBuy * totalRatio;
    }

    //Buy Individuals
    for (const i of buyingConversions) {
        if (i.ratio < resourceToSpend) {
            resourceToSpend -= i.ratio;
            i.amountToAdd += 1;
        }
        else
            break;
    };
    return buyingConversions;
}

function getQuantityOfItemAndUpgrades(item) {
    const baseQnt = game.bank.getQty(item);
    const equipQnt = settings.getCountEquipped(ctx) ? game.combat.player.equipment.getQuantityOfItem(item) : 0;

    var itemUpgrades;
    const upgradeQnt = (!settings.getCountUpgrades(ctx) || (itemUpgrades = game.bank.itemUpgrades.get(item)) === undefined)
        ? 0 : itemUpgrades.reduce((count, i) => count + getQuantityOfItemAndUpgrades(i.upgradedItem), 0);

    return baseQnt + equipQnt + upgradeQnt;
}
