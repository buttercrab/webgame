function engine() {
    const self = this;

    self.objects = [];
    self.pos = createVector(0, 0);

    self.set = (object) => {
        self.objects.push(object);
    };

    self.update = () => {
        for(let i in self.objects) {
            self.objects[i].addForces(createVector(0, 1));
            self.objects[i].update();
        }
    };

    self.draw = () => {
        for(let i in self.objects) {
            self.objects[i].draw(self.objects[0].pos);
        }
    };
}