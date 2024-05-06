export function createOnInterfaceReadyFunction(config) {
    return () => {
        createAutoTradeConfig(config);
    };
}

function createAutoTradeConfig(config) {
    game.township.resources.forEach((resource) => {
        const element = document.getElementById(`jump-to-resource-${resource.id}`);
        if (element)
            element.after(createAutoTradeConfigElement(config, resource));
    });
}

function createAutoTradeConfigElement(config, resource) {
    const id = `auto-trade-from-resource-${resource.id}-settings`;

    const div = document.createElement('div');
    div.setAttribute('class', 'block block-rounded-double bg-combat-inner-dark');
    div.setAttribute('style', 'padding-bottom: 12px;');
    div.setAttribute('id', id);

    const headerDiv = createHeader(config, resource);
    div.append(headerDiv);

    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('class', 'block-content');
    div.append(contentDiv);

    const tradeModeId = `${resource.name}--auto-trade-mode`;
    const tradeModeOptions = [];
    for (const option of config.getTradeModesAndDescriptors()) {
        tradeModeOptions.push({
            value: option.mode,
            labelContent: option.name,
            tippy: option.description
        });
    }
    const tradeModeDiv = createRadioInput(tradeModeId, tradeModeOptions, config.getResourceTradeMode(resource.id), {
        maxWidth: 500,
        onInput: (e) => {
            if (e.target.checked)
                config.setResourceTradeMode(resource.id, parseInt(e.target.value));
        }
    });
    contentDiv.append(tradeModeDiv);

    const unorderedList = document.createElement('ul');
    unorderedList.setAttribute('class', 'nav-main nav-main-horizontal nav-main-horizontal-override font-w400 font-size-sm mb-2 auto-trader-settings');
    contentDiv.append(unorderedList);

    game.township.getResourceItemConversionsFromTownship(resource).forEach((conversion) => {
        const conversionDiv = createConversionListItem(config, resource, conversion);
        unorderedList.append(conversionDiv);
    });

    const quantityId = `${resource.name}--auto-limit-quanity`;
    const quantityDiv = createNumberInput(quantityId, `Minimum ${resource.name}`, config.getResourceLimit(resource.id), {
        maxWidth: 200,
        hint: `Limit minimum amount of ${resource.name} that will be left in storage`,
        onInput: (e) => {
            config.setResourceLimit(resource.id, e.target.value);
        }
    });
    contentDiv.append(quantityDiv);

    return div;
}

function createHeader(config, resource) {
    const div = document.createElement('div');
    div.setAttribute('class', 'block-header border-bottom bg-combat-inner-dark');

    const header = document.createElement('h3');
    header.setAttribute('class', 'block-title');
    header.innerText = `AutoTrade ${resource.name}`;

    const enabledId = `${resource.name}-enabled`;
    const isResourceEnabled = config.isResourceEnabled(resource.id);
    const enabledDiv = createToggle(enabledId, header, isResourceEnabled, {
        onInput: (e) => {
            config.setResourceEnabled(resource.id, e.target.checked);
        }
    });
    div.append(enabledDiv);

    return div;
}

function createNumberInput(id, labelContent, value, optional = {}) {
    const div = document.createElement('div');
    div.setAttribute('class', 'form-group');

    const label = document.createElement('label');
    label.setAttribute('class', 'font-weight-normal flex-wrap justify-content-start ml-2');
    label.setAttribute('for', id);
    if (typeof labelContent === 'string')
        label.innerHTML = labelContent;
    else
        label.append(labelContent);
    div.append(label);

    if (optional.hint) {
        const small = document.createElement('small');
        small.setAttribute('class', 'd-block');
        small.innerText = optional.hint;
        label.append(small);
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('class', 'form-control form-control-lg');
    if (optional.maxWidth)
        input.setAttribute('style', `max-width: ${optional.maxWidth}px;`);
    input.setAttribute('id', id);
    input.setAttribute('name', id);
    input.value = value;
    if (optional.onInput)
        input.addEventListener('input', optional.onInput);
    div.append(input);

    return div;
}

function createRadioInput(id, options, startValue, optional = {}) {
    const div = document.createElement('div');
    div.setAttribute('class', 'form-group');
    if (optional.maxWidth)
        div.setAttribute('style', `max-width: ${optional.maxWidth}px;`);

    var first = true;
    for (const option of options) {
        const subDiv = document.createElement('div');
        subDiv.setAttribute('class', 'custom-control custom-radio custom-control-inline');
        subDiv.setAttribute('style', 'z-index: auto;');
        div.append(subDiv);

        const subId = `${id}-${option.value}`;

        const input = document.createElement('input');
        input.setAttribute('type', 'radio');
        input.setAttribute('class', 'custom-control-input');
        input.setAttribute('id', subId);
        input.setAttribute('name', id);
        input.setAttribute('value', option.value);
        input.checked = first || option.value === startValue;
        first = false;
        if (optional.onInput)
            input.addEventListener('input', optional.onInput);
        subDiv.append(input);

        const label = document.createElement('label');
        label.setAttribute('class', 'font-weight-normal flex-wrap justify-content-start ml-2 custom-control-label');
        label.setAttribute('for', subId);
        if (typeof option.labelContent === 'string')
            label.innerHTML = option.labelContent;
        else
            label.append(option.labelContent);
        subDiv.append(label);

        if (option.tippy)
            tippy(subDiv, {
                content: option.tippy,
                animation: false,
                allowHTML: true
            });
    }

    return div;
}


function createToggle(id, labelContent, checked, optional = {}) {
    const div = document.createElement('div');
    div.setAttribute('class', 'custom-control custom-switch custom-control-lg');
    div.setAttribute('style', 'z-index: auto;');

    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('class', 'custom-control-input');
    input.setAttribute('id', id);
    input.setAttribute('name', id);
    input.checked = checked;
    if (optional.onInput)
        input.addEventListener('input', optional.onInput);
    div.append(input);

    const label = document.createElement('label');
    label.setAttribute('class', 'custom-control-label');
    label.setAttribute('for', id);
    if (typeof labelContent === 'string')
        label.innerHTML = labelContent;
    else
        label.append(labelContent);
    div.append(label);

    if (optional.hint) {
        const small = document.createElement('small');
        small.setAttribute('class', 'd-block');
        small.innerText = optional.hint;
        label.append(small);
    }

    return div;
}

function createConversionListItem(config, resource, conversion) {
    const li = document.createElement('li');
    li.setAttribute('class', 'btn btn-outline-secondary township-auto-trader-item-selector')
    li.setAttribute('style', 'margin: 2px; padding: 6px; float: left;')
    li.onclick = () => conversionListItemOnClick(config, li, resource.id, conversion.item.id);
    setConversionListItemOpacity(li, config.isConversionEnabled(resource.id, conversion.item.id));

    const img = document.createElement('img');
    img.setAttribute('src', conversion.item.media);
    img.setAttribute('width', '30');
    img.setAttribute('height', '30');
    li.append(img);

    tippy(li, {
        content: conversion.item.name,
        animation: false,
        allowHTML: true
    });

    return li;
}

function setConversionListItemOpacity(li, enabled, animate = false) {
    const opacity = enabled ? 1 : 0.25; 
    if (animate)
        $(li).fadeTo(200, opacity);
    else 
        li.style.opacity = opacity;
}

function conversionListItemOnClick(config, li, resourceID, conversionID) {
    const newEnabled = config.toggleConversionEnabled(resourceID, conversionID);
    setConversionListItemOpacity(li, newEnabled, true);
}
