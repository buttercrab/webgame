function Waiting() {
    this.draw = () => {
        if (width !== window.innerWidth || height !== window.innerHeight)
            refresh();

        background('#aaa');

        if (!logined) return;
        if (myRoomID === '') return;

        e.update();
        e.draw();
    };

    this.keyPressed = () => {
        switch(keyCode) {
            case 87:
                break;
            case 65:
                break;
            case 83:
                break;
            case 68:
                break;
        }
    };
}