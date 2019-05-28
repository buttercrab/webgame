function Engine() {
    const self = this;

    self.a = createSprite(10, 10, 10, 10);
    self.player = new Entity(socket.id);
    self.player.sprite.draw = () => {};
    self.players = new Entities(); // includes enemy
    self.players.add(self.player);

    for (let id in roomData.users) {
        self.players.add(new Entity(id));
    }

    self.bullets = new Bullets();
    // self.map = new Group();
    // self.items = new Group();

    self.data_on = false;
    self.shake = createVector(0, 0);

    self.players.group.collide(self.bullets.group, (a, b) => {
        if (a.tag === 'Bullet') {
            self.players.d[b.id].hit(a);
            a.remove();
        } else {
            self.players.d[a.id].hit(b);
            b.remove();
        }
    });

    self.update = () => {
        self.player.update();
        eval(charData[self.player.type].update)(self.player);
    };

    self.draw = () => {
        let p = self.players.d[user.id].sprite.position.copy();
        let v = self.players.d[user.id].sprite.velocity;
        let mouse = createVector(/*camera.mouseX, camera.mouseY*/0, 0);
        let diff = p5.Vector.sub(mouse, p).mult(0.03);

        // p.add(diff);
        camera.position.set(p);
        camera.zoom = min(width / 480, height / 300) / 2;
        // p.sub(diff).sub(v);

        console.log('cam: ' + camera.position.x + ' ' + camera.position.y + ' pos: ' + p.x + ' ' + p.y);

        v.set(0, 0);

        drawSprites(self.bullets.group);
        drawSprites(self.players.group);
        drawSprite(self.a);
        camera.off();
    };

    self.data = msg => {
        self.data_on = true;
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

    self.input = k => {
        eval(charData[self.player.type].input)(k, self.player);
    };

    return self;
}

let _engine = null;