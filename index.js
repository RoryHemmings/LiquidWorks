import {
    Editor,
    Canvas_Widget,
} from './editor.js';

import UI from './ui.js'

const setup = () => {
    // Set up UI
    new UI();

    // Draw Canvas
    new Canvas_Widget(document.querySelector("#editor-canvas"), [new Editor()], {
        make_controls: false,
        make_code_nav: false,
        show_explanation: false,
    });
};

setup();