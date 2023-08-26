let liftsState;
let requestedFloors = [];
const getDefaultliftsState = (noOfLifts) => {
    let lifts = [];
    for (let i = 0; i < noOfLifts; i++) {
        lifts.push({
            id: `lift${i}`,
            currentFloor: 0,
            isMoving: false,
            requestedFloors: [],
        })
    }
    return lifts;
};
const initializeLiftsState = (noOfLifts) => {
    liftsState = getDefaultliftsState(noOfLifts);
};
const updateLiftsState = (liftId, isMoving, floor) => {
    for (let i = 0; i < liftsState.length; i++) {
        if (liftsState[i].id === liftId) {
            liftsState[i].isMoving = isMoving;
            liftsState[i].currentFloor = floor;
        }
    }
}
const findNearestLift = (liftsArr, targetFloor) => {
    if (liftsArr.length === 0) return null;
    let minDistance = Infinity;
    let nearestLift = null;

    for (let i = 0; i < liftsArr.length; i++) {
        const lift = liftsArr[i];
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

const openAndCloseDoor = async (nearestLiftEl, nearestLiftId, targetFloor) => {
    openDoor(nearestLiftEl);
    await waitForTime(2500);
    closeDoor(nearestLiftEl);
    await waitForTime(2500);
    updateLiftsState(nearestLiftId, false, targetFloor);
}
const processQueuedRequests = async (liftObj) => {
    const requestedFloors = liftObj.requestedFloors;
    if (requestedFloors.length > 0) {
        for(let i =0 ;i<requestedFloors.length;i++){
            const nextFloor = requestedFloors[i];
            const floorDiff = nextFloor - liftObj.currentFloor;
            const nearestLiftEl = document.getElementById(liftObj.id);
            
            if (nearestLiftEl !== null) {
                const oldTransformStr = nearestLiftEl.style.transform;
                const oldPos = oldTransformStr ? parseInt(oldTransformStr.match(/translateY\((-?\d+)px\)/)[1]) : 0;
                const distanceToBeTravelled = oldPos - (floorDiff * 165);
                updateLiftsState(liftObj.id, true, nextFloor);
    
                if (floorDiff === 0) {
                    openAndCloseDoor(nearestLiftEl, liftObj.id, nextFloor);
                } else {
                    moveLift(nearestLiftEl, distanceToBeTravelled, Math.abs(floorDiff));
                     await waitForTime(2000 * Math.abs(floorDiff)).then(async () => {
                        await openAndCloseDoor(nearestLiftEl, liftObj.id, nextFloor);
                    });
                }
            }
        }
     
    }
    liftObj.requestedFloors =[];
};

const callLift = async (targetFloor) => {
    let availableLifts = liftsState.filter((lift) => lift.isMoving === false);
    const liftObj = findNearestLift(availableLifts, targetFloor);
    if (liftObj == null) {
        const nearestLiftObj = findNearestLift(liftsState, targetFloor);
        if (nearestLiftObj !== null) {
            nearestLiftObj.requestedFloors.push(targetFloor);
        }
    } else {
        const nearestLiftId = liftObj.id;
        const floorDiff = targetFloor - liftObj.currentFloor;
        const nearestLiftEl = document.getElementById(nearestLiftId);
        if (nearestLiftEl !== null) {
            const oldTransformStr = nearestLiftEl.style.transform;
            const oldPos = oldTransformStr ? parseInt(oldTransformStr.match(/translateY\((-?\d+)px\)/)[1]) : 0;
            const distanceToBeTravelled = oldPos - (floorDiff * 165);
            updateLiftsState(nearestLiftId, true, targetFloor);
            if (floorDiff === 0) {
                await openAndCloseDoor(nearestLiftEl, nearestLiftId, targetFloor);
            } else {
                moveLift(nearestLiftEl, distanceToBeTravelled, Math.abs(floorDiff));
                await waitForTime(2000 * Math.abs(floorDiff));
                await openAndCloseDoor(nearestLiftEl, nearestLiftId, targetFloor);
            }
            await processQueuedRequests(liftObj); 
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
        initializeLiftsState(noOfLifts);
    }
}
