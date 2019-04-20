const fs = require('fs');
const crypto = require('crypto');
const Peer = require('simple-peer');
const wrtc = require('wrtc');

module.exports = () => {
    const self = this;
    self.userData = JSON.parse(fs.readFileSync(__dirname + '/../data/user.json').toString());
    self.connected = {};

    self.saveUserData = () => {
        fs.writeFileSync(__dirname + '/../data/user.json', JSON.stringify(self.userData));
    };

    self.login = (socketid, id, hashed) => {
        if (!self.userData[id]) return false;
        for (let i = 0, t = Math.floor(new Date().getTime() / 1000); i < 60; i++, t--) {
            if (crypto.createHash('sha256').update(self.userData[id].pw + t).digest('hex') === hashed) {
                self.connected[socketid].logined = true;
                self.connected[socketid].isGuest = false;
                self.connected[socketid].id = id;

                self.connected[socketid].socket.handshake.session.userid = id;
                self.connected[socketid].socket.handshake.session.pw = self.userData[id].pw;
                self.connected[socketid].socket.handshake.session.save();

                return true;
            }
        }
        return false;
    };

    self.register = (socketid, id, hashed) => {
        if (self.userData[id]) return false;
        self.userData[id] = {
            pw: hashed
        };
        self.saveUserData();

        self.connected[socketid].logined = true;
        self.connected[socketid].isGuest = false;
        self.connected[socketid].id = id;

        self.connected[socketid].socket.handshake.session.userid = id;
        self.connected[socketid].socket.handshake.session.pw = hashed;
        self.connected[socketid].socket.handshake.session.save();

        return true;
    };

    self.connect = (socket) => {
        if (self.connected[socket.id]) return false;
        self.connected[socket.id] = {
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

            self.connected[socket.id].logined = true;
            self.connected[socket.id].isGuest = false;
            self.connected[socket.id].id = socket.handshake.session.userid;
        }

        self.connected[socket.id].peer.on('error', err => {
            console.log(err);
        });

        self.connected[socket.id].peer.on('signal', data => {
            socket.emit('signal', {
                signal: data
            });
        });

        self.connected[socket.id].peer.on('data', msg => {
            const data = JSON.parse(msg);
            if (data.type === 'heartbeat') {
                self.connected[socket.id].peer.send(JSON.stringify({
                    type: 'heartbeat'
                }));
            } else {
                self.connected[socket.id].peer.send(msg);
            }
        });

        socket.on('signal', msg => {
            self.connected[socket.id].peer.signal(msg.signal);
        });

        return true;
    };

    self.disconnect = (socketid) => {
        if (!self.connected[socketid]) return false;
        self.connected[socketid].peer.destroy();
        self.connected[socketid] = undefined;
        return true;
    };

    return self;
};