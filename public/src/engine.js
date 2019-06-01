function Engine() {
    const self = this;

    self.player = new Entity(socket.id);
    self.player.sprite.draw = () => {
    };
    peer.send(JSON.stringify({
        type: 'type',
        data: self.player.type
    }));
    self.players = new Entities(); // includes enemy
    // self.players.add(self.player);

    for (let id in roomData.users) {
        self.players.add(new Entity(id));
    }

    self.bullets = new Bullets();
    self.map = new MyMap('0');

    self.shake = createVector(0, 0);
    self.follow = false;

    self.pointer = createSprite(0, 0, 0, 0);
    self.pointer.addAnimation('img', 'https://buttercrab.iptime.org/public/img/pointer_1.png');

    self.ai = new Group();
    self.ai_entity = [];

    self.update = () => {
        eval(charData[self.player.type].update)(self.player);

        self.player.update();

        for (let i = 0; i < self.players.group.size(); i++) {
            for (let j = 0; j < self.bullets.group.size(); j++) {
                if (self.players.group.get(i).overlapPoint(self.bullets.group.get(j).position.x, self.bullets.group.get(j).position.y)) {
                    self.players.d[self.players.group.get(i).id].hit(self.bullets.group.get(j));
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

        for (let i in self.ai_entity) {
            if (self.ai_entity[i].entity.sprite.removed) continue;

            self.ai_entity[i].update();

            if (self.ai_entity[i].entity.health === 0 && !self.ai_entity[i].entity.sprite.removed) {
                self.ai_entity[i].entity.sprite.remove();
            }
        }

        for (let i = 0; i < self.ai.size(); i++) {
            for (let j = 0; j < self.bullets.group.size(); j++) {
                if (self.ai.get(i).overlapPoint(self.bullets.group.get(j).position.x, self.bullets.group.get(j).position.y)) {
                    self.ai_entity[self.ai.get(i).id].entity.hit(self.bullets.group.get(j));
                }
            }
        }
    };

    self.draw = () => {
        let p = self.players.d[user.id].sprite.position;

        if (self.follow) {
            camera.position.lerp(p, 0.1);
            if (camera.position.dist(p) < 1) {
                self.follow = false;
            }
        } else {
            if (abs(camera.position.x - p.x) >= 160 || abs(camera.position.y - p.y) >= 100) {
                self.follow = true;
            }
        }

        camera.zoom = max(width / 480, height / 300) / 3.2;
        self.players.d[user.id].sprite.velocity.set(0, 0);

        drawSprites(self.map.group);
        drawSprites(self.bullets.group);
        drawSprites(self.players.group);
        drawSprites(self.ai);

        camera.off();

        self.pointer.position.set(mouseX, mouseY);
        drawSprite(self.pointer);
    };

    self.data = msg => {
        for (let id in msg) {
            for (let i in msg[id]) {
                self.players.data(id, msg[id][i]);
            }
        }
    };

    self.addPlayer = id => {
        self.players.add(new Entity(id));
    };

    self.removePlayer = id => {
        self.players.remove(id);
    };

    self.pressed = k => {
        eval(charData[self.player.type].pressed)(k, self.player);
    };

    self.released = k => {
        eval(charData[self.player.type].released)(k, self.player);
    };

    self.mouse = () => {
        eval(charData[self.player.type].mouse)(self.player);
    };

    self.aicount = 0;

    self.addAI = data => {
        let ai = new AIEntity(aicount++, _engine);
        ai.lay = data;
        self.ai_entity.add(ai);
        self.ai.add(ai.entity.sprite);
    };

    return self;
}

let _engine = null;