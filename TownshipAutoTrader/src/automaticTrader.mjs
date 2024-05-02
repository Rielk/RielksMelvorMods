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
        const currentQuantity = game.bank.getQty(item) + game.combat.player.equipment.getQuantityOfItem(item);

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
    pendingItems.sort((a, b) => b.currentQuantity - a.currentQuantity);

    let resourceToSpend = Math.max(0, resource.amount - config.getResourceLimit(resource.id));
    const buyingItems = [];
    while (pendingItems.length > 0) {
        buyingItems.push(pendingItems.pop());
        const totalRatio = buyingItems.reduce((a, i) => a + i.ratio, 0);
        const qtyLimit = pendingItems.slice(-1)[0]?.currentQuantity; //Will be undefined on final pass
        const currentTotal = buyingItems[0].currentQuantity + buyingItems[0].amountToAdd;
        const maxCanBuy = Math.floor(resourceToSpend / totalRatio);
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
        } else
            break;
    };

    //Commit Purchases
    buyingItems.forEach(i => {
        if (i.amountToAdd <= 0)
            return;
        game.township.convertQty = i.amountToAdd;
        game.township.processConversionFromTownship(i.item, resource);
    });
}
