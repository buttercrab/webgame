module.exports = (roomid) => {
    const self = this;

    self.roomid = roomid;
    self.users = {};
    self.datas = {};

    self.connect = (id, peer) => {
        self.users[id] = peer;
    };

    self.update = () => {
        let res = JSON.stringify(self.datas);
        for(let id in self.users)
            self.users[id].send(res);
    };

    self.data = (id, data) => {
        self.datas[id] = data;
    };

    self.interval = setInterval(self.update, 20);

    self.end = () => {
        clearInterval(self.interval);
    };

    return self;
};