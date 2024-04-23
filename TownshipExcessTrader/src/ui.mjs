const ctx = mod.getContext(import.meta);
ctx.loadTemplates('src/templates.html');

export function followWithList(element, id, classes) {
    const ulTemplate = document.querySelector('#unordered-list-template');
    const ulClone = ulTemplate.content.cloneNode(true);
    const ulElement = ulClone.querySelector('#ul-container');
    if (id)
        ulElement.setAttribute('id', id);
    if (classes)
        ulElement.setAttribute('class', classes);
    element.after(ulClone);
    return ulElement;
}
