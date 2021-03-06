/**
 * WebGame made by Jaeyong Sung
 */

/**
 * @module greenlock
 * @url https://buttercrab.ml
 * @description ssl configuration for website
 */

const lex = require('greenlock').create({
    version: 'draft-12',
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    configDir: '~/.config/acme/',
    store: require('greenlock-store-fs'),
    renewWithin: 90 * 24 * 60 * 60 * 1000,
    renewBy: 89 * 24 * 60 * 60 * 1000
});

const fs = require('fs');
const Turn = require('node-turn');
const expressSession = require('express-session');
const sharedSession = require('express-socket.io-session');
const FileStore = require('session-file-store')(expressSession);

/**
 * @module express-session
 * @description session configuration
 * @type {session}
 */

const session = expressSession({
    secret: 'f392h*32@usfeo{]a]]|',
    resave: true,
    saveUninitialized: true,
    cookie: {secure: true, maxAge: 2592000000},
    store: new FileStore
});

/**
 * @module node-turn
 * @url turn:buttercrab.ml:1234
 * @description Turn Server for p2p connection
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

/**
 * @function server
 * @description main function to serve website
 * @port 8080 forwarded to 80 for http server
 * @port 8443 forwarded to 443 for https(spdy) server
 * @param certs: certification for ssl
 */

function server(certs) {
    const port = 8443;
    const app = require('express')();
    // app.use(require('morgan')('dev'));
    app.use(session);

    app.enable('trust proxy');

    app.get('/', (req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html');
        fs.createReadStream(__dirname + '/public/src/index.html').pipe(res);
        // res.end();
    });

    app.get('/admin', (req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html');
        fs.createReadStream(__dirname + '/public/src/admin.html').pipe(res);
        // res.end();
    });

    app.get('/public/font', (req, res) => {
        res.statusCode = 404;
        if (!req.query.fontName || !req.query.fontFamily)
            return;
        const stream = fs.createReadStream(__dirname + '/public/font/' + req.query.fontName + '/' + req.query.fontName + '-' + req.query.fontFamily + '.ttf');

        stream.on('open', () => {
            res.statusCode = 200;
            stream.pipe(res);
            // res.end();
        });

        stream.on('error', err => {
            res.statusCode = 404;
            // res.end();
        });
    });

    app.get('/public/:dir/:file', (req, res) => {
        res.statusCode = 404;
        if (!req.params.file || !req.params.dir)
            return;
        const stream = fs.createReadStream(__dirname + '/public/' + req.params.dir + '/' + req.params.file);

        stream.on('open', () => {
            res.statusCode = 200;
            stream.pipe(res);
            // res.end();
        });

        stream.on('error', err => {
            res.statusCode = 404;
            // res.end();
        });
    });

    app.get('*', (req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html');
        fs.createReadStream(__dirname + '/public/src/404.html').pipe(res);
        // res.end();
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
    const user = require('./src/user.js')(io);
    const charData = JSON.parse(fs.readFileSync(__dirname + '/public/data/entities.json').toString());
    const bullData = JSON.parse(fs.readFileSync(__dirname + '/public/data/bullet.json').toString());
    const mapData = JSON.parse(fs.readFileSync(__dirname + '/public/data/map.json').toString());

    io.use(sharedSession(session, {
        autoSave: true
    }));

    io.on('connection', socket => {
        user.connect(socket);

        socket.emit('user-data', {
            logined: user.logined(socket.id),
            name: user.getUsername(socket.id),
            id: socket.id
        });

        socket.emit('char-data', charData);
        socket.emit('bull-data', bullData);
        socket.emit('map-data', mapData);

        socket.emit('heartbeat');
        socket.on('heartbeat', () => {
            socket.emit('heartbeat');
        });

        socket.on('login', msg => {
            const logined = user.login(socket.id, msg.id, msg.pw);
            socket.emit('login', logined);
            socket.emit('user-data', {
                logined: user.logined(socket.id),
                name: user.getUsername(socket.id),
                id: socket.id
            });
        });

        socket.on('logout', () => {
            const logouted = user.logout(socket.id);
            socket.emit('logout', logouted);
        });

        socket.on('login-guest', name => {
            user.loginGuest(socket.id, name);
            socket.emit('user-data', {
                logined: user.logined(socket.id),
                name: user.getUsername(socket.id),
                id: socket.id,
                isGuest: true
            });
        });

        socket.on('logined', () => {
            socket.emit('user-data', {
                logined: user.logined(socket.id),
                name: user.getUsername(socket.id),
                id: socket.id
            });
        });

        socket.on('register', msg => {
            socket.emit('register', user.register(socket.id, msg.id, msg.nm, msg.pw));
        });

        socket.on('delete-user', msg => {
            socket.emit('delete-user', user.deleteUser(socket.id, msg.id, msg.pw));
        });

        socket.on('get-rooms', () => {
            socket.emit('get-rooms', user.getRooms());
        });

        socket.on('make-room', name => {
            user.makeRoom(socket.id, name);
            socket.emit('room-data', user.getRoomData(socket.id));
        });

        socket.on('join-room', roomid => {
            user.joinRoom(socket.id, roomid);
            socket.emit('room-data', user.getRoomData(socket.id));
        });

        socket.on('leave-room', () => {
            user.leaveRoom(socket.id);
            socket.emit('leave-room-callback');
        });

        socket.on('room-data', () => {
            socket.emit('room-data', user.getRoomData(socket.id));
        });

        socket.on('disconnect', () => {
            user.disconnect(socket.id);
        });
    });
}

/**
 * @description checking certification that has been saved
 */

lex.check({domains: ['buttercrab.ml', 'buttercrab.iptime.org']}).then(res => {
    if (res) {
        server(res);
        return;
    }

    lex.register({
        email: 'jaeyong0201@gmail.com',
        domains: ['buttercrab.ml', 'buttercrab.iptime.org'],
        agreeTos: true,
        communityMember: true
    }).then(server, err => {
        console.error(err);
    });
});