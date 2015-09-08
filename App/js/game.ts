interface Asset {
    id: string;
    src: string;
    value?;
}

interface ViewPort {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
}

class Game {
    player: Player;
    world: World;
    sound: Sound;
    assets: Array<Asset>;
    audioContext;
    currentOsc;
    currentGain;
    view: ViewPort;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    resX: number;
    resY: number;
    fps: number;
    maxFps: number;
    objects: Array<IMapObject>;
    testArray1: number[];
    testArray2: number[];
    testArray3: number[];

    constructor(canvas: HTMLCanvasElement, resX: number, resY: number, fps: number, maxFps: number) {
        this.canvas = canvas;
        this.canvas.width = resX;
        this.canvas.height = resY;
        this.ctx = canvas.getContext('2d');

        this.resX = resX;
        this.resY = resY;

        this.fps = fps;
        this.maxFps = maxFps;
        this.objects = new Array();

        this.assets = [
            { id: 'char', src: '/img/char.png' },
            { id: 'terrain', src: "/img/terrain.png" },
            { id: 'items', src: "/img/itemset.png" }
        ];

        this.testArray1 = [];
        this.testArray2 = [];
        this.testArray3 = [];
    }

    setLoadMsg(step: string) {
        if (step) {
            $('.load-step').text(step);
        }
        else {
            $('.load-step').remove();
        }
    }

    init() {
        this.setLoadMsg("Building World...");
        this.loadAssets(function () {
            var tileset = <HTMLImageElement>this.getAssetById('terrain').value,
                itemset = <HTMLImageElement>this.getAssetById('items').value;

            this.world = new World(100, 100, 100, 5, tileset, itemset, this.objects);
            this.sound = new Sound();

            this.player = new Player(itemset);
            this.player.controls = new Controls(this.fps);
            this.player.sprite = new Sprite(this.getAssetById('char'));
            this.player.sprite.x = 2000;
            this.player.sprite.y = 2000;
            this.player.sprite.sectionId = this.world.getSectionId(2000, 2000, 'p');
            this.objects.push(this.player.sprite);

            this.setLoadMsg();
            this.player.controls.start();
            this.start();
        });
    }

    getAssetById(id: string) {
        var asset = _.find(this.assets, function (a: Asset) {
            return a.id === id;
        });
        return asset;
    }

    loadAssets(callback: Function) {
        var queue = new createjs.LoadQueue();

        queue.on("fileload", handleAssetLoaded, this);
        queue.on("complete", handleComplete, this);

        for (var a in this.assets) {
            queue.loadFile({ id: this.assets[a].id, src: this.assets[a].src });
        }

        function handleAssetLoaded(event) {
            var asset = this.getAssetById(event.item.id);
            asset.value = event.result;
        }

        function handleComplete() {
            callback.call(this);
        }
    }

    start() {
        var obj = this;

        this.monitorInterval(obj.stateUpdate.bind(obj), 15, $('#state-duration'), 'state');
        this.monitorInterval(obj.refresh.bind(obj), (1000 / this.fps), $('#refresh-duration'), 'refresh', true);
    }

    monitorInterval(f: Function, ms: number, el: JQuery, label: string, controlsFPS?: boolean) {
        var obj = this,
            arr: number[] = [],
            interval,
            monitorFunc = function () {
                var start = new Date(),
                    duration;

                f();

                duration = new Date().getTime() - start.getTime();
                arr.push(duration);

                if (arr.length > obj.fps / 2) {
                    var ave,
                        sum = 0;

                    for (var i = 0; i < arr.length; i++) {
                        sum += arr[i];
                    }

                    ave = (sum / arr.length).toFixed(2);

                    el.html(label + ": " + ave + "ms");
                    arr = [];

                    if (controlsFPS) {
                        if (ave > ms) {
                            ms++;
                            clearInterval(interval);
                            obj.fps = Math.round(1000 / ms);
                            $('#fps').html('fps: ' + obj.fps);
                            interval = setInterval(monitorFunc, ms);
                        }
                        else if ((ave < (ms - 3)) && (Math.round(1000 / ms) < obj.maxFps)) {
                            ms--;
                            clearInterval(interval);
                            obj.fps = Math.round(1000 / ms);
                            $('#fps').html('fps: ' + obj.fps);
                            interval = setInterval(monitorFunc, ms);
                        }
                    }
                }
            };

        interval = setInterval(monitorFunc, ms);
    }

    monitorFunction(f: Function, arr: number[], el: JQuery, label: string, ...params) {
        var obj = this,
            start = new Date(),
            duration;

        f.apply(this, params);

        duration = new Date().getTime() - start.getTime();
        arr.push(duration);

        if (arr.length > obj.fps / 2) {
            var ave,
                sum = 0;

            for (var i = 0; i < arr.length; i++) {
                sum += arr[i];
            }

            ave = (sum / arr.length).toFixed(2);

            el.html(label + ": " + ave + "ms");
            arr = [];
        }
    }

    stateUpdate() {
        this.player.update(this, this.world, this.sound);
    }

    refresh() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //this.moveViewCenter(this.player.sprite);
        this.monitorFunction(this.moveViewCenter.bind(this), this.testArray1, $('#draw-view-duration'), 'move view', this.player.sprite);

        //this.drawMapObjects.bind(this)
        this.monitorFunction(this.drawMapObjects.bind(this), this.testArray1, $('#draw-map-objects-duration'), 'map objects');

        //this.player.inventory.draw(this.canvas);
        //this.monitorFunction(this.player.inventory.draw.bind(this.player.inventory), this.testArray2, $('#draw-inventory-duration'), 'inventory', this.canvas);
    }

    drawMapObjects() {
        var currSection = this.player.sprite.sectionId;
        if (currSection) {
            // only draw objects that are around current player's section
            var acceptSections = this.world.getSurroundingSections(currSection),
                drawObjects = _.filter(this.objects, function (o: IMapObject) {
                    return acceptSections.indexOf(o.sectionId) > -1;
                });

            // sort by z index
            drawObjects = _.sortBy(drawObjects, function (o: IMapObject) {
                var sortBy = o.z.toString();

                if (o.mapObjectType == MapObjectType.sprite) sortBy += (o.passing ? "0" : "2");
                else sortBy += "1";

                return sortBy;
            });

            // draw
            for (var o in drawObjects) {
                drawObjects[o].draw(this.ctx, this.view);
            }
        }
    }

    renderView() {
        var ctx = this.canvas.getContext("2d"),
            ySection = Math.floor(this.player.sprite.y / this.world.pyps),
            xSection = Math.floor(this.player.sprite.x / this.world.pxps),
            currSectionId = ySection + "," + xSection,
            cachedStartY = this.view.startY - ((ySection - 1) * this.world.pyps),
            cachedStartX = this.view.startX - ((xSection - 1) * this.world.pxps);

        // logging
        var info = document.getElementById('view');
        info.innerHTML = currSectionId;

        ctx.drawImage(this.world.worldCache[currSectionId], cachedStartX, cachedStartY, this.resX, this.resY, 0, 0, this.resX, this.resY);
    }

    moveViewCenter(userSprite: Sprite) {
        var newStartX = userSprite.x - (this.resX / 2),
            newEndX = newStartX + this.resX,
            newStartY = userSprite.y - (this.resY / 2),
            newEndY = newStartY + this.resY;

        this.view = {
            startX: newStartX,
            endX: newEndX,
            startY: newStartY,
            endY: newEndY
        };

        this.renderView();
    }
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}