function Game() {
    this.draw = () => {
        if(width !== window.innerWidth || height !== window.innerHeight)
            refresh();

        background('#aaa');
    }
}