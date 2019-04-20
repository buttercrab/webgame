const fs = require('fs');
const crypto = require('crypto');
const Peer = require('simple-peer');
const wrtc = require('wrtc');

module.exports = (io) => {
    this.io = io;
    // this.game = game;
    this.userData = fs.readFileSync(__dirname + '/../data/user.json');
    this.connected = {};

    this.saveUserData = () => {
        fs.writeFileSync(__dirname + '/../data/user.json', userData);
    };

    this.login = (socketid, id, hashed, msg) => {
        if (!this.userData[id]) return false;
        for (let i = 0, t = Math.floor(new Date().getTime() / 1000); i < 60; i++, t--) {
            if (crypto.createHash('sha512').update(this.userData[id].pw + msg + t).digest('hex') === hashed) {
                this.connected[socketid].logined = true;
                this.connected[socketid].isGuest = false;
                this.connected[socketid].id = id;
                return true;
            }
        }
        return false;
    };

    this.register = (id, hashed) => {
        if (this.userData[id]) return false;
        this.userData[id] = {
            pw: hashed
        };
        this.saveUserData();
        return true;
    };

    this.connect = (socket) => {
        if(this.connected[socket.id]) return false;
        this.connected[socket.id] = {
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

        this.connected[socket.id].peer.on('error', err => {
            console.log(err);
        });

        this.connected[socket.id].peer.on('signal', data => {
            socket.emit('signal', {
                signal: data
            });
        });

        this.connected[socket.id].peer.on('data', msg => {
            const data = JSON.parse(msg);
            if(data.type === 'heartbeat') {
                this.connected[socket.id].peer.send(JSON.stringify({
                    type: 'heartbeat'
                }));
            } else {
                this.connected[socket.id].peer.send(msg);
            }
        });

        socket.on('signal', msg => {
            this.connected[socket.id].peer.signal(msg.signal);
        });

        return true;
    };

    this.disconnect = (socketid) => {
        if(!this.connected[socketid]) return false;
        this.connected[socketid].peer.destroy();
        this.connected[socketid] = undefined;
        return true;
    };

    return this;
};