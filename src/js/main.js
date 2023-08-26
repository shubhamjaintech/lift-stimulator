let liftsState;
const getDefaultliftsState = (noOfLifts) => {
    let lifts = [];
    for (let i = 0; i < noOfLifts; i++) {
        lifts.push({
            id: `lift${i}`,
            currentFloor: 0,
            isMoving: false,
        })
    }
    return lifts;
};
const updateLiftsState = (liftId, isMoving, floor) => {
    for (let i = 0; i < liftsState.length; i++) {
        if (liftsState[i].id === liftId) {
            liftsState[i].isMoving = isMoving;
            liftsState[i].currentFloor = floor;
        }
    }
}
const findNearestAvailableLift = (targetFloor) => {
    let availableLifts = liftsState.filter((lift) => lift.isMoving === false);
    if (availableLifts.length === 0) return null;

    let closestLift = availableLifts[0];
    let minDistance = Math.abs(targetFloor - closestLift.currentFloor);
    for (let i = 1; i < availableLifts.length; i++) {
        const lift = availableLifts[i];
        const distance = Math.abs(targetFloor - lift.currentFloor);
        if (distance < minDistance) {
            closestLift = lift;
            minDistance = distance;
        }
    }
    return closestLift;

}
const openDoor = (nearestLiftEl) => {
    nearestLiftEl.classList.add('liftDoorOpen');
};

const closeDoor = (nearestLiftEl) => {
    nearestLiftEl.classList.remove('liftDoorOpen');
};

const moveLift = (nearestLiftEl, distanceToBeTravelled, floorDiff) => {
    nearestLiftEl.style.transform = `translateY(${distanceToBeTravelled}px)`;
    nearestLiftEl.style.transition = `transform ${floorDiff * 2}s ease`;
};

const waitForTime = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const openAndCloseDoor = async (nearestLiftEl, nearestLiftId, targetFloor) => {
    openDoor(nearestLiftEl);
    await waitForTime(2500);
    closeDoor(nearestLiftEl);
    await waitForTime(2500);
    updateLiftsState(nearestLiftId, false, targetFloor);
}
const callLift = async (targetFloor) => {
    const liftObj = findNearestAvailableLift(targetFloor);
    if (liftObj == null) {

    }
    else {
        const nearestLiftId = liftObj.id;
        const floorDiff = targetFloor - liftObj.currentFloor;
        const nearestLiftEl = document.getElementById(nearestLiftId);
        if (nearestLiftEl !== null) {
            const oldTransformStr = nearestLiftEl.style.transform;
            const oldPos = oldTransformStr ? parseInt(oldTransformStr.match(/translateY\((-?\d+)px\)/)[1]) : 0;
            const distanceToBeTravelled = oldPos - (floorDiff * 165);
            updateLiftsState(nearestLiftId, true, targetFloor);
            if (floorDiff === 0) {
                openAndCloseDoor(nearestLiftEl, nearestLiftId, targetFloor);
            } else {
                moveLift(nearestLiftEl, distanceToBeTravelled, Math.abs(floorDiff));
                await waitForTime(2000 * Math.abs(floorDiff));
                openAndCloseDoor(nearestLiftEl, nearestLiftId, targetFloor);
            }
        }
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
            floorHtml += `<div class="floor" id="floor${noOfFloors - i - 1}"><div class="btnContainer"><div class="liftButton" onclick="callLift(${noOfFloors - i - 1})" >Up</div> </div><div></div><div class="floorNo">Floor ${noOfFloors - i - 1} </div></div>`
        }
        else if (i == 0) {
            floorHtml += `<div class="floor" id="floor${noOfFloors - i - 1}"><div class="btnContainer"><div class="liftButton" onclick="callLift(${noOfFloors - i - 1})">Down</div> </div><div></div><div class="floorNo">Floor ${noOfFloors - i - 1} </div></div>`
        }
        else {
            floorHtml += `<div class="floor" id="floor${noOfFloors - i - 1}"><div class="btnContainer"><div class="liftButton" onclick="callLift(${noOfFloors - i - 1})">Up</div><div class="liftButton" onclick="callLift(${noOfFloors - i - 1})">Down</div> </div><div></div><div class="floorNo">Floor ${noOfFloors - i - 1} </div></div>`
        }
    }

    for (let i = 0; i < noOfLifts; i++) {
        liftHtml += `<div class="lift" id="lift${i}"> <div class="leftDoor"></div> Lift ${i} <div class="rightDoor"></div>  </div>`
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
        liftsState = getDefaultliftsState(noOfLifts);
    }
}
