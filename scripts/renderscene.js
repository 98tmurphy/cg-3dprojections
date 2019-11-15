var view;
var ctx;
var scene;
var theta = 0;

// Initialization function - called when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            vrp: Vector3(20, 0, -30),
            vpn: Vector3(1, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(14, 20, 26),
            clip: [-20, 20, -4, 36, 1, -50]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ]
            },
            {
                type: 'generic',
                vertices:[
                    Vector4(0,0,-50,1),
                    Vector4(30,15,-20,1)
                ],
                edges: [
                    [0,1]
                ]
            }
        ]
    };
    CalculateModelCenter();
    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);
    setInterval(function(){
        Animate(.5)
     }, 10);

}
function CalculateModelCenter(){
    for(var i = 0; i < scene.models.length; i++){
        let xMax = scene.models[i].vertices[0].x;
        let xMin = scene.models[i].vertices[0].x;
        let yMax = scene.models[i].vertices[0].y;
        let yMin = scene.models[i].vertices[0].y;
        let zMax = scene.models[i].vertices[0].z;
        let zMin = scene.models[i].vertices[0].z;
        for(let j = 1; j < scene.models[i].vertices.length; j++){
            //translte to origin, rotate, translate back
            if(scene.models[i].vertices[j].x > xMax){
                xMax = scene.models[i].vertices[j].x;
            }
            if(scene.models[i].vertices[j].y > yMax){
                yMax = scene.models[i].vertices[j].y;
            }
            if(scene.models[i].vertices[j].z > zMax){
                zMax = scene.models[i].vertices[j].z;
            }
            if(scene.models[i].vertices[j].x < xMin){
                xMin = scene.models[i].vertices[j].x;
            }
            if(scene.models[i].vertices[j].y < yMin){
                yMin = scene.models[i].vertices[j].y;
            }
            if(scene.models[i].vertices[j].z < zMin){
                zMin = scene.models[i].vertices[j].z;
            }
        }
        let xAvg = (xMax + xMin)/2;
        let yAvg = (yMax + yMin)/2;
        let zAvg = (zMax + zMin)/2;
        scene.models[i].averages = Vector3(xAvg, yAvg, zAvg);
    }
}
// Main drawing code here! Use information contained in variable `scene`
function DrawScene() {
    ctx.clearRect(0,0,view.width,view.height);
    console.log(scene); 
    if(scene.view.type == 'perspective'){
        var perspectiveMatrix   = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
        var mPer                = mat4x4mper();
        var projectionToWindow = new Matrix(4,4);
        projectionToWindow.values = [[view.width/2,            0, 0,  view.width/2],
                                    [           0, view.height/2, 0, view.height/2],
                                    [           0,             0, 1,             0],
                                    [           0,             0, 0,             1]];
       

        for(var i = 0; i < scene.models.length; i++){
            let canonicalVertices = [];
            var translateToOrigin   = mat4x4translate(-(scene.models[i].averages.x), -(scene.models[i].averages.y), -(scene.models[i].averages.z));
            var rotateAboutOriginX  = mat4x4rotatey(theta);
            var translateFromOrigin = mat4x4translate(scene.models[i].averages.x, scene.models[i].averages.y, scene.models[i].averages.z);
            for(let j = 0; j < scene.models[i].vertices.length; j++){
                //translte to origin, rotate, translate back
                canonicalVertices.push(Matrix.multiply(perspectiveMatrix,translateFromOrigin,rotateAboutOriginX,translateToOrigin,scene.models[i].vertices[j]));
            }
            for(let j = 0; j< scene.models[i].vertices.length; j++){
            //TODO clip
            //
            //Look man, I did my best
            //
                canonicalVertices[j] = Matrix.multiply(projectionToWindow, mPer, canonicalVertices[j]);

            }
            for(let j = 0; j < scene.models[i].edges.length; j++){
                for(let k = 0; k < scene.models[i].edges[j].length - 1; k++){
                    let vert1, vert2;
                    vert1 = canonicalVertices[scene.models[i].edges[j][k]];
                    vert2 = canonicalVertices[scene.models[i].edges[j][k + 1]];
                   /* newVerts = clipLine(vert1,vert2,-.1)
                    DrawLine(newVerts.V1.x/newVerts.V1.w, newVerts.V1.y/newVerts.v1.w, newVerts.V2.x/newVerts.V2.w, newVerts.V2.y/newVerts.V2.w);*/
                    DrawLine(vert1.x/vert1.w, vert1.y/vert1.w,vert2.x/vert2.w, vert2.y/vert2.w);
                }
            }
        }
    }
    if(scene.view.type == 'parallel'){
        var parallelMatrix = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
        var projectionToWindow = new Matrix(4,4);
        projectionToWindow.values = [[view.width/2,            0, 0,  view.width/2],
                                    [           0, view.height/2, 0, view.height/2],
                                    [           0,             0, 1,             0],
                                    [           0,             0, 0,             1]];

        for(var i = 0; i < scene.models.length; i++){
            let canonicalVertices = [];
            var translateToOrigin   = mat4x4translate(-(scene.models[i].averages.x), -(scene.models[i].averages.y), -(scene.models[i].averages.z));
            var rotateAboutOriginX  = mat4x4rotatey(theta);
            var translateFromOrigin = mat4x4translate(scene.models[i].averages.x, scene.models[i].averages.y, scene.models[i].averages.z);
            
            for(let j = 0; j < scene.models[i].vertices.length; j++){
            //translte to origin, rotate, translate back
            canonicalVertices.push(Matrix.multiply(parallelMatrix,translateFromOrigin,rotateAboutOriginX,translateToOrigin,scene.models[i].vertices[j]));
            }
            //TODO clip
            
            for(let j = 0; j< scene.models[i].vertices.length; j++){
                canonicalVertices[j] = Matrix.multiply(projectionToWindow, canonicalVertices[j]);
            }
            for(let j = 0; j < scene.models[i].edges.length; j++){
                for(let k = 0; k < scene.models[i].edges[j].length - 1; k++){
                    let vert1, vert2;
                    vert1 = canonicalVertices[scene.models[i].edges[j][k]];
                    vert2 = canonicalVertices[scene.models[i].edges[j][k + 1]];
                    
                    DrawLine(vert1.x/vert1.w, vert1.y/vert1.w, vert2.x/vert2.w, vert2.y/vert2.w);
                }
            }
        }
    }
}
function Animate(rps){
    theta = (theta + rps * (Math.PI) * 2 * .01);
    DrawScene();
    
}
// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.vrp = Vector3(scene.view.vrp[0], scene.view.vrp[1], scene.view.vrp[2]);
        scene.view.vpn = Vector3(scene.view.vpn[0], scene.view.vpn[1], scene.view.vpn[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
        }
        CalculateModelCenter();
        DrawScene();
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            var vpn = scene.view.vpn;
            var vup = scene.view.vup;
            var vrp = scene.view.vrp;
            var nAxis = new Vector(vpn);
            nAxis.normalize();
            var uAxis = new Vector(vup.cross(nAxis));
            uAxis.normalize();
            var translate = mat4x4translate(-uAxis.x, -uAxis.y, -uAxis.z);
            var vrp4 = Vector4(vrp.x, vrp.y, vrp.z, 1);
            vrp4 = Matrix.multiply(translate,vrp4);
            scene.view.vrp.x = vrp4.x;
            scene.view.vrp.y = vrp4.y;
            scene.view.vrp.z = vrp4.z;
            DrawScene();
            console.log("left");
            break;
        case 38: // UP Arrow
            console.log("up");
            var vpn = scene.view.vpn;
            var vup = scene.view.vup;
            var vrp = scene.view.vrp;
            var nAxis = new Vector(vpn);
            nAxis.normalize();
            var translate = mat4x4translate(-nAxis.x, -nAxis.y, -nAxis.z);
            var vrp4 = Vector4(vrp.x, vrp.y, vrp.z, 1);
            vrp4 = Matrix.multiply(translate,vrp4);
            scene.view.vrp.x = vrp4.x;
            scene.view.vrp.y = vrp4.y;
            scene.view.vrp.z = vrp4.z;
            DrawScene();
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            var vpn = scene.view.vpn;
            var vup = scene.view.vup;
            var vrp = scene.view.vrp;
            var nAxis = new Vector(vpn);
            nAxis.normalize();
            var uAxis = new Vector(vup.cross(nAxis));
            uAxis.normalize();
            var translate = mat4x4translate(uAxis.x,uAxis.y,uAxis.z);
            var vrp4 = Vector4(vrp.x, vrp.y, vrp.z, 1);
            vrp4 = Matrix.multiply(translate,vrp4);
            scene.view.vrp.x = vrp4.x;
            scene.view.vrp.y = vrp4.y;
            scene.view.vrp.z = vrp4.z;
            DrawScene();
            break;
        case 40: // DOWN Arrow
            console.log("down");
            var vpn = scene.view.vpn;
            var vup = scene.view.vup;
            var vrp = scene.view.vrp;
            var nAxis = new Vector(vpn);
            nAxis.normalize();
            var translate = mat4x4translate(nAxis.x, nAxis.y, nAxis.z);
            var vrp4 = Vector4(vrp.x, vrp.y, vrp.z, 1);
            vrp4 = Matrix.multiply(translate,vrp4);
            scene.view.vrp.x = vrp4.x;
            scene.view.vrp.y = vrp4.y;
            scene.view.vrp.z = vrp4.z;
            DrawScene();
            break;
    }
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}


function clipLine(pt0, pt1, zMin){ 
	var LEFT   = 32;  //100000
	var RIGHT  = 16;  //010000
	var BOTTOM = 8;   //001000
	var TOP    = 4;   //000100
	var NEAR   = 2;   //000010
	var FAR    = 1;   //000000
	var result;
	var outcode0 = getOutCode(pt0,zMin);
	var outcode1 = getOutCode(pt1,zMin);
	var deltaX = pt1.x - pt0.x;
	var deltaY = pt1.y - pt0.y;
	var deltaZ = pt1.z - pt0.z;
	var done = false;
	while(!done){
		if((outcode0 | outcode1) === 0) {//trivial accept
			done = true
			pt0.x = pt0.x;
			pt0.y = pt0.y;
			pt0.z = pt0.z
			pt1.x = pt1.x;
			pt1.y = pt1.y;
			pt1.z = pt1.z;
			result = {V1:pt0, V2: pt1};
		}
		else if ((outcode0 & outcode1) !== 0){ //trivial reject
			done = true;
			result = null;
		}
		else{
			var selected_pt;
			var selected_outcode;
			if(outcode0 > 0){
				selected_pt      = pt0;
				selected_outcode = outcode1;
			}
			else {
				selected_pt      = pt1;
				selected_outcode = outcode1;
			}
			if((selected_outcode & LEFT) === LEFT){
				t             = (-selected_pt.x + -selected_pt.z)/(deltaX-deltaZ);
				selected_pt.x = selected_pt.x + t * deltaX;
				selected_pt.y = selected_pt.y + t * deltaY;
				selected_pt.z = selected_pt.z + t * deltaZ;
				
			}else if ((selected_outcode & RIGHT) === RIGHT){
				t             = (selected_pt.x + selected_pt.z)/(-deltaX - deltaZ);
				selected_pt.x = selected_pt.x + t * deltaX;
				selected_pt.y = selected_pt.y + t * deltaY;
				selected_pt.z = selected_pt.z + t * deltaZ;
				
			}else if ((selected_outcode & BOTTOM) === BOTTOM){
				t             = (-selected_pt.y + selected_pt.z)/(deltaY - deltaZ);
				selected_pt.x = selected_pt.x + t * deltaX;
				selected_pt.y = selected_pt.y + t * deltaY;
				selected_pt.z = selected_pt.z + t * deltaZ;
			}else if ((selected_outcode & TOP) === TOP){
				t             = (selected_pt.y + selected_pt.z)/(-deltaY - deltaZ);
				selected_pt.x = selected_pt.x + t * deltaX;
				selected_pt.y = selected_pt.y + t * deltaY;
				selected_pt.z = selected_pt.z + t * deltaZ;
			}else if ((selected_outcode & NEAR) === NEAR){
				t             = (selected_outcode.z - zMin)/(-deltaZ);
				selected_pt.x = selected_pt.x + t * deltaX;
				selected_pt.y = selected_pt.y + t * deltaY;
				selected_pt.z = selected_pt.z + t * deltaZ;
			}else{
				t             = (-selected_pt.z - 1)/(deltaZ);
				selected_pt.x = selected_pt.x + t * deltaX;
				selected_pt.y = selected_pt.y + t * deltaY;
				selected_pt.z = selected_pt.z + t * deltaZ;
			}
			selected_outcode = getOutCode(selected_pt, zMin);
			if(outcode0 > 0){
				outcode0 = selected_outcode;
				
			}else {
				outcode1 = selected_outcode;
			}
		}
	}
	return result;
}
function getOutcode(pt, zMin){
    var LEFT   = 32;  //100000
	var RIGHT  = 16;  //010000
	var BOTTOM = 8;   //001000
	var TOP    = 4;   //000100
	var NEAR   = 2;   //000010
	var FAR    = 1;   //000000
    var outcode = 0;
    if (pt.x < pt.z){
        outcode = outcode + LEFT;
    }
    else if (pt.x > -pt.z){
        outcode = outcode + RIGHT;
    }
    if (pt.y < pt.z){
        outcode = outcode + BOTTOM;
    }
    if (pt.y > -pt.z){
        outcode = outcode + TOP;
    }
    if(pt.z > zMin){
        outcode = outcode + NEAR;
    }
    if(pt.z < -1){
        outcode = outcode + FAR;
    }
    return outcode;
}
