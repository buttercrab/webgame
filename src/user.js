const fs = require('fs');
const crypto = require('crypto');
const Peer = require('simple-peer');
const wrtc = require('wrtc');
const uniqid = require('uniqid');
const game = require('./game.js');

module.exports = (io) => {
    const self = this;
    self.io = io;
    let data;
    try {
        data = fs.readFileSync(__dirname + '/../data/user.json').toString();
    } catch (e) {
        data = '{}';
    }
    self.userData = JSON.parse(data);
    self.connections = {};
    self.loginedUsers = {};
    self.room = {};

    self.saveUserData = async () => {
        fs.writeFileSync(__dirname + '/../data/user.json', JSON.stringify(self.userData));
    };

    self.login = (socketid, id, hashed) => {
        if (!self.userData[id]) return false;
        if (self.loginedUsers[id]) return false;
        for (let i = 0, t = Math.floor(new Date().getTime() / 1000); i < 60; i++, t--) {
            if (crypto.createHash('sha256').update(self.userData[id].pw + t).digest('hex') === hashed) {
                self.connections[socketid].loginedUsers = true;
                self.connections[socketid].isGuest = false;
                self.connections[socketid].id = id;
                self.connections[socketid].name = self.userData[id].nm;

                self.connections[socketid].socket.handshake.session.userid = id;
                self.connections[socketid].socket.handshake.session.pw = self.userData[id].pw;
                self.connections[socketid].socket.handshake.session.save();

                self.loginedUsers[self.connections[socketid].id] = true;

                return true;
            }
        }
        return false;
    };

    self.loginGuest = (socketid, name) => {
        self.connections[socketid].loginedUsers = false;
        self.connections[socketid].isGuest = true;
        self.connections[socketid].id = uniqid('Guest-');
        self.connections[socketid].name = name;
    };

    self.logout = (socketid) => {
        if (!self.logined(socketid)) return false;
        self.connections[socketid].loginedUsers = false;
        self.connections[socketid].isGuest = false;
        self.loginedUsers[self.connections[socketid].id] = false;
        delete self.connections[socketid].id;
        delete self.connections[socketid].name;
        delete self.connections[socketid].socket.handshake.session.userid;
        delete self.connections[socketid].socket.handshake.session.pw;
        self.connections[socketid].socket.handshake.session.save();
        return true;
    };

    self.register = (socketid, id, nm, hashed) => {
        if (self.userData[id]) return false;
        self.userData[id] = {
            nm: nm,
            pw: hashed
        };
        self.saveUserData();

        self.connections[socketid].loginedUsers = true;
        self.connections[socketid].isGuest = false;
        self.connections[socketid].id = id;

        self.connections[socketid].socket.handshake.session.userid = id;
        self.connections[socketid].socket.handshake.session.pw = hashed;
        self.connections[socketid].socket.handshake.session.save();

        return true;
    };

    self.logined = (socketid) => {
        if (!self.connections.hasOwnProperty(socketid)) return false;
        return self.connections[socketid].loginedUsers || self.connections[socketid].isGuest;
    };

    self.connect = (socket) => {
        if (self.connections[socket.id]) return false;
        self.connections[socket.id] = {
            logined: false,
            isGuest: false,
            peer: new Peer({
                wrtc: wrtc,
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
            }),
            socket: socket
        };

        if (self.userData[socket.handshake.session.userid] &&
            self.userData[socket.handshake.session.userid].pw === socket.handshake.session.pw) {

            self.connections[socket.id].loginedUsers = true;
            self.connections[socket.id].isGuest = false;
            self.connections[socket.id].id = socket.handshake.session.userid;
        }

        self.connections[socket.id].peer.on('error', err => {
            console.log(`Ice connection failed. id: ${self.connections[socket.id].id || socket.id} reconnecting...`);
        });

        self.connections[socket.id].peer.on('signal', data => {
            socket.emit('signal', {
                signal: data
            });
        });

        self.connections[socket.id].peer.on('data', msg => {
            let data;
            try {
                data = JSON.parse(msg);
            } catch (e) {
                return;
            }
            if (data.type === 'heartbeat') {
                self.connections[socket.id].peer.send(JSON.stringify({
                    type: 'heartbeat'
                }));
            } else if (self.connections[socket.id].roomid) {
                self.room[self.connections[socket.id].roomid].game.data(self.connections[socket.id].id, data);
            }
        });

        socket.on('signal', msg => {
            self.connections[socket.id].peer.signal(msg.signal);
        });

        return true;
    };

    self.disconnect = (socketid) => {
        if (!self.connections[socketid]) return false;
        self.leaveRoom(socketid);
        self.connections[socketid].peer.destroy();
        delete self.connections[socketid];
        return true;
    };

    self.deleteUser = (socketid, id, pw) => {
        if (!self.logined(socketid)) return false;
        if (pw !== self.userData[self.connections[socketid].id]) return false;
        delete self.connections[socketid].socket.handshake.session.userid;
        delete self.connections[socketid].socket.handshake.session.pw;
        self.connections[socketid].socket.handshake.session.save();
        self.connections[socketid].loginedUsers = false;
        delete self.userData[self.connections[socketid].id];
        return true;
    };

    self.makeRoom = (socketid, name) => {
        if (!self.logined(socketid)) return;
        if (self.connections[socketid].room) return;
        let roomid = uniqid();
        self.connections[socketid].socket.join(roomid);
        self.connections[socketid].roomid = roomid;
        self.room[roomid] = {
            ids: {},
            count: 1,
            name: name,
            game: game(roomid)
        };
        self.room[roomid].ids[socketid] = true; // true for room head false for else
    };

    self.getRooms = () => {
        let res = {};
        for (let i in self.room) {
            res[i] = {
                count: self.room[i].count,
                name: self.room[i].name
            }
        }
        return res;
    };

    self.joinRoom = (socketid, roomid) => {
        if (!self.logined(socketid)) return false;
        if (!self.room[roomid]) return false;
        if (self.connections[socketid].roomid) return false;
        self.connections[socketid].socket.join(roomid);
        self.connections[socketid].roomid = roomid;
        self.room[roomid].ids[socketid] = false;
        self.room[roomid].count++;
        return true;
    };

    self.leaveRoom = (socketid) => {
        if (!self.logined(socketid)) return;
        if (!self.connections[socketid].roomid) return;
        let roomid = self.connections[socketid].roomid;
        if (!self.room[roomid]) return;
        if (self.room[roomid].ids[socketid]) {
            delete self.room[roomid].ids[socketid];
            self.room[roomid].ids[Object.keys(self.room[roomid].ids)[0]] = true;
        } else self.room[roomid].ids[socketid] = undefined;
        self.room[roomid].count--;
        if (self.room[roomid].count === 0) {
            self.room[roomid].game.end();
            delete self.room[roomid];
        }
        delete self.connections[socketid].roomid;
        self.connections[socketid].socket.leave(roomid, err => {
        });
    };

    self.getRoomData = (socketid) => {
        if (!self.logined(socketid)) return;
        let res = {
            roomid: self.connections[socketid].roomid,
            name: self.room[self.connections[socketid].roomid].name,
            users: {}
        };
        for (let i in self.room[self.connections[socketid].roomid].ids) {
            res.users[i] = {
                king: self.room[self.connections[socketid].roomid].ids[i],
                name: self.connections[i].id
            };
        }
        return res;
    };

    self.getUsername = (socketid) => {
        return self.connections[socketid].id;
    };

    self.notify = (title, msg) => {
        self.io.emit('notice', {
            title: title,
            msg: msg
        });
    };

    return self;
};