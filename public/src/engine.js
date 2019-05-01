function engine() {
    const self = this;

    self._camera = createSprite(0, 0, 0, 0);
    self.player = entity(socket.id);
    self.player.id = 'entity';
    self.players = entities(); // includes enemy
    self.players.add(self.player);

    for(let id in roomData.users) {
        self.players.add(entity(id));
    }

    self.bullets = bullets();
    self.map = new Group();
    self.items = new Group();

    self.shake = createVector(0, 0);
    self.follow = false;

    self.update = () => {
        self.player.update();
        self.players.update();
    };

    self.draw = () => {
        let diff = p5.Vector.sub(self._camera.position, self.player.position);
        if(abs(diff.x) > 48 || abs(diff.y) > 30) {
            self.follow = true;
        } else if(diff.x === 0 && diff.y === 0) {
            self.follow = false;
        }
        if(self.follow) {
            let t = diff.mag();
            self._camera.velocity.set(diff.normalize().mult(Math.tanh(t / 20) * 20));
        }
        camera.position.set(self._camera.position);
        camera.zoom = min(width / 480, height / 300);
        drawSprites();
    };

    self.data = msg => {
        for(let id in msg) {
            for(let i in msg[id]) {
                self.players.data(id, msg[id][i]);
            }
        }
    };

    self.input = k => {

    };

    return self;
}

let e;