export async function setup(ctx) {
    const settings = (await ctx.loadModule('src/settings.mjs'));
    settings.setupGeneralSettings(ctx);
    ctx.patch(Player, 'getRuneCosts').replace(function(regularGetRuneCosts, spell) { //function not arrow function for 'this' context
        if (!settings.getEnabled(ctx))
            return regularGetRuneCosts(spell);

        //else
        let runeCost = spell.runesRequired;
        const spellCost = [];
        if (this.useCombinationRunes && spell.runesRequiredAlt !== undefined)
            runeCost = spell.runesRequiredAlt;
        let flatModifier = 0;
        if (spell instanceof AttackSpell) {
            flatModifier += this.modifiers.getValue("melvorD:flatAttackSpellRuneCost", spell.modQuery);
        }
        runeCost.forEach((cost) => {
            var _a;
            let modifiedQuantity = cost.quantity - ((_a = this.runesProvided.get(cost.item)) !== null && _a !== void 0 ? _a : 0) + flatModifier;
            modifiedQuantity += this.modifiers.getValue("melvorD:flatSpellRuneCost", cost.item.modQuery);
            //modifiedQuantity = Math.max(1, modifiedQuantity); //Removed line
            if (modifiedQuantity > 0) // Added line
                spellCost.push({
                    item: cost.item,
                    quantity: modifiedQuantity,
                });
        });
        return spellCost;
    });
}
