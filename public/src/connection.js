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

peer.on('connect', () => {
    peer.send(JSON.stringify({
        type: 'heartbeat'
    }));
});

peer.on('data', msg => {
    let data = "";
    for(let i = 0; i < msg.length; i++)
        data += String.fromCharCode(msg[i]);
    data = JSON.parse(data);
    console.log(data);
    if (data.type === 'heartbeat') {
        setTimeout(() => {
            peer.send(JSON.stringify({
                type: 'heartbeat'
            }));
        }, 10000);
    } else {
        _engine.data(data);
    }
});