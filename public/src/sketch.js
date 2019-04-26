let x = 0, y = 0;
let keyOn = {};
let mgr;
let mainFont;

function setup() {
    setSize(window.innerWidth, window.innerHeight);
    document.getElementById('defaultCanvas0').style.position = 'absolute';

    mainFont = loadFont('https://buttercrab.ml/public/font?fontName=Raleway&fontFamily=Regular');

    mgr = new SceneManager();
    mgr.showScene(Intro);
}

function draw() {
    if (width !== window.innerWidth || height !== window.innerHeight)
        setSize(window.innerWidth, window.innerHeight);

    mgr.draw();
}

function mousePressed() {
    mgr.handleEvent('mousePressed');
}

function mouseReleased() {
    mgr.handleEvent('mouseReleased');
}

function keyPressed() {
    mgr.handleEvent('keyPressed');
}

function keyReleased() {
    mgr.handleEvent('keyReleased');
}