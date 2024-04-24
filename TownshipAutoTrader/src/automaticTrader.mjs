const config = (await mod.getContext(import.meta).loadModule('src/config.mjs')).config;

export function afterPatch(ret) {
    autoTrade();
    return ret;
}

export function autoTrade() {
    console.log('Would have done the trading!');
}
