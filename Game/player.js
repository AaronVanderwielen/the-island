var Player = (function () {
    function Player() {
        this.inventory = new Inventory(10);
    }
    Player.prototype.update = function (world, sound) {
        // player can perform action
        if (_.some(this.controls.actions, function (a) {
            return a.button === 3 && !a.recorded;
        })) {
            // player pressed 'y', toggle inventory
            this.inventory.toggle();
        }
        else if (this.inventory.focusedIndex != null) {
            // inventory is open
            if (_.some(this.controls.actions, function (a) {
                return a.button === 14 && !a.recorded;
            })) {
                // left on d-pad
                if (this.inventory.focusedIndex == 0) {
                    this.inventory.focusedIndex = this.inventory.carryCapacity - 1;
                }
                else {
                    this.inventory.focusedIndex--;
                }
            }
            else if (_.some(this.controls.actions, function (a) {
                return a.button === 15 && !a.recorded;
            })) {
                // right on d-pad
                if (this.inventory.focusedIndex == this.inventory.carryCapacity - 1) {
                    this.inventory.focusedIndex = 0;
                }
                else {
                    this.inventory.focusedIndex++;
                }
            }
        }
        else {
            // no inventory actions, attempt movement
            this.sprite.move(this.controls.x, this.controls.y, this.controls.strength, world, sound);
        }
    };
    return Player;
})();
//# sourceMappingURL=player.js.map