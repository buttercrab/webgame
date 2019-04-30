let x = 0, y = 0;
let mgr;
let mainFont;

function setup() {
    refresh();
    document.getElementById('defaultCanvas0').style.position = 'absolute';

    mainFont = loadFont('https://buttercrab.ml/public/font?fontName=Raleway&fontFamily=Regular');

    frameRate(50);
    e = engine();

    mgr = new SceneManager();
    mgr.showScene(Waiting);
}

function draw() {
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