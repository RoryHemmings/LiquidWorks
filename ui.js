import {
    Editor,
} from './editor.js';

import * as Tools from './tools.js';

export const TOOLS = {
    'select': 0,
    'translate': 1,
    'rotate': 2,
    'scale': 3,
    'color': 4,
    'add': 5,
};

export default class UI {
    constructor(editor) {
        this._tools = [];
        this._currentTool = null;
        this._editor = new Editor(this);

        this._initializeTools();
        this.selectTool(this._tools[0]);
    }

    getEditor() {
        return this._editor;
    }

    getCurrentTool() {
        return this._currentTool;
    }

    updateTool(t) {
        this._tools[TOOLS[t]].updateValues();
    }

    selectTool(tool) {
        this._currentTool = tool;
        this._tools.forEach(t => t.touch(t === tool));

        document.querySelector('#controls').replaceChildren(tool.getControls());
    }
//selector add function to update tools
    _initializeTools() {
        this._tools = [
            new Tools.SelectTool(this),
            new Tools.TranslateTool(this),
            new Tools.RotateTool(this),
            new Tools.ScaleTool(this),
            new Tools.ColorTool(this),
            new Tools.AddTool(this)
        ];

        this._tools.forEach(tool => {
            document.querySelector('#toolbar').appendChild(tool.getElement());
        });
    }
}