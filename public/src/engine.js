function engine() {
    const self = this;

    self._camera = createSprite(0, 0, 0, 0);
    self.player = entity(socket.id);
    self.players = entities(); // includes enemy
    self.players.add(self.player);

    for(let id in roomData.users) {
        self.players.add(entity(id));
    }

    self.bullets = new Group();
    self.map = new Group();
    self.items = new Group();

    self.shake = createVector(0, 0);
    self.cameraA = 0;

    self.update = () => {
        self.player.update();
        self.players.update();
    };

    self.draw = () => {
        let diff = p5.Vector.sub(self._camera.position, self.player.position);
        if(abs(diff.x) > 80 || abs(diff.y) > 50 || self.cameraA) {
            self.cameraA = diff.mag() / 100;
            self._camera.addSpeed(self.cameraA, diff.heading());
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

    return self;
}

let e;