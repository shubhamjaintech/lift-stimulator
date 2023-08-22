const getDefaultElevatorState = (noOfLifts) => {
    let lifts = [];
    for (let i = 0; i < noOfLifts; i++) {
        lifts.push({
            currentFloor: 0,
            isMoving: false,
        })
    }
    return {
        lifts,
    }
};


const generateBuildingLayout = (noOfFloors, noOfLifts, buildingEl) => {
    const floorContainerEl = document.createElement('div');
    floorContainerEl.classList.add("floorContainer");

    const liftContainerEl = document.createElement('div');
    liftContainerEl.classList.add("liftContainer");
    let liftHtml = '';
    let floorHtml = '';

    for (let i = 0; i < noOfFloors; i++) {
        if (i == noOfFloors - 1) {
            floorHtml += `<div class="floor"><div class="btnContainer"><div class="liftButton">Up</div> </div><div></div><div class="floorNo">Floor ${noOfFloors - i - 1} </div></div>`
        }
        else if (i == 0) {
            floorHtml += `<div class="floor"><div class="btnContainer"><div class="liftButton">Down</div> </div><div></div><div class="floorNo">Floor ${noOfFloors - i - 1} </div></div>`
        }
        else {
            floorHtml += `<div class="floor"><div class="btnContainer"><div class="liftButton">Up</div><div class="liftButton">Down</div> </div><div></div><div class="floorNo">Floor ${noOfFloors - i - 1} </div></div>`
        }
    }

    for (let i = 0; i < noOfLifts; i++) {
        liftHtml += `<div class="lift"> Lift ${i} </div>`
    }
    floorContainerEl.innerHTML += floorHtml;
    liftContainerEl.innerHTML += (`<div></div>` + liftHtml + `<div></div>`);

    buildingEl.appendChild(floorContainerEl);
    buildingEl.appendChild(liftContainerEl);
}

const getErrorMsg = (noOfFloors, noOfLifts) => {
    let errorMsg = '';
    if (isNaN(noOfFloors) || isNaN(noOfLifts) || noOfFloors < 1 || noOfLifts < 1) {
        errorMsg = 'Please enter valid field values'
    }
    else if (noOfFloors > 10 || noOfLifts > 10) {
        errorMsg = 'Number. of floors/lifts should be <= 10'
    }
    return errorMsg;
}

const stimulate = () => {
    const noOfFloors = parseInt(document.getElementById('noOfFloors')?.value);
    const noOfLifts = parseInt(document.getElementById('noOfLifts')?.value);
    let errorMsg = getErrorMsg(noOfFloors, noOfLifts);
    if (errorMsg !== '') {
        document.querySelector('.stimulationError').innerHTML = errorMsg;

    }
    else {
        document.querySelector('.liftStimulationForm').style.display = 'none';
        const buildingEl = document.getElementById('building');
        buildingEl.innerHTML = '';
        generateBuildingLayout(noOfFloors, noOfLifts, buildingEl);
        // const defaultElevatorState = getDefaultElevatorState(noOfFloors, noOfLifts);
    }
}
