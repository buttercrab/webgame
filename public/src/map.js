function MapElement(type, x, y) {
    const self = this;

    self.sprite = createSprite(x * 40, y * 40, 40, 40);
    self.sprite.tag = 'map';
    self.sprite.immovable = true;

    return self;
}

function Map() {
    const self = this;

    self.type = "A";
    self.group = new Group();

    for(let i = 0; i < 20; i++) {
        for(let j = 0; j < 10; j++) {
            self.group.add(new MapElement(0, i, j));
        }
    }
}
