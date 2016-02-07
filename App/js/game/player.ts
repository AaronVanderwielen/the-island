import _ = require('underscore');
import Controls = require('controls');
import Inventory = require('inventory');
import Account = require('account');
import Map = require('map');
import MapObject = require('mapObject');
import Sprite = require('sprite');
import World = require('worldbuilder');

export interface PlayerProcess {
    d: number
    moveY: number;
    moveX: number;
    lookx: number;
    looky: number;
    strength: number;
    sprinting: boolean;
    looking: boolean;
    slow: number;
    actions: QueuedAction[];
}

export interface QueuedAction {
    action: PlayerAction;
    value?;
}

export enum PlayerAction {
    Interact,
    DropItem
}

export class Player {
    account: Account.Account;
    inventory: Inventory.Inventory;
    process: PlayerProcess;
    sprite: Sprite.Sprite;

    constructor(account: Account.Account) {
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

    registerControlsUpdates(socket: SocketIO.Socket) {
        var obj = this;
        socket.on('updatePlayerControls', function (controls: Controls.GameControls) {
            obj.update(controls);
        });
    }

    update(controls: Controls.GameControls) {
        // player can perform action
        this.processControls(controls);
        this.movement(controls);
    }

    movement(controls: Controls.GameControls) {
        var d = (controls.sprinting && !controls.looking) ? (controls.strength * 4) : ((controls.sprinting && controls.looking) ? (controls.strength * 3) : controls.strength * 2);

        this.process.d = Math.ceil(d * this.process.slow);
        this.process.moveY = Math.round(controls.y * this.process.d * this.process.slow);
        this.process.moveX = Math.round(controls.x * this.process.d * this.process.slow);
        this.process.lookx = controls.lookx;
        this.process.looky = controls.looky;
        this.process.strength = controls.strength;
        this.process.sprinting = controls.sprinting;
        this.process.looking = controls.looking;
    }

    processControls(controls: Controls.GameControls) {
        for (var a in controls.actions) {
            var action = controls.actions[a];
            if (!action.recorded) {
                // new action to process
                switch (action.button) {
                    case 0: // a
                        if (this.inventory.active) {
                            this.inventory.secondaryAction();
                        }
                        else {
                            this.process.actions.push({
                                action: PlayerAction.Interact
                            });
                        }
                        break;
                    case 1: // b
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
                    case 2: // x
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

    processAction(map: Map.Map) {
        this.move(map);
    }

    move(map: Map.Map) {
        var obj = this,
            sprite = this.sprite,
            //    <Sprite.Sprite>_.find(map.sprites, function (s) {
            //    return s.id == obj.sprite.id;
            //}),
            nextY = Math.round(sprite.y + obj.process.moveY),
            nextX = Math.round(sprite.x + obj.process.moveX),
            yOffset = Math.round(-(Sprite.Sprite.height * (1 - sprite.yAdjust))),
            nextBlock = Map.Map.getBlock(map, nextX, nextY + yOffset),
            nearbyBlocks = Map.Map.getSurroundingBlocks(map, nextX, nextY + yOffset),
            nearbyObjects = Map.Map.getBlocksObjects(map, nearbyBlocks),
            canMove = true;

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
                if (sprite.stepCounter >= 80) sprite.stepDir = -1;
                else if (sprite.stepCounter <= 0) sprite.stepDir = 1;

                sprite.stepCounter += (obj.process.d * sprite.stepDir);

                //sprite.currAnim = (Math.abs(obj.process.moveX) > Math.abs(obj.process.moveY)) ? (obj.process.moveX > 0 ? 1 : 3) : (obj.process.moveY > 0 ? 2 : 0);
                sprite.currStep = sprite.stepCounter < 20 ? 0 : sprite.stepCounter > 60 ? 2 : 1;

                sprite.x = nextX;
                sprite.y = nextY;
            }
        }

        sprite.sectionId = Map.Map.getSectionId(map, sprite.x, sprite.y, 'p');
    }
}