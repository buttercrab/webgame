let logined = undefined, roomData = {}, loginViewState = 0;
let registerFailMsg = '', loginFailMsg = '', myRoomData = '', username = '', isGuest = false;

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

function getRooms() {
    socket.emit('getRooms');
}

socket.on('myRoom', msg => {
    myRoomData = msg;
    refresh();
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
    logined = msg.logined;
    username = msg.id;
    isGuest = msg.isGuest === true;
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
            registerFailMsg = '<div class="fail-msg">Nickname Required</div>';
            break;
        case 3:
            registerFailMsg = '<div class="fail-msg">Password Required</div>';
            break;
        case 4:
            registerFailMsg = '<div class="fail-msg">Username is Used</div>';
            break;
        case 5:
            registerFailMsg = '<div class="fail-msg">Username is Requiered for Guest login</div>';
            break;
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

function guest_submit() {
    const id = document.getElementById('register-username').value;
    if (!id) {
        register_failed(5);
        return;
    }
    login_guest(id);
}

let is_loading = false, loginViewOn = false;

function start_loading() {
    if (loginViewOn) removeElements();
    if (is_loading) return;
    is_loading = true;
    createDiv(`
<div class="spinner">
    <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle class="length" fill="none" stroke-width="8" stroke-linecap="round" cx="33" cy="33" r="28"></circle>
    </svg>
    <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle fill="none" stroke-width="8" stroke-linecap="round" cx="33" cy="33" r="28"></circle>
    </svg>
    <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle fill="none" stroke-width="8" stroke-linecap="round" cx="33" cy="33" r="28"></circle>
    </svg>
    <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle fill="none" stroke-width="8" stroke-linecap="round" cx="33" cy="33" r="28"></circle>
    </svg>
</div>`);
}

function view_login() {
    removeElements();

    loginViewState = 0;
    loginViewOn = true;

    createDiv(`
<div class="title">
    <img src="https://buttercrab.ml/public/img/logo.png" alt="Bang">
</div>
<div class="form-structor" id="base">
    <div class="signup">
        <h2 class="form-title" id="signup"><span>or</span>Sign up\u00A0\u00A0\u00A0</h2>
        <div class="form-holder">
            <input type="username" class="input" placeholder="Username" id="register-username"/>
            <input type="nickname" class="input" placeholder="Nickname" id="register-nickname"/>
            <input type="password" class="input" placeholder="Password" id="register-password"/>
        </div>
        <button class="submit-btn" id="signup-btn" onclick="register_submit()">Sign up</button>
        <div class="form-guest">or login as <a class="form-click" onclick="guest_submit()">Guest</a></div>
        ${registerFailMsg}
    </div>
    <div class="login slide-up">
        <div class="center">
            <h2 class="form-title" id="login"><span>or</span>Log in\u00A0\u00A0\u00A0</h2>
            <div class="form-holder">
                <input type="username" class="input" placeholder="Username" id="login-username"/>
                <input type="password" class="input" placeholder="Password" id="login-password"/>
            </div>
            <button class="submit-btn" id="login-btn" onclick="login_submit()">Log in</button>
            ${loginFailMsg}
        </div>
    </div>
</div>`);

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
    let res = `
<div class="room-list-title">
    <img src="https://buttercrab.ml/public/img/logo-white.png" alt="Bang"/>
</div>
<div class="room-list">
<div class="room-list-scroll">`;

    for (let roomid in roomData) {
        res += `
<div class="room-list item" onclick="joinRoom('${roomid}')">
    <div class="room-list-content">
        <div>${roomData[roomid].name}</div>
        <div class="room-list-content-subtitle">${roomid}</div>
    </div>
    <div class="room-list-content right">
        <div class="room-list-count">${roomData[roomid].count}</div>
        <div class="room-list-join">Click to Join</div>
    </div>
</div>`;
    }

    res += `
</div>
</div>
<div class="room-list-subtitle">rooms</div>
<div class="room-list-footer">
    <div class="room-list-username" onclick="usernameClicked()">${isGuest ? 'logined as guest' : username}</div>
    <div class="room-list-footer-github">
        <svg></svg>
    </div>
    <div class="room-list-make-room">make new room</div>
    <div class="room-list-make-room-icon">
        <svg id="add-icon" onclick="makeRoomClicked()" viewBox="0 0 52 52">
            <path d="M26,0C11.664,0,0,11.663,0,26s11.664,26,26,26s26-11.663,26-26S40.336,0,26,0z M26,50C12.767,50,2,39.233,2,26 S12.767,2,26,2s24,10.767,24,24S39.233,50,26,50z"/>
            <path d="M38.5,25H27V14c0-0.553-0.448-1-1-1s-1,0.447-1,1v11H13.5c-0.552,0-1,0.447-1,1s0.448,1,1,1H25v12c0,0.553,0.448,1,1,1 s1-0.447,1-1V27h11.5c0.552,0,1-0.447,1-1S39.052,25,38.5,25z"/>
        </svg>
    </div>
</div>`; // TODO: add logout, make room, refresh buttons

    return res;
}

let usernamePopupViewOn = 0;
let makeroomPopupViewOn = 0;

function deleteAccountClicked() {
    //TODO
}

function usernameClicked() {
    if (usernamePopupViewOn === 0) {
        createDiv(`
<div class="username-popup">
    <div class="username-popup-item" onclick="logout()">logout</div>` +
(isGuest || `<div class="username-popup-item warning" onclick="deleteAccountClicked()">delete account</div>`) +
`</div>`).addClass('username-popup-wrap');
        usernamePopupViewOn = 1;
    } else {
        const element = document.getElementsByClassName('username-popup-wrap')[0];
        element.parentNode.removeChild(element);
        usernamePopupViewOn = 0;
    }
}

function makeRoomSubmit() {
    const name = document.getElementById('room-name').value;
    makeroomPopupViewOn = 0;
    makeRoom(name);
}

function makeRoomClicked() {
    if (makeroomPopupViewOn === 0) {
        createDiv(`
<div class="make-room-popup">
    <input class="make-room-popup-input" id="room-name" placeholder="Room Name"/>
    <div class="make-room-popup-submit" onclick="makeRoomSubmit()">make</div>
</div>`).addClass('make-room-popup-wrap');

        document.getElementById('room-name').addEventListener('keyup', event => {
            if (event.key === 'Enter') makeRoomSubmit();
        });

        makeroomPopupViewOn = 1;
    } else {
        const element = document.getElementsByClassName('make-room-popup-wrap')[0];
        element.parentNode.removeChild(element);
        makeroomPopupViewOn = 0;
    }
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
    if (is_loading) {
        removeElements();
        is_loading = false;
    }
    if (logined) {
        if (myRoomID === '')
            makeRoomList();
        return;
    }

    view_login();
}