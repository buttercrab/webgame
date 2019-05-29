function Entity(id) {
    const self = this;

    self.sprite = createSprite(100, 100);
    self.id = id;
    self.sprite.tag = 'Entity';
    self.sprite.restitution = 0.9;
    self.type = 'A';
    self.sprite.setCollider('rectangle', 0, 0, 60, 60);
    self.sprite.addAnimation('img', charData[self.type].img);
    self.health = charData[self.type].health;

    self.sprite.debug = true;

    self.sprite.hit = bullet => {
        if (_engine.bullets.d[bullet.num].shooter !== self.id) {
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
                self.fire(msg.data);
                break;
            case 'type':
                self.setType(msg.data);
                break;
        }
    };

    self.update = () => {
        self.sprite.velocity.add(0, 1);
        if(self.sprite.position.y >= 500) {
            self.sprite.position.y = 500;
            self.sprite.velocity.y = 0;
        }
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

    self.fire = dir => {
        let pos = self.sprite.position;
        let vel = dir.copy().normalize();
        _engine.bullets.add(new Bullet(pos, vel, self.type, self.id));
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
        self.d[entity.id] = entity;
    };

    self.remove = id => {
        for(let i = 0; i < self.group.length; i++) {
            let s = self.group.get(i);
            if(s.id === id) {
                s.remove();
            }
        }
    };

    self.data = (id, msg) => {
        self.d[id].data(msg);
    };

    return self;
}
