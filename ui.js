import * as Tools from './tools.js';

export default class UI {
    constructor() {
        this._controlBar = new ControlBar();
        this._tools = [];
        this._currentTool = null;

        // Only used twice, doesn't warrent entire class
        this._toolbarElement = document.querySelector('#toolbar');

        this._initializeTools();
        this.selectTool(this._tools[0]);
    }

    selectTool(tool) {
        this._currentTool = tool;
        alert(`selecting ${tool._displayName}`);
    }

    getControlBar() {
        return this._controlBar;
    }

    getToolbar() {
        return this._toolbar;
    }

    _initializeTools() {
        this._tools = [
            new Tools.SelectTool(this),
            new Tools.TransformTool(this),
            new Tools.RotateTool(this),
            new Tools.ScaleTool(this),
        ];

        this._tools.forEach(tool => {
            this._toolbarElement.appendChild(tool.getElement());
        });
    }
}

class ControlBar {
    constructor() {
        this._controlBarElement = document.querySelector('#controls');
    }
}