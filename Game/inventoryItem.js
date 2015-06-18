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
    InventoryItemType[InventoryItemType["hammer"] = 18] = "hammer";
    InventoryItemType[InventoryItemType["axe"] = 19] = "axe";
})(InventoryItemType || (InventoryItemType = {}));
var InventoryItem = (function () {
    function InventoryItem(mItem) {
        if (mItem) {
            this.createFromMapItem(mItem);
        }
        else {
            this.id = guid();
        }
    }
    InventoryItem.prototype.createFromMapItem = function (mItem) {
        this.id = mItem.id;
        this.img = mItem.img;
        this.stack = mItem.stack;
        this.maxStack = 5;
        switch (mItem.itemType) {
            case 28 /* axe */:
                this.type = 19 /* axe */;
                this.maxStack = 1;
                break;
            case 19 /* bone */:
                this.type = 3 /* bone */;
                break;
            case 24 /* clay */:
                this.type = 4 /* clay */;
                break;
            case 4 /* flowerA */:
            case 5 /* flowerB */:
            case 25 /* roots */:
                this.type = 7 /* roots */;
                break;
            case 26 /* hammer */:
                this.type = 18 /* hammer */;
                this.maxStack = 1;
                break;
            case 23 /* hemp */:
                this.type = 2 /* hemp */;
                break;
            case 27 /* knife */:
                this.type = 17 /* knife */;
                this.maxStack = 1;
                break;
            case 6 /* mushroom */:
                this.type = 6 /* mushroom */;
                break;
            case 17 /* rocksA */:
            case 18 /* rocksB */:
                this.type = 1 /* rock */;
                break;
            case 29 /* rope */:
                this.type = 11 /* rope */;
                break;
            case 21 /* stickA */:
            case 22 /* stickB */:
                this.type = 0 /* stick */;
                break;
        }
    };
    return InventoryItem;
})();
//# sourceMappingURL=inventoryItem.js.map