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

peer.on('connection', () => {
    console.log('peer connection successfully done');
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

peer.on('data', msg => {
    const data = JSON.parse(msg);
    switch (data.type) {
        case 'heartbeat':
            setTimeout(() => {
                peer.send(JSON.stringify({
                    type: 'heartbeat'
                }));
            }, 10000);
            break;
    }
});