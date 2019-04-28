function Waiting() {
    this.draw = () => {
        if(width !== window.innerWidth || height !== window.innerHeight)
            refresh();

        background('#aaa');

        if(!logined) return;
        if(myRoomID === '') return;


    }
}