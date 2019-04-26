module.exports = () => {
    const self = this;

    self.valueDB = {};
    self.logDB = {};

    self.setValue = (key, value) => {
        self.valueDB[key] = value;
    };

    self.getValue = (key) => {
        return self.valueDB[key];
    };

    self.initLog = (key, maxLength = 100) => {
        self.logDB[key] = {
            log: [],
            max: maxLength
        };
    };

    self.addLog = (key, value) => {
        if(self.logDB[key] === undefined) return;
        self.logDB[key].log.push(value);
    };

    self.getLog = (key) => {
        if(self.logDB[key] === undefined) return;
        return self.logDB[key].log;
    };

    self.resetLog = (key) => {
        if(self.logDB[key] === undefined) return;
        self.logDB[key].log = [];
    };

    return self;
};