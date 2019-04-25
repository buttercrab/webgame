const socket = io('https://buttercrab.ml');

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

peer.on('connection', () => {
    console.log('peer connection successfully done');
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

///==========

let x = 0, y = 0;
let keyOn = {};

function setup() {
    setSize(window.innerWidth, window.innerHeight);
    document.getElementById('defaultCanvas0').style.position = 'absolute';
}

function draw() {
    if (width !== window.innerWidth || height !== window.innerHeight)
        setSize(window.innerWidth, window.innerHeight);
    background('#aaa');
}

function Intro() {

    this.setup = () => {

    };

    this.draw = () => {

    };
}

///===========

peer.on('data', msg => {
    const data = JSON.parse(msg);
    switch (data.type) {
        case 'heartbeat':
            setTimeout(() => {
                peer.send(JSON.stringify({
                    type: 'heartbeat'
                }));
            }, 10000);
            break;
    }
});