/**
 * Intro scene
 *
 * show room, main page
 */

function Intro() {

    const self = this;

    self.draw = () => {
        background('#808080');

        if(!logined) return;

        push();
        rectMode(CENTER);
        noStroke();
        rect(width/2, height/2, 400, 800, 50);

        push();
        textFont(mainFont);
        textSize(80);
        textAlign(CENTER);
        fill('#000');
        text('Bang', width/2, height/2 - 400 + 80 + 20);
        pop();
        pop();
    };
}