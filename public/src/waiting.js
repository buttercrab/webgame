function Waiting() {
    this.draw = () => {
        if (width !== window.innerWidth || height !== window.innerHeight)
            refresh();

        background('#aaa');

        if (!user.logined) return;
        if (!roomData.roomid) return;

        e.update();
        e.draw();
    };

    this.keyPressed = () => {
        e.input(keyCode);
    };
}