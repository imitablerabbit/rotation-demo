// Mesh consists of squares not tris. This is to be consistent with how Tyler
// has started setting up his application. Each element in the mesh contains a
// 2 element array which represents the vertices (in local space) going from
// top left, top right, bottom right, bottom left.
var squareMesh = [ [-100, -100], 
                   [100, -100],
                   [100, 100],
                   [-100, 100] ];

// The position of the square in the world coordinate space. The center of the
// square is used for the mesh.
var squarePos = [ 300, 300 ];

// The current roation value for the square. This value should not exceed 360
// or be below 0.
var squareRot = 0;

// The circle mesh that is generated and drawn each frame.
var circleMesh = null;

// The position of the circle in world space.
var circlePos = [ 100, 300 ];

// The rotation value of the circle.
var circleRot = 0;

// Generates a circle mesh in the same structure as the square mesh. This
// function takes in the radius and the number if samples to construct the
// mesh with.
function generateCircle(radius, samples) {
    var angle = 360/samples;
    var angleRad = toRadians(angle);
    var mesh = [];
    for (var i = 0; i < samples; i++) {
        var coord = [ 0, 0 ];
        coord[0] = Math.sin(angleRad * i) * radius;
        coord[1] = Math.cos(angleRad * i) * radius;
        mesh.push(coord);
    }
    return mesh;
}

// Create a duplicate of the mesh.
function cloneMesh(mesh) {
    return JSON.parse(JSON.stringify(mesh));
}

// Convert degress to radians.
function toRadians(angle) {
    return (angle * Math.PI) / 180;
}

// Convert the local mesh vertices into world space coordinates. This function
// just adds position onto each vertex rather than faffing around with matrices.
// Returns a new set of vertices that are in world space.
function toWorldSpace(mesh, pos) {
    var dup = cloneMesh(mesh);
    for (var vert of dup) {
        vert[0] += pos[0];
        vert[1] += pos[1];
    }
    return dup;
}

// Rotates the square clockwise according to the angle passed in. The angle is
// in degress not radians. Returns a new rotated set of mesh vertices.
function rotate(mesh, angle) {
    var dup = cloneMesh(mesh);
    var radAngle = toRadians(angle);
    
    for (var vert of dup) {
        var newX = (vert[0] * Math.cos(radAngle)) - (vert[1] * Math.sin(radAngle));
        var newY = (vert[0] * Math.sin(radAngle)) + (vert[1] * Math.cos(radAngle));
        vert[0] = newX;
        vert[1] = newY;
    }
    return dup;
}

// Render the mesh to the canvas context by drawing a line between each vertex.
// When we have reached the final vertex, draw a line between it and the first
// one.
function renderMesh(ctx, mesh) {
    if (! $.isArray(mesh))
        throw "invalid type (mesh)";
    ctx.beginPath();
    for (var i = 0; i < mesh.length; i++) {
        var vertex1 = mesh[i];
        var vertex2 = (i == mesh.length-1) ? mesh[0] : mesh[i+1];
        ctx.moveTo(vertex1[0], vertex1[1]);
        ctx.lineTo(vertex2[0], vertex2[1]);
    }
    ctx.closePath();
    ctx.stroke();
}

$(document).ready(function() {
    var canvas = document.getElementById("rotation-canvas");
    var canvasCtx = canvas.getContext('2d');

    var shouldRotateCheck = document.getElementById("rotate-check");
    var rotateAngleRange = document.getElementById("rotate-angle");
    var rotateAngleLabel = document.getElementById("rotate-angle-label");
    rotateAngleRange.addEventListener("input", function(e) {
        rotateAngleLabel.innerHTML = "Rotation Angle (" + rotateAngleRange.value + "):";
    });
    rotateAngleLabel.innerHTML = "Rotation Angle (" + rotateAngleRange.value + "):";

    circleMesh = generateCircle(50, 30);
    console.log(circleMesh);

    setInterval(function() {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        if (shouldRotateCheck.checked) {
            squareRot += Number(rotateAngleRange.value);
            if (squareRot >= 360)
                squareRot -= 360;
            circleRot += Number(rotateAngleRange.value);
            if (circleRot >= 360)
                circleRot -= 360;
        }
        var rotatedSquareMesh = rotate(squareMesh, squareRot);
        var rotatedCircleMesh = rotate(circleMesh, circleRot);
        renderMesh(canvasCtx, toWorldSpace(rotatedSquareMesh, squarePos));
        renderMesh(canvasCtx, toWorldSpace(rotatedCircleMesh, circlePos));
    }, 1000/60);
});

