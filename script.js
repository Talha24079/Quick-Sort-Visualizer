const barsContainer = document.getElementById("bars-container");
const generateBtn = document.getElementById("generateBtn");
const sortBtn = document.getElementById("sortBtn");
const arrayInput = document.getElementById("arrayInput");
const setArrayBtn = document.getElementById("setArrayBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const speedSlider = document.getElementById("speedSlider");
const statusText = document.getElementById("status-text");

let array = [];
let originalArray = [];
let maxVal = 1;

let steps = [];
let currentStep = 0;
let isPlaying = false;
let playInterval = null;

function renderArray(arr) {
    barsContainer.innerHTML = "";
    maxVal = Math.max(...arr, 1);
    for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${(val / maxVal) * 380}px`;
        barsContainer.appendChild(bar);
    }
}

function generateArray(size = 30) {
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 350) + 10);
    }
    resetVisualizer();
}

function resetVisualizer() {
    stopPlayback();
    steps = [];
    currentStep = 0;
    originalArray = [...array];
    renderArray(array);
    statusText.innerText = "Ready to sort!";
    playPauseBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    sortBtn.disabled = false;
    generateBtn.disabled = false;
    setArrayBtn.disabled = false;
    arrayInput.disabled = false;
}

setArrayBtn.addEventListener("click", () => {
    const inputVal = arrayInput.value;
    if (inputVal) {
        const newArr = inputVal.split(",").map(num => parseInt(num.trim())).filter(num => !isNaN(num) && num > 0);
        if (newArr.length > 0) {
            array = newArr;
            resetVisualizer();
        }
    }
});

function partition(arr, start, end) {
    const pivotValue = arr[end];
    let pivotIndex = start;
    steps.push({ type: "pivot", idx: end, val: pivotValue, arrCopy: [...arr] });

    for (let i = start; i < end; i++) {
        steps.push({ type: "compare", i: i, j: end, val1: arr[i], val2: pivotValue, arrCopy: [...arr] });
        if (arr[i] < pivotValue) {
            steps.push({ type: "swap", i: i, j: pivotIndex, arrCopy: [...arr] });
            let temp = arr[i];
            arr[i] = arr[pivotIndex];
            arr[pivotIndex] = temp;
            steps.push({ type: "swap_done", i: i, j: pivotIndex, arrCopy: [...arr] });
            pivotIndex++;
        }
    }

    steps.push({ type: "swap", i: pivotIndex, j: end, arrCopy: [...arr] });
    let temp = arr[pivotIndex];
    arr[pivotIndex] = arr[end];
    arr[end] = temp;
    steps.push({ type: "swap_done", i: pivotIndex, j: end, arrCopy: [...arr] });

    return pivotIndex;
}

function quickSort(arr, start, end) {
    if (start >= end) {
        return;
    }
    let index = partition(arr, start, end);
    steps.push({ type: "placed", idx: index, arrCopy: [...arr] });
    quickSort(arr, start, index - 1);
    quickSort(arr, index + 1, end);
}

sortBtn.addEventListener("click", () => {
    sortBtn.disabled = true;
    generateBtn.disabled = true;
    setArrayBtn.disabled = true;
    arrayInput.disabled = true;
    
    steps = [];
    currentStep = 0;
    let arrCopy = [...array];
    quickSort(arrCopy, 0, arrCopy.length - 1);
    steps.push({ type: "done", arrCopy: [...arrCopy] });
    
    playPauseBtn.disabled = false;
    nextBtn.disabled = false;
    
    togglePlayback();
});

function updateVisualsForStep(stepIndex) {
    if (stepIndex < 0) {
        renderArray(originalArray);
        statusText.innerText = "Ready to sort!";
        prevBtn.disabled = true;
        return;
    }
    
    prevBtn.disabled = false;
    nextBtn.disabled = stepIndex >= steps.length - 1;

    const step = steps[stepIndex];
    const bars = document.getElementsByClassName("bar");
    
    for (let i = 0; i < bars.length; i++) {
        bars[i].className = "bar";
    }

    if (step.arrCopy) {
        for (let i = 0; i < step.arrCopy.length; i++) {
            bars[i].style.height = `${(step.arrCopy[i] / maxVal) * 380}px`;
        }
    }

    if (step.type === "pivot") {
        bars[step.idx].classList.add("red");
        statusText.innerText = `Selected Pivot: ${step.val}`;
    } else if (step.type === "compare") {
        bars[step.i].classList.add("yellow");
        bars[step.j].classList.add("red");
        statusText.innerText = `Comparing ${step.val1} with Pivot ${step.val2}`;
    } else if (step.type === "swap" || step.type === "swap_done") {
        bars[step.i].classList.add("orange");
        bars[step.j].classList.add("orange");
        statusText.innerText = `Swapping elements`;
    } else if (step.type === "placed") {
        bars[step.idx].classList.add("green");
        statusText.innerText = `Pivot placed in correct position`;
    } else if (step.type === "done") {
        for (let i = 0; i < bars.length; i++) bars[i].classList.add("green");
        statusText.innerText = `Array is sorted!`;
        stopPlayback();
        playPauseBtn.disabled = true;
    }
}

function playNextStep() {
    if (currentStep < steps.length) {
        updateVisualsForStep(currentStep);
        currentStep++;
    } else {
        stopPlayback();
    }
}

function playPrevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateVisualsForStep(currentStep - 1);
    }
}

function togglePlayback() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        playPauseBtn.innerText = "Pause";
        let speed = parseInt(speedSlider.max) - parseInt(speedSlider.value) + parseInt(speedSlider.min);
        playInterval = setInterval(playNextStep, speed);
    } else {
        stopPlayback();
    }
}

function stopPlayback() {
    isPlaying = false;
    playPauseBtn.innerText = "Play";
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
}

speedSlider.addEventListener("input", () => {
    if (isPlaying) {
        stopPlayback();
        togglePlayback();
    }
});

playPauseBtn.addEventListener("click", togglePlayback);

nextBtn.addEventListener("click", () => {
    stopPlayback();
    playNextStep();
});

prevBtn.addEventListener("click", () => {
    stopPlayback();
    playPrevStep();
});

generateBtn.addEventListener("click", () => generateArray());

generateArray();
