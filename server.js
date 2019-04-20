const lex = require('greenlock').create({
    version: 'draft-12',
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    configDir: '~/.config/acme/',
    store: require('greenlock-store-fs'),
    renewWithin: 90 * 24 * 60 * 60 * 1000,
    renewBy: 89 * 24 * 60 * 60 * 1000
});

const fs = require('fs');
const Peer = require('simple-peer');
const wrtc = require('wrtc');
const Turn = require('node-turn');

/**
 * Turn Server for p2p connection
 *
 * @port 8888
 * @username buttercrab
 * @password 1234
 */
new Turn({
    authMech: 'long-term',
    credentials: {
        "buttercrab": "1234"
    },
    listeningPort: 8888,
    listeningIps: ['192.168.0.100']
}).start();

let connections = {};

function server(certs) {
    const port = 8443;
    const app = require('express')();
    app.use(require('morgan')('dev'));

    app.get('/', (req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html');
        fs.createReadStream(__dirname + '/client/src/index.html').pipe(res);
    });

    app.get('/source.js', (req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/javascript');
        fs.createReadStream(__dirname + '/client/src/source.js').pipe(res);
    });

    app.get('*', (req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html');
        fs.createReadStream(__dirname + '/client/src/404.html').pipe(res);
    });

    require('http').createServer(lex.middleware(require('redirect-https')())).listen(8080);
    const server = require('spdy').createServer({
        key: certs.privkey,
        cert: certs.cert + '\r\n' + certs.chain
    }, app).listen(port, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Server Listening on port ${port}`);
    });

    const io = require('socket.io')(server);

    io.on('connection', socket => {
        if (!connections[socket.id])
            connections[socket.id] = {
                server: new Peer({
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
                })
            };

        connections[socket.id].server.on('error', err => {
            console.log(err);
        });

        connections[socket.id].server.on('signal', data => {
            socket.emit('signal', {
                signal: data
            });
        });

        connections[socket.id].server.on('data', msg => {
            const data = JSON.parse(msg);
            if(data.type === 'heartbeat') {
                connections[socket.id].server.send(JSON.stringify({
                    type: 'heartbeat'
                }));
            } else {
                connections[socket.id].server.send(msg);
            }
        });

        socket.on('signal', msg => {
            connections[socket.id].server.signal(msg.signal);

            connections[socket.id].server.on('connect', () => {
                console.log(`socket id ${socket.id} has connected to peer`);
            });
        });

        socket.emit('heartbeat');

        socket.on('heartbeat', () => {
            socket.emit('heartbeat');
        });

        socket.on('disconnect', () => {
            connections[socket.id].server.destroy();
            connections[socket.id] = undefined;
        });
    });
}

lex.check({domains: ['buttercrab.ml']}).then(res => {
    if (res) {
        server(res);
        return;
    }

    lex.register({
        email: 'jaeyong0201@gmail.com',
        domains: ['buttercrab.ml'],
        agreeTos: true,
        communityMember: true
    }).then(server, err => {
        console.error(err);
    });
});