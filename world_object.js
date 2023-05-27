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
        this._position = [0, 0, 0];
        this._scale = [0, 0, 0];
        this._rotation = [0, 0, 0];
    }

    // (within some margin of distance).
    static intersect_cube(p, margin = 0) {
        return p.every(value => value >= -1 - margin && value <= 1 + margin)
    }
    
    static intersect_sphere(p, margin = 0) {
        return p.dot(p) < 1 + margin;
    }

    set transform(t) {
        this._transform = t;
    }

    get position() {
        return this._position;
    }

    get scale() {
        return this._scale;
    }

    get rotation() {
        return this._rotation;
    }

    get transform(){
        return this._transform;
    }

    translate_transform(dx, dy, dz){
        this._transform = this._transform.times(Mat4.translation(dx, dy, dz));
        this.position[0] += dx;
        this.position[1] += dy;
        this.position[2] += dz;
        //console.log(this._intersect_cube(this));
        //console.log("HELLO");
    }

    // scale_transform(sx, sy, sz) {
    //     this._transform = this._transform.times(Mat4.scale(sx, sy, sz));

    //     this._scale[0] += sx;
    //     this._scale[1] += sy;
    //     this._scale[2] += sz;
    // }

    scale_transform(s) {
        this._transform = this._transform.times(Mat4.scale(s, s, s));
    }

    rotate_transform(rx, ry, rz, w) {
        this._transform = this._transform.times(Mat4.rotation(rx, ry, rz, w));
        this._rotation[0] += rx;
        this._rotation[1] += ry;
        this._rotation[2] += rz;
    }


    isLineIntersectingRectangularPrism(point1, point2) {            //CURRENTLY DOES NOT WORK WITH ROTATION
        let prismCenter = this.position;
        let matrix = this.transform;

        let prismSides =  [2 * matrix[0][0], 2 * matrix[1][1], 2 * matrix[2][2]];

        const halfSides = prismSides.map(side => side / 2);

        const prismMin = prismCenter.map((center, index) => center - halfSides[index]);
        const prismMax = prismCenter.map((center, index) => center + halfSides[index]);

        for (let i = 0; i < 3; i++) {
            if (point1[i] < prismMin[i] && point2[i] < prismMin[i]) {
            continue;
            }
            if (point1[i] > prismMax[i] && point2[i] > prismMax[i]) {
            continue;
            }

            const t = (prismMax[i] - point1[i]) / (point2[i] - point1[i]);
            const intersection = point1.map((coord, index) => coord + t * (point2[index] - coord));

            let isInside = true;
            for (let j = 0; j < 3; j++) {
            if (j === i) {
                continue;
            }
            if (intersection[j] < prismMin[j] || intersection[j] > prismMax[j]) {
                isInside = false;
                break;
            }
            }
            if (isInside) {
            return true; 
            }
        }

        return false; 
    }

    draw(context, program_state) {
        this._shape.draw(context, program_state, this._transform, this._shader);
    }

    drawSelected(context, program_state) {
        const green = hex_color("#00FF00");
        const gray = hex_color("#FFFFFF");
        this._shape.draw(context, program_state, this._transform, this._shader.override({color: green}));
    }
}