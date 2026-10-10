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
const baseTextOuterOffset = 65;
const baseSelTriangleWidth = 30;
const baseSelTriangleHeight = 40;
const baseFontSize = 50;

const baseTextOffset = 20;

// If the pool size is bigger than this number text is scaled down.
const textScalingPoolSizeBorder = 12;
const textScalingLengthFactor = 10;

///
//  Wheel display variables
/// 
let scalingPercentage = 1;
let width = baseWidth;
let height = baseHeight;
let radius = baseRadius;
let textOuterOffset = baseTextOuterOffset;
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
// Text constants
/// 
const COUNT_MAX = 12;
const MAX_TEXT_LEN = 36;

/// 
// Other variables
/// 
let canvas;
let ctx;
let positionToRemove = -1;
let textPool = ["Option 1", "Option 2", "Option 3"];
let futurePool = [];

window.addEventListener("load", initSingle, false);
window.addEventListener("resize", resizeCanvas, false);
window.addEventListener("themeChanged", themeChanged, false);

function initSingle(){
    canvas = document.getElementById("wheel_canvas");
    ctx = canvas.getContext("2d");

    textPool.forEach( text => {
        futurePool.push(text);
    })

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

function confirmChanges(){
    textPool = futurePool;
    hideRangeForm();
}

function cancelChanges(){
    futurePool = textPool;
    hideRangeForm();
}

function showModificationForm(){
    document.getElementById("modification_form").style.display = "block";
    reloadTextBoxes();
}

function hideRangeForm(){
    document.getElementById("modification_form").style.display = "none";
}

function addText(){
    if(textPool.length == COUNT_MAX){
        return;
    }

    try{
        futurePool.push(document.getElementById("new_text_input").value.substring(0, MAX_TEXT_LEN-1));
    }catch{
        console.warn("Tried adding text with text additon input field absent.");
    }

    reloadTextBoxes();
}

function removeAtPos(pos){
    futurePool.splice(pos, 1);
    reloadTextBoxes();
}

function removeLastNumber(){
    if(positionToRemove == -1){
        return;
    }

    textPool.splice(positionToRemove, 1);
    futurePool = textPool
    
    positionToRemove = -1;
    document.getElementById("remove_button").style.display = "none";
}

function reloadTextBoxes(){
    let parent = document.getElementById("modification_form_text_parent");
    while(parent.lastChild != null){
        parent.removeChild(parent.lastChild);
    }

    for(let i=0; i<futurePool.length; i++){
        drawTextBox(i);
    }
    if(futurePool.length < COUNT_MAX){
        drawAddBox();
    }
}

function drawTextBox(pos){
    let modificationTextBox = document.createElement("div");
    modificationTextBox.setAttribute("class", "modification_text_box");

    let paragraph = document.createElement("p");
    paragraph.appendChild(document.createTextNode(futurePool[pos]));
    modificationTextBox.append(paragraph);

    let button = document.createElement("button");
    button.appendChild(document.createTextNode(window.translation["remove"]))
    button.setAttribute("data-i18n", "remove");
    button.setAttribute("onclick", `removeAtPos(${pos})`);
    modificationTextBox.append(button);

    document.getElementById("modification_form_text_parent").append(modificationTextBox);
}

function drawAddBox(){
    let addTextBox = document.createElement("div");
    addTextBox.setAttribute("class", "modification_text_box");

    let input = document.createElement("input");
    input.setAttribute("id", "new_text_input")
    input.setAttribute("placeholder", window.translation["enter-text"]);
    input.setAttribute("data-i18n-placeholder", "enter-text");
    addTextBox.append(input);

    let button = document.createElement("button");
    button.appendChild(document.createTextNode(window.translation["add"]))
    button.setAttribute("class", "modification_add_button");
    button.setAttribute("data-i18n", "add");
    button.setAttribute("onclick", "addText()");
    addTextBox.append(button);

    document.getElementById("modification_form_text_parent").append(addTextBox);
}

function spinWheel(){
    if(stage != 0 || textPool.length == 0){
        return;
    }
    stage = 1;
    document.getElementById("generate_button").disabled = true;
    
    positionToRemove = -1;
    document.getElementById("remove_button").style.display = "none";

    document.getElementById("result_display").innerText = "";

    rotTime = (Math.floor(Math.random() * textPool.length) + 0.5) / textPool.length * singleRotDuration + baseRotTime;
    midRot = (rotTime * maxVel) % 360;
}

function displayResult(){
    let angPerNumber = 360 / textPool.length;
    positionToRemove = textPool.length - Math.ceil(rotation / angPerNumber);
    let result = textPool[positionToRemove];

    document.getElementById("generate_button").disabled = false;
    document.getElementById("remove_button").style.display = "block";
    document.getElementById("result_display").innerText = result;
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
    textOuterOffset = baseTextOuterOffset * scalingPercentage;
    selTriangleWidth = baseSelTriangleWidth * scalingPercentage;
    selTriangleHeight = baseSelTriangleHeight * scalingPercentage;
    fontSize = baseFontSize * scalingPercentage;

    // Updating canvas
    canvas.width = width;
    canvas.height = height;
}

function drawWheelPart(number, color){
    // Rotation is converted into radians for use in trigonometric functions.
    let sAng = 2*Math.PI * number/textPool.length + rotation * Math.PI / 180;
    let eAng = 2*Math.PI * (number+1)/textPool.length + rotation * Math.PI / 180;

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

function drawText(number, text){
    ctx.save();
    ctx.translate(width/2, height/2);
    let rotAngle = 2*Math.PI * (number + 0.5)/textPool.length + rotation * Math.PI / 180
    ctx.rotate(rotAngle);

    /// <todo>
    /// - Add ability to apply style from css sheets.
    /// </todo>

    let displayFont = fontSize;
    let textVertOffset = baseTextOffset * scalingPercentage;

    if(textPool.length > textScalingPoolSizeBorder){
        let poolSizeFactor = textScalingPoolSizeBorder / textPool.length;
        displayFont *= poolSizeFactor
        textVertOffset *= poolSizeFactor;
    }

    if(text.length > textScalingLengthFactor){
        let lenghtFactor = textScalingLengthFactor / text.length;
        displayFont *= lenghtFactor;
        textVertOffset *= lenghtFactor;
    }

    let textLength = text.length * displayFont/5; 
    let textRadius = radius - textLength - textOuterOffset;

    ctx.font = `${displayFont}px Arial`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(text, textRadius, textVertOffset);

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

    if(textPool.length%3 != 1 || number != textPool.length-1){
        return wheelcolors[number%3];
    }

    return wheelcolors[1];
}

function drawWheel(timestamp){
    calculateRotation(timestamp);

    ctx.clearRect(0, 0, width, height);
    for(let i=0; i<textPool.length; i++){
        drawWheelPart(i, getPartcolor(i));
        drawText(i, textPool[i]);
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