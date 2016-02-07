import World = require('worldbuilder');
import Inventory = require('inventory');
import Lib = require('lib');

export interface IMapObject {
    id: string;
    imgId: string;
    mapObjectType: MapObjectType;
    blockX: number;
    blockY: number;
    x: number;
    y: number;
    z: number;
    sectionId: string;
    onItem(y: number, x: number);
    pass: boolean;
    passSlow: number;
    passing: boolean;
    canPickup: boolean;
}

export enum MapObjectType {
    item,
    sprite
}

export enum ItemType {
    tree,
    berry,
    bush,
    fern,
    flowerA,
    flowerB,
    mushroom,
    grassA,
    grassB,
    grassC,
    grassD,
    plant,
    rockA,
    rockB,
    rockC,
    rockD,
    rockE,
    rocksA,
    rocksB,
    bone,
    log,
    stickA,
    stickB,
    hemp,
    clay,
    roots,
    hammer,
    knife,
    axe,
    rope
}

export class MapItem implements IMapObject {
    id: string;
    imgId: string;
    mapObjectType: MapObjectType;
    //img: HTMLImageElement;
    itemType: ItemType;
    x: number;
    y: number;
    z: number;
    sectionId: string;
    height: number;
    width: number;
    blockX: number;
    blockY: number;
    pass: boolean;
    passSlow: number;
    passing: boolean;
    canPickup: boolean;
    stack: number;

    constructor(itemType: ItemType, droppedItem?: Inventory.InventoryItem, stack?: number) {
        this.id = Lib.guid();

        if (droppedItem) {
            this.createFromInventoryItem(droppedItem, stack);
        }
        else {
            this.mapObjectType = MapObjectType.item;
            this.getItem(itemType);

            this.passing = false;
        }
    }

    static mapItemKey(itemType: ItemType) {
        return "mapitem_" + ItemType[itemType].toString();
    }

    static getItemData(itemType: ItemType) {
        var data = {
            x: 0,
            y: 0,
            z: 0,
            width: 1,
            height: 1,
            multiplier: 1,
            pass: false,
            passSlow: 1,
            canPickup: false,
            stack: 1
            //passYOffset: 
        };

        switch (itemType) {
            case ItemType.axe:
                data.x = 2;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.berry:
                data.x = 11;
                data.y = 0;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.bone:
                data.x = 8;
                data.y = 5;
                data.canPickup = true;
                break;
            case ItemType.bush:
                data.x = 10;
                data.y = 0;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.clay:
                data.x = 5;
                data.y = 5;
                data.z = 1;
                data.canPickup = true;
                break;
            case ItemType.fern:
                data.x = 1;
                data.y = 5;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.flowerA:
                data.x = 0;
                data.y = 5;
                data.canPickup = true;
                break;
            case ItemType.flowerB:
                data.x = 0;
                data.y = 6;
                data.canPickup = true;
                break;
            case ItemType.grassA:
                data.x = 4;
                data.y = 6;
                break;
            case ItemType.grassB:
                data.x = 4;
                data.y = 7;
                break;
            case ItemType.grassC:
                data.x = 5;
                data.y = 7;
                break;
            case ItemType.grassD:
                data.x = 5;
                data.y = 6;
                break;
            case ItemType.hammer:
                data.x = 0;
                data.y = 0;
                break;
            case ItemType.hemp:
                data.x = 9;
                data.y = 1;
                data.z = 1;
                data.canPickup = true;
                break;
            case ItemType.knife:
                data.x = 1;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.log:
                data.x = 7;
                data.y = 5;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.mushroom:
                data.x = 4;
                data.y = 5;
                data.canPickup = true;
                break;
            case ItemType.plant:
                data.x = 8;
                data.y = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockA:
                data.x = 8;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockB:
                data.x = 9;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockC:
                data.x = 10;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockD:
                data.x = 1;
                data.y = 7;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockE:
                data.x = 3;
                data.y = 7;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rocksA:
                data.x = 0;
                data.y = 7;
                data.canPickup = true;
                data.stack = 3;
                break;
            case ItemType.rocksB:
                data.x = 2;
                data.y = 7;
                data.canPickup = true;
                data.stack = 3;
                break;
            case ItemType.roots:
                data.x = 1;
                data.y = 6;
                data.canPickup = true;
                break;
            case ItemType.rope:
                data.x = 5;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.stickA:
                data.x = 6;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.stickB:
                data.x = 7;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.tree:
                data.x = 6;
                data.y = 6;
                data.z = 1;
                data.height = 2;
                data.width = 2;
                data.pass = true;
                data.passSlow = .5;
                break;
        }
        return data;
    }

    createFromInventoryItem(invItem: Inventory.InventoryItem, stack?: number) {
        this.mapObjectType = MapObjectType.item;

        switch (invItem.itemType) {
            case Inventory.InventoryItemType.axe:
                this.getItem(ItemType.axe);
                break;
            //case InventoryItemType.berries:
            //    this.itemType = ItemType.berry;
            //    break;
            case Inventory.InventoryItemType.bone:
                this.getItem(ItemType.bone);
                break;
            //case InventoryItemType.brick:
            //    this.itemType = ItemType.brick;
            //    break;
            //case InventoryItemType.canvas:
            //    this.itemType = ItemType.axe;
            //    break;
            case Inventory.InventoryItemType.clay:
                this.getItem(ItemType.clay);
                break;
            case Inventory.InventoryItemType.hammer:
                this.getItem(ItemType.hammer);
                break;
            case Inventory.InventoryItemType.hemp:
                this.getItem(ItemType.hemp);
                break;
            case Inventory.InventoryItemType.knife:
                this.getItem(ItemType.knife);
                break;
            //case InventoryItemType.lumber:
            //    this.itemType = ItemType.;
            //    break;
            //case InventoryItemType.meat:
            //    this.itemType = ItemType.mea;
            //    break;
            case Inventory.InventoryItemType.mushroom:
                this.getItem(ItemType.mushroom);
                break;
            //case InventoryItemType.plank:
            //    this.itemType = ItemType.axe;
            //    break;
            case Inventory.InventoryItemType.rock:
                this.getItem(ItemType.rocksA);
                break;
            case Inventory.InventoryItemType.roots:
                this.getItem(ItemType.roots);
                break;
            case Inventory.InventoryItemType.rope:
                this.getItem(ItemType.rope);
                break;
            //case InventoryItemType.sand:
            //    this.itemType = ItemType.sa;
            //    break;
            //case InventoryItemType.skin:
            //    this.itemType = ItemType.sk;
            //    break;
            case Inventory.InventoryItemType.stick:
                this.getItem(ItemType.stickA);
                break;
            //case InventoryItemType.twine:
            //    this.itemType = ItemType.tw;
            //    break;
        }

        this.stack = stack ? stack : invItem.stack;
        this.canPickup = true;
    }

    getItem(itemType: ItemType) {
        var data = MapItem.getItemData(itemType),
            width = (data.width * 50) * data.multiplier,
            height = (data.height * 50) * data.multiplier;

        this.itemType = itemType;
        this.height = height;
        this.width = width;
        this.z = data.z;
        this.pass = data.pass;
        this.passSlow = data.passSlow;
        this.canPickup = data.canPickup;
        this.stack = data.stack;
        this.imgId = MapItem.mapItemKey(itemType);
    }

    onItem(y: number, x: number) {
        var startY = this.y - (this.height / 2),
            endY = startY + this.height,
            startX = this.x - (this.width / 2),
            endX = startX + this.width;

        return (y >= startY && y <= endY) && (x >= startX && x <= endX);
    }

    toInventoryItem() {
        var invItemType = Inventory.InventoryItem.getInventoryTypeFromMapType(this.itemType),
            item = new Inventory.InventoryItem(invItemType);

        return item;
    }
}