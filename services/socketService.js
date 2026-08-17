const { Server } = require('socket.io');

let io = null;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`+ Socket Node Connection Link Active: [${socket.id}]`);
        socket.on('disconnect', () => {
            console.log(`- Socket Node Connection Dropped: [${socket.id}]`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error("Socket.io engine has not been initialized yet.");
    return io;
};

const emitGlobalEvent = (channelLabel, dataPayload) => {
    const ioInstance = getIO();
    ioInstance.emit(channelLabel, dataPayload);
    console.log(`[SOCKET BROADCAST] Dispensed event metrics down channel: [${channelLabel}]`);
};

module.exports = { init, getIO, emitGlobalEvent };
