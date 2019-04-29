function entity(id) {
    const self = this;

    self.sprite = createSprite(0, 0);
    self.id = id;

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

    self.add = entity => {
        self.group.add(entity.sprite);

    };

    self.data = (id, msg) => {

    };
}
