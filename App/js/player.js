var Player = (function () {
    function Player(itemset) {
        this.inventory = new Inventory(5, itemset);
    }
    Player.prototype.update = function (game, world, sound) {
        // player can perform action
        this.processActions(game, world);
        this.sprite.move(this.controls, world, sound);
    };
    Player.prototype.processActions = function (game, world) {
        for (var a in this.controls.actions) {
            var action = this.controls.actions[a];
            if (!action.recorded) {
                // new action to process
                switch (action.button) {
                    case 0:
                        if (this.inventory.active) {
                            this.inventory.secondaryAction();
                        }
                        else {
                            world.interactMapObject(this, game);
                        }
                        break;
                    case 1:
                        if (this.inventory.active) {
                            // drop stack
                            var dropped = this.inventory.dropInv(this.inventory.focusedIndex, true);
                            if (dropped) {
                                world.dropMapItem(dropped, this.sprite, game);
                            }
                        }
                        break;
                    case 2:
                        if (this.inventory.active) {
                            var dropped = this.inventory.dropInv(this.inventory.focusedIndex, false);
                            if (dropped) {
                                world.dropMapItem(dropped, this.sprite, game);
                            }
                        }
                        else {
                        }
                        break;
                    case 3:
                        this.inventory.toggle();
                        break;
                    case 4:
                        break;
                    case 5:
                        break;
                    case 6:
                        // look around-- right thumb takes over anim
                        break;
                    case 7:
                        // sprint
                        break;
                    case 8:
                        break;
                    case 9:
                        break;
                    case 10:
                        break;
                    case 11:
                        break;
                    case 12:
                        if (this.inventory.active) {
                            this.inventory.focusedHolding = true;
                        }
                        break;
                    case 13:
                        if (this.inventory.active) {
                            this.inventory.focusedHolding = false;
                        }
                        break;
                    case 14:
                        if (this.inventory.active) {
                            if (this.inventory.focusedIndex == 0) {
                                this.inventory.focusedIndex = this.inventory.carryCapacity - 1;
                            }
                            else {
                                this.inventory.focusedIndex--;
                            }
                        }
                        break;
                    case 15:
                        if (this.inventory.active) {
                            if (this.inventory.focusedIndex == this.inventory.carryCapacity - 1) {
                                this.inventory.focusedIndex = 0;
                            }
                            else {
                                this.inventory.focusedIndex++;
                            }
                        }
                        break;
                }
                action.recorded = true;
            }
        }
    };
    return Player;
})();
