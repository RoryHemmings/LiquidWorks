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
    }

    scale_transform(sx, sy, sz) {
        this._transform = this._transform.times(Mat4.scale(sx, sy, sz));

        this._scale[0] += sx;
        this._scale[1] += sy;
        this._scale[2] += sz;
    }

    rotate_transform(rx, ry, rz, w) {
        this._transform = this._transform.times(Mat4.rotation(rx, ry, rz, w));
        this._rotation[0] += rx;
        this._rotation[1] += ry;
        this._rotation[2] += rz;
    }

    check_if_colliding(b, collider) {
        // check_if_colliding(): Collision detection function.
        // DISCLAIMER:  The collision method shown below is not used by anyone; it's just very quick
        // to code.  Making every collision body an ellipsoid is kind of a hack, and looping
        // through a list of discrete sphere points to see if the ellipsoids intersect is *really* a
        // hack (there are perfectly good analytic expressions that can test if two ellipsoids
        // intersect without discretizing them into points).
        if (this == b)
            return false;
        // Nothing collides with itself.
        // Convert sphere b to the frame where a is a unit sphere:
        const T = this.inverse.times(b, this.temp_matrix);

        const {intersect_test, points, leeway} = collider;
        // For each vertex in that b, shift to the coordinate frame of
        // a_inv*b.  Check if in that coordinate frame it penetrates
        // the unit sphere at the origin.  Leave some leeway.
        return points.arrays.position.some(p =>
            intersect_test(T.times(p.to4(1)).to3(), leeway));
    }

    draw(context, program_state) {
        this._shape.draw(context, program_state, this._transform, this._shader);
    }

    drawSelected(context, program_state) {
        //const green = hex_color("#00FF00");
        const gray = hex_color("#FFFFFF");
        this._shape.draw(context, program_state, this._transform, this._shader.override({color: gray}));
    }
}