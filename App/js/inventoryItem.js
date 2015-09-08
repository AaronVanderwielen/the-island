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
            case ItemType.axe:
                this.type = InventoryItemType.axe;
                this.maxStack = 1;
                break;
            case ItemType.bone:
                this.type = InventoryItemType.bone;
                break;
            case ItemType.clay:
                this.type = InventoryItemType.clay;
                break;
            case ItemType.flowerA:
            case ItemType.flowerB:
            case ItemType.roots:
                this.type = InventoryItemType.roots;
                break;
            case ItemType.hammer:
                this.type = InventoryItemType.hammer;
                this.maxStack = 1;
                break;
            case ItemType.hemp:
                this.type = InventoryItemType.hemp;
                break;
            case ItemType.knife:
                this.type = InventoryItemType.knife;
                this.maxStack = 1;
                break;
            case ItemType.mushroom:
                this.type = InventoryItemType.mushroom;
                break;
            case ItemType.rocksA:
            case ItemType.rocksB:
                this.type = InventoryItemType.rock;
                break;
            case ItemType.rope:
                this.type = InventoryItemType.rope;
                break;
            case ItemType.stickA:
            case ItemType.stickB:
                this.type = InventoryItemType.stick;
                break;
        }
    };
    return InventoryItem;
})();
