const canvas = document.getElementById("wheel_canvas");
const ctx = canvas.getContext("2d");

///
//  Wheel rotation constants
///
const maxVel = 0.5;
const accelTime = 1 * 1000;
const decelTime = 3 * 1000;
const baseRotTime = 2 * 1000;
const aRot = ( accelTime*maxVel/2 ) % 360;
const dRot = ( decelTime*maxVel/2 ) % 360;
const singleRotDuration = 360 / maxVel;

///
//  Wheel display constants
/// 
const widthPercentage = 0.5;
const heightPercentage = 0.85;

const baseWidth = 900;
const baseHeight = 800;
const baseRadius = 400;
const baseTextRadius = 350;
const baseSelTriangleWidth = 30;
const baseSelTriangleHeight = 40;
const baseFontSize = 60;

const baseTextOffset = 20;

///
//  Wheel display variables
/// 
let scalingPercentage = 1;
let width = baseWidth;
let height = baseHeight;
let radius = baseRadius;
let textRadius = baseTextRadius;
let selTriangleWidth = baseSelTriangleWidth;
let selTriangleHeight = baseSelTriangleHeight;
let fontSize = baseFontSize;

///
//  Wheel Variables
///
let rotTime = baseRotTime;
let midRot;
let stage = 0;
let sTime;
// Rotations in grades <0; 355>
let rotation = 0;
let sRotation = 0;

/// 
// Colours
///
const colours = ['#00420e', '#00aa00'];
const selectionTriangleColour = '#ff2626'

/// 
// Number generation variables
/// 
const MAX_MAX = 100;
let min = 1;
let max = 34;

/// 
// References and other variables
/// 
let numberPool = [];
let isExcluded = new Array(max+1).fill(false);

window.addEventListener("load", init, true);
window.addEventListener("resize", resizeCanvas, false);

function init(){
    fillPool();
    requestAnimationFrame(drawWheel);
}

function setValues(){
    min = parseInt(document.getElementById("lowest_number").value);
    max = parseInt(document.getElementById("highest_number").value);
    max = Math.min(max, MAX_MAX);

    isExcluded = new Array(max+1).fill(false);
    let excludedInput = document.getElementById("excluded_numbers").value;
    let excludedList = excludedInput.split(",");

    for(var i = 0; i < excludedList.length; i++){
        let num = parseInt(excludedList[i].trim());

        if(!isNaN(num) && num >= min && num <= max){
            isExcluded[num] = true;
        }
    }

    fillPool();
    hideRangeForm();
}

function showRangeForm(){
    document.getElementById("range_form").style.display = "block";
}

function hideRangeForm(){
    document.getElementById("range_form").style.display = "none";
}

function fillPool(){
    numberPool = [];

    for (let i = min; i <= max; i++) {
        if(!isExcluded[i]){
            numberPool.push(i);
        }
    }

    shuffle(numberPool);
}

function shuffle(arr){
    for(let i=1; i<arr.length; i++){
        let toSwap = Math.floor(Math.random() * (i));
        
        arr[i] += arr[toSwap];
        arr[toSwap] = arr[i] - arr[toSwap];
        arr[i] -= arr[toSwap];
    }
}

function spinWheel(){
    stage = 1;

    rotTime = (Math.floor(Math.random() * numberPool.length) + 0.5) / numberPool.length * singleRotDuration + baseRotTime;
    midRot = (rotTime * maxVel) % 360;
}

function displayResult(){
    let angPerNumber = 360 / numberPool.length;
    let position = numberPool.length - Math.ceil(rotation / angPerNumber);
    let number = numberPool[position];
    //numberPool.splice(position, 1);

    document.getElementById("result_display").innerText = number;
}

/// 
//  WHEEL DRAWING
/// 

function resizeCanvas(){
    let wPer = window.innerWidth * widthPercentage / baseWidth;
    let hPer = window.innerHeight * heightPercentage / baseHeight;

    scalingPercentage = Math.min(wPer, hPer);

    // Updating variables
    width = baseWidth * scalingPercentage;
    height = baseHeight * scalingPercentage;
    radius = baseRadius * scalingPercentage;
    textRadius = baseTextRadius * scalingPercentage;
    selTriangleWidth = baseSelTriangleWidth * scalingPercentage;
    selTriangleHeight = baseSelTriangleHeight * scalingPercentage;
    fontSize = baseFontSize * scalingPercentage;

    // Updating canvas
    canvas.width = width;
    canvas.height = height;
}

function drawWheelPart(number, colour){
    // Rotation is converted into radians for use in trigonometric functions.
    let sAng = 2*Math.PI * number/numberPool.length + rotation * Math.PI / 180;
    let eAng = 2*Math.PI * (number+1)/numberPool.length + rotation * Math.PI / 180;

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
    let rotAngle = 2*Math.PI * (number + 0.5)/numberPool.length + rotation * Math.PI / 180
    ctx.rotate(rotAngle);

    /// <todo>
    /// - Add ability to apply style from css sheets.
    //  - CHange font size based on number of parts.
    /// </todo>

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(val, textRadius, baseTextOffset * scalingPercentage);

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
    
            displayResult();
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
    for(let i=0; i<numberPool.length; i++){
        drawWheelPart(i, getPartColour(i));
        drawText(i, numberPool[i]);
    }

    drawSelectionTriangle();

    requestAnimationFrame(drawWheel);
}

function drawSelectionTriangle(){
    ctx.beginPath();
    ctx.moveTo(width/2  + radius + selTriangleWidth/2, height/2 + selTriangleHeight/2);
    ctx.lineTo(width/2  + radius - selTriangleWidth/2, height/2);
    ctx.lineTo(width/2  + radius + selTriangleWidth/2, height/2 - selTriangleHeight/2);
    ctx.fillStyle = selectionTriangleColour;
    ctx.fill();
}