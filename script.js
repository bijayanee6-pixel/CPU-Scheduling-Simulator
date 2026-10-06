let processes = [];


// ===============================
// DOM ELEMENTS
// ===============================

const algorithmSelect =
    document.getElementById("algorithm");

const quantumContainer =
    document.getElementById("quantumContainer");

const quantumInput =
    document.getElementById("quantum");

const processIdInput =
    document.getElementById("processId");

const arrivalInput =
    document.getElementById("arrivalTime");

const burstInput =
    document.getElementById("burstTime");

const priorityInput =
    document.getElementById("priority");

const processTable =
    document.getElementById("processTable");


// ===============================
// ALGORITHM CHANGE
// ===============================

algorithmSelect.addEventListener("change", () => {

    if (algorithmSelect.value === "RR") {

        quantumContainer.classList.remove("hidden");

    } else {

        quantumContainer.classList.add("hidden");

    }

});


// ===============================
// ADD PROCESS
// ===============================

document.getElementById("addProcess")
    .addEventListener("click", addProcess);


function addProcess() {

    const id = processIdInput.value.trim();

    const arrival =
        Number(arrivalInput.value);

    const burst =
        Number(burstInput.value);

    const priority =
        Number(priorityInput.value);


    if (!id) {

        alert("Enter a Process ID.");

        return;
    }


    if (arrival < 0 || isNaN(arrival)) {

        alert("Enter a valid arrival time.");

        return;
    }


    if (burst <= 0 || isNaN(burst)) {

        alert("Burst time must be greater than 0.");

        return;
    }


    if (priority <= 0 || isNaN(priority)) {

        alert("Priority must be greater than 0.");

        return;
    }


    if (processes.some(p => p.id === id)) {

        alert("Process ID already exists.");

        return;
    }


    processes.push({

        id: id,

        arrival: arrival,

        burst: burst,

        priority: priority

    });


    renderProcessTable();


    processIdInput.value = "";

    arrivalInput.value = "";

    burstInput.value = "";

    priorityInput.value = "";

}


// ===============================
// RENDER PROCESS TABLE
// ===============================

function renderProcessTable() {

    processTable.innerHTML = "";


    processes.forEach((process, index) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${process.id}</td>

            <td>${process.arrival}</td>

            <td>${process.burst}</td>

            <td>${process.priority}</td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteProcess(${index})">

                    Delete

                </button>

            </td>

        `;


        processTable.appendChild(row);

    });

}


// ===============================
// DELETE PROCESS
// ===============================

function deleteProcess(index) {

    processes.splice(index, 1);

    renderProcessTable();

}


// ===============================
// FCFS
// ===============================

function fcfs(inputProcesses) {

    const list =
        [...inputProcesses]
            .sort((a, b) => {

                if (a.arrival !== b.arrival) {

                    return a.arrival - b.arrival;

                }

                return a.originalIndex -
                    b.originalIndex;

            });


    let time = 0;

    const timeline = [];

    const results = [];


    list.forEach(process => {

        if (time < process.arrival) {

            timeline.push({

                id: "IDLE",

                start: time,

                end: process.arrival

            });

            time = process.arrival;

        }


        const start = time;

        const end =
            start + process.burst;


        timeline.push({

            id: process.id,

            start: start,

            end: end

        });


        results.push({

            ...process,

            completion: end,

            turnaround:
                end - process.arrival,

            waiting:
                start - process.arrival,

            response:
                start - process.arrival

        });


        time = end;

    });


    return {

        timeline,

        results

    };

}


// ===============================
// SJF NON-PREEMPTIVE
// ===============================

function sjf(inputProcesses) {

    const remaining =
        inputProcesses.map(p => ({
            ...p
        }));


    const timeline = [];

    const results = [];

    let time = 0;


    while (remaining.length > 0) {

        const available =
            remaining.filter(
                p => p.arrival <= time
            );


        if (available.length === 0) {

            const next =
                remaining.reduce(
                    (a, b) =>
                        a.arrival < b.arrival
                            ? a
                            : b
                );


            timeline.push({

                id: "IDLE",

                start: time,

                end: next.arrival

            });


            time = next.arrival;

            continue;

        }


        available.sort((a, b) => {

            if (a.burst !== b.burst) {

                return a.burst - b.burst;

            }

            return a.arrival - b.arrival;

        });


        const process =
            available[0];


        const index =
            remaining.findIndex(
                p => p.id === process.id
            );


        remaining.splice(index, 1);


        const start = time;

        const end =
            time + process.burst;


        timeline.push({

            id: process.id,

            start: start,

            end: end

        });


        results.push({

            ...process,

            completion: end,

            turnaround:
                end - process.arrival,

            waiting:
                start - process.arrival,

            response:
                start - process.arrival

        });


        time = end;

    }


    return {

        timeline,

        results

    };

}


// ===============================
// SRTF
// ===============================

function srtf(inputProcesses) {

    const remaining =
        inputProcesses.map(p => ({

            ...p,

            remaining: p.burst,

            firstStart: null,

            completion: null

        }));


    const timeline = [];

    let time = 0;

    let completed = 0;

    let lastProcess = null;

    let segmentStart = 0;


    while (
        completed < remaining.length
    ) {

        const available =
            remaining.filter(
                p =>
                    p.arrival <= time &&
                    p.remaining > 0
            );


        let current = null;


        if (available.length > 0) {

            available.sort((a, b) => {

                if (
                    a.remaining !==
                    b.remaining
                ) {

                    return a.remaining -
                        b.remaining;

                }

                if (
                    a.arrival !==
                    b.arrival
                ) {

                    return a.arrival -
                        b.arrival;

                }

                return a.originalIndex -
                    b.originalIndex;

            });


            current = available[0];

        }


        if (
            current?.id !== lastProcess?.id
        ) {

            if (lastProcess !== null) {

                timeline.push({

                    id: lastProcess
                        ? lastProcess.id
                        : "IDLE",

                    start: segmentStart,

                    end: time

                });

            }


            segmentStart = time;

            lastProcess = current;

        }


        if (!current) {

            time++;

            continue;

        }


        if (current.firstStart === null) {

            current.firstStart = time;

        }


        current.remaining--;

        time++;


        if (current.remaining === 0) {

            current.completion = time;

            completed++;

        }

    }


    if (lastProcess !== null) {

        timeline.push({

            id: lastProcess.id,

            start: segmentStart,

            end: time

        });

    }


    const results =
        remaining.map(p => ({

            ...p,

            turnaround:
                p.completion - p.arrival,

            waiting:
                p.completion -
                p.arrival -
                p.burst,

            response:
                p.firstStart -
                p.arrival

        }));


    return {

        timeline,

        results

    };

}


// ===============================
// ROUND ROBIN
// ===============================

function roundRobin(
    inputProcesses,
    quantum
) {

    const list =
        inputProcesses
            .map(p => ({

                ...p,

                remaining: p.burst,

                firstStart: null

            }))
            .sort((a, b) => {

                if (a.arrival !== b.arrival) {

                    return a.arrival -
                        b.arrival;

                }

                return a.originalIndex -
                    b.originalIndex;

            });


    const queue = [];

    const timeline = [];

    let time = 0;

    let index = 0;

    let completed = 0;


    while (completed < list.length) {

        while (
            index < list.length &&
            list[index].arrival <= time
        ) {

            queue.push(list[index]);

            index++;

        }


        if (queue.length === 0) {

            const next =
                list[index];

            timeline.push({

                id: "IDLE",

                start: time,

                end: next.arrival

            });


            time = next.arrival;

            continue;

        }


        const process =
            queue.shift();


        if (process.firstStart === null) {

            process.firstStart = time;

        }


        const execution =
            Math.min(
                quantum,
                process.remaining
            );


        const start = time;

        time += execution;

        process.remaining -= execution;


        timeline.push({

            id: process.id,

            start: start,

            end: time

        });


        while (
            index < list.length &&
            list[index].arrival <= time
        ) {

            queue.push(list[index]);

            index++;

        }


        if (process.remaining > 0) {

            queue.push(process);

        } else {

            process.completion = time;

            completed++;

        }

    }


    const results =
        list.map(p => ({

            ...p,

            turnaround:
                p.completion -
                p.arrival,

            waiting:
                p.completion -
                p.arrival -
                p.burst,

            response:
                p.firstStart -
                p.arrival

        }));


    return {

        timeline,

        results

    };

}


// ===============================
// PRIORITY SCHEDULING
// ===============================

function priorityScheduling(
    inputProcesses
) {

    const remaining =
        inputProcesses.map(p => ({
            ...p
        }));


    const timeline = [];

    const results = [];

    let time = 0;


    while (remaining.length > 0) {

        const available =
            remaining.filter(
                p => p.arrival <= time
            );


        if (available.length === 0) {

            const next =
                remaining.reduce(
                    (a, b) =>
                        a.arrival < b.arrival
                            ? a
                            : b
                );


            timeline.push({

                id: "IDLE",

                start: time,

                end: next.arrival

            });


            time = next.arrival;

            continue;

        }


        available.sort((a, b) => {

            if (
                a.priority !==
                b.priority
            ) {

                return a.priority -
                    b.priority;

            }

            if (
                a.arrival !==
                b.arrival
            ) {

                return a.arrival -
                    b.arrival;

            }

            return a.originalIndex -
                b.originalIndex;

        });


        const process =
            available[0];


        const index =
            remaining.findIndex(
                p => p.id === process.id
            );


        remaining.splice(index, 1);


        const start = time;

        const end =
            start + process.burst;


        timeline.push({

            id: process.id,

            start: start,

            end: end

        });


        results.push({

            ...process,

            completion: end,

            turnaround:
                end - process.arrival,

            waiting:
                start - process.arrival,

            response:
                start - process.arrival

        });


        time = end;

    }


    return {

        timeline,

        results

    };

}


// ===============================
// SIMULATION
// ===============================

document.getElementById("simulateBtn")
    .addEventListener(
        "click",
        runSimulation
    );


function runSimulation() {

    if (processes.length === 0) {

        alert(
            "Please add at least one process."
        );

        return;

    }


    const algorithm =
        algorithmSelect.value;


    const input =
        processes.map(
            (p, index) => ({

                ...p,

                originalIndex: index

            })
        );


    let simulation;


    switch (algorithm) {

        case "FCFS":

            simulation =
                fcfs(input);

            break;


        case "SJF":

            simulation =
                sjf(input);

            break;


        case "SRTF":

            simulation =
                srtf(input);

            break;


        case "RR":

            const quantum =
                Number(
                    quantumInput.value
                );


            if (quantum <= 0) {

                alert(
                    "Enter a valid time quantum."
                );

                return;

            }


            simulation =
                roundRobin(
                    input,
                    quantum
                );

            break;


        case "PRIORITY":

            simulation =
                priorityScheduling(input);

            break;

    }


    displayResults(simulation);

}


// ===============================
// DISPLAY RESULTS
// ===============================

function displayResults(simulation) {

    const results =
        simulation.results;


    const timeline =
        simulation.timeline;


    const resultTable =
        document.getElementById(
            "resultTable"
        );


    resultTable.innerHTML = "";


    results
        .sort(
            (a, b) =>
                a.originalIndex -
                b.originalIndex
        )
        .forEach(process => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${process.id}</td>

                <td>${process.arrival}</td>

                <td>${process.burst}</td>

                <td>${process.priority}</td>

                <td>${process.completion}</td>

                <td>${process.turnaround}</td>

                <td>${process.waiting}</td>

                <td>${process.response}</td>

            `;


            resultTable.appendChild(row);

        });


    displayGantt(timeline);

    calculateStatistics(
        results,
        timeline
    );


    document
        .getElementById("results")
        .classList.remove("hidden");

}


// ===============================
// GANTT CHART
// ===============================

function displayGantt(timeline) {

    const container =
        document.getElementById(
            "ganttChart"
        );


    container.innerHTML = "";


    if (timeline.length === 0) {

        return;

    }


    const totalTime =
        timeline[timeline.length - 1].end;


    timeline.forEach(segment => {

        const block =
            document.createElement("div");


        block.className =
            "gantt-block";


        const duration =
            segment.end -
            segment.start;


        block.style.width =
            `${Math.max(
                duration * 60,
                80
            )}px`;


        block.innerHTML = `

            <span>
                ${segment.id}
                <br>
                ${segment.start} - ${segment.end}
            </span>

        `;


        container.appendChild(block);

    });

}


// ===============================
// STATISTICS
// ===============================

function calculateStatistics(
    results,
    timeline
) {

    const n =
        results.length;


    const avgWaiting =
        results.reduce(
            (sum, p) =>
                sum + p.waiting,
            0
        ) / n;


    const avgTurnaround =
        results.reduce(
            (sum, p) =>
                sum + p.turnaround,
            0
        ) / n;


    const avgResponse =
        results.reduce(
            (sum, p) =>
                sum + p.response,
            0
        ) / n;


    const totalTime =
        timeline.length > 0
            ? timeline[timeline.length - 1].end
            : 0;


    const busyTime =
        timeline.reduce(
            (sum, segment) => {

                if (segment.id === "IDLE") {

                    return sum;

                }

                return sum +
                    (segment.end -
                     segment.start);

            },
            0
        );


    const utilization =
        totalTime > 0
            ? (busyTime /
               totalTime) * 100
            : 0;


    const throughput =
        totalTime > 0
            ? n / totalTime
            : 0;


    document.getElementById(
        "avgWaiting"
    ).textContent =
        avgWaiting.toFixed(2);


    document.getElementById(
        "avgTurnaround"
    ).textContent =
        avgTurnaround.toFixed(2);


    document.getElementById(
        "avgResponse"
    ).textContent =
        avgResponse.toFixed(2);


    document.getElementById(
        "cpuUtilization"
    ).textContent =
        utilization.toFixed(2) + "%";


    document.getElementById(
        "throughput"
    ).textContent =
        throughput.toFixed(3);

}


// ===============================
// SAMPLE DATA
// ===============================

document.getElementById("sampleBtn")
    .addEventListener(
        "click",
        loadSampleData
    );


function loadSampleData() {

    processes = [

        {
            id: "P1",
            arrival: 0,
            burst: 8,
            priority: 2
        },

        {
            id: "P2",
            arrival: 1,
            burst: 4,
            priority: 1
        },

        {
            id: "P3",
            arrival: 2,
            burst: 2,
            priority: 3
        },

        {
            id: "P4",
            arrival: 3,
            burst: 5,
            priority: 2
        }

    ];


    renderProcessTable();

}


// ===============================
// CLEAR ALL
// ===============================

document.getElementById("clearBtn")
    .addEventListener(
        "click",
        () => {

            processes = [];

            renderProcessTable();


            document
                .getElementById("results")
                .classList.add("hidden");

        }
    );