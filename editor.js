import { defs, tiny } from './lib/common.js';
import { WorldObject } from './world_object.js'

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
    Canvas_Widget
} = tiny;

const { Cube, Phong_Shader } = defs

/* Base Scene */
class Editor extends Scene {
    constructor() {
        super();

        this.shapes = {
            cube: new Cube(),
        }

        this.materials = {
            phong: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 1.0,
                specularity: 1.0,
                color: hex_color("#ffffff"),
            }),
        }

        this.worldObjects = [ new WorldObject(this.shapes.cube, Mat4.identity(), this.materials.phong), ];
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(-1, -1, -10).times(Mat4.rotation(Math.PI/6, 1, 1, 0)));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        for (let obj of this.worldObjects) {
            obj.draw(context, program_state);
        }
    }
}

export {Editor, Canvas_Widget}