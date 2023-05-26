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

        let div = createDiv('control-div');
        let c1 = createInput({
            label: 'X:',
            callback: (e) => {
                this._ui.getEditor().selectedObject.translate_transform(e.target.value - this._ui.getEditor().selectedObject.position[0], 0 , 0);
            },
        });
        div.appendChild(c1);
        let c2 = createInput({
            label: 'Y:',
            callback: (e) => {
                this._ui.getEditor().selectedObject.translate_transform(0, e.target.value - this._ui.getEditor().selectedObject.position[1], 0);
            },
        });
        div.appendChild(c2);

        let c3 = createInput({
            label: 'Z:',
            callback: (e) => {
                this._ui.getEditor().selectedObject.translate_transform(0, 0, e.target.value - this._ui.getEditor().selectedObject.position[2]);
            },
        });
        div.appendChild(c3);

        this._controls = div;
    }

    touch(selected) {
        super.touch(selected);

        this._controls.childNodes[0].childNodes[1].setAttribute('value', this._ui.getEditor().selectedObject.position[0]);
        this._controls.childNodes[1].childNodes[1].setAttribute('value', this._ui.getEditor().selectedObject.position[1]);
        this._controls.childNodes[2].childNodes[1].setAttribute('value', this._ui.getEditor().selectedObject.position[2]);
    }
}

export class RotateTool extends Tool {
    constructor(ui) {
        super(ui, 'Rotate');

        let div = createDiv('control-div');
        let c1 = createInput({
            label: 'Rotate X (Degrees):',
            callback: (e) => {
                this._ui.getEditor().selectedObject.rotate_transform(e.target.value/90, 1, 0, 0);
            },
        });
        div.appendChild(c1);

        let c2 = createInput({
            label: 'Rotate Y (Degrees):',
            callback: (e) => {
                this._ui.getEditor().selectedObject.rotate_transform(e.target.value/90, 0, 1, 0);
            },
        });
        div.appendChild(c2);

        let c3 = createInput({
            label: 'Rotate Z (Degrees):',
            callback: (e) => {
                this._ui.getEditor().selectedObject.rotate_transform(e.target.value/90, 0, 0, 1);
            },
        });
        div.appendChild(c3);

        this._controls = div;
    }

    
}

export class ScaleTool extends Tool {
    constructor(ui) {
        super(ui, 'Scale');

        let div = createDiv('control-div');
        let c = createInput({
            label: 'Scale:',
            callback: (e) => {
                if (e.target.value > 0){
                this._ui.getEditor().selectedObject.scale_transform(e.target.value);
                }
            },
        });
        div.appendChild(c);

        this._controls = div;
    }
}


export class ColorTool extends Tool {
    constructor(ui) {
        super(ui, 'Color');

        let div = createDiv('control-div');
        let c = createInput({
            label: 'RGB Color:',
            callback: (e) => {
                if (e.target.value > 0){
                this._ui.getEditor().selectedObject.scale_transform(e.target.value);
                }
            },
        });
        div.appendChild(c);

        this._controls = div;
    }
}