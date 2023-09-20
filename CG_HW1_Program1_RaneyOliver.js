var canvas;			// Drawing surface 
var gl;				// Graphics context

var axis = 1;			// Currently active axis of rotation
var xAxis = 0;			//  Will be assigned on of these codes for
var yAxis = 1;			//  
var zAxis = 2;
var brightness = 0;
var color = [1, 1, 1];

var theta = [0.017 * 3, Math.PI / 2, 0];		// Rotation angles for x, y and z axes
var posOffset = [0, 0, 0, 0];
var thetaLoc;			// Holds shader uniform variable location
var modelMatrixLocation;
var flag = true;		// Toggle Rotation Control
var kickFlag = false;

var oVStart;
var oVCount;
var r = 0.5;
var segments = 64
var vertices = [
    0.0, 0.1, 0.0,
    0.0, 0.0, 0.0
];
var indices = [];

function createTranslationMatrix(x, y, z) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ];
}
function createScalingMatrix(sx, sy, sz) {
    return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1
    ];
}
function multiplyMatrices(A, B) {
    let result = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i * 4 + j] =
                A[i * 4 + 0] * B[j + 0 * 4] +
                A[i * 4 + 1] * B[j + 1 * 4] +
                A[i * 4 + 2] * B[j + 2 * 4] +
                A[i * 4 + 3] * B[j + 3 * 4];
        }
    }
    return result;
}

// Translate 4x4 Matrix
function createConeModelMatrix(x = 0, y = 0, z = 0, rotationAngle = 0, rotationAxis = [0, 1, 0]) {
    return createTranslationMatrix(x, y, z);
}

// Initial Circular Planes
for (let i = 0; i < segments; i++) {
    const theta = 2 * Math.PI * i / segments;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = 0;

    vertices.push(x, y, z);
}

oVStart = vertices.length / 3
console.log(oVStart)

// In the Cone's Surface and Base, I create triangles. Each triangle on the cone goes from the apex, to the polar coordinate, then to the next polar coordinate.
// This repeats for 2*pi radians.
// On the Cone's base, it's the same thing except instead of the apex it starts at the center of the circle.

// Cone's surface
for (let i = 2; i < 1 + segments; i++) {
    let next = (1 % segments) + 2;
    indices.push(0, i, next);
}

// Cone's base
for (let i = 2; i < 1 + segments; i++) {
    let next = (i % segments) + 2;
    indices.push(1, i, next);
}

//console.log(pedTopVert)

// Top Cone Colors
var colors = [];
for (var i = 0; i < vertices.length / 3; i++) {
    colors.push(0.9, 0, 0.2, 0.6);
}


// O Letter
//left
let oOuterLeft = [
    // top left
    -0.2, 0.0, 0.0,
    -0.2, 0.2, 0.0,
    0.0, 0.2, 0.0,

    // bot right
    0.0, 0.2, 0.0,
    0.0, 0.0, 0.0,
    -0.2, 0.0, 0.0
];
for (let i = 0; i < oOuterLeft.length; i++) {
    if (i % 3 == 1) {
        oOuterLeft[i] += 0.03;
    }
    vertices.push(oOuterLeft[i]);
}

//right
var oOuterRight = oOuterLeft;
for (i = 0; i < oOuterLeft.length; i++) {
    if (i % 3 == 2) {
        oOuterRight[i] = -0.2;
    }
}
for (let i = 0; i < oOuterRight.length; i++) {
    vertices.push(oOuterRight[i]);
}

//top
let oOuterTop = [
    -0.2, 0.2, 0.0, //DL
    -0.2, 0.2, -0.2,//UL
    0.0, 0.2, -0.2, //UR

    0.0, 0.2, -0.2, //UR
    0.0, 0.2, 0.0,  //DR
    -0.2, 0.2, 0.0, //DL
];
for (let i = 0; i < oOuterTop.length; i++) {
    if (i % 3 == 1) {
        oOuterTop[i] += 0.03
    }
    vertices.push(oOuterTop[i]);
}

//bottom
var oOuterBot = oOuterTop;
for (i = 0; i < oOuterTop.length; i++) {
    if (i % 3 == 1) {
        oOuterBot[i] = 0.03;
    }
}
for (let i = 0; i < oOuterBot.length; i++) {
    vertices.push(oOuterBot[i]);
}

//oVCount = vertices.length/3 - oVStart
oVCount = oOuterLeft.length / 3

// O letter colors
let oVerticesTotalCount = vertices.length / 3 - oVStart
for (let i = 0; i < oVerticesTotalCount; i++) {
    //left
    if (i < oVCount) {
        colors.push(0.0, 0.0, 1.0, 0.6);
    }
    //right
    else if (i >= oVCount && i < 2 * oVCount) {
        colors.push(0.0, 1.0, 0.0, 0.6);
    }
    //top
    else if (i >= 2 * oVCount && i < 2 * oVCount + 6) {
        colors.push(1.0, 0.0, 0.0, 0.6);
    }
    //bot
    else {
        colors.push(1.0, 1.0, 0.0, 0.6);
    }
}

// end O

// R
// little O for R (duplicated O)
let x = 0;
let y = 0.15;
let z = -0.05;
let scale = 0.7;
for (let i = 0; i < oVerticesTotalCount; i++) {
    vertices.push(
        vertices[(oVStart + i) * 3] * scale + x,
        vertices[(oVStart + i) * 3 + 1] * scale + y,
        vertices[(oVStart + i) * 3 + 2] * scale + z
    );
}

// left leg (duplicated side of O)
var rLeftLeg = oOuterBot;
for (let i = 0; i < rLeftLeg.length; i++) {
    if (i % 3 == 0) {
        vertices.push(rLeftLeg[i] * scale + x);
    }
    else if (i % 3 == 1) {
        vertices.push(rLeftLeg[i] * scale + y);
    }
    else if (i % 3 == 2) {
        rLeftLeg[i] += 0.2;
        vertices.push(rLeftLeg[i] * scale + z);
    }
}

// right leg (duplicated side of O)
var rRightLeg = oOuterBot;
let rightLegXOffset = 0;
let rightLegYOffset = 0;
let rightLegZOffset = 0;
for (let i = 0; i < rRightLeg.length; i++) {
    if (i % 3 == 0) {
        vertices.push(rRightLeg[i] * scale + x + rightLegXOffset);
    }
    else if (i % 3 == 1) {
        vertices.push(rRightLeg[i] * scale + y + rightLegYOffset);
    }
    else if (i % 3 == 2) {
        rRightLeg[i] += 0.2;
        vertices.push(rRightLeg[i] * scale + z + rightLegZOffset);
    }
}

// Colors of R letter
rVerticesTotalCount = vertices.length / 3 - (oVStart + oVerticesTotalCount);
for (let i = 0; i < rVerticesTotalCount; i++) {
    //left
    if (i < oVCount) {
        colors.push(0.0, 0.0, 1.0, 0.6);
    }
    //right
    else if (i >= oVCount && i < 2 * oVCount) {
        colors.push(0.0, 1.0, 0.0, 0.6);
    }
    //top
    else if (i >= 2 * oVCount && i < 2 * oVCount + 6) {
        colors.push(1.0, 0.0, 0.0, 0.6);
    }
    //bot
    else {
        colors.push(1.0, 1.0, 0.0, 0.6);
    }
}

//end R

// Set JS arrays to Typed Arrays
var pedTopVert = new Float32Array(vertices);
var pedTopInd = new Int16Array(indices);
var pedTopColors = new Float32Array(colors);
console.log(pedTopVert)
console.log(pedTopColors)
console.log(pedTopInd)

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);



    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color array atrribute buffer

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pedTopColors, gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // vertex array attribute buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pedTopVert, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // index array buffer

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pedTopInd, gl.STATIC_DRAW);

    // uniform modelMatrix

    modelMatrixLocation = gl.getUniformLocation(program, "u_ModelMatrix");

    // uniform pedColor

    pedColorLoc = gl.getUniformLocation(program, "pedColor");

    // uniform posOffset

    posOffsetLoc = gl.getUniformLocation(program, "posOffset");

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    //event listeners for buttons

    document.getElementById("xButton").onclick = function () {
        axis = xAxis;
    };
    document.getElementById("yButton").onclick = function () {
        axis = yAxis;
    };
    document.getElementById("zButton").onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function () { flag = !flag; };
    document.getElementById("ButtonK").onclick = function () {
        kickFlag = true;
        axis = 2;
    };

    document.getElementById("backlight").oninput = function () {
        brightness = this.value / 100;
        //console.log(color)
    };

    document.getElementById("colorselect").onchange = function () {
        if (this.value == "0") {
            color = [1, 0, 1];
        }
        else if (this.value == "1") {
            color = [1, 1, 0];
        }
        else if (this.value == "2") {
            color = [1, 0, 0];
        }
        else if (this.value == "3") {
            color = [0, 0, 1];
        }
        else if (this.value == "4") {
            color = [1, 1, 1];
        }
    };


    render();
}

function render() {
    // user can control brightness + some colors
    gl.clearColor(brightness * color[0], brightness * color[1], brightness * color[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag) theta[axis] += 0.017;	// Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    // if click "Kick Away", kickFlag = true, this unif variable will increment on all positions
    if (kickFlag) {
        for (ax in posOffset) {
            posOffset[ax] += .01;
        }
    }
    gl.uniform4fv(posOffsetLoc, posOffset);

    // cone1
    // Top cone is translated and scaled using matrix multiplication and is drawn using indices for simplicity.
    let cone1Translation = createConeModelMatrix(0.0, -0.2, 0);
    let cone1Scaling = createScalingMatrix(0.5, 1, 0.5);
    let cone1Matrix = multiplyMatrices(cone1Translation, cone1Scaling);
    gl.uniformMatrix4fv(modelMatrixLocation, false, new Float32Array(cone1Matrix));
    gl.uniform4f(pedColorLoc, 0.3, 0.0, 0.3, 0.3);
    gl.drawElements(gl.TRIANGLES, pedTopInd.length, gl.UNSIGNED_SHORT, 0);


    // cone2
    // This cone is a duplicate of the previous, and theta has added + pi to make it upside down on the x axis.
    // It also has a separate color uniform variable "pedColor" so I could use the duplicate vertices but also have a different color.
    let cone2Matrix = createConeModelMatrix(0, 0, 0);
    gl.uniformMatrix4fv(modelMatrixLocation, false, new Float32Array(cone2Matrix));
    theta[0] += Math.PI;
    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle
    gl.uniform4f(pedColorLoc, 0.0, 0.0, 0.0, 0.0);
    gl.drawElements(gl.TRIANGLES, pedTopInd.length, gl.UNSIGNED_SHORT, 0);
    // reset the theta back to what it was before so everthing else can render okay
    theta[0] -= Math.PI;
    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    // O
    // left
    let oLeftStart = oVStart;
    let oLeftCount = oVCount;
    gl.drawArrays(gl.TRIANGLE_FAN, oLeftStart, oLeftCount);

    // right
    let oRightStart = oLeftStart + oLeftCount;
    let oRightCount = oLeftCount;
    gl.drawArrays(gl.TRIANGLE_FAN, oRightStart, oRightCount);

    // top
    let oTopStart = oRightStart + oRightCount;
    let oTopCount = oOuterTop.length / 3;
    gl.drawArrays(gl.TRIANGLE_FAN, oTopStart, oTopCount);

    // bottom
    let oBotStart = oTopStart + oTopCount;
    let oBotCount = oOuterBot.length / 3;
    gl.drawArrays(gl.TRIANGLE_FAN, oBotStart, oBotCount);

    // R
    // The R letter is also rotated 45 degrees to the "right" to make it look like it's leaning.

    // "O" part of R, duplicated from O.
    theta[0] += Math.PI / 4;
    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle
    let roStart = oBotStart + oBotCount;
    let roCount = oVerticesTotalCount;
    gl.drawArrays(gl.TRIANGLES, roStart, roCount);

    //left leg
    let rlStart = roStart + roCount;
    let rlCount = rLeftLeg.length / 3;
    gl.drawArrays(gl.TRIANGLES, rlStart, rlCount);

    //right leg
    theta[0] -= Math.PI / 4;
    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle
    let rrStart = rlStart + rlCount;
    let rrCount = rRightLeg.length / 3;
    gl.drawArrays(gl.TRIANGLES, rrStart, rrCount);

    requestAnimationFrame(render);	// Call to browser to refresh display
}