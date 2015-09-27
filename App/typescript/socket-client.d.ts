declare var io: {
    connect(url: string): SocketIO.Socket;
}
//interface Socket {
//    on(event: string, callback: (data: any) => void);
//    emit(event: string, data: any);
//}