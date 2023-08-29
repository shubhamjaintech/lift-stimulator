let liftsState;
let processQueue = [];
const getDefaultLiftsState = (noOfLifts) => {
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
const initializeLiftsState = (noOfLifts) => {
    liftsState = getDefaultLiftsState(noOfLifts);
};
const updateLiftsState = (liftId, isMoving, floor) => {
    for (let i = 0; i < liftsState.length; i++) {
        if (liftsState[i].id === liftId) {
            liftsState[i].isMoving = isMoving;
            liftsState[i].currentFloor = floor;
        }
    }
}
const findNearestLift = (targetFloor) => {
    let availableLifts;
    availableLifts = liftsState.filter((lift) => lift.isMoving === false);
    if (availableLifts.length === 0) return null;
    let minDistance = Infinity;
    let nearestLift = null;
    for (let i = 0; i < availableLifts.length; i++) {
        const lift = availableLifts[i];
        const distance = Math.abs(targetFloor - lift.currentFloor);
        if (distance < minDistance) {
            minDistance = distance;
            nearestLift = lift;
        }
    }
    return nearestLift;
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

const processQueuedRequests = async () => {
    if (processQueue.length !== 0) {
        let processQueueCopy = processQueue;
        let targetFloor = processQueueCopy.shift();
        let liftObj = findNearestLift(targetFloor);
        if (liftObj !== null && targetFloor !== null) {
            const floorDiff = targetFloor - liftObj.currentFloor;
            const nearestLiftEl = document.getElementById(liftObj.id);
            if (nearestLiftEl !== null) {
                const distanceToBeTravelled = -(targetFloor * 165);
                updateLiftsState(liftObj.id, true, targetFloor);
                if (floorDiff === 0) {
                    await openAndCloseDoor(nearestLiftEl, liftObj.id, targetFloor);
                } else {
                    moveLift(nearestLiftEl, distanceToBeTravelled, Math.abs(floorDiff));
                    await waitForTime(2000 * Math.abs(floorDiff));
                    await openAndCloseDoor(nearestLiftEl, liftObj.id, targetFloor);
                }
            }
        }
        processQueue=processQueueCopy;
    }
}
const openAndCloseDoor = async (nearestLiftEl, nearestLiftId, targetFloor) => {
    openDoor(nearestLiftEl);
    await waitForTime(2500);
    closeDoor(nearestLiftEl);
    await waitForTime(2500);
    updateLiftsState(nearestLiftId, false, targetFloor);
    await processQueuedRequests();
}

const isProcessQueueAlreadyContainRequest = (targetFloor) => {
    for (let i = 0; i < processQueue.length; i++) {
        if (processQueue[i] === targetFloor) {
            return true;
        }
    }
    return false;
}
const isTargetFloorAlreadyContainsLift = (targetFloor) => {
    for (let i = 0; i < liftsState.length; i++) {
        if (liftsState[i].currentFloor === targetFloor && liftsState[i].isMoving ) {
            return true;
        }
    }
    return false;
}
const callLift = async (targetFloor) => {
    if (isProcessQueueAlreadyContainRequest(targetFloor) || isTargetFloorAlreadyContainsLift(targetFloor)) {
        return;
    }
    processQueue.push(targetFloor);
    let availableLifts = liftsState.filter((lift) => lift.isMoving === false);
    if (availableLifts.length === 0 || processQueue.length > 1) {
        return;
    }
    await processQueuedRequests();
}

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
        errorMsg = 'No. of Floors and Lifts should be <= 10'
    }
    else if (noOfFloors < noOfLifts) {
        errorMsg = 'No. of Lifts should be <= No. of Floors '
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
        document.querySelector('.backBtn').style.display = 'block';
        const buildingEl = document.getElementById('building');
        buildingEl.innerHTML = '';
        generateBuildingLayout(noOfFloors, noOfLifts, buildingEl);
        initializeLiftsState(noOfLifts);
        document.querySelector('.building').style.display = 'block';
    }
}

const reset =()=>{
    document.getElementById('noOfFloors').value='';
    document.getElementById('noOfLifts').value='';
    document.querySelector('.stimulationError').innerHTML='';
    document.querySelector('.liftStimulationForm').style.display = 'flex';
    document.querySelector('.building').style.display = 'none';
    document.querySelector('.backBtn').style.display = 'none';
}
