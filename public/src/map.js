function MyMapElement(type, x, y) {
    const self = this;

    self.sprite = createSprite(x * 40, y * 40, 40, 40);
    self.sprite.tag = 'map';
    self.sprite.immovable = true;

    self.sprite.debug = true;

    return self;
}

function MyMap() {
    const self = this;

    self.type = "A";
    self.group = new Group();

    for(let i = 0; i < 20; i++) {
        for(let j = 0; j < 11; j++) {
            if(mapData[self.type][j][i] === '1')
                self.group.add(new MyMapElement(0, i, j).sprite);
        }
    }

    return self;
}
