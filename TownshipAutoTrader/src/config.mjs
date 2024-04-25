const automaticTrader = await mod.getContext(import.meta).loadModule('src/automaticTrader.mjs');

const enabledConversionsName = 'enabled-conversions';
const resourceConfigsName = 'resource-configs';

class Config {
    constructor(ctx) {
        this._conversionStore = undefined;
        this._resources = undefined;
        this._ctx = ctx;
        ctx.onCharacterLoaded((ctx) => this.onCharacterLoaded(ctx));
    }

    get enabledResources() {
        const enabledResources = [];
        for (var resourceID in this._resources) {
            const config = this._resources[resourceID];
            if (config.enabled)
                enabledResources.push(config.resource);
        }
        return enabledResources;
    }

    isResourceEnabled(resourceID) {
        return this._resources[resourceID]?.enabled;
    }

    setResourceEnabled(resourceID, enabled) {
        const config = this._resources[resourceID];
        if (config === undefined)
            return false;
        if (config.enabled === enabled)
            return true;
        config.enabled = enabled;
        this.saveState();
        if (enabled)
            automaticTrader.autoTrade(config, [config.resource]);
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

            var subConfig = resourceConfigs[resource.id];
            if (subConfig === undefined)
                subConfig = {
                    enabled: false,
                    limit: 0
                };
            resources[resource.id] = {
                enabled: subConfig.enabled,
                limit: subConfig.limit,
                resource: resource
            };
        });

        this._conversionStore = store;
        this._resources = resources;
    }

    saveState() {
        console.log('Config would have saved!')
        return; //Disable while testing.
        const enabledConversions = [];
        for (var resourceID in this._conversionStore)
            for (var conversionID in this._conversionStore[resourceID.id])
                if (getConversion(resourceID, conversionID).enabled)
                    enabledConversions.push(conversionID);

        const resourceConfigs = {};
        for (var resourceID in this._resources) {
            resourceConfigs[resourceID] = {
                enabled: this.isResourceEnabled(resourceID),
                limit: this.resourceLimit(resourceID),
            }
        }

        this._ctx.characterStorage.setItem(enabledConversionsName, enabledConversions);
        this._ctx.characterStorage.setItem(resourceConfigsName, resourceConfigs);
    }
}

export const config = new Config(mod.getContext(import.meta));
