const enabledName = 'enabled';
const generalSettingsName = 'General';

export function setupGeneralSettings(ctx) {
    const generalSettings = ctx.settings.section(generalSettingsName);
    generalSettings.add({
        type: 'switch',
        name: enabledName,
        label: 'Let Rune costs be reduced to 0',
        default: true
    });
}

export var getEnabled = (ctx) => ctx.settings.section(generalSettingsName).get(enabledName);
