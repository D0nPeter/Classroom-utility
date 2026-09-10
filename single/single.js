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
const baseTextRadius = 330;
const baseSelTriangleWidth = 30;
const baseSelTriangleHeight = 40;
const baseFontSize = 100;

const baseTextOffset = 40;

// If the pool size is bigger than this number text is scaled down.
const textScalingPoolSizeBorder = 12;

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
// colors
///
const selectionTrianglecolor = '#ff2626'

/// 
// Number generation variables
/// 
const MAX_MAX = 100;
let min = 1;
let max = 34;

/// 
// Other variables
/// 
let canvas;
let ctx;
let positionToRemove = -1;
let numberPool = [];
// Number states   0 - present    1 - excluded    2 - removed after being drawn
let numberState = new Array(max+1).fill(0);

window.addEventListener("load", initSingle, false);
window.addEventListener("resize", resizeCanvas, false);
window.addEventListener("themeChanged", themeChanged, false);

function initSingle(){
    canvas = document.getElementById("wheel_canvas");
    ctx = canvas.getContext("2d");

    numberState = new Array(max+1).fill(0);

    fillPool();
    resizeCanvas();
    requestAnimationFrame(drawWheel);
}

function themeChanged(){
    let theme_buttons = document.querySelectorAll("[id^=theme_]");

    theme_buttons.forEach(button => {
        button.style.fontWeight = "unset";
    });

    document.getElementById("theme_" + window.currentTheme).style.fontWeight = "bold";
}

function openSidenav() {
    document.getElementById("sidenav").style.width = "15%";

    document.getElementById("sidenav_button_right").style.display = "none";
    document.getElementById("sidenav_button_left").style.display = "block";
}

function closeSidenav() {
    document.getElementById("sidenav").style.width = "0";

    document.getElementById("sidenav_button_right").style.display = "block";
    document.getElementById("sidenav_button_left").style.display = "none";
}

function setValues(){
    min = parseInt(document.getElementById("lowest_number").value);
    max = parseInt(document.getElementById("highest_number").value);
    min = Math.max(min, 1);
    max = Math.min(max, MAX_MAX);

    while(numberState.length > max+1){
        numberState.pop();
    }
    while(numberState.length <= max){
        numberState.push(0);
    }

    let excludedInput = document.getElementById("excluded_numbers").value;
    let excludedList = excludedInput.split(",");

    for(let i = 0; i < max; i++){
        if(numberState[i] == 1){
            numberState[i] = 0;
        }
    }

    for(let i = 0; i < excludedList.length; i++){
        let num = parseInt(excludedList[i].trim());

        if(!isNaN(num) && num >= min && num <= max){
            numberState[num] = 1;
        }
    }

    fillPool();
    hideRangeForm();
}

function showRangeForm(){
    document.getElementById("range_form").style.display = "block";

    updateRangeFormFields();
}

function hideRangeForm(){
    document.getElementById("range_form").style.display = "none";
}

function updateRangeFormFields(){
    document.getElementById("lowest_number").value = min;
    document.getElementById("highest_number").value = max;

    let excluded_string = "";
    let removed_string = "";
    for(let i = 0; i < numberState.length; i++){
        if(numberState[i] == 1){
            excluded_string += `${i}, `;
        }else if(numberState[i] == 2){
            removed_string += `${i}, `;
        }
    }

    document.getElementById("excluded_numbers").value = excluded_string.substring(0, excluded_string.length - 2);

    if(removed_string.length){
        document.getElementById("removed_numbers").textContent = removed_string.substring(0, removed_string.length - 2);
    }else{
        document.getElementById("removed_numbers").textContent = window.translation["no-removed-numbers"];
    }
}

function fillPool(){
    numberPool = [];

    for (let i = min; i <= max; i++) {
        if(numberState[i] == 0){
            numberPool.push(i);
        }
    }

    shuffle(numberPool);
}

function refillPool(){
    for (let i = min; i <= max; i++) {
        if(numberState[i] == 2){
            numberState[i] = 0;
        }
    }

    fillPool();
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
    if(stage != 0){
        return;
    }
    stage = 1;
    document.getElementById("generate_button").disabled = true;
    
    positionToRemove = -1;
    document.getElementById("remove_button").style.display = "none";

    document.getElementById("result_display").innerText = "";

    rotTime = (Math.floor(Math.random() * numberPool.length) + 0.5) / numberPool.length * singleRotDuration + baseRotTime;
    midRot = (rotTime * maxVel) % 360;
}

function removeLastNumber(){
    if(positionToRemove == -1){
        return;
    }

    numberState[numberPool[positionToRemove]] = 2;
    numberPool.splice(positionToRemove, 1);
    
    positionToRemove = -1;
    document.getElementById("remove_button").style.display = "none";
}

function displayResult(){
    let angPerNumber = 360 / numberPool.length;
    positionToRemove = numberPool.length - Math.ceil(rotation / angPerNumber);
    let number = numberPool[positionToRemove];

    document.getElementById("generate_button").disabled = false;
    document.getElementById("remove_button").style.display = "block";
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

function drawWheelPart(number, color){
    // Rotation is converted into radians for use in trigonometric functions.
    let sAng = 2*Math.PI * number/numberPool.length + rotation * Math.PI / 180;
    let eAng = 2*Math.PI * (number+1)/numberPool.length + rotation * Math.PI / 180;

    let sX = Math.cos(sAng)*radius + width/2;
    let eX = Math.cos(eAng)*radius + width/2;

    let sY = height/2 + Math.sin(sAng)*radius;
    let eY = height/2 + Math.sin(eAng)*radius;

    ctx.fillStyle = color;

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
    /// </todo>

    let displayFont = fontSize;
    let textRadiusOffset = 0;
    let textVertOffset = baseTextOffset * scalingPercentage;

    if(numberPool.length > textScalingPoolSizeBorder){
        let poolSizeFactor = textScalingPoolSizeBorder / (numberPool.length);
        displayFont = fontSize * poolSizeFactor
        textRadiusOffset = (fontSize - displayFont) / 2;
        textVertOffset *= poolSizeFactor;
    }

    ctx.font = `${displayFont}px Arial`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(val, textRadius + textRadiusOffset, textVertOffset);

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

function getColor(element){
    let style = window.getComputedStyle(document.getElementById(element));
    return style.getPropertyValue('color');
}

function getPartcolor(number){
    let wheelcolors = ['#000000', '#888888', '#FFFFFF'];

    wheelcolors[0] = getColor("wheel_color_1");
    wheelcolors[1] = getColor("wheel_color_2");
    wheelcolors[2] = getColor("wheel_color_3");

    if(numberPool.length%3 != 1 || number != numberPool.length-1){
        return wheelcolors[number%3];
    }

    return wheelcolors[1];
}

function drawWheel(timestamp){
    calculateRotation(timestamp);

    ctx.clearRect(0, 0, width, height);
    for(let i=0; i<numberPool.length; i++){
        drawWheelPart(i, getPartcolor(i));
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
    ctx.fillStyle = selectionTrianglecolor;
    ctx.fill();
}