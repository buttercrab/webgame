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

        textFont(mainFont);
        textSize(80);
        textAlign(CENTER);
        push();
        fill('#fff');
        text('Bang', width/2, 120);
        pop();
    };


}