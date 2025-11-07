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
let axis_index = 0;
let propeller_index = 0;
let vertex_data = [];

let uniform_z_translation_xy = null;
let uniform_z_translation_yz = null;
let uniform_z_translation_xz = null;
let uniform_z_translation_xyz = null;

let canvas_xz = null; 
let canvas_yz = null;
let canvas_xy = null; 
let canvas_xyz = null;

let xz_context = null; 
let yz_context =null;
let xy_context = null; 
let xyz_context = null;

let program_xz = null; 
let program_yz = null;
let program_xy = null; 
let program_xyz = null;

let attr_vertex_xy = null;
let attr_vertex_yz = null;
let attr_vertex_xz = null;
let attr_vertex_xyz = null;

let uniform_view_xy = null;
let uniform_view_yz = null;
let uniform_view_xz = null;
let uniform_view_xyz = null;

let uniform_props_xy = null;
let uniform_props_yz = null;
let uniform_props_xz = null;
let uniform_props_xyz = null;

let uniform_color_xy = null;
let uniform_color_yz = null;
let uniform_color_xz = null;
let uniform_color_xyz = null;


let at = vec3(0.0,0.0,0.0);
let up = vec3(0.0,0.5,0.0);
let eye = vec3(0.0,0.0,0.5);
let viewMatrix_xyz = lookAt( eye, at, up );
let viewMatrix_xy = lookAt(vec3(0.5,0.0,0.0), vec3(0.0,0.0,0.0),vec3(0.0,1.0,0.0))
let viewMatrix_yz = lookAt(vec3(0.0,0.0,0.5), vec3(0.0,0.0,0.0),vec3(0.0,1.0,0.0))
let viewMatrix_xz = lookAt(vec3(0.0,-0.5,0.0), vec3(0.0,0.0,0.0),vec3(0.0,0.0,1.0))

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
    propeller_index = vertex_data.length

    for(let i = 0; i < Fpp.length; i++) {
        vertex_data[row++] = Vpp[Fpp[i][0]];
        vertex_data[row++] = Vpp[Fpp[i][1]];
        vertex_data[row++] = Vpp[Fpp[i][2]];
    }

    axis_index = vertex_data.length;
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
    xz_context.viewport(0, 0, canvas_xz.width, canvas_xz.height);
    xz_context.enable(xz_context.DEPTH_TEST);
    attr_vertex_xz = xz_context.getAttribLocation(program_xz, "vertex");
    uniform_props_xz = xz_context.getUniformLocation(program_xz, "props");
    uniform_color_xz = xz_context.getUniformLocation(program_xz, "color");
    uniform_view_xz = xz_context.getUniformLocation(program_xz, "View");
    uniform_z_translation_xz = xz_context.getUniformLocation(program_xz, "z_translation");
    xz_context.useProgram(program_xz);
    xz_context.uniformMatrix4fv(uniform_view_xz, false, flatten(viewMatrix_xz));
    



    yz_context.useProgram(program_yz);
    yz_context.viewport(0, 0, canvas_yz.width, canvas_yz.height);
    yz_context.enable(yz_context.DEPTH_TEST);
    attr_vertex_yz = yz_context.getAttribLocation(program_yz, "vertex");
    uniform_props_yz = yz_context.getUniformLocation(program_yz, "props");
    uniform_color_yz = yz_context.getUniformLocation(program_yz, "color");
    uniform_view_yz = yz_context.getUniformLocation(program_yz, "View");
    uniform_z_translation_yz = yz_context.getUniformLocation(program_yz, "z_translation");
    yz_context.useProgram(program_yz);
    yz_context.uniformMatrix4fv(uniform_view_yz, false, flatten(viewMatrix_yz));
    


    xy_context.useProgram(program_xy);
    xy_context.viewport(0, 0, canvas_xy.width, canvas_xy.height);
    xy_context.enable(xy_context.DEPTH_TEST);
    attr_vertex_xy = xy_context.getAttribLocation(program_xy, "vertex");
    uniform_props_xy = xy_context.getUniformLocation(program_xy, "props");
    uniform_color_xy = xy_context.getUniformLocation(program_xy, "color");
    uniform_view_xy = xy_context.getUniformLocation(program_xy, "View");
    uniform_z_translation_xy = xy_context.getUniformLocation(program_xy, "z_translation");
    xy_context.useProgram(program_xy);
    xy_context.uniformMatrix4fv(uniform_view_xy, false, flatten(viewMatrix_xy));
    

    xyz_context.useProgram(program_xyz);    
    xyz_context.viewport(0, 0, canvas_xyz.width, canvas_xyz.height);
    xyz_context.enable(xyz_context.DEPTH_TEST);
    attr_vertex_xyz = xyz_context.getAttribLocation(program_xyz, "vertex");
    uniform_props_xyz = xyz_context.getUniformLocation(program_xyz, "props");
    uniform_color_xyz = xyz_context.getUniformLocation(program_xyz, "color");
    uniform_view_xyz = xyz_context.getUniformLocation(program_xyz, "View");
    uniform_z_translation_xyz = xyz_context.getUniformLocation(program_xyz, "z_translation");
    xyz_context.useProgram(program_xyz);
    xyz_context.uniformMatrix4fv(uniform_view_xyz, false, flatten(viewMatrix_xyz));

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

    xy_context.vertexAttribPointer( attr_vertex_xy, 3, xy_context.FLOAT, false, 0, 0 );
    yz_context.vertexAttribPointer( attr_vertex_yz, 3, yz_context.FLOAT, false, 0, 0 );
    xz_context.vertexAttribPointer( attr_vertex_xz, 3, xz_context.FLOAT, false, 0, 0 );
    xyz_context.vertexAttribPointer( attr_vertex_xyz, 3, xyz_context.FLOAT, false, 0, 0 );


    //Missing two lines about the vertex attribute

    xy_context.enableVertexAttribArray( attr_vertex_xy );
    yz_context.enableVertexAttribArray( attr_vertex_yz );
    xz_context.enableVertexAttribArray( attr_vertex_xz );
    xyz_context.enableVertexAttribArray( attr_vertex_xyz );

    xz_context.bufferData( xz_context.ARRAY_BUFFER, flatten(vertex_data), xz_context.STATIC_DRAW );
    yz_context.bufferData( yz_context.ARRAY_BUFFER, flatten(vertex_data), yz_context.STATIC_DRAW );
    xy_context.bufferData( xy_context.ARRAY_BUFFER, flatten(vertex_data), xy_context.STATIC_DRAW );
    xyz_context.bufferData( xyz_context.ARRAY_BUFFER, flatten(vertex_data), xyz_context.STATIC_DRAW );
}


/*Using the JavaScript programming language, the WebGL application programming interface (API), and the OpenGL shading language (GLSL), you and your group will write JS and GLSL code to create an web-based application that is visually identical to the one in the video.

You may use the design framework included in ICE 5 and 6. Specifically, 

create the data, - (Done) 
context configuration, - 
memory allocation and buffering,
draw the model(s), and
animation (i.e., draw at timed intervals), and 
complete the GLSL vertex shader program.
You and your group will also be responsible for identifying and creating variables used by your coding solution, as well as selecting the appropriate data structures (such as an arrayLinks to an external site., an objectLinks to an external site., or an array of objects).

Lastly, remember, every canvas will have its own context.*/


//this is a helper function, so that you can call the repeated drawing code and make it simpler
function draw_per_conteext(canvas_context, program, uniform_prop, uniform_color, xang, yang, zang, rot,uniform_z_translation){
    canvas_context.useProgram(program);
    xang = xang * Math.PI/180.0;
    yang = yang * Math.PI/180.0;
    zang = zang * Math.PI/180.0;
    rot = rot * Math.PI/180.0;


    let i = 0;
    canvas_context.uniform1f(uniform_z_translation, 0.0)
    canvas_context.uniform4f(uniform_prop, xang, yang, zang, 1.75)
    canvas_context.uniform4f(uniform_color, 0.60, 0.60, 0.60, 1.0);
    for (j = 0; j < propeller_index; j += 3) {
        canvas_context.drawArrays(canvas_context.LINE_STRIP, j, 3);
    }
    canvas_context.uniform4f(uniform_color, 0.81, 0.81, 0.81, 1.0);
    canvas_context.drawArrays(canvas_context.TRIANGLES, 0, propeller_index);

    i = axis_index

    canvas_context.uniform4f(uniform_color, 1.0, 0.0, 0.0, 1.0);
    canvas_context.drawArrays(canvas_context.LINES, i, 2);
    i += 2;

    canvas_context.uniform4f( uniform_color, 0.0, 1.0, 0.0, 1.0 );
    canvas_context.drawArrays( canvas_context.LINES, i, 2);
    i += 2;
    
  
    canvas_context.uniform4f( uniform_color, 0.0, 0.0, 1.0, 1.0 );
    canvas_context.drawArrays( canvas_context.LINES, i, 2);


    canvas_context.uniform1f(uniform_z_translation, -0.375)
    canvas_context.uniform4f(uniform_color, 0.40, 0.40, 0.40, 1.0);
    canvas_context.uniform4f(uniform_prop, xang, yang, rot, 1.75)
    for (j = propeller_index; j < axis_index; j += 3) {
        canvas_context.drawArrays(canvas_context.LINE_STRIP, j, 3);
    }
    canvas_context.uniform4f(uniform_color, 0.72, 0.72, 0.72, 1.0);
    canvas_context.drawArrays(canvas_context.TRIANGLES, propeller_index, axis_index);


    

}




function draw(){
    rot = (rot + rot_inc) % 360;
    draw_per_conteext(xy_context, program_xy, uniform_props_xy, uniform_color_xy, 0.0, 0.0, zang, rot, uniform_z_translation_xy)
    draw_per_conteext(xz_context, program_xz, uniform_props_xz, uniform_color_xz, 0.0, yang, 0.0, rot,  uniform_z_translation_xz)
    draw_per_conteext(yz_context, program_yz, uniform_props_yz, uniform_color_yz, xang, 0.0, 0.0, rot,  uniform_z_translation_yz)
    draw_per_conteext(xyz_context, program_xyz, uniform_props_xyz, uniform_color_xyz, xang, yang, zang, rot,  uniform_z_translation_xyz)
}

createData();
configure();
allocateMemory();
setInterval(draw, 100)