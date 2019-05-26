let user = {};
let roomList = {};
let roomData = {};
let charData = {};
let bullData = {};

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
    startLoading();
    user.logined = undefined;
    digestMessage(pw).then(value => {
        digestMessage(hexString(value) + Math.floor(new Date().getTime() / 1000)).then(hashed => {
            socket.emit('login', {
                id: id,
                pw: hexString(hashed)
            });
        });
    });
}

function loginGuest(name) {
    startLoading();
    user.logined = undefined;
    socket.emit('login-guest', name);
}

function logout() {
    startLoading();
    socket.emit('logout');
    user.logined = undefined;
}

function register(id, nm, pw) {
    startLoading();
    user.logined = undefined;
    digestMessage(pw).then(value => {
        socket.emit('register', {
            id: id,
            nm: nm,
            pw: hexString(value)
        });
    });
}

function deleteUser(id, pw) {
    startLoading();
    user.logined = undefined;
    digestMessage(pw).then(value => {
        socket.emit('delete-user', {
            id: id,
            pw: hexString(value)
        });
    })
}

function makeRoom(name) {
    socket.emit('make-room', name);
}

function joinRoom(roomid) {
    socket.emit('join-room', roomid);
}

function leaveRoom() {
    socket.emit('leave-room');
}

function getRooms() {
    socket.emit('get-rooms');
}

socket.on('char-data', msg => {
    charData = msg;
});

socket.on('bull-data', msg => {
    bullData = msg;
});

socket.on('room-data', msg => {
    roomData = msg;
    refresh();
});

socket.on('login', msg => {
    if (msg) {
        user.logined = true;
        getRooms();
    } else {
        loginFailed(3);
        socket.emit('logined');
    }
});

socket.on('logout', msg => {
    if (msg) {
        user.logined = false;
        getRooms();
    } else {
        socket.emit('logined');
    }
});

socket.on('user-data', msg => {
    user = msg;
    user.isGuest = (msg.isGuest === true);
    getRooms();
});

socket.on('register', msg => {
    if (msg) {
        user.logined = true;
        getRooms();
    } else {
        registerFailed(4);
        socket.emit('logined');
    }
});

socket.on('delete-user', msg => {
    if (msg) {
        user.logined = false;
        getRooms();
    } else {
        deleteUserFailed();
        // TODO
    }
});

socket.on('get-rooms', data => {
    roomList = data;
    refresh();
});

///==========

let registerFailMsg = '', loginFailMsg = '';

function loginFailed(code) {
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

function loginSubmit() {
    const id = document.getElementById('login-username').value;
    const pw = document.getElementById('login-password').value;
    if (!id) {
        loginFailed(1);
        return;
    }
    if (!pw) {
        loginFailed(2);
        return;
    }
    login(id, pw);
}

function registerFailed(code) {
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

function registerSubmit() {
    const id = document.getElementById('register-username').value;
    const nm = document.getElementById('register-nickname').value;
    const pw = document.getElementById('register-password').value;
    if (!id) {
        registerFailed(1);
        return;
    }
    if (!pw) {
        registerFailed(2);
        return;
    }
    if (!nm) {
        registerFailed(3);
        return;
    }
    register(id, nm, pw);
}

function guestSubmit() {
    const id = document.getElementById('register-username').value;
    if (!id) {
        registerFailed(5);
        return;
    }
    loginGuest(id);
}

let onLoading = false, loginViewOn = false, loginViewState = 0;

function startLoading() {
    if (loginViewOn) removeElements();
    if (onLoading) return;
    onLoading = true;
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

function viewLogin() {
    removeElements();

    loginViewState = 0;
    loginViewOn = true;

    createDiv(`
<div class="title">
<!--    <img src="https://buttercrab.iptime.org/public/img/logo.png" alt="Bang">-->
Bang
</div>
<div class="form-structor" id="base">
    <div class="signup">
        <h2 class="form-title" id="signup"><span>or</span>Sign up\u00A0\u00A0\u00A0</h2>
        <div class="form-holder">
            <input type="username" class="input" placeholder="Username" id="register-username"/>
            <input type="nickname" class="input" placeholder="Nickname" id="register-nickname"/>
            <input type="password" class="input" placeholder="Password" id="register-password"/>
        </div>
        <button class="submit-btn" id="signup-btn" onclick="registerSubmit()">Sign up</button>
        <div class="form-guest">or login as <a class="form-click" onclick="guestSubmit()">Guest</a></div>
        ${registerFailMsg}
    </div>
    <div class="login slide-up">
        <div class="center">
            <h2 class="form-title" id="login"><span>or</span>Log in\u00A0\u00A0\u00A0</h2>
            <div class="form-holder">
                <input type="username" class="input" placeholder="Username" id="login-username"/>
                <input type="password" class="input" placeholder="Password" id="login-password"/>
            </div>
            <button class="submit-btn" id="login-btn" onclick="loginSubmit()">Log in</button>
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
        if (event.key === 'Enter') registerSubmit();
    });
    document.getElementById('register-nickname').addEventListener('keyup', event => {
        if (event.key === 'Enter') registerSubmit();
    });
    document.getElementById('register-password').addEventListener('keyup', event => {
        if (event.key === 'Enter') registerSubmit();
    });
    document.getElementById('login-username').addEventListener('keyup', event => {
        if (event.key === 'Enter') loginSubmit();
    });
    document.getElementById('login-password').addEventListener('keyup', event => {
        if (event.key === 'Enter') loginSubmit();
    });
}

function getRoomHTML() {
    let res = `
<div class="room-list-title">
<!--    <img src="https://buttercrab.iptime.org/public/img/logo-white.png" alt="Bang"/>-->
Bang
</div>
<div class="room-list">
<div class="room-list-scroll">`;

    for (let roomid in roomList) {
        res += `
<div class="room-list item" onclick="joinRoom('${roomid}')">
    <div class="room-list-content">
        <div>${roomList[roomid].name}</div>
        <div class="room-list-content-subtitle">${roomid}</div>
    </div>
    <div class="room-list-content right">
        <div class="room-list-count">${roomList[roomid].count}</div>
        <div class="room-list-join">Click to Join</div>
    </div>
</div>`;
    }

    res += `
</div>
</div>
<div class="room-list-subtitle">rooms</div>
<div class="room-list-footer">
    <div class="room-list-username" onclick="usernameClicked()">${user.isGuest ? 'logined as guest' : user.name}</div>
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
</div>`; // TODO: add logout, refresh buttons

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
(user.isGuest || `<div class="username-popup-item warning" onclick="deleteAccountClicked()">delete account</div>`) +
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
    createDiv(self.getRoomHTML()).addClass('room-list-wrap');
}

function refresh() {
    createCanvas(window.innerWidth, window.innerHeight);

    if (user.logined === undefined) {
        startLoading();
        return;
    }
    if (onLoading) {
        removeElements();
        onLoading = false;
    }
    if (user.logined) {
        removeElements();
        if (!roomData.roomid)
            makeRoomList();
        else if(_engine === null) {
            _engine = new Engine();
        }
        return;
    }

    viewLogin();
}