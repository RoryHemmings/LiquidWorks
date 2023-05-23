import { createDiv, createInput } from './dom.js';

class Tool {
    constructor(ui, displayName) {
        this._ui = ui;
        this._displayName = displayName;
        this._element = this._createElement();
        this._controls = [];
    }

    // Update selection status
    touch(selected) {
        this._element.querySelector('button').style =
            `background-color: ${selected ? '#303030' : '#606060'}`;
    }

    getElement() {
        return this._element;
    }

    getControls() {
        return this._controls;
    }

    _createElement() {
        let div = createDiv('tool');
        let button = document.createElement('button');
        button.innerHTML = this._displayName;
        button.addEventListener('mousedown', () => this._ui.selectTool(this));

        div.appendChild(button);
        return div;
    }
}

export class SelectTool extends Tool {
    constructor(ui) {
        super(ui, 'Select');

        let div = createDiv('control-div');
        let c = createInput({
            parentClassName: 'select-controls',
            label: 'Select:',
            callback: (e) => {
                console.log(e.target.value);
            },
        });
        div.appendChild(c);

        this._controls = div;
    }

    setSelectedObject(obj) {
        
    }
}

export class TransformTool extends Tool {
    constructor(ui) {
        super(ui, 'Transform');
    }
}

export class RotateTool extends Tool {
    constructor(ui) {
        super(ui, 'Rotate');
    }
}

export class ScaleTool extends Tool {
    constructor(ui) {
        super(ui, 'Scale');
    }
}