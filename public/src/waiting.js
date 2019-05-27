function Waiting() {
    this.draw = () => {
        if (width !== window.innerWidth || height !== window.innerHeight)
            refresh();

        background('#aaa');

        if (!user.logined) return;
        if (!roomData.roomid) return;

        _engine.update();
        _engine.draw();
    };

    this.keyPressed = () => {
        if (!user.logined) return;
        if (!roomData.roomid) return;
        _engine.input(keyCode);
    };
}