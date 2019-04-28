let logined = undefined, roomData = {}, loginViewState = 0;
let registerFailMsg = '', loginFailMsg = '', myRoomID = '';

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
    start_loading();
    logined = undefined;
    digestMessage(pw).then(value => {
        digestMessage(hexString(value) + Math.floor(new Date().getTime() / 1000)).then(hashed => {
            socket.emit('login', {
                id: id,
                pw: hexString(hashed)
            });
        });
    });
}

function login_guest(name) {
    start_loading();
    logined = undefined;
    socket.emit('login-guest', name);
}

function logout() {
    start_loading();
    socket.emit('logout');
    logined = undefined;
}

function register(id, nm, pw) {
    start_loading();
    logined = undefined;
    digestMessage(pw).then(value => {
        socket.emit('register', {
            id: id,
            nm: nm,
            pw: hexString(value)
        });
    });
}

function deleteUser(id, pw) {
    start_loading();
    logined = undefined;
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
        logined = true;
        getRooms();
    } else {
        login_failed(3);
        socket.emit('logined');
    }
});

socket.on('logout', msg => {
    if (msg) {
        logined = false;
        getRooms();
    } else {
        socket.emit('logined');
    }
});

socket.on('logined', msg => {
    logined = msg;
    getRooms();
});

socket.on('register', msg => {
    if (msg) {
        logined = true;
        getRooms();
    } else {
        register_failed(4);
        socket.emit('logined');
    }
});

socket.on('delete-user', msg => {
    if (msg) {
        logined = false;
        getRooms();
    } else {
        delete_user_failed();
        // TODO
    }
});

socket.on('getRooms', data => {
    roomData = data;
    refresh();
});

socket.on('refresh', () => {
    window.location.reload();
});

///==========

function login_failed(code) {
    switch (code) {
        case 1:
            loginFailMsg = '<div class="fail-msg">Username Required</div>';
            break;
        case 2:
            loginFailMsg = '<div class="fail-msg">Password Required</div>';
            break;
        case 3:
            loginFailMsg = '<div class="fail-msg">Wrong Username or Password</div>';
            break;
        default:
            loginFailMsg = '';
    }
    refresh();
}

function login_submit() {
    const id = document.getElementById('login-username').value;
    const pw = document.getElementById('login-password').value;
    if (!id) {
        login_failed(1);
        return;
    }
    if (!pw) {
        login_failed(2);
        return;
    }
    login(id, pw);
}

function register_failed(code) {
    switch (code) {
        case 1:
            registerFailMsg = '<div class="fail-msg">Username Required</div>';
            break;
        case 2:
            registerFailMsg = '<div class="fail-msg">Username Required</div>';
            break;
        case 3:
            registerFailMsg = '<div class="fail-msg">Password Required</div>';
            return;
        case 4:
            registerFailMsg = '<div class="fail-msg">Username is Used</div>';
            return;
        default:
            registerFailMsg = '';
    }
    refresh();
}

function register_submit() {
    const id = document.getElementById('register-username').value;
    const nm = document.getElementById('register-nickname').value;
    const pw = document.getElementById('register-password').value;
    if (!id) {
        register_failed(1);
        return;
    }
    if (!pw) {
        register_failed(2);
        return;
    }
    if (!nm) {
        register_failed(3);
        return;
    }
    register(id, nm, pw);
}

let is_loading = false, loginViewOn = false;

function start_loading() {
    if (loginViewOn) removeElements();
    if (is_loading) return;
    is_loading = true;
    createDiv(
        '<div class="spinner">\n' +
        '    <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\n' +
        '        <circle class="length" fill="none" stroke-width="8" stroke-linecap="round" cx="33" cy="33" r="28"></circle>\n' +
        '    </svg>\n' +
        '    <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\n' +
        '        <circle fill="none" stroke-width="8" stroke-linecap="round" cx="33" cy="33" r="28"></circle>\n' +
        '    </svg>\n' +
        '    <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\n' +
        '        <circle fill="none" stroke-width="8" stroke-linecap="round" cx="33" cy="33" r="28"></circle>\n' +
        '    </svg>\n' +
        '    <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\n' +
        '        <circle fill="none" stroke-width="8" stroke-linecap="round" cx="33" cy="33" r="28"></circle>\n' +
        '    </svg>\n' +
        '</div>'
    );
}

function finish_loading() {
    if (is_loading) {
        removeElements();
        is_loading = false;
    }
}

function view_login() {
    removeElements();

    loginViewState = 0;
    loginViewOn = true;

    createDiv(
        '<div class="title">\n' +
        '    <img src="https://buttercrab.ml/public/img/logo.png" alt="Bang">\n' +
        '</div>\n' +
        '<div class="form-structor" id="base">\n' +
        '    <div class="signup">\n' +
        '        <h2 class="form-title" id="signup"><span>or</span>Sign up\u00A0\u00A0\u00A0</h2>\n' +
        '        <div class="form-holder">\n' +
        '            <input type="username" class="input" placeholder="Username" id="register-username"/>\n' +
        '            <input type="nickname" class="input" placeholder="Nickname" id="register-nickname"/>\n' +
        '            <input type="password" class="input" placeholder="Password" id="register-password"/>\n' +
        '        </div>\n' +
        '        <button class="submit-btn" id="signup-btn" onclick="register_submit()">Sign up</button>\n' +
        '        <div class="form-guest">or login as <a class="form-click" onclick="login_guest()">Guest</a></div>\n' +
        registerFailMsg +
        '    </div>\n' +
        '    <div class="login slide-up">\n' +
        '        <div class="center">\n' +
        '            <h2 class="form-title" id="login"><span>or</span>Log in\u00A0\u00A0\u00A0</h2>\n' +
        '            <div class="form-holder">\n' +
        '                <input type="username" class="input" placeholder="Username" id="login-username"/>\n' +
        '                <input type="password" class="input" placeholder="Password" id="login-password"/>\n' +
        '            </div>\n' +
        '            <button class="submit-btn" id="login-btn" onclick="login_submit()">Log in</button>\n' +
        loginFailMsg +
        '        </div>\n' +
        '    </div>\n' +
        '</div>'
    );

    const login = document.getElementById('login');
    const signin = document.getElementById('signup');

    login.addEventListener('click', e => {
        if (loginViewState === 1) return;
        let parent = e.target.parentNode.parentNode;
        Array.from(e.target.parentNode.parentNode.classList).find(element => {
            if (element !== "slide-up") {
                parent.classList.add('slide-up');
            } else {
                signin.parentNode.classList.add('slide-up');
                parent.classList.remove('slide-up');
            }
        });
        loginViewState = 1;
    });

    signin.addEventListener('click', e => {
        if (loginViewState === 0) return;
        let parent = e.target.parentNode;
        Array.from(e.target.parentNode.classList).find(element => {
            if (element !== "slide-up") {
                parent.classList.add('slide-up');
            } else {
                login.parentNode.parentNode.classList.add('slide-up');
                parent.classList.remove('slide-up');
            }
        });
        loginViewState = 0;
    });

    document.getElementById('register-username').addEventListener('keyup', event => {
        if (event.key === 'Enter') register_submit();
    });
    document.getElementById('register-nickname').addEventListener('keyup', event => {
        if (event.key === 'Enter') register_submit();
    });
    document.getElementById('register-password').addEventListener('keyup', event => {
        if (event.key === 'Enter') register_submit();
    });
    document.getElementById('login-username').addEventListener('keyup', event => {
        if (event.key === 'Enter') login_submit();
    });
    document.getElementById('login-password').addEventListener('keyup', event => {
        if (event.key === 'Enter') login_submit();
    });
}

function getRoomHTML() {
    let res =
        `
<div class="room-list-title">
    <img src="https://buttercrab.ml/public/img/logo-white.png" alt="Bang"/>
</div>
<div class="room-list">
<div class="room-list-scroll">
        `

    for (let roomid in roomData) {
        res +=
            `
<div class="room-list item" onclick="joinRoom('${roomid}')">
    <div class="room-list-content">
        <div>${roomData[roomid].name}</div>
        <div class="room-list-content-subtitle">${roomid}</div>
    </div>
    <div class="room-list-content right">
        <div class="room-list-count">${roomData[roomid].count}</div>
        <div class="room-list-join">Click to Join</div>
    </div>
</div>
`;
    }

    res +=
        `
</div>
</div>
<div class="room-list-subtitle">rooms</div>
<div class="room-list-footer">
</div>
        `

    return res;
}

function makeRoomList() {
    removeElements();

    createDiv(self.getRoomHTML()).addClass('room-list-wrap');
}

function refresh() {
    createCanvas(window.innerWidth, window.innerHeight);

    if (logined === undefined) {
        start_loading();
        return;
    }
    finish_loading();
    if (logined) {
        makeRoomList();
        return;
    }

    view_login();
}