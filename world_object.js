import { defs, tiny } from './lib/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Cube, Phong_Shader } = defs

export class WorldObject {
    constructor(shape, transform, shader) {
        this._shape = shape;
        this._transform = transform;
        this._shader = shader;
    }

    set transform(t) {
        this._transform = t;
    }

    draw(context, program_state) {
        this._shape.draw(context, program_state, this._transform, this._shader);
    }
}