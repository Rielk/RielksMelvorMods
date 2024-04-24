const config = (await mod.getContext(import.meta).loadModule('src/config.mjs')).config;

export function afterPatch(ret) {
    return ret;
}
