interface IMapObject {
    set: Array<Array<HTMLImageElement>>;
    x: number;
    y: number;
    height: number;
    width: number;
    currAnim: number;
    currStep: number;
    draw(ctx: CanvasRenderingContext2D, view: ViewPort);
}

interface ViewPort {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
}

class Game {
    world: World;
    userControls: Controls;
    userControlled: Sprite;
    view: ViewPort;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    resX: number;
    resY: number;
    fps: number;
    objects: Array<IMapObject>;

    constructor(canvas: HTMLCanvasElement, resX: number, resY: number, fps: number) {
        this.canvas = canvas;
        this.canvas.width = resX;
        this.canvas.height = resY;
        this.ctx = canvas.getContext('2d');

        this.resX = resX;
        this.resY = resY;

        this.fps = fps;
        this.objects = new Array();
    }

    onGameReady(callback: Function) {
        var game = this,
            i;

        i = window.setInterval(function () {
            var ready = true;
            for (var o in game.objects) {
                if (!game.objects[0].set) ready = false; // check map objects rendered
            }
            if (ready) {
                window.clearInterval(i);
                callback();
            }
        }, 100);
    }

    start() {
        var obj = this;

        window.setInterval(function () {
            obj.refresh();
        }, 1000 / obj.fps);
    }

    refresh() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.moveViewCenter(this.userControlled);
        this.moveUserControlled();
        this.drawMapObjects();
    }

    moveUserControlled() {
        this.userControlled.move(this.userControls.x, this.userControls.y, this.userControls.strength, this.world);
    }

    drawMapObjects() {
        for (var o in this.objects) {
            this.objects[o].draw(this.ctx, this.view);
        }
    }

    addMapObject(obj: IMapObject) {
        obj.currAnim = 2;
        obj.currStep = 1;
        obj.x = 2000;
        obj.y = 2000;
        this.objects.push(obj);
    }

    renderView() {
        var ctx = this.canvas.getContext("2d");

        var info = document.getElementById('view');
        info.innerHTML = "";
        info.innerHTML += 'startX: ' + this.view.startX + '<br />';
        info.innerHTML += 'endX: ' + this.view.endX + '<br />';
        info.innerHTML += 'startY: ' + this.view.startY + '<br />';
        info.innerHTML += 'endY: ' + this.view.endY;

        ctx.drawImage(this.world.cached, this.view.startX, this.view.startY, this.resX, this.resY, 0, 0, this.resX, this.resY);
    }

    moveViewCenter(userSprite: Sprite) {
        var newStartX = userSprite.x - (this.resX / 2),
            newEndX = newStartX + this.resX,
            newStartY = userSprite.y - (this.resY / 2),
            newEndY = newStartY + this.resY;

        //if (newStartX <= 0) {
        //    newStartX = 0;
        //    newEndX = this.game.resX;
        //    center = false;
        //}
        //else if (newEndX >= this.numX * this.tileSize) {
        //    newStartX = (this.numX * this.tileSize) - this.game.resX;
        //    newEndX = this.numX * this.tileSize;
        //    center = false;
        //}
        //else if (newStartY <= 0) {
        //    newStartY = 0;
        //    newEndY = this.game.resY;
        //    center = false;
        //}
        //else if (newEndY >= this.numY * this.tileSize) {
        //    newStartY = (this.numY * this.tileSize) - this.game.resY;
        //    newEndY = this.numY * this.tileSize;
        //    center = false;
        //}

        this.view = {
            startX: newStartX,
            endX: newEndX,
            startY: newStartY,
            endY: newEndY
        };

        this.renderView();
    }
}

function canGame() {
    return "getGamepads" in navigator;
}

$(function () {
    if (canGame()) {
        var canvas = <HTMLCanvasElement>$('canvas')[0],
            game = new Game(canvas, 1280, 800, 60);

        game.world = new World(game, 100, 100, 100, 5); 
        game.userControls = new Controls(game.fps)
        game.userControlled = new Sprite('/img/char.png');
        game.addMapObject(game.userControlled);

        game.onGameReady(function () {
            game.userControls.start();
            game.start();
        });
    }
});