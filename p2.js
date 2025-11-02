console.clear();

// ----------------------------------------------
// Axis data (do not modify)
// ----------------------------------------------

let A = [
    [0.0, 0.0, 0.0],
    [1.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 1.0]
];

// ----------------------------------------------
// end axis data
// ----------------------------------------------

// ----------------------------------------------
// Simuation control (do not modify)
// ----------------------------------------------

let xang = 0;
let yang = 0;
let zang = 0;
let rot = 0;
let axisRotation = null;
let rot_inc = 10;

function startRotation(rotationFunc) {
    if (axisRotation !== null) clearInterval(axisRotation);
    axisRotation = setInterval(rotationFunc, 100);
}

function stopRotation() {
    clearInterval(axisRotation);
    axisRotation = null;
}

document.addEventListener('mouseup', stopRotation);

document.addEventListener('mousedown', function (event) {
    switch ( event.target.id ) {
        case "pitch-up":
            startRotation(() => { xang = ( xang + rot_inc ) % 360; });
            break;
        case "pitch-down":
            startRotation(() => { xang = ( xang - rot_inc ) % 360; });
            break;
        case "roll-left":
            startRotation(() => { zang = ( zang + rot_inc ) % 360; });
            break;
        case "roll-right":
            startRotation(() => { zang = ( zang - rot_inc ) % 360; });
            break;
        case "yaw-left":
            startRotation(() => { yang = ( yang + rot_inc ) % 360; });
            break;
        case "yaw-right":
            startRotation(() => { yang = ( yang - rot_inc ) % 360; });
            break;
        case "reset":
            xang = yang = zang = 0; 
            break;
        default:
            stopRotation();
    }
});

// ----------------------------------------------
// End simuation control
// ----------------------------------------------

// 1. Create vertex data
// function modeled off of ICE5

function createData() {
    let row = 0;
    for(let i = 0; i < Fpl.length; i++) {
        vertex_data[row++] = Vpl[Fpl[i][0]];
        vertex_data[row++] = Vpl[Fpl[i][1]];
        vertex_data[row++] = Vpl[Fpl[i][2]];
    }
    for(let i = 0; i < Fpp.length; i++) {
        vertex_data[row++] = Vpp[Fpp[i][0]];
        vertex_data[row++] = Vpp[Fpp[i][0]];
        vertex_data[row++] = Vpp[Fpp[i][0]];
    }
    for(let i = 0; i < A.length; i++) {
        vertex_data[row++] = A[i];
    }
}

// 2. Configure the context
// function modeled off of ICE5

function configure() {
    canvas_xz = document.getElementById("xz");
    canvas_yz = document.getElementById("yz");
    canvas_xy = document.getElementById("xy");
    canvas_xyz = document.getElementById("xyz");
    
    xz_context = canvas_xz.getContext("webgl");
    yz_context = canvas_yz.getContext("webgl");
    xy_context = canvas_xy.getContext("webgl");
    xyz_context = canvas_xyz.getContext("webgl");
    
    program_xz = initShaders( xz_context, "vertex-shader", "fragment-shader" );
    program_yz = initShaders( yz_context, "vertex-shader", "fragment-shader" );
    program_xy = initShaders( xy_context, "vertex-shader", "fragment-shader" );
    program_xyz = initShaders( xyz_context, "vertex-shader", "fragment-shader" );
    
    xz_context.useProgram(program_xz);
    yz_context.useProgram(program_yz);
    xy_context.useProgram(program_xy);
    xyz_context.useProgram(program_xyz);

    xz_context.viewport(0, 0, canvas_xz.width, canvas_xz.height);
    yz_context.viewport(0, 0, canvas_yz.width, canvas_yz.height);
    xy_context.viewport(0, 0, canvas_xy.width, canvas_xy.height);
    xyz_context.viewport(0, 0, canvas_xyz.width, canvas_xyz.height);

    //Not yet including lines for getting vertex, props, and color or for enabling
}

// 3. Memory allocation and buffering
// copied exactly from ICE5 because I don't know how it works

function allocateMemory() {
    let buffer_xz = xz_context.createBuffer();
    let buffer_yz = yz_context.createBuffer();
    let buffer_xy = xy_context.createBuffer();
    let buffer_xyz = xyz_context.createBuffer();

    xz_context.bindBuffer( xz_context.ARRAY_BUFFER, buffer_xz );
    yz_context.bindBuffer( yz_context.ARRAY_BUFFER, buffer_yz );
    xy_context.bindBuffer( xy_context.ARRAY_BUFFER, buffer_xy );
    xyz_context.bindBuffer( xyz_context.ARRAY_BUFFER, buffer_xyz );

    //Missing two lines about the vertex attribute

    xz_context.bufferData( xz_context.ARRAY_BUFFER, flatten(vertex_data), xz_context.STATIC_DRAW );
    yz_context.bufferData( yz_context.ARRAY_BUFFER, flatten(vertex_data), yz_context.STATIC_DRAW );
    xy_context.bufferData( xy_context.ARRAY_BUFFER, flatten(vertex_data), xy_context.STATIC_DRAW );
    xyz_context.bufferData( xyz_context.ARRAY_BUFFER, flatten(vertex_data), xyz_context.STATIC_DRAW );

}


/*Using the JavaScript programming language, the WebGL application programming interface (API), and the OpenGL shading language (GLSL), you and your group will write JS and GLSL code to create an web-based application that is visually identical to the one in the video.

You may use the design framework included in ICE 5 and 6. Specifically, 

create the data, 
context configuration,
memory allocation and buffering,
draw the model(s), and
animation (i.e., draw at timed intervals), and 
complete the GLSL vertex shader program.
You and your group will also be responsible for identifying and creating variables used by your coding solution, as well as selecting the appropriate data structures (such as an arrayLinks to an external site., an objectLinks to an external site., or an array of objects).

Lastly, remember, every canvas will have its own context.*/
