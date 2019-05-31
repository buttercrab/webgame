function AIEntity(id) {
    const self = this;

    self.entity = new Entity(id);

    self.entity.type = 1;

    self.entity.sprite.draw = () => {
        fill('#c260bc');
        ellipse(0, 0, 56, 56);

        fill('#aa131f');
        rect(0, -33, 56, 8);
        fill('#26aa19');
        let w = self.entity.health / charData[self.entity.type].health * 56;
        rect(28 - w / 2, -33, w, 8);

        fill('#1a1a1a');
        textFont(mainFont);
        textSize(18);
        text('ai ' + id, -textWidth('ai ' + id) / 2, -40);
    };

    self.entity.hit = bullet => {
        if (_engine.bullets.d[bullet.num].shooter !== self.entity.sprite.id) {
            self.entity.health -= bullData[_engine.bullets.d[bullet.num].type].damage;
            if (self.entity.health < 0) self.entity.health = 0;
            bullet.remove();
        }
    };

    self.entity.update = () => {
        self.entity.sprite.velocity.add(0, 1.8);

        self.entity.sprite.bounce(_ai_engine.map.group, (a, b) => {
            if (a.tag === 'Entity') a.velocity.x *= 0.3;
            else b.velocity.x *= 0.3;
        });

        if (abs(self.entity.sprite.velocity.y) < 1) self.entity.sprite.velocity.y = 0;
        if (abs(self.entity.sprite.velocity.x) < 1) self.entity.sprite.velocity.x = 0;
    };

    self.entity.fire = (x, y) => {
        let pos = self.entity.sprite.position;
        let vel = createVector(x, y).normalize();
        _ai_engine.bullets.add(new Bullet(pos, vel, charData[self.type].bullet, self.entity.sprite.id));
    };


    self.nn1 = [];
    self.nn2 = [];

    for (let i = 0; i < 9; i++) {
        self.nn1[i] = [];
        for (let j = 0; j < 4; j++) {
            self.nn1[i][j] = Math.random() * 2 - 1;
        }
    }

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            self.nn2[i][j] = Math.random() * 2 - 1;
        }
    }

    self.update = () => {
        let pos = self.entity.sprite.position.copy();
        let vel = self.entity.sprite.velocity.copy();
        let bull = createVector(-1000, -1000);
        let bullvel = createVector(-1000, -1000);

        for (let i in self.bullets.d) {
            if (self.bullets.d[i].sprite.removed) continue;

            if (self.bullets.d[i].sprite.position.dist(pos) < bull.dist(pos)) {
                bull = self.bullets.d[i].sprite.position.copy();
            }
        }

        if (bull.x === -1000 && bull.y === -1000) {
            bull.set(0, 0);
            bullvel.set(0, 0);
        }

        let inp = [pos.x, pos.y, vel.x, vel.y, bull.x, bull.y, bullvel.x, bullvel.y, 1];
        let hid = [];
        let res = [];

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 4; j++) {
                hid[j] += inp[i] * self.nn1[i][j];
            }
        }

        for (let i = 0; i < 4; i++)
            hid[i] = Math.tanh(hid[i]);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                res[j] = hid[i] * nn2[i][j];
            }
        }

        if (res[0] >= 10) eval(charData[self.entity.type].pressed)(65, self.entity);
        if (res[1] >= 10) eval(charData[self.entity.type].pressed)(68, self.entity);
        if (res[2] >= 10) {
            let l = p5.Vector.sub(p5.Vector.fromAngle(res[3]), self.entity.sprite.position);
            self.entity.fire(l.x, l.y);
        }

        eval(charData[self.player.type].update)(self.entity);

        self.entity.update();
    };

    return self;
}

function AIEngine() {
    const self = this;

    self.generation = 0;
    self.bullets = new Bullets();
    self.d = [];
    self.group = new Group();
    self.map = new MyMap();
    self.surv = 0;

    self.best = {};

    self.newGen = () => {
        self.generation++;
        self.gruop.removeSprites();
        self.bullets.clear();

        self.d.sort((a, b) => {
            return a.rank - b.rank;
        });

        self.res = [self.d[0], self.d[1], self.d[2]];

        console.log('generation: ' + self.generation + ', ' + self.d[0].nn1 + ', ' + self.d[0].nn2);

        self.d = [];

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                self.d[i * 3 + j] = new AIEntity(i * 3 + j);
                self.group.add(self.d[i * 3 + j].entity.sprite);

                if (self.generation !== 1) {
                    for (let k = 0; k < 9; k++) {
                        for (let l = 0; l < 4; l++) {
                            self.d[i * 3 + j].nn1[k][l] = (self.res[i].nn1[k][l] + self.res[j].nn1[k][l]) / 2 + (Math.random() <= 0.1 ? Math.random() * 2 - 1 : 0);
                        }
                    }

                    for (let k = 0; k < 4; k++) {
                        for (let l = 0; l < 4; l++) {
                            self.d[i * 3 + j].nn2[k][l] = (self.res[i].nn2[k][l] + self.res[j].nn2[k][l]) / 2 + (Math.random() <= 0.1 ? Math.random() * 2 - 1 : 0);
                        }
                    }
                }
            }
        }

        self.d[9] = new AIEntity(9);

        self.surv = 10;
    };

    self.update = () => {
        if (d.length <= 1) newGen();

        for (let i in self.d) {
            self.d[i].update();
        }

        if (self.d[i].entity.health === 0) {
            self.d[i].rank = self.surv--;
            self.d[i].entity.sprite.remove();
        }

        for (let i = 0; i < self.group.size(); i++) {
            for (let j = 0; j < self.bullets.group.size(); j++) {
                if (self.group.get(i).overlapPoint(self.bullets.group.get(j).position.x, self.bullets.group.get(j).position.y)) {
                    self.d[self.group.get(i).id].hit(self.bullets.group.get(j));
                }
            }
        }

        for (let i = 0; i < self.map.group.size(); i++) {
            for (let j = 0; j < self.bullets.group.size(); j++) {
                if (self.map.group.get(i).overlapPoint(self.bullets.group.get(j).position.x, self.bullets.group.get(j).position.y)) {
                    self.bullets.group.get(j).remove();
                }
            }
        }
    };

    self.draw = () => {
        if (ketIsDown(65)) camera.position.x -= 10;
        if (keyIsDown(68)) camera.position.x += 10;
        if (keyIsDown(87)) camera.position.y += 10;
        if (keyIsDown(83)) camera.position.y -= 10;

        camera.zoom = 1;

        drawSprites(self.map.group);
        drawSprites(self.bullets.group);
        drawSprites(self.group);
    };

    return self;
}

let _ai_engine = null;

function ai_test() {
    _engine = 1;
    refresh();
    _ai_engine = new AIEngine();
}