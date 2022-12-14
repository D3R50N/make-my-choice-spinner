//#region 
const list = document.getElementById("list");
const spin_btn = document.getElementById("spin_btn");
const add_btn = document.getElementById("add_btn");
const save_btn = document.getElementById("save_btn");

const cv = document.createElement("canvas");
const cx = cv.getContext("2d");
document.getElementById("canvasRenderer").appendChild(cv);

var cb, resolution, cw, ch, ratio, center_x, center_y, spinner_radius, pointer_h, pointer_radius, pointer_semi_angle, final_text = "";


const rad = (angle) => angle * Math.PI / 180;

const tan = (angle) => Math.tan(rad(angle));

const rand = (max, min = 0) => parseInt(Math.random() * (max - min) + min);

const randomColor = () => `rgb(${rand(255)},${rand(255)},${rand(255)})`;

const isInInterval = (value, a, b) => value >= Math.min(a, b) && value <= Math.max(a, b);

const getMin = (index) => {
    return pie_angle * index;
}
const getMax = (index) => {
    return getMin(index) + pie_angle;
}

// Color picker
var colorPicker = new iro.ColorPicker(".colorPicker", {
    width: 150,
    color: "rgb(255, 0, 0)",
    borderWidth: 1,
    borderColor: "#fff",
});


var nbParts = list.children.length;
var pie_angle = 360 / nbParts;
var spin_angle = 0;
var colors = [];
var velocity = 0;
var decceleration = .99;
var canRun = true;
var has_started = false;


function spinnerBase() {
    cx.lineWidth = 5;
    cx.fillStyle = "#16161D";
    cx.strokeStyle = "#16161D";
    cx.beginPath();
    cx.arc(0, 0, spinner_radius, 0, rad(360));
    cx.fill();
    cx.stroke();
    cx.closePath();
}
function pointerBase() {
    cx.beginPath();
    if (has_started)
        cx.fillStyle = colors[getSpinIndex()];
    else
        cx.fillStyle = "white";

    cx.lineWidth = 2;

    const pointer_y = center_y - spinner_radius - pointer_h;
    const pointer_left_angle = rad(-90) - rad(pointer_semi_angle);
    const pointer_right_angle = rad(-90) + rad(pointer_semi_angle);

    cx.arc(center_x, pointer_y, pointer_radius, pointer_left_angle, pointer_right_angle);
    cx.lineTo(center_x, pointer_y);
    cx.lineTo(center_x - (pointer_radius * tan(pointer_semi_angle)), pointer_y - pointer_radius);
    cx.fill();
    cx.stroke();
    cx.closePath();
}

function drawPart(index) {
    if (colors[index] == null) {
        colors[index] = randomColor();
    }
    cx.fillStyle = colors[index];
    cx.strokeStyle = "#16161D";
    cx.lineWidth = 3;

    cx.beginPath();
    const prev_angle = -90 + 360 * (index) / nbParts;
    const part_angle = prev_angle + (360 / nbParts);

    cx.arc(0, 0, spinner_radius, rad(prev_angle), rad(part_angle));
    cx.lineTo(0, 0);
    cx.fill();
    cx.fillStyle = "black";
    cx.font = "40px arial"

    cx.closePath();
}
function drawAllParts() {
    for (let index = 0; index < nbParts; index++) {
        drawPart(index);
        list.children[index].querySelector(".dot").style.backgroundColor = colors[index];
        list.children[index].querySelector(".dot").dataset.index = index;
    }
}
function spin() {
    cx.save();
    cx.translate(center_x, center_y);
    cx.rotate(-rad(spin_angle));
    spinnerBase();
    drawAllParts();
    cx.restore();


    cx.fillStyle = colors[getSpinIndex()];
    cx.strokeStyle = "#16161D";
    const fontsize = 70;
    cx.font = fontsize + "px arial";
    cx.fillText(final_text, fontsize, center_y - spinner_radius - fontsize);
    cx.strokeText(final_text, fontsize, center_y - spinner_radius - fontsize);

    spin_angle += velocity;
    spin_angle %= 360;
    velocity *= decceleration; // slow down
    if (velocity < .1 && has_started) {
        showChoice();
    }
}

//? if wins
function showChoice() {
    velocity = 0;
    var s_index = getSpinIndex();
    list.children[s_index].style.translate = "-20px";
    list.children[s_index].querySelector("input").style.borderColor = colors[s_index];

    cx.fillStyle = colors[s_index];
    cx.strokeStyle = "#16161D";
    final_text = list.children[s_index].querySelector("input").value;
    setTimeout(() => canRun = false, 200);

}

function getSpinIndex() {
    for (let index = 0; index < nbParts; index++) {
        var min = getMin(index);
        var max = getMax(index);

        var toCheck = spin_angle;
        if (toCheck > getMax(nbParts - 1))
            toCheck = toCheck - 360;
        if (isInInterval(toCheck, min, max)) return index;
    }

}

function initCanvas() {
    cb = cv.getBoundingClientRect();
    resolution = 1;
    cw = cv.width = resolution * cb.width;
    ch = cv.height = resolution * cb.height;
    ratio = Math.min(cw / ch, ch / cw);
    center_x = cw / 2;
    center_y = ch / 2;

    spinner_radius = 300 * ratio;
    pointer_h = -15;
    pointer_radius = 30;
    pointer_semi_angle = pointer_radius / 2;

}



function addItem(value = "") {
    const div1 = document.createElement("div");
    div1.classList = "row my-2 item d-flex";
    const div2 = document.createElement("div");
    div2.classList = "m-1 rounded-circle p-1 dot pointer my-auto";
    const div3 = document.createElement("div");
    const input = document.createElement("input");
    input.classList = "form-control";
    input.value = value;
    div3.classList = "col";

    div3.appendChild(input);
    div1.appendChild(div2);
    div1.appendChild(div3);
    list.appendChild(div1);

    input.focus();
    autoChangeInput();

    nbParts = list.children.length;
    pie_angle = 360 / nbParts;
}

function autoChangeInput() {
    document.querySelectorAll("input").forEach((input, key) => {
        input.onchange = null;
        input.addEventListener("change", (e) => {
            if (key + 1 < document.querySelectorAll("input").length)
                document.querySelectorAll("input")
                    .item(key + 1).focus();
            else
                document.querySelectorAll("input")
                    .item(key).blur()
        });
    });
}


function loadSaved() {
    let tab1 = localStorage.getItem("saved_inputs");
    let tab2 = localStorage.getItem("saved_colors");

    if (tab1 == null || tab1 == undefined) return;
    if (tab2 == null || tab2 == undefined) return;
    
    tab1.split(",").forEach((value)=>addItem(value));

    tab2 = tab2.substring(0, tab2.length - 1);
    tab2 = tab2.split("/,");

    for (let index = 0; index < tab2.length; index++) {
        colors[index] = tab2[index];
    }

}

function run() {
    if (!canRun) return;
    cx.clearRect(0, 0, cw, ch);
    spin();
    pointerBase();
    requestAnimationFrame(run);
}

function after_color_picker(index){
    cx.clearRect(0, 0, cw, ch);

    cx.save();
    cx.translate(center_x, center_y);
    cx.rotate(-rad(spin_angle));
    spinnerBase();
    
    for (let index = 0; index < nbParts; index++) {
        drawPart(index);
        list.children[index].querySelector(".dot").style.backgroundColor = colors[index];
    }

    cx.restore();
    pointerBase();
}

save_btn.addEventListener("click", (e) => {
    let tab1 = [];
    let tab2 = [];
    for (const child of list.children) {
        tab1.push(child.querySelector("input").value);
        tab2.push(child.querySelector(".dot").style.backgroundColor + "/");
    }
    localStorage.setItem("saved_inputs", tab1);
    localStorage.setItem("saved_colors", tab2);
    alert("Saved");
})


add_btn.addEventListener("click", (e) => {
    if (list.children.length > 1) {
        var s_index = getSpinIndex()
        list.children[s_index].style.translate = "0px"
        list.children[s_index].querySelector("input").style.borderColor = "";
    }

    addItem();
    final_text = "";
    
    cx.clearRect(0, 0, cw, ch);

    cx.save();
    cx.translate(center_x, center_y);
    cx.rotate(-rad(spin_angle));
    spinnerBase();
    drawAllParts();
    cx.restore();
    pointerBase();

})
spin_btn.addEventListener("click", (e) => {

    if (list.children.length == 0) {
        alert("Add items first");
        return;
    }
    else if (list.children.length == 1) {
        alert("Add two or more items");
        return
    }
    final_text = "";

    has_started = true;
    var s_index = getSpinIndex()
    list.children[s_index].style.translate = "0px"
    list.children[s_index].querySelector("input").style.borderColor = "";
    velocity += rand(100, 5)
    decceleration = .99;
    canRun = true;
    run();
})
window.onresize = () => {
    initCanvas();
    spin();
    pointerBase();
}

$(document).ready(function() {

    var index = 0;

    $(document).on('click', '.dot', function(e) {
        
        // get the color and index of the dot
        var color = $(this).css('background-color');
        index = $(this).data('index');
        colorPicker.color.set(color);

    });

    colorPicker.on("color:change", function (color) {

        $('.picker_container').css('border', '1px solid ' + color.hexString);
        colors[index] = color.rgbString;

        spin();
        pointerBase();  
    });


})


loadSaved()
initCanvas();
spin();
pointerBase();
autoChangeInput();

//#endregion
