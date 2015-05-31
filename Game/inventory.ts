enum InventoryItemType {
    stick,
    rock,
    hemp,
    bone,
    clay,
    berries,
    mushroom,
    roots,
    lumber,
    plank,
    twine,
    rope,
    sand,
    brick,
    meat,
    skin,
    canvas,
    knife,
    axe
}

interface InventoryItem {
    type: InventoryItemType;
    stack: number;
    maxStack: number;
}

class Inventory {
    cached: HTMLCanvasElement;
    changes: boolean;
    itemset; HTMLImageElement;
    holding: InventoryItem; // in hands
    carrying: Array<InventoryItem>;
    carryCapacity: number;
    focusedIndex: number; // player is selecting an object from inventory

    constructor(carryCapacity) {
        this.carryCapacity = carryCapacity;
        this.holding = null;
        this.focusedIndex = null;
        this.changes = true;
    }

    toggle() {
        // player either begins interacting with their inventory or cancels
        if (this.focusedIndex === null) {
            this.focusedIndex = 0;
        }
        else {
            this.focusedIndex = null;
        }
    }

    equip(item: InventoryItem) {
        var success = false;

        if (this.holding == null) {
            // hands are free
            this.holding = item;
            success = true;
        }
        else {
            // hands full, can we move current held to bag?
            if (this.moveToBag()) {
                this.holding = item;
                success = true;
            }
        }

        return success;
    }

    pickup(item: InventoryItem) {
        var itemReceived = false;

        if (this.putInBag(item)) {
            itemReceived = true;
        }
        else {
            // no available slot, are hands available?
            if (this.holding == null) {
                this.holding = item;
                itemReceived = true;
            }
        }

        return itemReceived;
    }

    putInBag(item: InventoryItem) {
        var success = false;
        // maybe it's a stackable item?
        var availableStack = _.find(this.carrying, function (i: InventoryItem) { return i.type == item.type && i.stack < i.maxStack; });
        if (availableStack) {
            // add to inventory stack
            success = true;
        }
        else {
            // no available stack, check if there is inventory space
            if (this.carrying.length < this.carryCapacity) {
                // add to open inventory slot
                success = true;
            }
        }

        return success;
    }

    moveToBag() {
        var success = false;

        if (this.holding) {
            if (this.putInBag(this.holding)) {
                this.holding = null;
                success = true;
            }
        }

        return success;
    }

    // drop from hand
    drop(item: InventoryItem) {
        var dropped = this.carrying;
        this.carrying = null;
        return dropped;
    }

    // drop from inventory
    dropInv(index: number, dropStack: boolean) {
        var dropped: InventoryItem = null;

        if (this.carrying[index].stack === 1) {
            dropped = this.carrying[index];
            this.carrying[index] = null;
        }
        else if (dropStack) {
            dropped = this.carrying[index];
            this.carrying[index] = null;
        }
        else {
            this.carrying[index].stack--;
            dropped = {
                type: this.carrying[index].type,
                maxStack: this.carrying[index].maxStack,
                stack: 1
            };
        }

        return dropped;
    }

    draw(canvas: HTMLCanvasElement) {
        var ctx = canvas.getContext('2d'),
            boxLength = 75,
            startX = boxLength / 2,
            startY = canvas.height - boxLength * 3.5;

        if (this.changes) {
            var tempCanvas = document.createElement('canvas'),
                tempCtx = tempCanvas.getContext('2d'),
                borderWidth = 2,
                borderColor = '#000',
                fillColor = '#999';

            tempCanvas.width = this.carryCapacity * boxLength;
            tempCanvas.height = boxLength * 3;

            tempCtx.lineWidth = borderWidth;
            tempCtx.fillStyle = '#999';
            tempCtx.strokeStyle = "#000";

            // draw holding
            //tempCtx.fillRect(borderWidth / 2, borderWidth / 2, boxLength * 1.5, boxLength * 1.5);
            tempCtx.rect(0, 0, boxLength * 1.5, boxLength * 1.5);
            tempCtx.stroke();

            // draw carrying
            for (var i = 0; i < this.carryCapacity; i++) {
                if (this.focusedIndex === i) {
                    borderColor = '#ff0';
                }
                else {
                    borderColor = '#000';
                }

                //tempCtx.fillRect(i * boxLength, boxLength * 2, boxLength, boxLength);
                tempCtx.rect(i * boxLength, boxLength * 2, boxLength, boxLength);
                tempCtx.stroke();
            }

            this.cached = tempCanvas;
        }

        ctx.drawImage(this.cached, 0, 0, this.cached.width, this.cached.height, startX, startY, this.cached.width, this.cached.height);
    }
}