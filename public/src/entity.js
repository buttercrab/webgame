function Entity(id) {
    const self = this;

    self.sprite = createSprite(100, 100);
    self.sprite.id = id;
    self.sprite.tag = 'Entity';
    self.sprite.restitution = 0.1;
    self.type = Math.floor(Math.random() * 2) + '';
    self.sprite.setCollider('circle', 0, 0, 28);
    self.health = charData[self.type].health;

    self.sprite.limitSpeed(100);

    self.sprite.draw = () => {
        if (user.id === self.sprite.id) fill('#60aa4b');
        else fill('#5675c2');
        ellipse(0, 0, 56, 56);

        fill('#aa131f');
        rect(0, -33, 56, 8);
        fill('#26aa19');
        let w = self.health / charData[self.type].health * 56;
        rect(28 - w / 2, -33, w, 8);

        fill('#1a1a1a');
        textFont(mainFont);
        textSize(18);
        text(roomData.users[self.sprite.id].name, -textWidth(roomData.users[self.sprite.id].name) / 2, -40);
    };

    self.hit = bullet => {
        if (_engine.bullets.d[bullet.num].shooter !== self.sprite.id) {
            self.health -= bullData[_engine.bullets.d[bullet.num].type].damage;
            if (self.health < 0) self.health = 0;
            if (self.sprite.id === user.id) {
                peer.send(JSON.stringify({
                    type: 'health',
                    data: self.health
                }));
            }
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
            case 'health':
                self.health = msg.data;
                if (self.health === 0 && self.sprite.id === user.id) {
                    leaveRoom();
                }
                break;
        }
    };

    self.update = () => {
        self.sprite.velocity.add(0, 1.1);

        self.sprite.bounce(_engine.map.group, (a, b) => {
            if (a.tag === 'Entity') a.velocity.x *= 0.3;
            else b.velocity.x *= 0.3;
        });

        if (abs(self.sprite.velocity.y) < 1) self.sprite.velocity.y = 0;
        if (abs(self.sprite.velocity.x) < 1) self.sprite.velocity.x = 0;

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
        _engine.bullets.add(new Bullet(pos, vel, charData[self.type].bullet, self.sprite.id));
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
