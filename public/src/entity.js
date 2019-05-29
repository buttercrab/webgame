function Entity(id) {
    const self = this;

    self.sprite = createSprite(100, 100);
    self.sprite.id = id;
    self.sprite.tag = 'Entity';
    self.sprite.restitution = 0;
    self.type = 'A';
    self.sprite.setCollider('circle', 0, 0, 28, 28);
    self.health = charData[self.type].health;

    self.sprite.draw = () => {
        if (user.id === self.sprite.id) fill('#60aa4b');
        else fill('#5675c2');
        ellipse(0, 0, 56, 56);
    };

    self.hit = bullet => {
        if (_engine.bullets.d[bullet.num].shooter !== self.sprite.id) {
            self.health -= bullData[_engine.bullets.d[bullet.num].type].damage;
            bullet.remove();
        }
    };

    self.data = msg => {
        switch (msg.type) {
            case 'pos':
                self.sprite.position.set(msg.data.pos.x, msg.data.pos.y);
                break;
            case 'fire':
                self.fire(msg.data.x, msg.data.y);
                break;
            case 'type':
                self.setType(msg.data);
                break;
        }
    };

    self.update = () => {
        self.sprite.velocity.add(0, 1);

        self.sprite.bounce(_engine.map.group);

        peer.send(JSON.stringify({
            type: 'pos',
            data: {
                pos: {
                    x: self.sprite.position.x,
                    y: self.sprite.position.y
                }
            }
        }));
    };

    self.fire = (x, y) => {
        let pos = self.sprite.position;
        let vel = createVector(x, y).normalize();
        _engine.bullets.add(new Bullet(pos, vel, self.type, self.sprite.id));
    };

    self.setType = type => {
        self.type = type;
    };

    return self;
}

function Entities() {
    const self = this;

    self.d = {};
    self.group = new Group();
    self.group.bounce(self.group);

    self.add = entity => {
        self.group.add(entity.sprite);
        self.d[entity.sprite.id] = entity;
    };

    self.remove = id => {
        for (let i = 0; i < self.group.length; i++) {
            let s = self.group.get(i);
            if (s.id === id) {
                s.remove();
            }
        }
    };

    self.data = (id, msg) => {
        if (!self.d.hasOwnProperty(id)) {
            return;
        }
        self.d[id].data(msg);
    };

    return self;
}
