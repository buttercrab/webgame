function MyMapElement(type, x, y, w, h) {
    const self = this;

    self.sprite = createSprite(x, y, w, h);
    self.sprite.tag = 'map';
    self.sprite.immovable = true;
    self.sprite.draw = () => {
        fill('#5c5c5c');
        rect(0, 0, w + 1, h + 1);
    };

    return self;
}

function MyMap() {
    const self = this;

    self.type = "A";
    self.group = new Group();

    let w = mapData[self.type].w;
    let h = mapData[self.type].h;

    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            if (mapData[self.type].data[j][i] === '1')
                self.group.add(new MyMapElement(0, i * 50, j * 50, 50, 50).sprite);
        }
    }

    // Borders
    let d = 50;

    self.group.add(new MyMapElement(0, 25 * w - 25, -d / 2 - 25, 50 * w + 2 * d, d).sprite);
    self.group.add(new MyMapElement(0, 25 * w - 25, d / 2 + 50 * h - 25, 50 * w + 2 * d, d).sprite);
    self.group.add(new MyMapElement(0, -d / 2 - 25, 25 * h - 25, d, 50 * h).sprite);
    self.group.add(new MyMapElement(0, w * 50 + d / 2 - 25, 25 * h - 25, d, 50 * h).sprite);

    return self;
}
