export function createAfterTickPatch(config) {
    return (ret) => {
        autoTrade(config, config.enabledResources);
        return ret;
    }
}

export function autoTrade(config, resources) {
    resources.forEach((resource) => {
        console.log(`Would have done the trading for ${resource.name}!`);
    });
}
