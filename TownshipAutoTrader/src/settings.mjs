const countUpgrades = 'countUpgrades';
const countEquipped = 'countEquipped';
const generalSettingsName = 'General';

export function setupGeneralSettings(ctx) {
    const generalSettings = ctx.settings.section(generalSettingsName);
    generalSettings.add({
        type: 'switch',
        name: countUpgrades,
        label: 'Include Upgrades in Count',
        hint: 'Include upgrades of items when calculating current quantities.',
        default: true
    });
    generalSettings.add({
        type: 'switch',
        name: countEquipped,
        label: 'Include Equipped in Count',
        hint: 'Include equipped items when calculating current quantities.',
        default: true
    });
}

export var getCountUpgrades = (ctx) => ctx.settings.section(generalSettingsName).get(countUpgrades);
export var getCountEquipped = (ctx) => ctx.settings.section(generalSettingsName).get(countEquipped);
