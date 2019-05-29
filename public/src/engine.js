function Engine() {
    const self = this;

    self.player = new Entity(socket.id);
    self.player.sprite.draw = () => {};
    self.players = new Entities(); // includes enemy
    self.players.add(self.player);

    for (let id in roomData.users) {
        self.players.add(new Entity(id));
    }

    self.bullets = new Bullets();
    self.map = new MyMap();
    // self.items = new Group();

    self.shake = createVector(0, 0);
    self.follow = false;

    self.players.group.collide(self.bullets.group, (a, b) => {
        if (a.tag === 'Bullet') {
            self.players.d[b.id].hit(a);
            a.remove();
        } else {
            self.players.d[a.id].hit(b);
            b.remove();
        }
    });

    self.player.sprite.collide(self.map.group);

    self.update = () => {
        self.player.update();
    };

    self.draw = () => {
        let p = self.players.d[user.id].sprite.position;

        if(self.follow) {
            camera.position.lerp(p, 0.1);
            if(camera.position.dist(p) < 1) {
                self.follow = false;
            }
        } else {
            if(abs(camera.position.x - p.x) >= 160 || abs(camera.position.y - p.y) >= 100) {
                self.follow = true;
            }
        }

        camera.zoom = min(width / 480, height / 300) / 2;
        self.players.d[user.id].sprite.velocity.set(0, 0);


        drawSprites(self.bullets.group);
        drawSprites(self.players.group);
        drawSprites(self.map.group);
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

    return self;
}

let _engine = null;