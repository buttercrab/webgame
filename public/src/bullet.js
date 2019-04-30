function bullet(pos, vel, type, shooter) {
    const self = this;

    self.sprite = createSprite(0, 0, 0, 0);
    self.sprite.position.set(pos);
    self.sprite.velocity.set(vel);
    self.sprite.id = 'bullet';
    self.type = type;
    self.isDead = false;
    self.shooter = shooter;

    self.update = () => {

    };

    self.die = () => {
        self.isDead = true;
        self.sprite.remove();
    };

    self.dead = () => {
        return self.isDead;
    };

    return self;
}

function bullets() {
    const self = this;

    self._cnt = 0;
    self.d = {};
    self.group = new Group();

    self.add = bullet => {
        bullet.sprite.num = self._cnt;
        self.d[self._cnt++] = bullet;
        self.group.add(bullet.sprite);
    };

    self.update = () => {
        for(let i in self.d) {
            self.d[i].update();
            if(self.d[i].dead())
                delete self.d[i];
        }
    };

    self.collisionCallback = (sprite1, sprite2) => {
        if(sprite1.id === 'bullet' && sprite2.id === 'bullet') {
            sprite1.die();
            sprite2.die();
        } else if(sprite1.id === 'bullet' && sprite2.id === 'entity') {
            sprite1.die();
            sprite2.hit(self.d[sprite1.num]);
        } else if(sprite1.id === 'entity' && sprite2.id === 'bullet') {
            sprite2.die();
            sprite1.hit(self.d[sprite2.num]);
        }
    };

    return self;
}