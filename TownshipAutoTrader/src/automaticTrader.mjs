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
    const pendingItems = [];
    conversions.forEach(conversion => {
        if (!isRequirementMet(conversion.unlockRequirements))
            return;

        const item = conversion.item;
        const ratio = game.township.getBaseConvertFromTownshipRatio(resource, item);
        const currentQuantity = getQuantityOfItemAndUpgrades(item);

        pendingItems.push({
            item: item,
            currentQuantity: currentQuantity,
            ratio: ratio,
            amountToAdd: 0
        });
    });
    if (pendingItems.length === 0)
        return;

    //Calculate Spending
    const tradeMode = config.getResourceTradeMode(resource.id);
    let resourceAtStart = Math.max(0, resource.amount - config.getResourceLimit(resource.id));
    var buyingItems;
    switch (tradeMode) {
        case config.TradeModes.buyEqualCost:
            buyingItems = equalCostBuying(resourceAtStart, pendingItems);
            break;
        case config.TradeModes.buyEqualQuantity:
            buyingItems = equalQuantityBuying(resourceAtStart, pendingItems);
            break;
        default:
        case config.TradeModes.lowestQuantity:
            buyingItems = lowestQuantityBuying(resourceAtStart, pendingItems);
            break;
    }

    //Commit Purchases
    buyingItems.forEach(i => {
        if (i.amountToAdd <= 0)
            return;
        game.township.convertQty = Math.floor(i.amountToAdd);
        game.township.processConversionFromTownship(i.item, resource);
    });
}

function equalCostBuying(resourceAtStart, pendingItems) {
    const resourcePerItem = Math.floor(resourceAtStart / pendingItems.length);

    const buyingItems = [];
    while (pendingItems.length > 0) {
        const item = pendingItems.pop();
        const amountToBuy = item.ratio === 0 ? 0 : Math.floor(resourcePerItem / item.ratio);
        item.amountToAdd = amountToBuy;
        buyingItems.push(item);
    }
    return buyingItems;
}

function equalQuantityBuying(resourceAtStart, pendingItems) {
    const totalRatio = pendingItems.reduce((a, i) =>  a + i.ratio , 0);
    const maxCanBuy = totalRatio === 0 ? 0 : Math.floor(resourceAtStart / totalRatio);

    const buyingItems = [];
    while (pendingItems.length > 0) {
        const item = pendingItems.pop();
        item.amountToAdd = maxCanBuy;
        buyingItems.push(item);
    }
    return buyingItems;
}

function lowestQuantityBuying(resourceAtStart, pendingItems) {
    pendingItems.sort((a, b) => b.currentQuantity - a.currentQuantity);

    let resourceToSpend = resourceAtStart;
    const buyingItems = [];
    while (pendingItems.length > 0) {
        buyingItems.push(pendingItems.pop());
        const totalRatio = buyingItems.reduce((a, i) => a + i.ratio, 0);
        const qtyLimit = pendingItems.slice(-1)[0]?.currentQuantity; //Will be undefined on final pass
        const currentTotal = buyingItems[0].currentQuantity + buyingItems[0].amountToAdd;
        const maxCanBuy = totalRatio === 0 ? 0 : Math.floor(resourceToSpend / totalRatio);
        var qtyToBuy;
        if (qtyLimit === undefined)
            qtyToBuy = maxCanBuy;
        else
            qtyToBuy = Math.min(maxCanBuy, qtyLimit - currentTotal);
        buyingItems.forEach(i => i.amountToAdd += qtyToBuy);
        resourceToSpend -= qtyToBuy * totalRatio;
    }

    //Buy Individuals
    for (const i of buyingItems) {
        if (i.ratio < resourceToSpend) {
            resourceToSpend -= i.ratio;
            i.amountToAdd += 1;
        }
        else
            break;
    };
    return buyingItems;
}

function getQuantityOfItemAndUpgrades(item) {
    const baseQnt = game.bank.getQty(item);
    const equipQnt = settings.getCountEquipped(ctx) ? game.combat.player.equipment.getQuantityOfItem(item) : 0;

    var itemUpgrades;
    const upgradeQnt = (!settings.getCountUpgrades(ctx) || (itemUpgrades = game.bank.itemUpgrades.get(item)) === undefined)
        ? 0 : itemUpgrades.reduce((count, i) => count + getQuantityOfItemAndUpgrades(i.upgradedItem), 0);

    return baseQnt + equipQnt + upgradeQnt;
}
