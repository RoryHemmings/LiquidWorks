import * as Tools from './tools.js';

export default class UI {
    constructor() {
        this._tools = [];
        this._currentTool = null;

        this._initializeTools();
        this.selectTool(this._tools[0]);
    }

    selectTool(tool) {
        this._currentTool = tool;
        this._tools.forEach(t => t.touch(t === tool));

        document.querySelector('#controls').replaceChildren(tool.getControls());
    }

    _initializeTools() {
        this._tools = [
            new Tools.SelectTool(this),
            new Tools.TransformTool(this),
            new Tools.RotateTool(this),
            new Tools.ScaleTool(this),
        ];

        this._tools.forEach(tool => {
            document.querySelector('#toolbar').appendChild(tool.getElement());
        });
    }
}