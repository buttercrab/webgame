function AIEntity(id, e) {
    const self = this;

    self.engine = e;
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
        if (self.engine.bullets.d[bullet.num].shooter !== self.entity.sprite.id) {
            self.entity.health -= bullData[self.engine.bullets.d[bullet.num].type].damage;
            if (self.entity.health < 0) self.entity.health = 0;
            bullet.remove();
        }
    };

    self.entity.update = () => {
        self.entity.sprite.velocity.add(0, 1.8);

        self.entity.sprite.bounce(self.engine.map.group, (a, b) => {
            if (a.tag === 'Entity') a.velocity.x *= 0.3;
            else b.velocity.x *= 0.3;
        });

        if (abs(self.entity.sprite.velocity.y) < 1) self.entity.sprite.velocity.y = 0;
        if (abs(self.entity.sprite.velocity.x) < 1) self.entity.sprite.velocity.x = 0;
    };

    self.entity.fire = (x, y) => {
        let pos = self.entity.sprite.position;
        let vel = createVector(x, y).normalize();
        self.engine.bullets.add(new Bullet(pos, vel, charData[self.entity.type].bullet, self.entity.sprite.id));
    };


    self.lay = [];

    for (let i = 0; i < 5; i++) {
        self.lay[i] = [];
        for (let j = 0; j < 3; j++) {
            self.lay[i][j] = Math.random();
        }
    }

    self.lay[5] = [];
    for (let i = 0; i < 3; i++) {
        self.lay[5][i] = [];
        for (let j = 0; j < 3; j++) {
            self.lay[5][i][j] = Math.random();
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

        let inp = [pos.x, pos.y, vel.x, vel.y, bull.x, bull.y, bullvel.x, bullvel.y, near.x, near.y, nearvel.x, nearvel.y, 1];
        let hid = [];
        let res = [0, 0, 0];

        for (let i = 0; i < 5; i++) {
            hid = [];
            for (let j = 0; j < 11 - i * 2; j++) {
                hid[j] = inp[j] * self.lay[i][0] + inp[j + 1] * self.lay[i][1] + inp[j + 2] * self.lay[i][2];
            }
            inp = [];
            for (let j = 0; j < 11 - i * 2; j++) {
                inp[j] = hid[j];
            }
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                res[j] += inp[i] * self.lay[5][i][j];
            }
        }

        if (abs(res[0]) >= 5000 || abs(res[0]) <= 1500) eval(charData[self.entity.type].pressed)(65, self.entity);
        if (abs(res[1]) >= 5000 || abs(res[1]) <= 1500) eval(charData[self.entity.type].pressed)(68, self.entity);
        {
            let l = p5.Vector.fromAngle(res[2]);
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

        self.res = [self.d[0], self.d[1]];

        if (self.generation >= 1)
            console.log('generation: ' + self.generation + ', ' + self.d[0].lay);

        while (self.d.length) self.d.pop();

        for (let i = 0; i < 4; i++) {
            self.d.push(new AIEntity(i, _ai_engine));
            self.group.add(self.d[i].entity.sprite);

            if (self.generation >= 1) {
                for (let j = 0; j < 5; j++) {
                    for (let k = 0; k < 3; k++) {
                        self.d[i].lay[j][k] = (self.res[Math.floor(i / 2)].lay[j][k] + self.res[i % 2].lay[j][k]) / 2 + (Math.random() <= 0.1 ? Math.random() * 0.02 - 0.01 : 0);
                    }
                }

                for (let k = 0; k < 3; k++) {
                    for (let l = 0; l < 3; l++) {
                        self.d[i].lay[5][k][l] = (self.res[Math.floor(i / 2)].lay[5][k][l] + self.res[i % 2].lay[5][k][l]) / 2 + (Math.random() <= 0.1 ? Math.random() * 0.02 - 0.01 : 0);
                    }
                }
            }
        }

        self.d.push(new AIEntity(4, _ai_engine));
        self.group.add(self.d[4].entity.sprite);

        self.surv = 5;

        self.generation++;
        self.tim = setTimeout(next, 30000);
    };

    self.update = () => {
        if (self.surv === 1) {
            for (let i in self.d) {
                if (self.d[i].entity.health !== 0) {
                    self.d[i].rank = self.surv--;
                    break;
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

/**
 * 0.4378980574699229,0.4233961854178661,0.4821526214655431,0.6685102559907358,0.49194660602497864,0.615431981606025,0.4884946234372259,0.45420213620575123,0.4069619532332497,0.2434917341393607,0.5510964828309379,0.4581897272264792,0.8211164868787595,0.7713343582469916,0.49543993525254676,0.22959887555320788,0.7378390184970562,0.3112700748960245,-0.13867444606519275,0.4152839842962577,0.649618142543024,0.7700415617486422,0.6956593780857552,0.6495584799805598
 */