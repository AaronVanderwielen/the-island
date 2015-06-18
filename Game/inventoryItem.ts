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
    type: InventoryItemType;
    img: HTMLImageElement;
    stack: number;
    maxStack: number;

    constructor(mItem?: MapItem) {
        if (mItem) {
            this.createFromMapItem(mItem);
        }
        else {
            this.id = guid();
        }
    }

    createFromMapItem(mItem: MapItem) {
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
    }
}