class Sprite implements IMapObject {
    type: MapObjectType;
    img: HTMLImageElement;
    set: Array<Array<HTMLImageElement>>;
    x: number;
    y: number;
    z: number;
    sectionId: string;
    yAdjust: number;
    height: number;
    width: number;
    currAnim: number;
    prevAnim: number;
    stepCounter: number;
    stepDir: number;
    currStep: number;
    on: Block;

    constructor(asset: Asset) {
        var sprite = this;

        sprite.type = MapObjectType.sprite;

        sprite.height = 96;
        sprite.width = 72;
        sprite.set = null;

        sprite.z = 1;
        sprite.currAnim = 2;
        sprite.currStep = 1;

        sprite.stepCounter = 0;
        sprite.stepDir = 1;

        sprite.yAdjust = 0; // used to cut sprite off early, like when partly underwater

        sprite.importSet(asset.value, function (set) {
            sprite.set = set;
        });
    }

    importSet(charset: HTMLImageElement, callback: Function) {
        var charsetData = [
            [null, null, null], // up
            [null, null, null], // right
            [null, null, null], // down
            [null, null, null]  // left
        ];

        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 3; x++) {
                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext("2d"),
                    offsetx = this.width * x,
                    offsety = this.height * y,
                    splicedImg = new Image();

                canvas.width = this.width;
                canvas.height = this.height;

                // sourceImage, sourceOffsetX, sourceOffsetY, chunkSizeX, chunkSizeY, canvasPlacementX, canvasPlacementY, newSizeX, newSizeY)
                ctx.drawImage(charset, offsetx, offsety, this.width, this.height, 0, 0, this.width, this.height);
                splicedImg.src = canvas.toDataURL('image/png');
                charsetData[y][x] = splicedImg;
            }
        }
        callback(charsetData);
    }

    onItem(y: number, x: number) {
        return (y >= this.y && y <= this.y + this.height) && (x >= this.x && x <= this.x + this.width);
    }

    move(x: number, y: number, strength: number, world: World, sound: Sound) {
        var note = [50, .1, .4, 'triangle'];

        var nextX = Math.round(this.x + (x * strength * 2)),
            nextY = Math.round(this.y + (y * strength * 2)),
            ifSlowedX = Math.round(this.x + (x * strength)),
            ifSlowedY = Math.round(this.y + (y * strength)),
            nextBlock = world.getBlock(nextX, nextY + this.yAdjust),
            canMove = true;

        this.on = nextBlock;

        if (strength < 2) {
            note = [50, .1, .1, 'triangle'];
        }
        if (nextBlock.type === TerrainType.shallow) {
            nextX = ifSlowedX;
            nextY = ifSlowedY;
            strength = strength / 2;
            note = [43.65, .3, .4, 'sawtooth'];
        }

        // check if can move
        if (nextBlock.type === TerrainType.ocean || nextBlock.type === TerrainType.mountain) {
            canMove = false;
        }
        else if (nextBlock.objects.length > 0) {
            for (var o in nextBlock.objects) {
                if (nextBlock.objects[o].z === this.z && nextBlock.objects[o].onItem(nextY, nextX)) {
                    canMove = false;
                }
            }
        }

        // logging
        var info2 = document.getElementById('tile');
        info2.innerHTML = nextBlock.type.toString();

        if (strength > 0) {
            if (!canMove) {
                this.currAnim = (Math.abs(x) > Math.abs(y)) ? (x > 0 ? 1 : 3) : (y > 0 ? 2 : 0);
            }
            else {
                if (this.stepCounter >= 40) this.stepDir = -strength;
                else if (this.stepCounter <= 0) this.stepDir = strength;

                this.stepCounter += this.stepDir;

                this.currAnim = (Math.abs(x) > Math.abs(y)) ? (x > 0 ? 1 : 3) : (y > 0 ? 2 : 0);
                this.currStep = this.stepCounter < 10 ? 0 : this.stepCounter > 30 ? 2 : 1;

                if (this.stepCounter === 40 || this.stepCounter === 0) {
                    sound.startNote.apply(sound, note);
                }

                this.x = nextX;
                this.y = nextY;
            }
        }

        // logging
        var info = document.getElementById('pos');
        info.innerHTML = "";
        info.innerHTML += 'x: ' + this.x + '<br />';
        info.innerHTML += 'y: ' + this.y;
    }

    draw(ctx: CanvasRenderingContext2D, view: ViewPort) {
        var offsetX = this.x - (this.width / 2.2),
            offsetY = this.y - (.9 * this.height),
            centeredX = offsetX - view.startX,
            centeredY = offsetY - view.startY;

        this.img = this.set[this.currAnim][this.currStep];

        if (this.on.type === TerrainType.shallow || this.on.type === TerrainType.ocean) {
            var bordersBeach = this.on.borders(TerrainType.beach),
                bordersOcean = this.on.borders(TerrainType.ocean);

            if ((bordersBeach && bordersOcean) || (!bordersBeach && !bordersOcean)) {
                this.yAdjust = -(this.height * .25);
                ctx.drawImage(this.set[this.currAnim][this.currStep], 0, 0, this.width, this.height * .75, centeredX, centeredY, this.width, this.height * .75);
            }
            else if (bordersBeach) {
                this.yAdjust = -(this.height * .15);
                ctx.drawImage(this.set[this.currAnim][this.currStep], 0, 0, this.width, this.height * .85, centeredX, centeredY, this.width, this.height * .85);
            }
            else if (bordersOcean) {
                this.yAdjust = -(this.height * .35);
                ctx.drawImage(this.set[this.currAnim][this.currStep], 0, 0, this.width, this.height * .65, centeredX, centeredY, this.width, this.height * .65);
            }
        }
        else {
            this.yAdjust = 0;
            ctx.drawImage(this.img, 0, 0, this.width, this.height, centeredX, centeredY, this.width, this.height);
        }
    }
}