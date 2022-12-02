const list = document.getElementById("list");
const spin_btn = document.getElementById("spin_btn");
const add_btn = document.getElementById("add_btn");

const cv = document.createElement("canvas");
const cx = cv.getContext("2d");
document.getElementById("canvasRenderer").appendChild(cv);

var cb, resolution, cw, ch, ratio, center_x, center_y, spinner_radius, pointer_h, pointer_radius, pointer_semi_angle;


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
        list.children[index].querySelector(".dot").style.backgroundColor
            = colors[index];
    }
}
function spin() {
    cx.save();
    cx.translate(center_x, center_y);
    cx.rotate(-rad(spin_angle));
    spinnerBase();
    drawAllParts();
    cx.restore();

    spin_angle += velocity;
    spin_angle %= 360;
    velocity *= decceleration; // slow down
    if (velocity < .1 && has_started) {
        showChoice();
    }
}

function showChoice() {
    velocity = 0;
    var s_index = getSpinIndex();
    list.children[s_index].style.translate = "-20px";
    list.children[s_index].querySelector("input").style.borderColor = colors[s_index];
    canRun = false;

    cx.fillStyle = colors[s_index];
    cx.strokeStyle = "#16161D";
    cx.fillText(list.children[s_index].querySelector("input").value, -100, -200);
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

function run() {
    if (!canRun) return;
    cx.clearRect(0, 0, cw, ch);
    spin();
    pointerBase();
    requestAnimationFrame(run);
}


add_btn.addEventListener("click", (e) => {
    addItem();

    nbParts = list.children.length;
    pie_angle = 360 / nbParts;
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
    // spin_angle = 0;
    // colors = [];
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



function addItem() {
    const div1 = document.createElement("div");
    div1.classList = "row my-2 item d-flex";
    const div2 = document.createElement("div");
    div2.classList = "m-1 rounded-circle p-1 dot my-auto";
    const div3 = document.createElement("div");
    const input = document.createElement("input");
    input.classList = "form-control";
    div3.classList = "col";

    div3.appendChild(input);
    div1.appendChild(div2);
    div1.appendChild(div3);
    list.appendChild(div1);

    input.focus();
    autoChangeInput();
}

function autoChangeInput() {
    document.querySelectorAll("input").forEach((input, key) => {
        input.onchange = null;
            input.addEventListener("change", (e) => {
                console.log(key);
                if (key + 1 < document.querySelectorAll("input").length)
                    document.querySelectorAll("input")
                        .item(key + 1).focus();
                else 
                     document.querySelectorAll("input")
                        .item(key).blur()
            });
    });
}


initCanvas();
spin();
pointerBase();
autoChangeInput();