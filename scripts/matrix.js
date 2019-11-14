class Matrix {
    constructor(r, c) {
        this.rows = r;
        this.columns = c;
        this.data = [];
        var i, j;
        for (i = 0; i < this.rows; i++) {
            this.data.push([]);
            for (j = 0; j < this.columns; j++) {
                this.data[i].push(0);
            }
        }
    }

    set values(v) {
        var i, j, idx;
        // v is already a 2d array with dims equal to rows and columns
        if (v instanceof Array && v.length === this.rows && 
            v[0] instanceof Array && v[0].length === this.columns) {
            this.data = v;
        }
        // v is a flat array with length equal to rows * columns
        else if (v instanceof Array && typeof v[0] === 'number' &&
                 v.length === this.rows * this.columns) {
            idx = 0;
            for (i = 0; i < this.rows; i++) {
                for (j = 0; j < this.columns; j++) {
                    this.data[i][j] = v[idx];
                    idx++;
                }
            }
        }
        // not valid
        else {
            console.log("could not set values for " + this.rows + "x" + this.columns + " maxtrix");
        }
    }

    get values() {
        return this.data.slice();
    }

    // matrix multiplication (this * rhs)
    mult(rhs) {
        var result = null;
        var i, j, k, vals, sum;
        // ensure multiplication is valid
        if (rhs instanceof Matrix && this.columns === rhs.rows) {
            result = new Matrix(this.rows, rhs.columns);
            vals = result.values;
            for (i = 0; i < result.rows; i++) {
                for (j = 0; j < result.columns; j++) {
                    sum = 0;
                    for (k = 0; k < this.columns; k++) {
                        sum += this.data[i][k] * rhs.data[k][j]
                    }
                    vals[i][j] = sum;
                }
            }
            result.values = vals;
        }
        else {
            console.log("could not multiply - row/column mismatch");
        }
        return result;
    }
}

Matrix.multiply = function(...args) {
    var i;
    var result = null;
    // ensure at least 2 matrices
    if (args.length >= 2 && args.every((item) => {return item instanceof Matrix;})) {
        result = args[0];
        i = 1;
        while (result !== null && i < args.length) {
            result = result.mult(args[i]);
            i++;
        }
        if (args[args.length - 1] instanceof Vector) {
            result = new Vector(result);
        }
    }
    else {
        console.log("could not multiply - requires at least 2 matrices");
    }
    return result;
}


class Vector extends Matrix {
    constructor(n) {
        var i;
        if (n instanceof Matrix) {
            super(n.rows, 1);
            for (i = 0; i < this.rows; i++) {
                this.data[i][0] = n.data[i][0];
            }
        }
        else {
            super(n, 1);
        }
    }

    get x() {
        var result = null;
        if (this.rows > 0) {
            result = this.data[0][0];
        }
        return result;
    }

    get y() {
        var result = null;
        if (this.rows > 1) {
            result = this.data[1][0];
        }
        return result;
    }

    get z() {
        var result = null;
        if (this.rows > 2) {
            result = this.data[2][0];
        }
        return result;
    }

    get w() {
        var result = null;
        if (this.rows > 3) {
            result = this.data[3][0];
        }
        return result;
    }

    set x(val) {
        if (this.rows > 0) {
            this.data[0][0] = val;
        }
    }

    set y(val) {
        if (this.rows > 0) {
            this.data[1][0] = val;
        }
    }

    set z(val) {
        if (this.rows > 0) {
            this.data[2][0] = val;
        }
    }

    set w(val) {
        if (this.rows > 0) {
            this.data[3][0] = val;
        }
    }

    magnitude() {
        var i;
        var sum = 0;
        for (i = 0; i < this.rows; i++) {
            sum += this.data[i][0] * this.data[i][0];
        }
        return Math.sqrt(sum);
    }

    normalize() {
        var i;
        var mag = this.magnitude();
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] /= mag;
        }
    }

    scale(s) {
        var i;
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] *= s;
        }
    }

    add(rhs) {
        var i;
        var result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] + rhs.data[i][0];
            }
        }
        return result;
    }

    subtract(rhs) {
        var i;
        var result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] - rhs.data[i][0];
            }
        }
        return result;
    }

    dot(rhs) {
        var i;
        var sum = 0;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            for (i = 0; i < this.rows; i++) {
                sum += this.data[i][0] * rhs.data[i][0];
            }
        }
        return sum;
    }

    cross(rhs) {
        var result = null;
        if (rhs instanceof Vector && this.rows === 3 && rhs.rows === 3) {
            result = new Vector(3);
            result.values = [this.data[1][0] * rhs.data[2][0] - this.data[2][0] * rhs.data[1][0],
                             this.data[2][0] * rhs.data[0][0] - this.data[0][0] * rhs.data[2][0],
                             this.data[0][0] * rhs.data[1][0] - this.data[1][0] * rhs.data[0][0]]
        }
        return result;
    }
}



function mat4x4identity() {
    var result    = new Matrix(4, 4);
    result.values = [[ 1, 0, 0, 0],
	                 [ 0, 1, 0, 0],
					 [ 0, 0, 1, 0],
					 [ 0, 0, 0, 1]];
    return result;
}

function mat4x4translate(tx, ty, tz) {
    var result    = new Matrix(4, 4);
	result.values = [[1, 0, 0, tx],
			         [0, 1, 0, ty],
			         [0, 0, 1, tz],
			         [0, 0, 0, 1 ]];
    return result;
}

function mat4x4scale(sx, sy, sz) {
    var result    = new Matrix(4, 4);
    result.values = [[sx,  0,  0, 0],
					 [ 0, sy,  0, 0],
					 [ 0,  0, sz, 0],
					 [ 0,  0,  0, 1]];
    return result;
}

function mat4x4rotatex(theta) {
    var result    = new Matrix(4, 4);
	result.values = [[ 1,               0,                  0, 0],
	                 [ 0, Math.cos(theta), -(Math.sin(theta)), 0],
					 [ 0, Math.sin(theta),    Math.cos(theta), 0],
					 [ 0,               0,                  0, 0]];
    return result;
}

function mat4x4rotatey(theta) {
    var result    = new Matrix(4, 4);
    result.values = [[   Math.cos(theta), 0, Math.sin(theta), 0],
	                 [                 0, 1,               0, 0],
					 [-(Math.sin(theta)), 0, Math.cos(theta), 0],
					 [                 0, 0,               0, 1]];
    return result;
}

function mat4x4rotatez(theta) {
    var result    = new Matrix(4, 4);
	result.values = [[Math.cos(theta), -(Math.sin(theta)), 0, 0],
	                 [Math.sin(theta),    Math.cos(theta), 0, 0],
					 [              0,                  0, 1, 0],
					 [              0,                  0, 0, 1]];
    
    return result;
}

function mat4x4shearxy(shx, shy) {
    var result    = new Matrix(4, 4);
    result.values = [[ 1, 0, shx, 0],
	                 [ 0, 1, shy, 0],
					 [ 0, 0,   1, 0],
					 [ 0, 0,   0, 1]];
    return result;
}

function mat4x4parallel(vrp, vpn, vup, prp, clip) {
/*     // 1. translate VRP to the origin
    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis, 
    //    u-axis becomes the x-axis, and v-axis becomes the y-axis
    // 3. shear such that the DOP becomes parallel to the z-axis
    // 4. translate and scale into canonical view volume
    //    (x = [-1,1], y = [-1,1], z = [0,-1])
	
	//Step 	One
	var vrpTranslate = mat4x4translate(-vrp.x, -vrp.y, -vrp.z);
	//Step 2
	var nAxis = new Vector(vpn);
	nAxis.normalize();
	var uAxis = new Vector(vup.cross(nAxis));
	uAxis.normalize();
	var vAxis = new Vector(nAxis.cross(uAxis));
		
	var vrcRotate    = new Matrix(4,4);
	vrcRotate.values = [[uAxis.x, uAxis.y, uAxis.z, 0],
	                    [vAxis.x, vAxis.y, vAxis.z, 0],
						[nAxis.x, nAxis.y, nAxis.z, 0]
						[      0,       0,       0, 1]];
	//Step 3
	//TODO- see if this at all correct
	var cwx   = (Math.min(uAxis) + Math.max(uAxis))/2;
    var cwy   = (Math.min(vAxis) + Math.max(vAxis))/2;
    var cwz   = (Math.min(nAxis) + Math.max(nAxis))/2;
    var dopx  = cwx - prp.x;
    var dopy  = cwy - prp.y;
    var dopz  = cwz - prp.z;
    var shear = mat4x4shearxy(-dopx/dopy, -dopy/dopz);
	//Step 4
	var tPar  = mat4x4translate(-cwx, -cwy, -clip);
	
	var sParX = (2/(Math.max(uAxis.x) - Math.min(uAxis.x)));
	var sParY = (2/(Math.max(vAxis.y) - Math.min(vAxis.y)));
	var sParZ = 1/(
	 */
    
}

function mat4x4perspective(vrp, vpn, vup, prp, clip) {
    // 1. translate VRP to the origin
    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis, 
    //    u-axis becomes the x-axis, and v-axis becomes the y-axis
    // 3. translate PRP to the origin
    // 4. shear such that the center line of the view volume becomes the z-axis
    // 5. scale into canonical view volume (truncated pyramid)
    //    (x = [z,-z], y = [z,-z], z = [-z_min,-1])
	
	//Step 	One
	var vrpTranslate = mat4x4translate(-vrp.x, -vrp.y, -vrp.z);
	//Step 2
	var nAxis = new Vector(vpn);
	nAxis.normalize();
	var uAxis = new Vector(vup.cross(nAxis));
	uAxis.normalize();
	var vAxis = new Vector(nAxis.cross(uAxis));
	console.log(uAxis, vAxis, nAxis);	
	var vrcRotate    = new Matrix(4,4);
	vrcRotate.values = [[uAxis.x, uAxis.y, uAxis.z, 0],
	                    [vAxis.x, vAxis.y, vAxis.z, 0],
						[nAxis.x, nAxis.y, nAxis.z, 0],
						[      0,       0,       0, 1]];
	//Step 3
	var prpTranslate = mat4x4translate(-prp.x, -prp.y, -prp.z);
	
	//Step 4 
	var xAvg = ((clip[1] + clip[0])/2);
	var yAvg = ((clip[3] + clip[2])/2);
	var zAvg = 0;
	
	var cw  = new Vector3(xAvg, yAvg, zAvg);
	var DOP = cw.subtract(prp);
	
	var shXPer = (-DOP.x)/DOP.z;
	var shYPer = (-DOP.y)/DOP.z;
	
	var shearCW = mat4x4shearxy(shXPer, shYPer);
	//step 5
	var back = clip[5];
	
	var ScalePerX = (2 * -(prp.z))/((clip[1] - clip[0]) * (-prp.z + back));
	var ScalePery = (2 * -(prp.z))/((clip[3] - clip[2]) * (-prp.z + back));
	var ScalePerZ = (-1)/(-(prp.z) + back);
	
	var ScalePer  =  mat4x4scale(ScalePerX, ScalePery, ScalePerZ);
	//Nper
	console.log(ScalePer, shearCW, prpTranslate, vrcRotate, vrpTranslate)
    var nPer = new Matrix(4,4); 
    nPer     =  Matrix.multiply(ScalePer, shearCW, prpTranslate, vrcRotate, vrpTranslate);
	return nPer;
}

function mat4x4mper() {
    // perspective projection from canonical view volume to far clip plane
    var result    = new Matrix(4, 4);
    result.values = [[ 1, 0, 0, 0],
					 [ 0, 1, 0, 0],
					 [ 0, 0, 1, 0],
					 [ 0, 0,-1, 0]];
						
    return result;
}

function Vector3(x, y, z) {
    var result = new Vector(3);
    result.values = [x, y, z];
    return result;
}

function Vector4(x, y, z, w) {
    var result = new Vector(4);
    result.values = [x, y, z, w];
    return result;
}
