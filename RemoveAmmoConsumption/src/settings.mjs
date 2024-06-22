const enabledName = 'enabled';
const generalSettingsName = 'General';

export function setupGeneralSettings(ctx) {
    const generalSettings = ctx.settings.section(generalSettingsName);
    generalSettings.add({
        type: 'switch',
        name: enabledName,
        label: 'Remove Ammunition Consumption',
        default: true
    });
}

export var getEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(enabledName);
