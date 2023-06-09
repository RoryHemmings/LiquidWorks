import { defs, tiny } from './lib/common.js';


const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Cube, Phong_Shader } = defs

export class WorldObject {
    constructor(shape, transform, shader, string) {
        this._shape = shape;
        this._shape_string = string;
        this._transform = transform;
        this._shader = shader;
        this._position = [this.transform[0][3], this.transform[1][3], this.transform[2][3]];
        this._scale = [0, 0, 0];
        this._rotation = [0, 0, 0];
        this._color = hex_color("#FFFFFF");
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


    scale_transform(dx, dy, dz) {
        this._transform = this._transform.times(Mat4.scale(dx, dy, dz));
    }

    rotate_transform(rx, ry, rz, w) {
        this._transform = this._transform.times(Mat4.rotation(rx, ry, rz, w));
        this._rotation[0] += rx;
        this._rotation[1] += ry;
        this._rotation[2] += rz;
    }

    change_color(color){
        this._color = hex_color(color);
    }


    isLineIntersectingRectangularPrism(point1, point2) {            //CURRENTLY DOES NOT WORK WITH ROTATION KIND OF
        let prismCenter = this.position;
        let matrix = this.transform;


        let scaleX =  matrix[0][0];
        let scaleY = matrix[1][1];
        let scaleZ = matrix[2][2];

        const transformedPoint1 = [
            (point1[0] - prismCenter[0]) / scaleX,
            (point1[1] - prismCenter[1]) / scaleY,
            (point1[2] - prismCenter[2]) / scaleZ
        ];
          
        const transformedPoint2 = [
            (point2[0] - prismCenter[0]) / scaleX,
            (point2[1] - prismCenter[1]) / scaleY,
            (point2[2] - prismCenter[2]) / scaleZ
        ];
          
        const halfLengthX = 0.5 / scaleX;
        const halfLengthY = 0.5 / scaleY;
        const halfLengthZ = 0.5 / scaleZ;
          
        if (transformedPoint1[0] > halfLengthX && transformedPoint2[0] > halfLengthX) {
            return false;
        }
        else if (transformedPoint1[0] < -halfLengthX && transformedPoint2[0] < -halfLengthX) {
            return false;
        }
        else if (transformedPoint1[1] > halfLengthY && transformedPoint2[1] > halfLengthY) {
            return false;
        }
        else if (transformedPoint1[1] < -halfLengthY && transformedPoint2[1] < -halfLengthY) {
            return false;
        }
        else if (transformedPoint1[2] > halfLengthZ && transformedPoint2[2] > halfLengthZ) {
            return false;
        }
        else if (transformedPoint1[2] < -halfLengthZ && transformedPoint2[2] < -halfLengthZ) {
            return false;
        }
        
        return true;

    }

    isLineIntersectingSphere(point1, point2) {
        let center = this.position;
        let matrix = this.transform;

        let scaleX =  matrix[0][0];
        let scaleY = matrix[1][1];
        let scaleZ = matrix[2][2];


        

        const transformedPoint1 = [
            (point1[0] - center[0]) / scaleX,
            (point1[1] - center[1]) / scaleY,
            (point1[2] - center[2]) / scaleZ
          ];
          
          const transformedPoint2 = [
            (point2[0] - center[0]) / scaleX,
            (point2[1] - center[1]) / scaleY,
            (point2[2] - center[2]) / scaleZ
          ];
          
          // Calculate the squared lengths of the transformed line segment
          const dx = transformedPoint2[0] - transformedPoint1[0];
          const dy = transformedPoint2[1] - transformedPoint1[1];
          const dz = transformedPoint2[2] - transformedPoint1[2];
          const squaredLength = dx * dx + dy * dy + dz * dz;
          
          // Check if the line intersects the unit sphere centered at the origin
          const discriminant = squaredLength - 1; // Assuming the unit sphere has radius 1
          if (discriminant < 0) {
            // The line does not intersect the unit sphere, so it does not intersect the ellipsoid
            return false;
          }
          
          // If the line passes all the checks, it intersects the ellipsoid
          return true;
    }

    isLineIntersectingTorus(point1, point2) {
        let center = this.position;
        let matrix = this.transform;

        let scaleX =  matrix[0][0];
        let scaleY = matrix[1][1];
        let scaleZ = matrix[2][2];


        const majorRadius = Math.max(scaleX, scaleY, scaleZ);
        const minorRadius = Math.min(scaleX, scaleY, scaleZ) / 2;

        const dx = point2[0] - point1[0];
        const dy = point2[1] - point1[1];
        const dz = point2[2] - point1[2];
      
        const a = (dx ** 2) + (dy ** 2) + (dz ** 2);
        const b = 2 * (
          ((point1[0] - center[0]) * dx) +
          ((point1[1] - center[1]) * dy) +
          ((point1[2] - center[2]) * dz)
        );
        const c =
          ((point1[0] - center[0]) ** 2) +
          ((point1[1] - center[1]) ** 2) +
          ((point1[2] - center[2]) ** 2) -
          (majorRadius ** 2) -
          (minorRadius ** 2);
      
        const discriminant = b * b - 4 * a * c;
      
        if (discriminant < 0) {
          return false; 
        }
      
        const t = (-b - Math.sqrt(discriminant)) / (2 * a);
        const intersectionZ = point1[2] + t * dz;
      
        const holeRadius = minorRadius * .55 ;
      
        const intersectionDistance = Math.sqrt((point1[0] + t * dx - center[0]) ** 2 + (point1[1] + t * dy - center[1]) ** 2);
      
        if (intersectionDistance < holeRadius && Math.abs(intersectionZ) > minorRadius) {
          return false; 
        }
      
        return true; 
    }

    isLineIntersectingShape(point1, point2){
        //console.log(this._shape.cube);
        console.log(this.transform);
        if (this._shape_string == "cube"){
            return this.isLineIntersectingRectangularPrism(point1, point2);
        }
        else if (this._shape_string == "sphere"){
            return this.isLineIntersectingSphere(point1, point2);
        }
        else if (this._shape_string == "torus"){
            return this.isLineIntersectingTorus(point1, point2);
        }
    }

    calculateDistance(point) {
        let center = this.position
        const dx = point[0] - center[0];
        const dy = point[1] - center[1];
        const dz = point[2] - center[2];
      
        const distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
        return distance;
      }

    draw(context, program_state) {
        this._shape.draw(context, program_state, this._transform, this._shader.override({color: this._color}));
    }

    drawSelected(context, program_state) {
        const green = hex_color("#00FF00");
        const gray = hex_color("#FFFFFF");
        this._shape.draw(context, program_state, this._transform, this._shader.override({color: green}));
    }
}