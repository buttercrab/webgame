
let x = 0, y = 0;
let keyOn = {};
let mgr;

function setup() {
    setSize(window.innerWidth, window.innerHeight);
    document.getElementById('defaultCanvas0').style.position = 'absolute';
    mgr = new SceneManager();

    mgr.showScene(Intro);
}

function draw() {
    if (width !== window.innerWidth || height !== window.innerHeight)
        setSize(window.innerWidth, window.innerHeight);

    mgr.draw();
}

function Intro() {

    this.draw = () => {
        background('#aaa');

        if(!logined) return;

        
    };
}
