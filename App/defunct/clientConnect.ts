export class ClientConnect {
    socket: SocketIO.Socket;

    constructor(onConnect: Function) {
        var obj = this;
        obj.socket = io.connect('http://localhost:1337');
        obj.socket.emit('connected', { id: obj.socket.id });
        onConnect(obj.socket);
    }

    joinQueue(callback: Function) {
        // start queue timer
        // find game
        this.socket.emit('findQueue', function (gameData) {
            callback(gameData);
        });
    }

    characterSelected(characterId: string) {
        this.socket.emit('characterSelected', characterId);
    }

    assetsLoaded() {
        this.socket.emit('playerReady');
    }

    addPlayerToGame(player) {
        this.socket.emit('addPlayer', player);
    }

    updatePlayerData(data) {
        this.socket.emit('updatePlayerData', data.toServerData());
    }

    on(event: string, received: Function) {
        this.socket.on(event, received);
    }
}