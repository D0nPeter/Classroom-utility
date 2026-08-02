const canvas = document.getElementById("wheel_canvas");
const ctx = canvas.getContext("2d");

///
//  Rotation constants
///
const maxVel = 0.5;
const accelTime = 1 * 1000;
const aRot = ( accelTime*maxVel/2 ) % 360;
const decelTime = 3 * 1000;
const dRot = ( decelTime*maxVel/2 ) % 360;

///
//  Display constants
/// 
const radius = 400;
const textRadius = 300;
const width = canvas.width;
const height = canvas.height;

///
//  Variables
///
let rotTime = 2 * 1000;
let midRot = ( maxVel*rotTime ) % 360;
let partsCount = 6;
let stage = 0;
let sTime;
// Rotations in grades <0; 355>
let rotation = 0;
let sRotation = 0;

/// 
// Temporary colours
///
const colours = ['#00420e', '#00aa00'];

function drawWheelPart(number, colour){
    // Rotation is converted into radians for use in trigonometric functions.
    let sAng = 2*Math.PI * number/partsCount + rotation * Math.PI / 180;
    let eAng = 2*Math.PI * (number+1)/partsCount + rotation * Math.PI / 180;

    let sX = Math.cos(sAng)*radius + width/2;
    let eX = Math.cos(eAng)*radius + width/2;

    let sY = height/2 + Math.sin(sAng)*radius;
    let eY = height/2 + Math.sin(eAng)*radius;

    ctx.fillStyle = colour;

    ctx.beginPath();
    ctx.moveTo(sX, sY);
    ctx.lineTo(width/2, height/2);
    ctx.lineTo(eX, eY);

    ctx.arc(width/2, height/2, radius, sAng, eAng);
    ctx.fill();
}

function drawText(number, val){
    ctx.save();
    ctx.translate(width/2, height/2);
    let rotAngle = 2*Math.PI * (number + 0.5)/partsCount + rotation * Math.PI / 180
    ctx.rotate(rotAngle);

    /// <todo>
    /// - Add ability to apply style from css sheets.
    /// </todo>

    ctx.font = "60px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(val, textRadius, 20);

    ctx.restore();
}

function calculateRotation(timestamp){
    if(stage == 1 && sTime === undefined){
        sTime = timestamp;
    }

    let time;
    
    if(stage == 1){
        time = timestamp - sTime;
        
        rotation = ( sRotation + time**2 * maxVel / accelTime /2 ) % 360;

        if(time >= accelTime){
            stage = 2;
        }
    }
    if(stage == 2){
        time = timestamp - sTime - accelTime;
        
        rotation = ( sRotation + aRot + time*maxVel) % 360;
        
        if(time >= rotTime){
            stage = 3;
        }
    }        
    if(stage == 3){
        time = timestamp - sTime - accelTime - rotTime;
        
        rotation = ( sRotation + aRot + midRot + (maxVel * (2*decelTime - time) * time /2 /decelTime )) % 360;
    
        if(time >= decelTime){
            stage = 0;
            sTime = undefined;
    
            sRotation = (aRot + midRot + dRot + sRotation)%360;
            rotation = sRotation;
    
            // DisplayResult();
        }
    }
}


/// <todo> 
// - Improve function for wheels with odd number of parts.
// </todo>
function getPartColour(number){
    return colours[number%2];
}

function drawWheel(timestamp){
    calculateRotation(timestamp);

    ctx.clearRect(0, 0, width, height);
    for(let i=0; i<partsCount; i++){
        drawWheelPart(i, getPartColour(i));
        drawText(i, 0);
    }

    requestAnimationFrame(drawWheel);
}

requestAnimationFrame(drawWheel);

function spinWheel(){
    stage = 1;
}