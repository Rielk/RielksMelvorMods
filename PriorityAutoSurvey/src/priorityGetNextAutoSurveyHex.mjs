const ctx = mod.getContext(import.meta);
const settings = (await ctx.loadModule('src/settings.mjs'));
const characterStore = (await ctx.loadModule('src/characterStore.mjs'));

export function afterPatch(_, hex, nextHexes = []) {
    if (!settings.getEnabled(ctx)) {
        checkThenSetLastAutos(hex, nextHexes);
        return;
    }

    const ignoreVision = settings.getIgnoreVision(ctx);
    const surveyHidden = settings.getSurveyHidden(ctx);
    const ret = priorityGetNextAutoSurveyHex(hex, nextHexes, ignoreVision, surveyHidden);
    checkThenSetLastAutos(ret, nextHexes);
    return ret;
};

export function beforePatch(hex, nextHexes = []) {
    if (!settings.getEnabled(ctx))
        return;

    return checkIfResetNeeded(hex, nextHexes);
};

export function startAutoSurveyPatch(canStart, hex) {
    if (canStart) {
        const lastManual = {
            q: hex.q,
            r: hex.r
        }
        characterStore.setLastManual(ctx, lastManual)
    }
}

function checkIfResetNeeded(hex, nextHexes) {
    const lastAutos = characterStore.getLastAutos(ctx);
    if ((lastAutos.actual.q === hex.q && lastAutos.actual.r === hex.r) ||
        (lastAutos.render.q === hex.q && lastAutos.render.r === hex.r)) {
        const lastManual = characterStore.getLastManual(ctx);
        const lastManualHex = hex.map.getHex(lastManual);
        if (lastManualHex)
            hex = lastManualHex
        else
            hex = hex.map.playerPosition;
    }
    return [hex, nextHexes];
}

function checkThenSetLastAutos(retHex, nextHexes) {
    const lastAutos = characterStore.getLastAutos(ctx);
    if (retHex !== undefined) {
        if (nextHexes.length === 0) {
            lastAutos.actual = {
                q: retHex.q,
                r: retHex.r
            };
            characterStore.setLastAutos(ctx, lastAutos);
        } else {
            lastAutos.render = {
                q: retHex.q,
                r: retHex.r
            };
            characterStore.setLastAutos(ctx, lastAutos);
        }
    }
}

function priorityGetNextAutoSurveyHex(hex, nextHexes, ignoreVision, surveyHidden) {
    const map = hex.map;
    if (map.isFullySurveyed)
        return undefined;

    const unreachableHexes = [];
    while (true) {
        const closestPOI = findClosestRemainingPointOfInterest(ignoreVision, surveyHidden, map, nextHexes, unreachableHexes);
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

function findClosestRemainingPointOfInterest(ignoreVision, surveyHidden, map, nextHexes, unreachableHexes) {
    const game = map.game;
    const cartography = map.cartography;
    let closestPoint = undefined;
    let closestDistance = Infinity;
    map.pointsOfInterest.forEach((poi) => {
        if (!ignoreVision && !poi.hex.inSightRange)
            return;
        if (!surveyHidden && poi.hidden !== undefined)
            if (!poi.hidden.showMarker || !cartography.isHiddenPOIMet(poi.hidden))
                return;
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
