module.exports = (roomid) => {
    const self = this;

    self.roomid = roomid;
    self.users = {};
    self.datas = {};

    self.connect = (id, peer) => {
        self.users[id] = peer;
    };

    self.update = () => {
        let res = JSON.stringify({type: 'data', data: self.datas, time: new Date().getTime()});
        for(let id in self.users)
            self.users[id].send(res);
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