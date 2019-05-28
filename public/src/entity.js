function Entity(id) {
    const self = this;

    self.sprite = createSprite(0, 0, 0, 0);
    self.id = id;
    self.tag = 'Entity';
    self.sprite.restitution = 0.9;
    self.sprite.setCollider('rectangle', 0, 0, 30, 30);
    self.type = 'A';
    self.sprite.addAnimation('img', charData[self.type].img);

    self.sprite.hit = bullet => {
        if (bullet.shooter !== self.id) {

        }
    };

    self.data = msg => {
        switch (msg.type) {
            case 'pos':
                self.sprite.position.set(msg.data.pos.x, msg.data.pos.y);
                self.sprite.velocity.set(0, 0);
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
        self.sprite.velocity.add(0, 0.5);
        if(self.sprite.position.y >= 300) {
            self.sprite.position.y = 300;
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
