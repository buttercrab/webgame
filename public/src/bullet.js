function Bullet(pos, vel, type, shooter) {
    const self = this;

    self.type = type;
    self.sprite = createSprite(0, 0, 0, 0);
    self.sprite.position.set(pos);
    self.sprite.velocity.set(vel.mult(bullData[self.type].speed));
    self.sprite.tag = 'Bullet';
    self.shooter = shooter;

    self.sprite.draw = () => {
        rotate((self.sprite.getDirection() + 90) / 180 * Math.PI);
        fill('#494949');
        rect(0, 0, 3, 12);
    };

    self.scale = 0.1;

    self.die = () => {
        self.isDead = true;
        self.sprite.remove();
    };

    return self;
}

function Bullets() {
    const self = this;

    self._cnt = 0;
    self.d = {};
    self.group = new Group();
    self.group.collide(self.group, (a, b) => {
        a.remove();
        b.remove();
    });

    self.add = bullet => {
        bullet.sprite.num = self._cnt;
        self.d[self._cnt++] = bullet;
        self.group.add(bullet.sprite);
    };

    self.clear = () => {
        self.group.removeSprites();
        self.d = {};
    };

    return self;
}