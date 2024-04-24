const enabledConversionsName = 'enabled-conversions';
const resourceConfigsName = 'resource-configs';

class Config {
    constructor(ctx) {
        this._ctx = ctx;
        ctx.onCharacterLoaded((ctx) => this.onCharacterLoaded(ctx));
    }

    isResourceEnabled(resourceID) {
        return this._resources[resourceID]?.enabled;
    }

    resourceLimit(resourceID) {
        return this._resources[resourceID]?.limit;
    }

    isConversionEnabled(resourceID, conversionID) {
        return this.getConversion(resourceID, conversionID)?.enabled;
    }

    getConversion(resourceID, conversionID) {
        return this.getConversionForResource(resourceID)[conversionID];
    }

    getConversionForResource(resourceID) {
        return this._conversionStore[resourceID];
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
                    enableed: false,
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
