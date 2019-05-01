function entity(id) {
    const self = this;

    self.sprite = createSprite(0, 0, 0, 0);
    self.id = id;
    self.sprite.restitution = 0.9;

    self.sprite.hit = bullet => {
        if(bullet.shooter === self.id) {

        }
    };

    self.data = msg => {
        switch(msg.type) {
            case 'pos':
                self.sprite.position.set(msg.data.pos);
                self.sprite.velocity.set(msg.data.vel);
                break;
            case 'fire':
                self.fire(msg.data);
                break;
        }
    };

    self.update = () => {
        
    };

    self.fire = dir => {
        let pos = self.sprite.position;
        let vel = dir.copy().normalize();
        e.bullets.add(bullet(pos, vel, self.type, self.id));
    };

    self.setType = type => {
        self.type = type;
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

    self.update = () => {
        for(let id in self.d) {
            self.d[id].update();
        }
    };

    self.draw = self.group.draw;

    return self;
}
