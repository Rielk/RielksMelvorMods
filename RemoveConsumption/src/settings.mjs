const enabledName = 'Enabled';
const ammoName = 'ammunition';
const runeName = 'rune';
const prayName = 'prayPoint';
const foodName = 'food';
const sTabName = 'summoningTablet';
const consName = 'consumable';
const potiName = 'potion';
const generalSettingsName = 'General';

export function setupGeneralSettings(ctx) {
    const generalSettings = ctx.settings.section(generalSettingsName);
    generalSettings.add([
        {
            type: 'switch',
            name: ammoName + enabledName,
            label: 'Remove Ammunition Consumption',
            default: false
        },
        {
            type: 'switch',
            name: runeName + enabledName,
            label: 'Remove Rune Consumption',
            default: false
        },
        {
            type: 'switch',
            name: prayName + enabledName,
            label: 'Remove Prayer Point Consumption',
            default: false
        },
        {
            type: 'switch',
            name: foodName + enabledName,
            label: 'Remove Food Consumption',
            default: false
        },
        {
            type: 'switch',
            name: sTabName + enabledName,
            label: 'Remove Summoning Tablet Consumption',
            default: false
        },
        {
            type: 'switch',
            name: consName + enabledName,
            label: 'Remove Consumable Consumption',
            default: false
        },
        {
            type: 'switch',
            name: potiName + enabledName,
            label: 'Remove Potion Consumption',
            default: false
        }]);
}

export var getAmmoEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(ammoName + enabledName);
export var getRuneEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(runeName + enabledName);
export var getPrayEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(prayName + enabledName);
export var getFoodEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(foodName + enabledName);
export var getSTabEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(sTabName + enabledName);
export var getConsEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(consName + enabledName);
export var getPotiEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(potiName + enabledName);
