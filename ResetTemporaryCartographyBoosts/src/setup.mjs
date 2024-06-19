export async function setup(ctx) {
    addSettingsButton(ctx);
}

function addSettingsButton(ctx) {
    const settings = ctx.settings.section('General');
    settings.add({
        type: 'button',
        name: 'resetTempCartographyBoosts',
        display: 'Reset',
        label: 'Reset Temporary Cartography Boosts',
        onClick() {
            resetTempCartographyBoosts();
        }
    });
}

function resetTempCartographyBoosts() {
    game.cartography.worldMaps.forEach((map) => {
        const toUndiscover = [];
        map.discoveredPOIs.forEach((poi) => {
            if (poi.discoveryModifiers !== undefined && poi.discoveryModifiers.modifiers.some(m => m.modifier.id === 'melvorD:cartographySurveyInterval'))
                toUndiscover.push(poi);
        });
        toUndiscover.forEach(undiscoverPOI);
    });
}

function undiscoverPOI(poi) {
    if (poi.activeStats.hasStats) {
        console.log('Unexpected Active POI could not be reset');
        return;
    }
    if (poi instanceof Watchtower) {
        console.log('Unexpected Watchtower could not be reset');
        return;
    }
    if (poi instanceof DigSitePOI) {
        console.log('Unexpected Digsite could not be reset');
        return;
    }

    const map = poi.hex.map;
    const cartography = map.cartography;
    const discoveredIdx = map.discoveredPOIs.indexOf(poi);
    if (discoveredIdx > -1)
        map.discoveredPOIs.splice(discoveredIdx, 1);
    if (poi.hidden !== undefined && poi.hidden.showMarker)
        map.markedUndiscoveredHiddenPOIs.add(poi);
    map.undiscoveredPOIs.push(poi);
    cartography.renderQueue.poiDiscoveryBtn = true;
    poi.isDiscovered = false;
    if (poi.hex.isPlayerHere) {
        let moveTo = poi.hex;
        while (moveTo.hasPOI || !moveTo.isFullySurveyed) {
            let coords = HexCoords.getNextInSpiral(moveTo, poi.hex);
            moveTo = map.getHex(coords);
        }
        cartography.movePlayer([moveTo], true);
        cartography.updateHiddenPOIDiscoveryHandler();
    }
    if (poi.discoveryModifiers !== undefined) {
        poi.discoveryModifiers.movesLeft = 0;
        cartography.activeDiscoveryModifiers.delete(poi.discoveryModifiers);
    }
    //Active stats asserted false;
    //addPoiModifier is ignored;
    cartography.game.combat.computeAllStats();
    //Discovery rewards are ignored;
    //Watchtower asserted false;
    cartography.renderQueue.poiMarkers.delete(poi);
    //Digsite asserted false;
    cartography.game.woodcutting.renderQueue.treeUnlocks = true;
    cartography.renderQueue.poiDiscoveryOptions = true;
}
