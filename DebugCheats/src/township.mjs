export function createButton() {
    const outerDiv = document.createElement('div');
    outerDiv.setAttribute('class', 'col-12');

    const innerDiv = document.createElement('div');
    innerDiv.setAttribute('class', 'block p-2');
    outerDiv.append(innerDiv);

    const finalDiv = document.createElement('div');
    finalDiv.setAttribute('class', 'nav-main nav-main-horizontal nav-main-horizontal-center township');
    innerDiv.append(finalDiv);

    const button = document.createElement('button');
    button.textContent = 'Tick';
    button.setAttribute('class', 'btn btn-primary');
    button.onclick = () => {
        game.township.onTickTimer();
    };
    finalDiv.append(button);
    return outerDiv;
}
