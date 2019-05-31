function Waiting() {
    this.draw = () => {
        if (width !== window.innerWidth || height !== window.innerHeight)
            refresh();

        background('#aaa');

        if (!user.logined) return;
        if (!roomData.roomid) return;

        background('#fff');

        if (_ai_engine !== null) {
            _ai_engine.update();
            _ai_engine.draw();

            return;
        }

        _engine.update();
        _engine.draw();
    };

    this.keyPressed = () => {
        if (!user.logined) return;
        if (!roomData.roomid) return;
        _engine.pressed(keyCode);
    };

    this.keyReleased = () => {
        if (!user.logined) return;
        if (!roomData.roomid) return;
        _engine.released(keyCode);
    };

    this.mousePressed = () => {
        if (!user.logined) return;
        if (!roomData.roomid) return;
        _engine.mouse();
    }
}