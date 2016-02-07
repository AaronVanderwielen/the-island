import Render = require('render');

export class ServerConnection {
    socket: SocketIO.Socket;
    gameData;
    account;

    constructor(socket: SocketIO.Socket, getGames: Function, getDb: Function, _: UnderscoreStatic) {
        var obj = this;
        obj.socket = socket;

        // store account and socket session in mongodb session so we can reconnect if disconnected
        obj.account = new Account();
        obj.account.username = "Aaron";
        obj.account.currentSocketId = socket.id;

        socket.on("findQueue", function (callback) {
            var games = getGames();
            console.log('looking for queue...');
            // look on server for a queue with room or create new queue and wait for enough players to join
            var foundGame = _.find(games, function (gd: GameData) {
                return !gd.queueFull && gd.playerList.length < 8;
            });

            // if no available queue, create one
            if (!foundGame) {
                console.log('no queues available, create');
                foundGame = new GameData();
                games.push(foundGame);
            }

            obj.gameData = foundGame;

            // update user's current game Id in database
            obj.account.currentGameId = obj.gameData.id;
            console.log('game Id = ' + obj.gameData.id);
            // db.updateAccountCurrentGame()

            obj.gameData.playerList.push(obj.account);

            // wait for more users to join, when there's enough, callback
            console.log('players in game: ' + obj.gameData.playerList.length);

            if (obj.gameData.playerList.length >= 1) {
                obj.gameData.queueFull = true;
                //socket.emit("queueReady_" + obj.gameData.id, obj.gameData);
            }

            callback(obj.gameData);
        });

        socket.on("characterSelected", function (characterId, callback) {
            console.log("characterSelected");
            obj.gameData.spritesToLoad.push(characterId);
            // wait for more users to join, when there's enough, callback
            if (obj.gameData.playerList.length == obj.gameData.spritesToLoad.length) {
                socket.emit("charactersSelected_" + obj.gameData.id, obj.gameData);
            }
        });

        socket.on("playerReady", function () {
            console.log("playerReady");
            obj.gameData.playersReady++;
            if (obj.gameData.playersReady == obj.gameData.playerList.length) {
                obj.gameData.world = new World(100, 100, 100, 5);
                socket.emit("playersReady_" + obj.gameData.id, obj.gameData);
            }
        });

        socket.on("addPlayer", function (player: Player) {
            console.log("addPlayer");
            var account = _.find(obj.gameData.playerList, function (a: Account) {
                return a.currentSocketId == socket.id;
            });
            account.currentPlayer = player;
            obj.gameData.world.objects.push(account.currentPlayer.sprite);
            account.inGame = true;

            // if all players now in game
            if (_.every(obj.gameData.playerList, function (a: Account) { return a.inGame; })) {
                socket.emit("gameReady_" + obj.gameData.id, obj.gameData);
                obj.startGameUpdates();
            }
        });

        socket.on("updatePlayerData", function (data: QueuedProcess) {
            console.log("received player data");
            obj.gameData.processQueue.push(data);
            //var playerData: Account = _.find(obj.gameData.playerList, function (a: Account) {
            //    return a.currentPlayer.sprite.id == data.id;
            //});
            //for (var d in data) {
            //    playerData.currentPlayer.sprite[d] = data[d];
            //}
            //callback(obj.gameData);
        });
    }

    startGameUpdates() {
        var obj = this;
        window.setInterval(function () {
            obj.socket.emit('gameProgress_' + obj.gameData.id, obj.gameData);
        }, 15);
    }

    when(condition: Function, callback: Function, ms?: number, attempt?: number) {
        var obj = this;

        if (!ms) ms = 1000;
        if (!attempt) attempt = 1;

        setTimeout(function () {
            if (condition()) {
                callback();
            }
            else {
                obj.when(condition, callback, ms, attempt + 1);
            }
        }, ms);
    }
}

export class Account {
    username: string;
    email: string;
    currentGameId: string;
    currentSocketId: string;
    currentPlayer: Player;
    inGame: boolean;
}

export interface QueuedProcess {
    playerId: string;
    moveY: number;
    moveX: number;
    actionQueue: QueuedAction[];
}

export class GameData {
    id: string;
    queueFull: boolean;
    playerList: Account[];
    spritesToLoad: string[];
    playersReady: number;
    world;
    processQueue: QueuedProcess[];

    constructor() {
        this.id = guid();
        this.playerList = [];
        this.spritesToLoad = [];
        this.queueFull = false;
        this.playersReady = 0;
    }
}

interface Asset {
    id: string;
    src: string;
    value?;
}

export class Game {
    gameData: GameData;
    mapRender: Render.MapRender;
    //player: Player;
    //world: World;
    //sound: Sound;
    playerId: string;
    connect: ClientConnect;
    assets: Array<Asset>;
    imgCache: Array<CachedImageData>;
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

        this.assets = [
            { id: 'char', src: '/img/char.png' },
            { id: 'terrain', src: "/img/terrain.png" },
            { id: 'items', src: "/img/itemset.png" }
        ];

        this.imgCache = [];

        this.testArray1 = [];
        this.testArray2 = [];
        this.testArray3 = [];

        this.mainMenu();
    }

    setLoadMsg(step?: string) {
        if (step) {
            $('.load-step').text(step);
        }
        else {
            $('#load-screen').remove();
            $('#canvas').show();
        }
    }

    mainMenu() {
        var obj = this;

        // request play login/account info, just if any previous game in progess, reconnect if necessary
        // if no previous session, bring to main menu
        this.connect = new ClientConnect(function (socket) {
            var menuControls = new Controls(),
                menuInterval;

            menuControls.onConnect = function () {
                $('#main-menu .waiting').hide();
                $('#main-menu .menu-options').show();
                menuInterval = window.setInterval(function () {
                    if (!menuControls) return;
                    menuControls.report();
                    for (var a in menuControls.actions) {
                        var action = menuControls.actions[a];
                        if (!action.recorded) {
                            // new action to process
                            switch (action.button) {
                                case 0: // a
                                    window.clearInterval(menuInterval);
                                    menuControls.clear();
                                    menuControls = null;
                                    $('#main-menu').remove();
                                    $('#load-screen').show();
                                    obj.init();
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }, 25);
            };
            menuControls.onDisconnect = function () {
                $('#main-menu .menu-options').hide();
                $('#main-menu .waiting').show();
                window.clearInterval(menuInterval);
            };
            menuControls.start();
        });
    }

    init() {
        var obj = this;

        // join queue, get placed in a match about to start
        obj.setLoadMsg("Looking for game...");
        obj.connect.joinQueue(function (gameData: GameData) {
            // show character select screen
            // select a sprite/character

            // set up the finish callback first
            obj.connect.on("charactersSelected_" + gameData.id, function (gameData: GameData) {
                obj.setLoadMsg("Loading Assets...");
                obj.loadAssets(function () {
                    obj.setLoadMsg("Building World...");
                    obj.connect.assetsLoaded();
                });
            });

            obj.connect.on("playersReady_" + gameData.id, function (gameData: GameData) {
                var tileset = <HTMLImageElement>obj.getAssetById('terrain').value;

                //obj.sound = new Sound();

                var player = new Player(obj.imgCache);
                player.sprite = new Sprite("playersprite", obj.getAssetById('char'), obj.imgCache);
                player.sprite.x = 2000;
                player.sprite.y = 2000;
                player.sprite.sectionId = gameData.world.getSectionId(2000, 2000, 'p');

                obj.setLoadMsg("Rendering...");
                gameData.world.clientRender(tileset, function () {
                    obj.connect.addPlayerToGame(player);
                    obj.playerId = player.playerId;
                });
            });

            obj.connect.on("gameReady_" + gameData.id, function (gameData: GameData) {
                obj.setLoadMsg();
                obj.gameData = gameData;
                obj.startGame(gameData.id);
            });

            obj.connect.characterSelected("GenericCharacter");
        });
    }

    static getCachedImgSet(key: string, imgCache: Array<CachedImageData>) {
        return _.find(imgCache, function (i: CachedImageData) {
            return i.id === key;
        });
    }

    getAssetById(id: string) {
        var asset = _.find(this.assets, function (a: Asset) {
            return a.id === id;
        });
        return asset;
    }

    loadAssets(callback: Function) {
        var queue = new createjs.LoadQueue(),
            obj = this;

        queue.on("fileload", handleAssetLoaded);
        queue.on("complete", handleComplete);

        for (var a in obj.assets) {
            queue.loadFile({ id: obj.assets[a].id, src: obj.assets[a].src });
        }

        function handleAssetLoaded(event) {
            var asset = obj.getAssetById(event.item.id);
            asset.value = event.result;
        }

        function handleComplete() {
            var itemset = <HTMLImageElement>obj.getAssetById('items').value;
            for (var item in ItemType) {
                MapItem.importSet(itemset, item, obj.imgCache);
            }
            callback();
        }
    }

    startGame(gameId: string) {
        var obj = this,
            player = _.find(obj.gameData.playerList, function (a: Account) { return a.currentPlayer.playerId == obj.playerId; }).currentPlayer;

        player.controls.start();

        this.connect.on('gameProgress_' + gameId, function (gameData: GameData) {
            //$('#state-duration').html("ping: " + ping + "ms");
            obj.gameData = gameData;
        });

        this.monitorInterval(obj.stateUpdate.bind(obj), (1000 / this.fps), $('#refresh-duration'), 'update');
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
                        else {
                            $('#fps').html('fps: ' + obj.fps);
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
        var obj = this,
            player = _.find(obj.gameData.playerList, function (a: Account) { return a.currentPlayer.playerId == obj.playerId; }).currentPlayer;

        // update player controls, actions, etc
        player.update();

        // send updated player data to server
        this.connect.updatePlayerData(player);
    }

    refresh() {
        var obj = this,
            player = _.find(obj.gameData.playerList, function (a: Account) { return a.currentPlayer.playerId == obj.playerId; }).currentPlayer;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //this.moveViewCenter(this.player.sprite);
        this.monitorFunction(this.moveViewCenter.bind(this), this.testArray1, $('#draw-view-duration'), 'move view', player.sprite);

        //this.drawMapObjects.bind(this)
        this.monitorFunction(this.drawMapObjects.bind(this), this.testArray2, $('#draw-map-objects-duration'), 'map objects');

        //this.player.inventory.draw(this.canvas);
        this.monitorFunction(player.inventory.draw.bind(player.inventory), this.testArray3, $('#draw-inventory-duration'), 'inventory', this.canvas);
    }

    drawMapObjects() {
        if (!this.gameData) return;

        var obj = this,
            player = _.find(obj.gameData.playerList, function (a: Account) { return a.currentPlayer.playerId == obj.playerId; }).currentPlayer,
            currSection = player.sprite.sectionId;

        if (currSection) {
            // clone map objects list and add in players
            //var mapObjects = this.objectData.concat(this.spriteData)

            // only draw objects that are around current player's section
            var acceptSections = obj.gameData.world.getSurroundingSections(currSection),
                drawObjects = _.filter(obj.gameData.world.objects, function (o: IMapObject) {
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
                drawObjects[o].draw(this.ctx, this.view, this.imgCache);
            }
        }
    }

    renderView() {
        if (!this.gameData) return;

        var obj = this,
            player = _.find(obj.gameData.playerList, function (a: Account) { return a.currentPlayer.playerId == obj.playerId; }).currentPlayer,
            ctx = this.canvas.getContext("2d"),
            ySection = Math.floor(player.sprite.y / obj.gameData.world.pyps),
            xSection = Math.floor(player.sprite.x / obj.gameData.world.pxps),
            currSectionId = ySection + "," + xSection,
            cachedStartY = this.view.startY - ((ySection - 1) * obj.gameData.world.pyps),
            cachedStartX = this.view.startX - ((xSection - 1) * obj.gameData.world.pxps);

        // logging
        var info = document.getElementById('view');
        info.innerHTML = currSectionId;

        ctx.drawImage(obj.gameData.world.worldCache[currSectionId], cachedStartX, cachedStartY, this.resX, this.resY, 0, 0, this.resX, this.resY);
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

export class Player {
    public playerId: string;
    sprite: Sprite;
    controls: Controls;
    inventory: Inventory;
    actionQueue: QueuedAction[];
    moveY: number;
    moveX: number;

    constructor(imgCache: Array<CachedImageData>) {
        this.inventory = new Inventory(5, imgCache);
        this.controls = new Controls();
        this.playerId = guid();
    }

    toServerData() {
        var data: QueuedProcess = {
            playerId: this.playerId,
            moveY: this.moveY,
            moveX: this.moveX,
            actionQueue: this.actionQueue
        };
        return data;
    }

    update() {
        // player can perform action
        this.controls.report();
        this.processActions();
        this.movement();
        //this.sprite.move(this.controls, world);
    }

    movement() {
        var d = Math.ceil(((this.controls.sprinting && !this.controls.looking ? this.controls.strength * 2 : this.controls.strength) * 2));
        this.moveY = Math.round(this.controls.y * d);
        this.moveX = Math.round(this.controls.x * d);
    }

    processActions() {
        for (var a in this.controls.actions) {
            var action = this.controls.actions[a];
            if (!action.recorded) {
                // new action to process
                switch (action.button) {
                    case 0: // a
                        if (this.inventory.active) {
                            this.inventory.secondaryAction();
                        }
                        else {
                            this.actionQueue.push({
                                action: PlayerAction.Interact
                            });
                        }
                        break;
                    case 1: // b
                        if (this.inventory.active) {
                            // drop stack
                            var dropped = this.inventory.dropInv(this.inventory.focusedIndex, true);
                            if (dropped) {
                                this.actionQueue.push({
                                    action: PlayerAction.DropItem,
                                    value: dropped
                                });
                            }
                        }
                        break;
                    case 2: // x
                        if (this.inventory.active) {
                            var dropped = this.inventory.dropInv(this.inventory.focusedIndex, false);
                            if (dropped) {
                                this.actionQueue.push({
                                    action: PlayerAction.DropItem,
                                    value: dropped
                                });
                            }
                        }
                        else {
                            // use equipped item
                        }
                        break;
                    case 3: // y
                        this.inventory.toggle();
                        break;
                    case 4: // lb
                        break;
                    case 5: // rb
                        break;
                    case 6: // lt
                        // look around-- right thumb takes over anim
                        break;
                    case 7: // rt
                        // sprint
                        break;
                    case 8: // back
                        break;
                    case 9: // start
                        break;
                    case 10: // l3
                        break;
                    case 11: // r3
                        break;
                    case 12: // up on d-pad
                        if (this.inventory.active) {
                            this.inventory.focusedHolding = true;
                            this.inventory.changes = true;
                        }
                        break;
                    case 13: // down on d-pad
                        if (this.inventory.active) {
                            this.inventory.focusedHolding = false;
                            this.inventory.changes = true;
                        }
                        break;
                    case 14: // left on d-pad
                        if (this.inventory.active) {
                            if (this.inventory.focusedIndex == 0) {
                                this.inventory.focusedIndex = this.inventory.carryCapacity - 1;
                            }
                            else {
                                this.inventory.focusedIndex--;
                            }
                            this.inventory.changes = true;
                        }
                        break;
                    case 15: // right on d-pad
                        if (this.inventory.active) {
                            if (this.inventory.focusedIndex == this.inventory.carryCapacity - 1) {
                                this.inventory.focusedIndex = 0;
                            }
                            else {
                                this.inventory.focusedIndex++;
                            }
                            this.inventory.changes = true;
                        }
                        break;
                }
                action.recorded = true;
            }
        }
    }

    //processActions(game: Game, world: World) {
    //    for (var a in this.controls.actions) {
    //        var action = this.controls.actions[a];
    //        if (!action.recorded) {
    //            // new action to process
    //            switch (action.button) {
    //                case 0: // a
    //                    if (this.inventory.active) {
    //                        this.inventory.secondaryAction();
    //                    }
    //                    else {
    //                        world.interactMapObject(this, game);
    //                    }
    //                    break;
    //                case 1: // b
    //                    if (this.inventory.active) {
    //                        // drop stack
    //                        var dropped = this.inventory.dropInv(this.inventory.focusedIndex, true);
    //                        if (dropped) {
    //                            world.dropMapItem(dropped, this.sprite, game);
    //                        }
    //                    }
    //                    break;
    //                case 2: // x
    //                    if (this.inventory.active) {
    //                        var dropped = this.inventory.dropInv(this.inventory.focusedIndex, false);
    //                        if (dropped) {
    //                            world.dropMapItem(dropped, this.sprite, game);
    //                        }
    //                    }
    //                    else {
    //                        // use equipped item
    //                    }
    //                    break;
    //                case 3: // y
    //                    this.inventory.toggle();
    //                    break;
    //                case 4: // lb
    //                    break;
    //                case 5: // rb
    //                    break;
    //                case 6: // lt
    //                    // look around-- right thumb takes over anim
    //                    break;
    //                case 7: // rt
    //                    // sprint
    //                    break;
    //                case 8: // back
    //                    break;
    //                case 9: // start
    //                    break;
    //                case 10: // l3
    //                    break;
    //                case 11: // r3
    //                    break;
    //                case 12: // up on d-pad
    //                    if (this.inventory.active) {
    //                        this.inventory.focusedHolding = true;
    //                        this.inventory.changes = true;
    //                    }
    //                    break;
    //                case 13: // down on d-pad
    //                    if (this.inventory.active) {
    //                        this.inventory.focusedHolding = false;
    //                        this.inventory.changes = true;
    //                    }
    //                    break;
    //                case 14: // left on d-pad
    //                    if (this.inventory.active) {
    //                        if (this.inventory.focusedIndex == 0) {
    //                            this.inventory.focusedIndex = this.inventory.carryCapacity - 1;
    //                        }
    //                        else {
    //                            this.inventory.focusedIndex--;
    //                        }
    //                        this.inventory.changes = true;
    //                    }
    //                    break;
    //                case 15: // right on d-pad
    //                    if (this.inventory.active) {
    //                        if (this.inventory.focusedIndex == this.inventory.carryCapacity - 1) {
    //                            this.inventory.focusedIndex = 0;
    //                        }
    //                        else {
    //                            this.inventory.focusedIndex++;
    //                        }
    //                        this.inventory.changes = true;
    //                    }
    //                    break;
    //            }
    //            action.recorded = true;
    //        }
    //    }
    //}
}