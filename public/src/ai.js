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
            let l = p5.Vector.fromAngle(res[2] / 20);
            self.entity.fire(l.x, l.y);
        }

        eval(charData[self.entity.type].update)(self.entity);

        self.entity.update();
    };

    return self;
}

function AIEngine(dat) {
    const self = this;

    self.dat = dat;
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
            } else {
                let cnt = 0;
                for (let j = 0; j < 5; j++) {
                    for (let k = 0; k < 3; k++) {
                        self.d[i].lay[j][k] = self.dat[i][cnt++];
                    }
                }

                for (let k = 0; k < 3; k++) {
                    for (let l = 0; l < 3; l++) {
                        self.d[i].lay[5][k][l] = self.dat[i][cnt++];
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

function ai_test(dat) {
    _engine = 1;
    roomData.roomid = 1;
    refresh();
    _ai_engine = new AIEngine(dat);
}

function next() {
    for (let i in _ai_engine.d) {
        if (_ai_engine.d[i].entity.health === 0) continue;
        _ai_engine.d[i].entity.health = 0;
        _ai_engine.d[i].rank = _ai_engine.surv--;
        _ai_engine.d[i].entity.sprite.remove();
    }
}

let a = [[0.5859499514739724, 0.35449067686128777, 0.24322758140251, 0.4081600273693491, 0.1756522586356183, 0.8114384136207411, 0.3524259191492385, 0.6401503480859014, 0.6839541331472383, 0.421692522770134, 0.6085998305938701, 0.46102732831537097, 0.33512813680949205, 0.1353681815482172, 0.5117737915944871, 0.5420544617774805, 0.6093198954719882, 0.34153861301754823, 0.8305111849725136, 0.5310459109688851, 0.5100947103244065, 0.6580390468403003, 0.7953945720537972, 0.4399123463296013],
    [0.12760364961225923, 0.19307609925448632, 0.2056392605895616, 0.14898409090849918, 0.4105634503317889, 0.43247853545587134, 0.5639708734879352, 0.37264318843421695, 0.2156221830346825, 0.8621985562780876, 0.39642686348502165, 0.4439655283401087, 0.8424656109134181, 0.5145286382774931, 0.3411477825862339, 0.14929151033661148, 0.7990907123085842, 0.44585497329031476, 0.4711591928189911, 0.38974362279372143, 0.9028894877691893, 0.2551901057140047, 0.7938184054803337, 0.6387291149586078],
    [0.5900064172948422, 0.35449067686128777, 0.24322758140251, 0.4081600273693491, 0.1756522586356183, 0.8167941138936726, 0.3524259191492385, 0.6401503480859014, 0.6839541331472383, 0.4297627781171229, 0.6085998305938701, 0.46102732831537097, 0.33512813680949205, 0.1353681815482172, 0.5117737915944871, 0.5420544617774805, 0.61395654941514, 0.34153861301754823, 0.8305111849725136, 0.5310459109688851, 0.5100947103244065, 0.6580390468403003, 0.7953945720537972, 0.4399123463296013],
    [0.36779399837064336, 0.5527104802331717, 0.5197995384622557, 0.6487210609809246, 0.25058403077933783, 0.49498261511769087, 0.3417921695582882, 0.4578201516662048, 0.5259508735871471, 0.33672741832225794, 0.4982850801622772, 0.3326176373056263, 0.40007869570532406, 0.37153836832821957, 0.4950640387474361, 0.3935393254180807, 0.6457816800526707, 0.2942847142849453, 0.5341018111881288, 0.4346960968382139, 0.2892574698506385, 0.36563229245684203, 0.4307515109339645, 0.5770835841405568]];
