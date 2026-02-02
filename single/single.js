var min = 1;
var max = 34;
const MAX_MAX = 100;


var number_pool = [];
var is_excluded = new Array(max+1).fill(false);


function set_values(){
    min = parseInt(document.getElementById("lower_boundary").value);
    max = parseInt(document.getElementById("upper_boundary").value);
    max = Math.min(max, MAX_MAX);


    is_excluded = new Array(max+1).fill(false);
    var excluded_input = document.getElementById("excluded_numbers").value;
    var excluded_list = excluded_input.split(",");


    for(var i = 0; i < excluded_list.length; i++){
        var num = parseInt(excluded_list[i].trim());

        if(!isNaN(num) && num >= min && num <= max){
            is_excluded[num] = true;
        }
    }

    fill_pool();
    hide_range_form();
}

function show_range_form(){
    document.getElementById("select_range_form_parent").style.display = "block";
}

function hide_range_form(){
    document.getElementById("select_range_form_parent").style.display = "none";
}

function fill_pool(){
    number_pool = [];

    for (var i = min; i <= max; i++) {
        if(!is_excluded[i]){
            number_pool.push(i);
        }
    }
}

function random_single() {
    var position = Math.floor(Math.random() * number_pool.length);
    var random_value = number_pool[position];
    number_pool.splice(position, 1);

    document.getElementById("result_display").innerText = random_value;
}