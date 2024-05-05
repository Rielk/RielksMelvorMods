const automaticTrader = await mod.getContext(import.meta).loadModule('src/automaticTrader.mjs');

const enabledConversionsName = 'enabled-conversions';
const resourceConfigsName = 'resource-configs';

export function createConfig(ctx) {
    return new Config(ctx);
}

class Config {
    constructor(ctx) {
        this._conversionStore = undefined;
        this._resources = undefined;
        this._ctx = ctx;
        ctx.onCharacterLoaded((ctx) => this.onCharacterLoaded(ctx));
    }

    static TradeModes = Object.freeze({
        lowestQuantity: 0,
        buyEqualQuantity: 1,
        buyEqualCost: 2
    })

    get enabledResources() {
        const enabledResources = [];
        for (var resourceID in this._resources) {
            const config = this._resources[resourceID];
            if (config.enabled)
                enabledResources.push(config.resource);
        }
        return enabledResources;
    }

    enabledConversionsForResource(resourceID) {
        const enabledConversions = [];
        if (!this.isResourceEnabled(resourceID))
            return enabledConversions;

        const resourceConfig = this._conversionStore[resourceID];
        for (var conversionID in resourceConfig) {
            const conversionConfig = resourceConfig[conversionID];
            if (conversionConfig.enabled)
                enabledConversions.push(conversionConfig.conversion);
        }
        return enabledConversions;
    }

    isResourceEnabled(resourceID) {
        return this._resources[resourceID]?.enabled;
    }

    setResourceEnabled(resourceID, enabled) {
        const resourceConfig = this._resources[resourceID];
        if (resourceConfig === undefined)
            return false;
        if (resourceConfig.enabled === enabled)
            return true;
        resourceConfig.enabled = enabled;
        this.saveState();
        if (enabled)
            automaticTrader.autoTrade(this, [resourceConfig.resource]);
        return true;
    }

    getResourceLimit(resourceID) {
        return this._resources[resourceID]?.limit;
    }

    setResourceLimit(resourceID, limit) {
        const config = this._resources[resourceID];
        if (config === undefined)
            return false;
        if (config.limit === limit)
            return true;
        config.limit = limit;
        this.saveState();
        return true;
    }

    getResourceTradeMode(resourceID) {
        return this._resources[resourceID]?.tradeMode;
    }

    setResourceTradeMode(resourceID, tradeMode) {
        const config = this._resources[resourceID];
        if (config === undefined)
            return false;
        if (config.tradeMode === tradeMode)
            return true;
        config.tradeMode = tradeMode;
        this.saveState();
        return true;
    }

    isConversionEnabled(resourceID, conversionID) {
        return this._getConversionConfig(resourceID, conversionID)?.enabled;
    }

    _getConversionConfig(resourceID, conversionID) {
        return this._conversionStore[resourceID]?.[conversionID];
    }

    toggleConversionEnabled(resourceID, conversionID) {
        const config = this._getConversionConfig(resourceID, conversionID);
        if (config) {
            config.enabled = !config.enabled;
            this.saveState();
            return config.enabled;
        }
        return undefined;
    }

    onCharacterLoaded(ctx) {
        const store = {};
        const resources = {};

        var resourceConfigs = ctx.characterStorage.getItem(resourceConfigsName);
        if (resourceConfigs === undefined)
            resourceConfigs = {};

        var enabledConversions = ctx.characterStorage.getItem(enabledConversionsName);
        if (enabledConversions === undefined)
            enabledConversions = [];

        game.township.resources.forEach((resource) => {
            const conversions = game.township.getResourceItemConversionsFromTownship(resource);
            if (conversions.length === 0)
                return;

            const subStore = store[resource.id] = {};
            conversions.forEach((conversion) => {
                subStore[conversion.item.id] = {
                    enabled: enabledConversions.includes(conversion.item.id),
                    conversion: conversion
                };
            });

            var subConfig = resourceConfigs[resource.id] ?? {};
            resources[resource.id] = {
                enabled: subConfig.enabled ?? false,
                limit: subConfig.limit ?? 0,
                tradeMode: subConfig.tradeMode ?? Config.TradeModes.lowestQuantity,
                resource: resource
            };
        });

        this._conversionStore = store;
        this._resources = resources;
    }

    saveState() {
        const enabledConversions = [];
        for (var resourceID in this._conversionStore)
            for (var conversionID in this._conversionStore[resourceID])
                if (this.isConversionEnabled(resourceID, conversionID))
                    enabledConversions.push(conversionID);

        const resourceConfigs = {};
        for (var resourceID in this._resources) {
            resourceConfigs[resourceID] = {
                enabled: this.isResourceEnabled(resourceID),
                limit: this.getResourceLimit(resourceID),
                tradeMode: this.getResourceTradeMode(resourceID)
            }
        }

        this._ctx.characterStorage.setItem(enabledConversionsName, enabledConversions);
        this._ctx.characterStorage.setItem(resourceConfigsName, resourceConfigs);
    }
}
