let min = 1;
let max = 34;
const MAX_MAX = 100;


let numberPool = [];
let isExcluded = new Array(max+1).fill(false);


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
    document.getElementById("range_form_parent").style.display = "block";
}

function hideRangeForm(){
    document.getElementById("range_form_parent").style.display = "none";
}

function fillPool(){
    numberPool = [];

    for (let i = min; i <= max; i++) {
        if(!isExcluded[i]){
            numberPool.push(i);
        }
    }
}

function randomSingle() {
    let position = Math.floor(Math.random() * numberPool.length);
    let randomValue = numberPool[position];
    numberPool.splice(position, 1);

    document.getElementById("result_display").innerText = randomValue;
}