var Inventory = (function () {
    function Inventory(carryCapacity, itemset) {
        this.itemset = itemset;
        this.carrying = [];
        this.carryCapacity = carryCapacity;
        for (var i = 0; i < carryCapacity; i++) {
            this.carrying[i] = null;
        }
        this.holding = null;
        this.focusedIndex = null;
        this.changes = true;
        this.focusedHolding = false;
        this.focusedIndex = 0;
        this.secondaryFocusActive = false;
        this.secondaryFocusHolding = false;
        this.secondaryFocusIndex = 0;
        this.active = false;
    }
    Inventory.prototype.toggle = function () {
        // player either begins interacting with their inventory or cancels
        this.active = !this.active;
        // if there was a secondary action (moving items) cancel it
        this.secondaryFocusActive = false;
        this.secondarySelection = null;
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
    Inventory.prototype.pickup = function (mItem) {
        var numReceived = 0, invItem = mItem.toInventoryItem(), stack = invItem.stack, tryBag;
        while (stack > 0 && tryBag !== 0) {
            tryBag = this.putInBag(invItem, stack);
            numReceived += tryBag;
            stack -= tryBag;
        }
        if (stack > 0) {
            // no available slot or filled available slots, are hands available?
            var tryHands = this.putInHands(invItem, stack);
            numReceived += tryHands;
            stack -= tryHands;
        }
        return numReceived;
    };
    Inventory.prototype.putInBag = function (item, stack) {
        var numReceived = 0;
        // maybe it's a stackable item?
        var existingStack = _.find(this.carrying, function (i) {
            return i && i.type == item.type && i.stack < i.maxStack;
        });
        if (existingStack) {
            while (existingStack.stack < existingStack.maxStack && stack > 0) {
                existingStack.stack++;
                stack--;
                numReceived++;
            }
        }
        else {
            // no available stack, check if there is inventory space
            var emptySlot = this.carrying.indexOf(null);
            if (emptySlot > -1) {
                // add to open inventory slot
                this.carrying[emptySlot] = item;
                this.carrying[emptySlot].stack = 0;
                while (this.carrying[emptySlot].stack < this.carrying[emptySlot].maxStack && stack > 0) {
                    this.carrying[emptySlot].stack++;
                    stack--;
                    numReceived++;
                }
            }
        }
        return numReceived;
    };
    Inventory.prototype.putInHands = function (item, stack) {
        var numReceived = 0;
        if (this.holding == null) {
            this.holding = item;
            this.holding.stack = 0;
            while (this.holding.stack < this.holding.maxStack && stack > 0) {
                this.holding.stack++;
                stack--;
                numReceived++;
            }
        }
        else if (this.holding.type === item.type) {
            while (this.holding.stack < this.holding.maxStack && stack > 0) {
                this.holding.stack++;
                stack--;
                numReceived++;
            }
        }
        return numReceived;
    };
    Inventory.prototype.moveToBag = function () {
        var success = false;
        //if (this.holding) {
        //    if (this.putInBag(this.holding)) {
        //        this.holding = null;
        //        success = true;
        //    }
        //}
        return success;
    };
    Inventory.prototype.secondaryAction = function () {
        if (this.secondarySelection) {
            var holdingIsTarget = (this.secondarySelection == "holding"), holdingIndex = holdingIsTarget ? -1 : parseInt(this.secondarySelection);
            // swapping two items, one already selected
            if (this.secondaryFocusHolding) {
            }
            else {
            }
        }
        else {
        }
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
        if (this.carrying[index]) {
            if (this.carrying[index].stack === 1) {
                dropped = new MapItem(this.itemset, null, this.carrying[index]);
                this.carrying[index] = null;
            }
            else if (dropStack) {
                dropped = new MapItem(this.itemset, null, this.carrying[index]);
                this.carrying[index] = null;
            }
            else {
                dropped = new MapItem(this.itemset, null, this.carrying[index], 1);
                this.carrying[index].stack--;
            }
        }
        return dropped;
    };
    Inventory.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d'), boxLength = 50, startX = boxLength / 2, startY = canvas.height - boxLength * 3.5;
        if (this.changes) {
            var tempCanvas = document.createElement('canvas'), tempCtx = tempCanvas.getContext('2d'), borderWidth = 1, borderColor = '#000', fillColor = 'rgba(0, 0, 0, 0.5)', focusColor = 'rgba(100, 100, 0, 0.5)', secondaryFocusColor = 'rgba(100, 100, 0, 0.5)';
            tempCanvas.width = this.carryCapacity * boxLength;
            tempCanvas.height = boxLength * 3;
            tempCtx.lineWidth = borderWidth;
            tempCtx.fillStyle = fillColor;
            tempCtx.strokeStyle = borderColor;
            // draw holding
            if (this.active) {
                if (this.focusedHolding) {
                    tempCtx.fillStyle = focusColor;
                }
                if (this.secondaryFocusHolding) {
                    tempCtx.fillStyle = secondaryFocusColor;
                }
            }
            tempCtx.fillRect(0, 0, boxLength * 1.5, boxLength * 1.5);
            tempCtx.rect(0, 0, boxLength * 1.5, boxLength * 1.5);
            tempCtx.stroke();
            if (this.holding) {
                // draw item image
                tempCtx.drawImage(this.holding.img, 0, 0, this.holding.img.width, this.holding.img.height, 0, 0, boxLength * 1.5, boxLength * 1.5);
                // text for stack count
                tempCtx.fillStyle = "#fff";
                tempCtx.font = "bold 16px Arial";
                tempCtx.fillText(this.holding.stack.toString(), 15, 15);
            }
            for (var i = 0; i < this.carryCapacity; i++) {
                tempCtx.lineWidth = borderWidth;
                tempCtx.fillStyle = fillColor;
                tempCtx.strokeStyle = borderColor;
                if (this.active) {
                    if (!this.focusedHolding && this.focusedIndex === i) {
                        tempCtx.fillStyle = focusColor;
                    }
                    if (this.secondaryFocusHolding) {
                        tempCtx.fillStyle = secondaryFocusColor;
                    }
                }
                tempCtx.fillRect(i * boxLength, boxLength * 2, boxLength, boxLength);
                tempCtx.rect(i * boxLength, boxLength * 2, boxLength, boxLength);
                tempCtx.stroke();
                if (this.carrying[i]) {
                    // draw item image
                    tempCtx.drawImage(this.carrying[i].img, 0, 0, this.carrying[i].img.width, this.carrying[i].img.height, i * boxLength, boxLength * 2, boxLength, boxLength);
                    // text for stack count
                    tempCtx.fillStyle = "#fff";
                    tempCtx.font = "bold 16px Arial";
                    tempCtx.fillText(this.carrying[i].stack.toString(), i * boxLength, boxLength * 2.25);
                }
            }
            this.cached = tempCanvas;
        }
        ctx.drawImage(this.cached, 0, 0, this.cached.width, this.cached.height, startX, startY, this.cached.width, this.cached.height);
    };
    return Inventory;
})();
//# sourceMappingURL=inventory.js.map