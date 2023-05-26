import * as Tools from './tools.js';

export default class UI {
    constructor(editor) {
        this._tools = [];
        this._currentTool = null;
        this._editor = editor;

        this._initializeTools();
        this.selectTool(this._tools[0]);
    }

    getEditor() {
        return this._editor;
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
            new Tools.TransformTool(this),
            new Tools.RotateTool(this),
            new Tools.ScaleTool(this),
            new Tools.ColorTool(this),
        ];

        this._tools.forEach(tool => {
            document.querySelector('#toolbar').appendChild(tool.getElement());
        });
    }
}