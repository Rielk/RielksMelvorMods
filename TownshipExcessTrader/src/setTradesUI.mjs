export function createAutoTradeConfig(resource) {
    const id = `auto-trade-from-resource-${resource}`;

    const unorderedList = document.createElement('ul');
    unorderedList.setAttribute('class', 'nav-main nav-main-horizontal nav-main-horizontal-override font-w400 font-size-sm mb-2 convert-from-township');
    unorderedList.setAttribute('id', id);

    const listItem = document.createElement('li');
    unorderedList.append(listItem);

    const button = document.createElement('button');
    button.textContent = 'Tick';
    button.setAttribute('class', 'btn btn-primary');
    button.onclick = () => {
        game.township.onTickTimer();
    };
    listItem.append(button);
    return unorderedList;
}
