function AIEntity(id, e) {
    const self = this;

    self.engine = e;
    self.entity = new Entity(id, createVector(Math.random() * 2000 + 100, Math.random() * 2000 + 100));

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

    self.entity.sprite.aaadead = false;

    self.entity.hit = bullet => {
        if (self.engine.bullets.d[bullet.num].shooter !== self.entity.sprite.id) {
            self.entity.health -= bullData[self.engine.bullets.d[bullet.num].type].damage;
            if (self.entity.health < 0) self.entity.health = 0;
            bullet.remove();
        }
    };

    self.entity.update = () => {
        self.entity.sprite.velocity.add(0, 1.8);

        self.entity.sprite.bounce(self.engine.map.group, (a, b) => {
            if (a.tag === 'Entity') {
                a.velocity.x *= 0.3;
                a.aaadead = true;
            } else {
                b.velocity.x *= 0.3;
                b.aaadead = true;
            }
        });

        if (self.entity.sprite.aaadead) self.entity.health = 0;

        if (abs(self.entity.sprite.velocity.y) < 1) self.entity.sprite.velocity.y = 0;
        if (abs(self.entity.sprite.velocity.x) < 1) self.entity.sprite.velocity.x = 0;
    };

    self.entity.fire = (x, y) => {
        let pos = self.entity.sprite.position;
        let vel = createVector(x, y).normalize();
        self.engine.bullets.add(new Bullet(pos, vel, charData[self.entity.type].bullet, self.entity.sprite.id));
    };


    self.lay = [];

    self.lay[0] = [];
    for (let i = 0; i < 13; i++) {
        self.lay[0][i] = [];
        for (let j = 0; j < 16; j++) {
            self.lay[0][i][j] = Math.random() * 2 - 1;
        }
    }

    for (let i = 1; i < 3; i++) {
        self.lay[i] = [];
        for (let j = 0; j < 16; j++) {
            self.lay[i][j] = [];
            for (let k = 0; k < 16; k++) {
                self.lay[i][j][k] = Math.random() * 2 - 1;
            }
        }
    }

    self.lay[3] = [];
    for (let i = 0; i < 16; i++) {
        self.lay[3][i] = [];
        for (let j = 0; j < 3; j++) {
            self.lay[3][i][j] = Math.random() * 2 - 1;
        }
    }

    self.update = () => {
        let pos = self.entity.sprite.position.copy();
        let vel = self.entity.sprite.velocity.copy();
        let bull = createVector(-1000, -1000);
        let bullvel = createVector(-1000, -1000);
        let near = createVector(-1000, -1000);
        let nearvel = createVector(-1000, -1000);

        for (let i in self.engine.bullets.d) {
            if (self.engine.bullets.d[i].sprite.removed) continue;
            if (self.engine.bullets.d[i].shooter === self.entity.sprite.id) continue;

            if (self.engine.bullets.d[i].sprite.position.dist(pos) < bull.dist(pos)) {
                bull = self.engine.bullets.d[i].sprite.position.copy();
                bullvel = self.engine.bullets.d[i].sprite.velocity.copy();
            }
        }

        for (let i in self.engine.d) {
            if (self.engine.d[i].entity.sprite.removed) continue;

            if (self.engine.d[i].entity.sprite.position.dist(pos) < near.dist(pos)) {
                near = self.engine.d[i].entity.sprite.position;
                nearvel = self.engine.d[i].entity.sprite.velocity;
            }
        }

        if (bull.x === -1000 && bull.y === -1000) {
            bull.set(0, 0);
            bullvel.set(0, 0);
        }

        let inp = [pos.x / 2000, pos.y / 2000, vel.x / 40, vel.y / 40, bull.x / 2000, bull.y / 2000, bullvel.x / 40, bullvel.y / 40, near.x / 2000, near.y / 2000, nearvel.x / 40, nearvel.y / 40, 1];
        let hid = [];
        let res = [0, 0, 0];

        for (let i = 0; i < 16; i++) {
            hid[i] = 0;
            for (let j = 0; j < 13; j++) {
                hid[i] += inp[j] * self.lay[0][j][i];
            }
            hid[i] = Math.tanh(hid[i]);
        }

        inp = [];
        for (let i = 0; i < 16; i++)
            inp[i] = hid[i];

        for (let i = 1; i < 3; i++) {
            for (let j = 0; j < 16; j++) {
                hid[j] = 0;
                for (let k = 0; k < 16; k++) {
                    hid[j] += inp[k] * self.lay[i][k][j];
                }
                hid[j] = Math.tanh(hid[j]);
            }
            inp = [];
            for (let i = 0; i < 16; i++)
                inp[i] = hid[i];
        }

        for (let i = 0; i < 3; i++) {
            res[i] = 0;
            for (let j = 0; j < 16; j++) {
                res[i] += inp[j] * self.lay[3][j][i];
            }
            res[i] = Math.tanh(res[i]);
        }

        res[0] = Math.tanh(res[0] / 3);
        res[1] = Math.tanh(res[1] / 3);
        res[2] = Math.tanh(res[2] / 3);

        if (abs(res[0]) > 0.3) eval(charData[self.entity.type].pressed)(65, self.entity);
        if (abs(res[1]) > 0.3) eval(charData[self.entity.type].pressed)(68, self.entity);
        {
            let l = p5.Vector.fromAngle(radians(res[2] * 500));
            self.entity.fire(l.x, l.y);
        }

        eval(charData[self.entity.type].update)(self.entity);

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
    self.map = new MyMap('1');
    self.surv = 0;

    self.tim = 0;

    self.newGen = () => {
        clearTimeout(self.tim);
        self.group.removeSprites();
        self.bullets.clear();

        self.d.sort((a, b) => {
            return a.rank - b.rank;
        });

        self.res = [];
        for (let i = 0; i < 3; i++)
            self.res.push(self.d[i]);

        if (self.generation >= 1)
            console.log('generation: ' + self.generation + ', ' + self.d[0].lay);

        while (self.d.length) self.d.pop();

        for (let z = 0; z < 9; z++) {
            self.d.push(new AIEntity(z, _ai_engine));
            self.group.add(self.d[z].entity.sprite);

            if (self.generation >= 1) {
                self.d[z].lay = [];

                self.d[z].lay[0] = [];
                for (let i = 0; i < 13; i++) {
                    self.d[z].lay[0][i] = [];
                    for (let j = 0; j < 16; j++) {
                        self.d[z].lay[0][i][j] = (self.res[Math.floor(z / 3)].lay[0][i][j] + self.res[z % 3].lay[0][i][j]) / 2;
                    }
                }

                for (let i = 1; i < 3; i++) {
                    self.d[z].lay[i] = [];
                    for (let j = 0; j < 16; j++) {
                        self.d[z].lay[i][j] = [];
                        for (let k = 0; k < 16; k++) {
                            self.d[z].lay[i][j][k] = (self.res[Math.floor(z / 3)].lay[i][j][k] + self.res[z % 3].lay[i][j][k]) / 2;
                        }
                    }
                }

                self.d[z].lay[3] = [];
                for (let i = 0; i < 16; i++) {
                    self.d[z].lay[3][i] = [];
                    for (let j = 0; j < 3; j++) {
                        self.d[z].lay[3][i][j] = (self.res[Math.floor(z / 3)].lay[3][i][j] + self.res[z % 3].lay[3][i][j]) / 2;
                    }
                }
            }
        }

        self.d.push(new AIEntity(9, _ai_engine));
        self.group.add(self.d[9].entity.sprite);
        self.d.push(new AIEntity(10, _ai_engine));
        self.group.add(self.d[10].entity.sprite);

        self.surv = 11;

        self.generation++;
        self.tim = setTimeout(next, 30000);
    };

    camera.position.set(1000, 1000);

    self.update = () => {
        if (self.surv <= 3) {
            for (let i in self.d) {
                if (self.d[i].entity.health !== 0) {
                    self.d[i].rank = self.surv--;
                }
            }
            self.newGen();
        }
        if (self.surv <= 0) self.newGen();

        for (let i in self.d) {
            if (self.d[i].entity.sprite.removed) continue;

            self.d[i].update();

            if (self.d[i].entity.health === 0 && !self.d[i].entity.sprite.removed) {
                self.d[i].rank = self.surv--;
                self.d[i].entity.sprite.remove();
            }
        }

        for (let i = 0; i < self.group.size(); i++) {
            for (let j = 0; j < self.bullets.group.size(); j++) {
                if (self.group.get(i).overlapPoint(self.bullets.group.get(j).position.x, self.bullets.group.get(j).position.y)) {
                    self.d[self.group.get(i).id].entity.hit(self.bullets.group.get(j));
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

    camera.zoom = 1 / 3;

    self.draw = () => {
        if (keyIsDown(65)) camera.position.x -= 20;
        if (keyIsDown(68)) camera.position.x += 20;
        if (keyIsDown(87)) camera.position.y -= 20;
        if (keyIsDown(83)) camera.position.y += 20;

        if (keyIsDown(90)) camera.zoom += 0.02;
        if (keyIsDown(88)) camera.zoom -= 0.02;

        drawSprites(self.map.group);
        drawSprites(self.bullets.group);
        drawSprites(self.group);
    };

    return self;
}

let _ai_engine = null;

function ai_test() {
    _engine = 1;
    roomData.roomid = 1;
    refresh();
    _ai_engine = new AIEngine();
}

function next() {
    for (let i in _ai_engine.d) {
        if (_ai_engine.d[i].entity.health === 0) continue;
        _ai_engine.d[i].entity.health = 0;
        _ai_engine.d[i].rank = _ai_engine.surv--;
        _ai_engine.d[i].entity.sprite.remove();
    }
}
