const config = (await mod.getContext(import.meta).loadModule('src/config.mjs')).config;

export function createAutoTradeConfig() {
    game.township.resources.forEach((resource) => {
        const element = document.getElementById(`jump-to-resource-${resource.id}`);
        if (element)
            element.after(createAutoTradeConfigElement(resource));
    });
}

function createAutoTradeConfigElement(resource) {
    const id = `auto-trade-from-resource-${resource.id}-settings`;

    const div = document.createElement('div');
    div.setAttribute('class', 'block block-rounded-double bg-combat-inner-dark');
    div.setAttribute('style', 'padding-bottom: 12px;');
    div.setAttribute('id', id);

    const headerDiv = createHeader(resource);
    div.append(headerDiv);

    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('class', 'block-content');
    div.append(contentDiv);

    const unorderedList = document.createElement('ul');
    unorderedList.setAttribute('class', 'nav-main nav-main-horizontal nav-main-horizontal-override font-w400 font-size-sm mb-2 auto-trader-settings');
    contentDiv.append(unorderedList);

    game.township.getResourceItemConversionsFromTownship(resource).forEach((conversion) => {
        const conversionDiv = createConversionListItem(conversion);
        tippy(conversionDiv, {
            content: conversion.item.name,
            animation: false,
            allowHTML: true
        });

        unorderedList.append(conversionDiv);
    });

    const quantityId = `${resource.name}--auto-limit-quanity`;
    const quantityDiv = createNumberInput(quantityId, `Minimum ${resource.name}`, config.resourceLimit(resource.id), {
        maxWidth: 200,
        hint: `Limit minimum amount of ${resource.name} that will be left in storage`
    });
    contentDiv.append(quantityDiv);

    return div;
}

function createHeader(resource) {
    const div = document.createElement('div');
    div.setAttribute('class', 'block-header border-bottom bg-combat-inner-dark');

    const header = document.createElement('h3');
    header.setAttribute('class', 'block-title');
    header.innerText = `AutoTrade ${resource.name}`;

    const enabledId = `${resource.name}-enabled`;
    const isResourceEnabled = config.isResourceEnabled(resource.id);
    const enabledDiv = createToggle(enabledId, header, isResourceEnabled);
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
    div.append(input);

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

function createConversionListItem(conversion) {
    const li = document.createElement('li');
    li.setAttribute('class', 'btn btn-outline-secondary township-excess-trader-item-selector')
    li.setAttribute('data-action', conversion.item.id);
    li.setAttribute('style', 'margin: 2px; padding: 6px; float: left;')

    const img = document.createElement('img');
    img.setAttribute('src', conversion.item.media);
    img.setAttribute('width', '30');
    img.setAttribute('height', '30');
    li.append(img);

    return li;
}
