import { createButton, createDiv, createFileInput, createInput } from './dom.js';
import { WorldObject } from './world_object.js';

import { defs, tiny } from './lib/common.js';
import { ShapeFromFile } from './utils.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
    Canvas_Widget
} = tiny;

function truncate(n) {
    return Math.round(n*10000) / 10000;
}

class Tool {
    constructor(ui, displayName) {
        this._ui = ui;
        this._displayName = displayName;
        this._element = this._createElement();
        this._controls = [];
    }

    // Update selection status
    touch(isSelected) {
        this._element.querySelector('button').style =
            `background-color: ${isSelected ? '#303030' : '#606060'}`;
    }

    getElement() {
        return this._element;
    }

    getControls() {
        return this._controls;
    }

    get displayName() {
        return this._displayName;
    }

    getSelectedObject() {
        return this._ui.getEditor().selectedObject;
    }

    _createElement() {
        let div = createDiv('tool');
        let button = document.createElement('button');
        button.innerHTML = this._displayName;
        button.addEventListener("mousedown", e => { 
            this._ui.selectTool(this);
            this._ui.getEditor().set_mode(this._displayName);
        });

        div.appendChild(button);
        return div;
    }
}

export class SelectTool extends Tool {
    constructor(ui) {
        super(ui, 'Select');

        const div = createDiv('control-div');
        const p = document.createElement('p');
        p.innerHTML = 'none';

        div.appendChild(p);
        this._controls = div;
    }

    setSelectedObject(obj) {
        
    }
}

export class TranslateTool extends Tool {
    constructor(ui) {
        super(ui, 'Translate');
        let div = createDiv('control-div');

        div.appendChild(
            createInput({
                label: 'X:',
                callback: (e) => this.updateTransform(e, 0),
            })
        );
        div.appendChild(
            createInput({
                label: 'Y:',
                callback: (e) => this.updateTransform(e, 1),
            })
        );
        div.appendChild(
            createInput({
                label: 'Z:',
                callback: (e) => this.updateTransform(e, 2),
            })
        );

        this._controls = div;
    }

    touch(isSelected) {
        super.touch(isSelected);
        this.updateValues();
    }

    updateValues() {
        const obj = this.getSelectedObject();
        if (obj === undefined) return;

        this._controls.childNodes[0].childNodes[1].setAttribute('value', truncate(obj.position[0]));
        this._controls.childNodes[1].childNodes[1].setAttribute('value', truncate(obj.position[1]));
        this._controls.childNodes[2].childNodes[1].setAttribute('value', truncate(obj.position[2]));
    }

    updateTransform(e, direction) {
        const obj = this.getSelectedObject();
        if (obj === undefined) return;

        const target = e.target.value;
        const [x, y, z] = obj.position;
        switch (direction) {
            case 0: obj.translate_transform(target - x, 0, 0); break;
            case 1: obj.translate_transform(0, target - y, 0); break;
            case 2: obj.translate_transform(0, 0, target - z); break;
        };
    }
}

export class RotateTool extends Tool {
    constructor(ui) {
        super(ui, 'Rotate');

        let div = createDiv('control-div');
        div.appendChild(
            createInput({
                label: 'X (Degrees):',
                callback: (e) => this.updateTransform(e, 0)
            })
        );
        div.appendChild(
            createInput({
                label: 'Y (Degrees):',
                callback: (e) => this.updateTransform(e, 1),
            })
        );
        div.appendChild(
            createInput({
                label: 'Z (Degrees):',
                callback: (e) => this.updateTransform(e, 2),
            })
        );

        this._controls = div;
    }

    touch(isSelected) {
        super.touch(isSelected);
        this.updateValues();
    }

    updateValues() {
        const obj = this.getSelectedObject();
        if (obj === undefined) return;

        this._controls.childNodes[0].childNodes[1].setAttribute('value', truncate(obj.rotation[0] * (180/Math.PI)));
        this._controls.childNodes[1].childNodes[1].setAttribute('value', truncate(obj.rotation[1] * (180/Math.PI)));
        this._controls.childNodes[2].childNodes[1].setAttribute('value', truncate(obj.rotation[2] * (180/Math.PI)));
    }

    updateTransform(e, direction) {
        const obj = this.getSelectedObject();
        if (obj === undefined) return;

        const target = e.target.value * (Math.PI/180);
        const [x, y, z] = obj.rotation;
        switch (direction) {
            case 0: obj.rotate_transform(target - x, 1, 0, 0); break;
            case 1: obj.rotate_transform(target - y, 0, 1, 0); break;
            case 2: obj.rotate_transform(target - z, 0, 0, 1); break;
        };
    }
}

export class ScaleTool extends Tool {
    constructor(ui) {
        super(ui, 'Scale');

        let div = createDiv('control-div');
        div.appendChild(
            createInput({
                label: 'X:',
                callback: (e) => this.updateTransform(e, 0),
            })
        );

        div.appendChild(
            createInput({
                label: 'Y:',
                callback: (e) => this.updateTransform(e, 1),
            })
        );

        div.appendChild(
            createInput({
                label: 'Z:',
                callback: (e) => this.updateTransform(e, 2),
            })
        );

        this._controls = div;
    }

    touch(isSelected) {
        super.touch(isSelected);
        this.updateValues();
    }

    updateValues() {
        const obj = this.getSelectedObject();
        if (obj === undefined) return;

        this._controls.childNodes[0].childNodes[1].setAttribute('value', truncate(obj.scale[0]));
        this._controls.childNodes[1].childNodes[1].setAttribute('value', truncate(obj.scale[1]));
        this._controls.childNodes[2].childNodes[1].setAttribute('value', truncate(obj.scale[2]));
    }

    updateTransform(e, direction) {
        const obj = this.getSelectedObject();
        if (obj === undefined) return;

        const target = e.target.value || 1;
        const [x, y, z] = obj.scale;
        if (x * y * z == 0) return; // if any variables are 0
        switch (direction) {
            case 0: obj.scale_transform(target/x, 1, 1); break;
            case 1: obj.scale_transform(1, target/y, 1); break;
            case 2: obj.scale_transform(1, 1, target/z); break;
        };
    }
}

export class ColorTool extends Tool {
    constructor(ui) {
        super(ui, 'Color');

        let div = createDiv('control-div');
        let c = createInput({
            label: 'RGB Color (RRGGBB):',
            callback: (e) => {
                if (e.target.value > 0) {
                    this._ui.getEditor().selectedObject.change_color(e.target.value);
                }
            },
        });
        div.appendChild(c);

        this._controls = div;
    }
}

export class AddTool extends Tool {
    constructor(ui) {
        super(ui, 'Add');

        this.variance = 5;

        let div = createDiv('control-div');

        // Prebuild Objects
        const options = ui.getEditor().shapes;
        for (const obj in options) {
            div.appendChild(
                createButton({
                    label: obj,                    
                    className: 'add-world-object-button',
                    callback: () => this.addObject(options[obj], obj),
                })
            );
        }

        const container = createDiv('add-world-object-button');
        const tmp = document.createElement('p');
        tmp.innerHTML = '+';
        container.appendChild(tmp);
        container.appendChild(
            createFileInput({
                label: 'Import',                    
                callback: (e) => this.importObject(e)
            }),
        );

        // Import
        div.appendChild(container);

        this._controls = div;
    }

    addObject(obj, label="custom") {
        const options = this._ui.getEditor().shapes;
        const materials = this._ui.getEditor().materials;

        const random_offset = Mat4.translation(
            Math.random()*this.variance - this.variance/2,
            Math.random()*this.variance - this.variance/2,
            0,
        );

        const wo = new WorldObject(obj, random_offset, materials.phong, label);
        this._ui.getEditor().worldObjects.push(wo);
    }

    async importObject(e) {
        let filepath = '';
        try { filepath = await this._chooseFile(e); }
        catch (err) { return; }

        this.addObject(new ShapeFromFile(filepath));
    }

    _chooseFile(e) {
        return new Promise((resolve, reject) => {
            const file = e.target.files[0];
            if (file === undefined) reject();

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const content = e.target.result; 
                const link = document.createElement('a');
                link.href = content;
                resolve(link);
            };
        });
    }
}