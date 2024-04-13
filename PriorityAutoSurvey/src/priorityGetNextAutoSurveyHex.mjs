export function getPatch(getIgnoreVisionFunc) {
    return (_, hex, nextHexes = []) => priorityGetNextAutoSurveyHex(hex, nextHexes, getIgnoreVisionFunc)
}

function priorityGetNextAutoSurveyHex(hex, nextHexes, getIgnoreVisionFunc) {
    const ignoreVision = getIgnoreVisionFunc();
    const map = hex.map;
    if (map.isFullySurveyed)
        return undefined;

    const unreachableHexes = [];
    while (true) {
        const closestPOI = findClosestRemainingPointOfInterest(ignoreVision, map, nextHexes, unreachableHexes);
        if (closestPOI === undefined) //All POIs have been surveyed, the requirements aren't met, or are unreachable.
            return undefined;
        if (canSurvey(closestPOI, nextHexes))
            return closestPOI;

        let nextHex = undefined;
        let nextCoords = closestPOI;
        let lastDistance = 0;
        let expandSearch = true; //this is to stop after expanding past all map edges.
        while (nextHex === undefined) {
            nextCoords = HexCoords.getNextInSpiral(nextCoords, closestPOI);
            const nextDistance = HexCoords.distance(nextCoords, closestPOI);

            if (lastDistance !== nextDistance) {
                if (!expandSearch) {
                    nextHex = undefined;
                    break;
                }
                lastDistance = nextDistance;
                expandSearch = false;
            }

            nextHex = map.getHex(nextCoords);
            if (nextHex !== undefined) {
                expandSearch = true;
                if (!canSurvey(nextHex, nextHexes) || nextHexes.includes(nextHex))
                    nextHex = undefined;
            }

        }
        if (nextHex === undefined)
            unreachableHexes.push(closestPOI);
        else
            return nextHex;
    }
}

function canSurvey(hex, nextHexes = []) {
    if (hex.isMaxLevel)
        return false;
    if (!checkRequirements(hex))
        return false;
    if (!(hex.hasSurveyedOrQueuedNeighbour(hex.map.cartography) || hex.someNeighbour(n => nextHexes.includes(n))))
        return false;
    return true;
}

function checkRequirements(hex) {
    return hex.map.game.checkRequirements(hex.requirements);
}

function findClosestRemainingPointOfInterest(ignoreVision, map, nextHexes, unreachableHexes) {
    const game = map.game;
    let closestPoint = undefined;
    let closestDistance = Infinity;
    map.pointsOfInterest.forEach((poi) => {
        if (!ignoreVision && !poi.hex.inSightRange)
            return
        if (poi.hex.isMaxLevel || !game.checkRequirements(poi.hex.requirements) || unreachableHexes.includes(poi.hex) || nextHexes.includes(poi.hex))
            return;
        const distance = HexCoords.distance(poi.hex, map.playerPosition);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = poi.hex;
        }
    });
    return closestPoint;
}
