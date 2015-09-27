class Player {
    sprite: Sprite;
    controls: Controls;
    inventory: Inventory;

    constructor(itemset: HTMLImageElement) {
        this.inventory = new Inventory(5, itemset);
        this.controls = new Controls();
    }

    update(game: Game, world: World, sound: Sound) {
        // player can perform action
        this.controls.report();
        this.processActions(game, world);
        this.sprite.move(this.controls, world, sound);
    }

    processActions(game: Game, world: World) {
        for (var a in this.controls.actions) {
            var action = this.controls.actions[a];
            if (!action.recorded) {
                // new action to process
                switch (action.button) {
                    case 0: // a
                        if (this.inventory.active) {
                            this.inventory.secondaryAction();
                        }
                        else {
                            world.interactMapObject(this, game);
                        }
                        break;
                    case 1: // b
                        if (this.inventory.active) {
                            // drop stack
                            var dropped = this.inventory.dropInv(this.inventory.focusedIndex, true);
                            if (dropped) {
                                world.dropMapItem(dropped, this.sprite, game);
                            }
                        }
                        break;
                    case 2: // x
                        if (this.inventory.active) {
                            var dropped = this.inventory.dropInv(this.inventory.focusedIndex, false);
                            if (dropped) {
                                world.dropMapItem(dropped, this.sprite, game);
                            }
                        }
                        else {
                            // use equipped item
                        }
                        break;
                    case 3: // y
                        this.inventory.toggle();
                        break;
                    case 4: // lb
                        break;
                    case 5: // rb
                        break;
                    case 6: // lt
                        // look around-- right thumb takes over anim
                        break;
                    case 7: // rt
                        // sprint
                        break;
                    case 8: // back
                        break;
                    case 9: // start
                        break;
                    case 10: // l3
                        break;
                    case 11: // r3
                        break;
                    case 12: // up on d-pad
                        if (this.inventory.active) {
                            this.inventory.focusedHolding = true;
                            this.inventory.changes = true;
                        }
                        break;
                    case 13: // down on d-pad
                        if (this.inventory.active) {
                            this.inventory.focusedHolding = false;
                            this.inventory.changes = true;
                        }
                        break;
                    case 14: // left on d-pad
                        if (this.inventory.active) {
                            if (this.inventory.focusedIndex == 0) {
                                this.inventory.focusedIndex = this.inventory.carryCapacity - 1;
                            }
                            else {
                                this.inventory.focusedIndex--;
                            }
                            this.inventory.changes = true;
                        }
                        break;
                    case 15: // right on d-pad
                        if (this.inventory.active) {
                            if (this.inventory.focusedIndex == this.inventory.carryCapacity - 1) {
                                this.inventory.focusedIndex = 0;
                            }
                            else {
                                this.inventory.focusedIndex++;
                            }
                            this.inventory.changes = true;
                        }
                        break;
                }
                action.recorded = true;
            }
        }
    }
}