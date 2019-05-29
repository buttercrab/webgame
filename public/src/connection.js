const socket = io('https://buttercrab.iptime.org');

let peer = new SimplePeer({
    initiator: true,
    trickle: false,
    reconnectTimer: 5000,
    iceTransportPolicy: 'relay',
    config: {
        iceServers: [
            {
                urls: "turn:buttercrab.iptime.org:8888",
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

let peerConnected = false;

peer.on('connect', () => {
    peerConnected = true;
    peer.send(JSON.stringify({
        type: 'heartbeat'
    }));
    refresh();
});

peer.on('data', msg => {
    let data = JSON.parse(msg.toString());
    if (data.type === 'heartbeat') {
        setTimeout(() => {
            peer.send(JSON.stringify({
                type: 'heartbeat'
            }));
        }, 10000);
    } else {
        _engine.data(data.data);
    }
});