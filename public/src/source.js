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

function hexString(buffer) {
    const byteArray = new Uint8Array(buffer);

    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        return hexCode.padStart(2, '0');
    });

    return hexCodes.join('');
}

function digestMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    return window.crypto.subtle.digest('SHA-256', data);
}

function login(id, pw) {
    digestMessage(pw).then(value => {
        digestMessage(hexString(value) + Math.floor(new Date().getTime() / 1000)).then(hashed => {
            socket.emit('login', {
                id: id,
                pw: hexString(hashed)
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

function deleteUser(id, pw) {
    digestMessage(pw).then(value => {
        socket.emit('delete-user', {
            id: id,
            pw: hexString(value)
        });
    })
}

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

socket.on('login', msg => {
    if (msg) {
        //TODO: login success
    } else {
        //login failed
    }
});

socket.on('register', msg => {
    if (msg) {
        //TODO: register success
    } else {
        //register failed
    }
});

socket.on('delete-user', msg => {
    if (msg) {
        //TODO: success
    } else {
        // failed
    }
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

socket.on('logined', msg => {
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
    createDiv(
        '    <div class="form-structor">\n' +
        '        <div class="signup">\n' +
        '            <h2 class="form-title" id="signup"><span>or</span>Sign up</h2>\n' +
        '            <div class="form-holder">\n' +
        '                <input type="username" class="input" placeholder="Username"/>\n' +
        '                <input type="password" class="input" placeholder="Password"/>\n' +
        '                <input type="password" class="input" placeholder="Confirm"/>\n' +
        '            </div>\n' +
        '            <button class="submit-btn">Sign up</button>\n' +
        '            <div class="form-guest">or login as <a class="form-click">Guest</a></div>\n' +
        '        </div>\n' +
        '        <div class="login slide-up">\n' +
        '            <div class="center">\n' +
        '                <h2 class="form-title" id="login"><span>or</span>Log in</h2>\n' +
        '                <div class="form-holder">\n' +
        '                    <input type="username" class="input" placeholder="Username"/>\n' +
        '                    <input type="password" class="input" placeholder="Password"/>\n' +
        '                </div>\n' +
        '                <button class="submit-btn">Log in</button>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>'
    );

    const loginBtn = document.getElementById('login');
    const signupBtn = document.getElementById('signup');

    loginBtn.addEventListener('click', (e) => {
        let parent = e.target.parentNode.parentNode;
        Array.from(e.target.parentNode.parentNode.classList).find((element) => {
            if (element !== "slide-up") {
                parent.classList.add('slide-up')
            } else {
                signupBtn.parentNode.classList.add('slide-up')
                parent.classList.remove('slide-up')
            }
        });
    });

    signupBtn.addEventListener('click', (e) => {
        let parent = e.target.parentNode;
        Array.from(e.target.parentNode.classList).find((element) => {
            if (element !== "slide-up") {
                parent.classList.add('slide-up')
            } else {
                loginBtn.parentNode.parentNode.classList.add('slide-up')
                parent.classList.remove('slide-up')
            }
        });
    });
}

function draw() {
    if (width !== window.innerWidth || height !== window.innerHeight)
        createCanvas(window.innerWidth, window.innerHeight);
    background('#aaa');
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