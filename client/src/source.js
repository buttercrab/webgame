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

peer.on('signal', data => {
    socket.emit('signal', {
        signal: data
    });
});

socket.on('signal', msg => {
    peer.signal(msg.signal);
});

peer.on('connect', () => {
    console.log('connected');
});

socket.on('heartbeat', () => {
    setTimeout(() => {
        socket.emit('heartbeat');
    }, 10000);
});

socket.on('disconnect', () => {
    peer = new SimplePeer({
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
    })
});

function hexString(buffer) {
    const byteArray = new Uint8Array(buffer);

    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        const paddedHexCode = hexCode.padStart(2, '0');
        return paddedHexCode;
    });

    return hexCodes.join('');
}

function digestMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    return window.crypto.subtle.digest('SHA-512', data);
}

function login(id, pw) {
    socket.emit('ready-to-login');
    socket.on('ready-to-login', msg => {
        digestMessage(pw).then(value => {
            digestMessage(hexString(value) + msg + Math.floor(new Date().getTime() / 1000)).then(hashed => {
                socket.emit('login', {
                    id: id,
                    hashed: hexString(hashed)
                });
            });
        });
    });
}

function register(id, pw) {
    digestMessage(pw).then(value => {
        socket.emit('register', {
            id: id,
            pw: hexString(value)
        });
    });
}

///==========

let x = 0, y = 0;
let keyOn = {};

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    x = width / 2;
    y = height / 2;
}

function draw() {
    if (width !== window.innerWidth || height !== window.innerHeight)
        createCanvas(window.innerWidth, window.innerHeight);
    background('rgb(255, 255, 255)');
    fill('rgb(255, 255, 255)');
    stroke('rgb(105,91,255)');
    strokeWeight(10);
    rect(0, 0, width, height);
    fill('rgb(0, 0, 0)');
    ellipse(x, y, 30, 30);

    if (keyOn['KeyW'])
        y -= 5;
    if (keyOn['KeyA'])
        x -= 5;
    if (keyOn['KeyS'])
        y += 5;
    if (keyOn['KeyD'])
        x += 5;
}

///===========

document.addEventListener('keydown', evt => {
    peer.send(JSON.stringify({type: 'keydown', key: evt.code, time: new Date().getTime()}));
});

document.addEventListener('keyup', evt => {
    peer.send(JSON.stringify({type: 'keyup', key: evt.code, time: new Date().getTime()}));
});

peer.on('data', msg => {
    const data = JSON.parse(msg);
    switch(data.type) {
        case 'keyup':
            keyOn[data.key] = false;
            console.log((new Date().getTime() - data.time) + 'ms was delayed');
            break;

        case 'keydown':
            keyOn[data.key] = true;
            console.log((new Date().getTime() - data.time) + 'ms was delayed');
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