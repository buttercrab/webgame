module.exports = (roomid) => {
    const self = this;

    self.roomid = roomid;
    self.users = {};
    self.datas = {};

    self.connect = (id, peer) => {
        self.users[id] = peer;
    };

    self.leave = id => {
        delete self.users[id];
    };

    self.update = () => {
        let res = JSON.stringify({type: 'data', data: self.datas});
        for(let id in self.users) {
            try {
                self.users[id].send(res);
            } catch (e) {
            }
        }
        self.datas = {};
    };

    self.data = (id, data) => {
        if(self.datas[id] === undefined)
            self.datas[id] = [];
        self.datas[id].push(data);
    };

    self.interval = setInterval(self.update, 20);

    self.end = () => {
        clearInterval(self.interval);
    };

    return self;
};