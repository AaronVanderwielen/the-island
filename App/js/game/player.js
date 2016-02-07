define(["require", "exports", 'inventory', 'map', 'sprite', 'worldbuilder'], function (require, exports, Inventory, Map, Sprite, World) {
    (function (PlayerAction) {
        PlayerAction[PlayerAction["Interact"] = 0] = "Interact";
        PlayerAction[PlayerAction["DropItem"] = 1] = "DropItem";
    })(exports.PlayerAction || (exports.PlayerAction = {}));
    var PlayerAction = exports.PlayerAction;
    var Player = (function () {
        function Player(account) {
            this.account = account;
            this.process = {
                d: 0,
                moveY: 0,
                moveX: 0,
                lookx: 0,
                looky: 0,
                strength: 0,
                sprinting: false,
                looking: false,
                slow: 1,
                actions: []
            };
            this.inventory = new Inventory.Inventory(5);
            this.sprite = new Sprite.Sprite();
        }
        Player.prototype.registerControlsUpdates = function (socket) {
            var obj = this;
            socket.on('updatePlayerControls', function (controls) {
                obj.update(controls);
            });
        };
        Player.prototype.update = function (controls) {
            // player can perform action
            this.processControls(controls);
            this.movement(controls);
        };
        Player.prototype.movement = function (controls) {
            var d = (controls.sprinting && !controls.looking) ? (controls.strength * 4) : ((controls.sprinting && controls.looking) ? (controls.strength * 3) : controls.strength * 2);
            this.process.d = Math.ceil(d * this.process.slow);
            this.process.moveY = Math.round(controls.y * this.process.d * this.process.slow);
            this.process.moveX = Math.round(controls.x * this.process.d * this.process.slow);
            this.process.lookx = controls.lookx;
            this.process.looky = controls.looky;
            this.process.strength = controls.strength;
            this.process.sprinting = controls.sprinting;
            this.process.looking = controls.looking;
        };
        Player.prototype.processControls = function (controls) {
            for (var a in controls.actions) {
                var action = controls.actions[a];
                if (!action.recorded) {
                    // new action to process
                    switch (action.button) {
                        case 0:
                            if (this.inventory.active) {
                                this.inventory.secondaryAction();
                            }
                            else {
                                this.process.actions.push({
                                    action: PlayerAction.Interact
                                });
                            }
                            break;
                        case 1:
                            if (this.inventory.active) {
                                // drop stack
                                var dropped = this.inventory.dropInv(this.inventory.focusedIndex, true);
                                if (dropped) {
                                    this.process.actions.push({
                                        action: PlayerAction.DropItem,
                                        value: dropped
                                    });
                                }
                            }
                            break;
                        case 2:
                            if (this.inventory.active) {
                                var dropped = this.inventory.dropInv(this.inventory.focusedIndex, false);
                                if (dropped) {
                                    this.process.actions.push({
                                        action: PlayerAction.DropItem,
                                        value: dropped
                                    });
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
                                this.inventory.changes = true;
                            }
                            break;
                        case 13:
                            if (this.inventory.active) {
                                this.inventory.focusedHolding = false;
                                this.inventory.changes = true;
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
                                this.inventory.changes = true;
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
                                this.inventory.changes = true;
                            }
                            break;
                    }
                    action.recorded = true;
                }
            }
        };
        Player.prototype.processAction = function (map) {
            this.move(map);
        };
        Player.prototype.move = function (map) {
            var obj = this, sprite = this.sprite, 
            //    <Sprite.Sprite>_.find(map.sprites, function (s) {
            //    return s.id == obj.sprite.id;
            //}),
            nextY = Math.round(sprite.y + obj.process.moveY), nextX = Math.round(sprite.x + obj.process.moveX), yOffset = Math.round(-(Sprite.Sprite.height * (1 - sprite.yAdjust))), nextBlock = Map.Map.getBlock(map, nextX, nextY + yOffset), nearbyBlocks = Map.Map.getSurroundingBlocks(map, nextX, nextY + yOffset), nearbyObjects = Map.Map.getBlocksObjects(map, nearbyBlocks), canMove = true;
            if (nextBlock.type === World.TerrainType.shallow) {
                obj.process.slow = sprite.yAdjust > .75 ? .75 : sprite.yAdjust > .65 ? .5 : .25;
            }
            else if (nextBlock.type === World.TerrainType.ocean || nextBlock.type === World.TerrainType.mountain) {
                canMove = false;
            }
            else {
                obj.process.slow = 1;
            }
            sprite.blockX = nextBlock.x;
            sprite.blockY = nextBlock.y;
            if (canMove) {
                if (nearbyObjects.length > 0) {
                    sprite.passing = false;
                    for (var o in nearbyObjects) {
                        if (nearbyObjects[o].z === sprite.z && nearbyObjects[o].onItem(nextY, nextX)) {
                            if (nearbyObjects[o].pass) {
                                obj.process.slow = nearbyObjects[o].passSlow;
                                sprite.passing = true;
                            }
                            else {
                                canMove = false;
                            }
                        }
                    }
                }
                else {
                    sprite.passing = false;
                }
            }
            if (obj.process.looking && (Math.abs(obj.process.lookx) > 0 || Math.abs(obj.process.looky) > 0)) {
                sprite.currAnim = (Math.abs(obj.process.lookx) > Math.abs(obj.process.looky)) ? (obj.process.lookx > 0 ? 1 : 3) : (obj.process.looky > 0 ? 2 : 0);
            }
            else if (Math.abs(obj.process.moveX) > 0 || Math.abs(obj.process.moveY) > 0) {
                sprite.currAnim = (Math.abs(obj.process.moveX) > Math.abs(obj.process.moveY)) ? (obj.process.moveX > 0 ? 1 : 3) : (obj.process.moveY > 0 ? 2 : 0);
            }
            if (obj.process.strength > 0) {
                if (canMove && obj.process.d > 0) {
                    if (sprite.stepCounter >= 80)
                        sprite.stepDir = -1;
                    else if (sprite.stepCounter <= 0)
                        sprite.stepDir = 1;
                    sprite.stepCounter += (obj.process.d * sprite.stepDir);
                    //sprite.currAnim = (Math.abs(obj.process.moveX) > Math.abs(obj.process.moveY)) ? (obj.process.moveX > 0 ? 1 : 3) : (obj.process.moveY > 0 ? 2 : 0);
                    sprite.currStep = sprite.stepCounter < 20 ? 0 : sprite.stepCounter > 60 ? 2 : 1;
                    sprite.x = nextX;
                    sprite.y = nextY;
                }
            }
            sprite.sectionId = Map.Map.getSectionId(map, sprite.x, sprite.y, 'p');
        };
        return Player;
    })();
    exports.Player = Player;
});
//# sourceMappingURL=player.js.map