function entity(id) {
    const self = this;

    self.sprite = createSprite(0, 0);
    self.id = id;
    self.restitution = 0.9;

    self.data = msg => {

    };

    self.update = () => {

    };

    self.fire = dir => {

    };

    return self;
}

function entities() {
    const self = this;

    self.d = {};
    self.group = new Group();
    self.group.bounce(self.group);

    self.add = entity => {
        self.group.add(entity.sprite);
        self.d[entity.id] = entity;
    };

    self.data = (id, msg) => {
        self.d[id].data(msg);
    };

    self.draw = self.group.draw;
}
