import {
    Editor,
    Canvas_Widget,
} from './editor.js';

import UI from './ui.js'

const setup = () => {
    const editor = new Editor();
    // Set up UI
    new UI(editor);

    // Draw Canvas
    new Canvas_Widget(document.querySelector("#editor-canvas"), [editor], {
        make_controls: false,
        make_code_nav: false,
        show_explanation: false,
    });

    document.querySelector("#editor-canvas").style = "background-color: black; border: 2px solid gray;";
};

setup();