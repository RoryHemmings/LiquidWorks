import UI from './ui.js'
import { Canvas_Widget } from './editor.js';

const setup = () => {
    // Set up UI
    const ui = new UI();

    // Draw Canvas
    new Canvas_Widget(document.querySelector("#editor-canvas"), [ui.getEditor()], {
        make_controls: false,
        make_code_nav: false,
        show_explanation: false,
    });

    document.querySelector("#editor-canvas").style = "background-color: black; border: 2px solid gray;";
};

setup();