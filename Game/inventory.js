var InventoryItemType;
(function (InventoryItemType) {
    InventoryItemType[InventoryItemType["stick"] = 0] = "stick";
    InventoryItemType[InventoryItemType["rock"] = 1] = "rock";
    InventoryItemType[InventoryItemType["hemp"] = 2] = "hemp";
    InventoryItemType[InventoryItemType["bone"] = 3] = "bone";
    InventoryItemType[InventoryItemType["clay"] = 4] = "clay";
    InventoryItemType[InventoryItemType["berries"] = 5] = "berries";
    InventoryItemType[InventoryItemType["mushroom"] = 6] = "mushroom";
    InventoryItemType[InventoryItemType["roots"] = 7] = "roots";
    InventoryItemType[InventoryItemType["lumber"] = 8] = "lumber";
    InventoryItemType[InventoryItemType["plank"] = 9] = "plank";
    InventoryItemType[InventoryItemType["twine"] = 10] = "twine";
    InventoryItemType[InventoryItemType["rope"] = 11] = "rope";
    InventoryItemType[InventoryItemType["sand"] = 12] = "sand";
    InventoryItemType[InventoryItemType["brick"] = 13] = "brick";
    InventoryItemType[InventoryItemType["meat"] = 14] = "meat";
    InventoryItemType[InventoryItemType["skin"] = 15] = "skin";
    InventoryItemType[InventoryItemType["canvas"] = 16] = "canvas";
    InventoryItemType[InventoryItemType["knife"] = 17] = "knife";
    InventoryItemType[InventoryItemType["axe"] = 18] = "axe";
})(InventoryItemType || (InventoryItemType = {}));
var Inventory = (function () {
    function Inventory(carryCapacity) {
        this.carryCapacity = carryCapacity;
        this.holding = null;
        this.focusedIndex = null;
        this.changes = true;
    }
    Inventory.prototype.toggle = function () {
        // player either begins interacting with their inventory or cancels
        if (this.focusedIndex === null) {
            this.focusedIndex = 0;
        }
        else {
            this.focusedIndex = null;
        }
    };
    Inventory.prototype.equip = function (item) {
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
    };
    Inventory.prototype.pickup = function (item) {
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
    };
    Inventory.prototype.putInBag = function (item) {
        var success = false;
        // maybe it's a stackable item?
        var availableStack = _.find(this.carrying, function (i) {
            return i.type == item.type && i.stack < i.maxStack;
        });
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
    };
    Inventory.prototype.moveToBag = function () {
        var success = false;
        if (this.holding) {
            if (this.putInBag(this.holding)) {
                this.holding = null;
                success = true;
            }
        }
        return success;
    };
    // drop from hand
    Inventory.prototype.drop = function (item) {
        var dropped = this.carrying;
        this.carrying = null;
        return dropped;
    };
    // drop from inventory
    Inventory.prototype.dropInv = function (index, dropStack) {
        var dropped = null;
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
    };
    Inventory.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d'), boxLength = 75, startX = boxLength / 2, startY = canvas.height - boxLength * 3.5;
        if (this.changes) {
            var tempCanvas = document.createElement('canvas'), tempCtx = tempCanvas.getContext('2d'), borderWidth = 2, borderColor = '#000', fillColor = '#999';
            tempCanvas.width = this.carryCapacity * boxLength;
            tempCanvas.height = boxLength * 3;
            tempCtx.lineWidth = borderWidth;
            tempCtx.fillStyle = '#999';
            tempCtx.strokeStyle = "#000";
            // draw holding
            //tempCtx.fillRect(borderWidth / 2, borderWidth / 2, boxLength * 1.5, boxLength * 1.5);
            tempCtx.rect(0, 0, boxLength * 1.5, boxLength * 1.5);
            tempCtx.stroke();
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
    };
    return Inventory;
})();
//# sourceMappingURL=inventory.js.map