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
    hammer,
    axe
}

class InventoryItem {
    id: string;
    imgId: string;
    itemType: InventoryItemType;
    stack: number;
    maxStack: number;

    constructor(mItem: MapItem) {
        this.createFromMapItem(mItem);
    }

    createFromMapItem(mItem: MapItem) {
        this.id = mItem.id;
        this.stack = mItem.stack;
        this.maxStack = 5;
        this.imgId = MapItem.mapItemKey(mItem.itemType);

        switch (mItem.itemType) {
            case ItemType.axe:
                this.itemType = InventoryItemType.axe;
                this.maxStack = 1;
                break;
            case ItemType.bone:
                this.itemType = InventoryItemType.bone;
                break;
            case ItemType.clay:
                this.itemType = InventoryItemType.clay;
                break;
            case ItemType.flowerA:
            case ItemType.flowerB:
            case ItemType.roots:
                this.itemType = InventoryItemType.roots;
                break;
            case ItemType.hammer:
                this.itemType = InventoryItemType.hammer;
                this.maxStack = 1;
                break;
            case ItemType.hemp:
                this.itemType = InventoryItemType.hemp;
                break;
            case ItemType.knife:
                this.itemType = InventoryItemType.knife;
                this.maxStack = 1;
                break;
            case ItemType.mushroom:
                this.itemType = InventoryItemType.mushroom;
                break;
            case ItemType.rocksA:
            case ItemType.rocksB:
                this.itemType = InventoryItemType.rock;
                break;
            case ItemType.rope:
                this.itemType = InventoryItemType.rope;
                break;
            case ItemType.stickA:
            case ItemType.stickB:
                this.itemType = InventoryItemType.stick;
                break;
        }
    }
}