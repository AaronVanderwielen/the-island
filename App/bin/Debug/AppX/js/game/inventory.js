define(["require", "exports", "mapObject"], function (require, exports, MapObject) {
    var Inventory = (function () {
        function Inventory(carryCapacity) {
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
            this.changes = true;
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
            this.changes = true;
            return success;
        };
        Inventory.prototype.pickup = function (mItem) {
            var numReceived = 0, invItem = mItem.toInventoryItem(), stack = invItem.stack, tryBag;
            // keep trying to fill up empty inventory spaces with item stack
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
            this.changes = true;
            return numReceived;
        };
        Inventory.prototype.putInBag = function (item, stack) {
            var numReceived = 0;
            // maybe it's a stackable item?
            var existingStack = _.find(this.carrying, function (i) { return i && i.itemType == item.itemType && i.stack < i.maxStack; });
            if (existingStack) {
                // add to inventory stack
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
            this.changes = true;
            return numReceived;
        };
        Inventory.prototype.putInHands = function (item, stack) {
            var numReceived = 0;
            if (this.holding == null) {
                this.holding = item;
                this.holding.stack = 0;
                // make sure it doesn't go over max stack
                while (this.holding.stack < this.holding.maxStack && stack > 0) {
                    this.holding.stack++;
                    stack--;
                    numReceived++;
                }
            }
            else if (this.holding.itemType === item.itemType) {
                // holding an item that is same as picked up, can it stack more?
                while (this.holding.stack < this.holding.maxStack && stack > 0) {
                    this.holding.stack++;
                    stack--;
                    numReceived++;
                }
            }
            this.changes = true;
            return numReceived;
        };
        Inventory.prototype.moveToBag = function () {
            var success = false;
            this.changes = true;
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
            this.changes = true;
        };
        // drop from hand
        Inventory.prototype.drop = function (item) {
            var dropped = this.carrying;
            this.carrying = null;
            this.changes = true;
            return dropped;
        };
        // drop from inventory
        Inventory.prototype.dropInv = function (index, dropStack) {
            var dropped = null;
            if (this.carrying[index]) {
                if (this.carrying[index].stack === 1) {
                    dropped = new MapObject.MapItem(null, this.carrying[index]);
                    this.carrying[index] = null;
                }
                else if (dropStack) {
                    dropped = new MapObject.MapItem(null, this.carrying[index]);
                    this.carrying[index] = null;
                }
                else {
                    dropped = new MapObject.MapItem(null, this.carrying[index], 1);
                    this.carrying[index].stack--;
                }
                this.changes = true;
            }
            return dropped;
        };
        return Inventory;
    })();
    exports.Inventory = Inventory;
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
        InventoryItemType[InventoryItemType["hammer"] = 18] = "hammer";
        InventoryItemType[InventoryItemType["axe"] = 19] = "axe";
    })(exports.InventoryItemType || (exports.InventoryItemType = {}));
    var InventoryItemType = exports.InventoryItemType;
    var InventoryItem = (function () {
        function InventoryItem(itemType) {
            this.itemType = itemType;
            switch (itemType) {
                case InventoryItemType.axe:
                case InventoryItemType.hammer:
                case InventoryItemType.knife:
                    this.maxStack = 1;
                default:
                    this.maxStack = 5;
            }
        }
        InventoryItem.createFromMapItem = function (mItem) {
            var itemType = InventoryItem.getInventoryTypeFromMapType(mItem.itemType), newItem = new InventoryItem(itemType);
            newItem.id = mItem.id;
            newItem.stack = mItem.stack;
            newItem.maxStack = 5;
            newItem.imgId = MapObject.MapItem.mapItemKey(mItem.itemType);
        };
        InventoryItem.getInventoryTypeFromMapType = function (mapItemType) {
            var itemType;
            switch (mapItemType) {
                case MapObject.ItemType.axe:
                    itemType = InventoryItemType.axe;
                    break;
                case MapObject.ItemType.bone:
                    itemType = InventoryItemType.bone;
                    break;
                case MapObject.ItemType.clay:
                    itemType = InventoryItemType.clay;
                    break;
                case MapObject.ItemType.flowerA:
                case MapObject.ItemType.flowerB:
                case MapObject.ItemType.roots:
                    itemType = InventoryItemType.roots;
                    break;
                case MapObject.ItemType.hammer:
                    itemType = InventoryItemType.hammer;
                    break;
                case MapObject.ItemType.hemp:
                    itemType = InventoryItemType.hemp;
                    break;
                case MapObject.ItemType.knife:
                    itemType = InventoryItemType.knife;
                    break;
                case MapObject.ItemType.mushroom:
                    itemType = InventoryItemType.mushroom;
                    break;
                case MapObject.ItemType.rocksA:
                case MapObject.ItemType.rocksB:
                    itemType = InventoryItemType.rock;
                    break;
                case MapObject.ItemType.rope:
                    itemType = InventoryItemType.rope;
                    break;
                case MapObject.ItemType.stickA:
                case MapObject.ItemType.stickB:
                    itemType = InventoryItemType.stick;
                    break;
                default:
                    itemType = null;
            }
            return itemType;
        };
        return InventoryItem;
    })();
    exports.InventoryItem = InventoryItem;
});
//# sourceMappingURL=inventory.js.map