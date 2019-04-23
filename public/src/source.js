const socket = io('https://localhost:8443');

let peer = new SimplePeer({
    initiator: true,
    trickle: false,
    reconnectTimer: 5000,
    iceTransportPolicy: 'relay',
    config: {
        iceServers: [
            {
                urls: "turn:buttercrab.ml:8888",
                username: "buttercrab",
                credential: "1234"
            }
        ]
    }
});

peer.on('signal', data => {
    socket.emit('signal', {
        signal: data
    });
});

socket.on('signal', msg => {
    peer.signal(msg.signal);
});

peer.on('connection', () => {
    console.log('connections');
    peer.send(JSON.stringify({
        type: 'heartbeat'
    }));
});

socket.on('heartbeat', () => {
    setTimeout(() => {
        socket.emit('heartbeat');
    }, 10000);
});

function makeRoom(name) {
    socket.emit('makeRoom', name);
}

function joinRoom(roomid) {
    socket.emit('joinRoom', roomid);
}

function leaveRoom() {
    socket.emit('leaveRoom');
}

let roomData = {};

function applyRooms() {
    console.log(roomData);
}

function getRooms() {
    socket.emit('getRooms');
}

socket.on('rooms', rooms => {
    roomData = rooms;
    applyRooms();
});

socket.on('getRooms', msg => {
    if (msg) {
        //TODO: success
    } else {
        // failed
    }
});

socket.on('makeRoom', msg => {
    if (msg) {
        //TODO: success
    } else {
        // failed
    }
});

socket.on('joinRoom', msg => {
    if (msg) {
        //TODO: success
    } else {
        // failed
    }
});

socket.on('leaveRoom', msg => {
    if (msg) {
        //TODO: success
    } else {
        // failed
    }
});

///==========


///==========

let x = 0, y = 0;
let keyOn = {};

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    document.getElementById('defaultCanvas0').style.position = 'absolute';
}

function draw() {
    if (width !== window.innerWidth || height !== window.innerHeight)
        createCanvas(window.innerWidth, window.innerHeight);
    background('#aaa');
}

///===========

// document.addEventListener('keydown', evt => {
//     peer.send(JSON.stringify({type: 'keydown', key: evt.code, time: new Date().getTime()}));
// });
//
// document.addEventListener('keyup', evt => {
//     peer.send(JSON.stringify({type: 'keyup', key: evt.code, time: new Date().getTime()}));
// });

peer.on('data', msg => {
    const data = JSON.parse(msg);
    switch (data.type) {
        case 'keyup':
            keyOn[data.key] = false;
            break;

        case 'keydown':
            keyOn[data.key] = true;
            break;

        case 'heartbeat':
            setTimeout(() => {
                peer.send(JSON.stringify({
                    type: 'heartbeat'
                }));
            }, 10000);
            break;
    }
});