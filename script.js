// Grid size form
const tableForm = document.querySelector("#foneForm");
const rowInput = document.querySelector("input#foneRows");
const colInput = document.querySelector("input#foneCols");

// The grid itself
const foneGrid = document.querySelector("#foneGrid tbody");
let mouseDown = false;

// Save form
const saveForm = document.querySelector("#saveForm");
const saveInput = document.querySelector("input#saveName");
const saveList = document.querySelector("ul#saveList");
let saveItems = [];

// Populate saveItems from localStorage
const getItems = JSON.parse(localStorage.getItem("rooms"));
if (getItems != null) {
    console.log(getItems);
    saveItems = getItems;
    console.log(saveItems);
    populateSaveList(saveItems);
}

// rows and columns desired by user
let rows = 20;
let cols = 40;

// rows and columns actually visible
let curRows = 0;    // start at 0 so updateTable() generates them
let curCols = cols; // start at 40 so updateTable() generates 40 cells per row

// rows and columns present in the DOM, including hidden ones
let totalRows = 0;
let totalCols = cols;

updateTable();

// User inputs new row or column number
tableForm.onchange = function(e) {
    let fieldValue = rowInput.value;
    if (fieldValue != null && fieldValue != "" && !isNaN(fieldValue)) {
        rows = parseInt(fieldValue);
        if (rows < 0) {
            rows = 20;
        }
    } else {
        rows = 20;
    }
    
    fieldValue = colInput.value;
    if (fieldValue != null && fieldValue != "" && !isNaN(fieldValue)) {
        cols = parseInt(fieldValue);
        if (cols < 0) {
            cols = 40;
        }
    } else {
        cols = 40;
    }

    updateTable();
    return false;
}

function updateTable() {
    //update rows
    if (curRows < rows) {
        // Make rows visible (if possible)
        for (let r = totalRows; r > curRows; r--) {
            if (r <= rows) {
                const nextRow = document.querySelector("#foneGrid #row" + r);
                nextRow.classList.toggle("hidden");
            }
        }

        // Add new rows (if necessary)
        let output = "";
        for (let r = totalRows+1; r <= rows; r++) {
            output += '<tr id="row' + r + '">';
            for (let c = 1; c <= curCols; c++) {
                output += '<td class="col' + c + '" onmousedown="forceFillCell(this)" onmouseover="fillCell(this)"></td>';
            }
            output += '</tr>';
        }
        foneGrid.innerHTML += output;

        // If new rows were added, update totalRows
        if (totalRows < rows) {
            totalRows = rows;
        }
    } else if (curRows > rows) {
        // Hide rows
        for (let r = curRows; r > rows; r--) {
            const nextRow = document.querySelector("#foneGrid #row" + r);
            nextRow.classList.toggle("hidden");
        }
    }
    curRows = rows;

    //update columns
    if (curCols < cols) {
        // Make columns visible (if possible)
        for (let r = 1; r <= totalRows; r++) {
            for (let c = curCols+1; c <= totalCols; c++) {
                if (c <= cols) {
                    const nextCell = document.querySelector("#foneGrid #row" + r + " .col" + c);
                    nextCell.classList.toggle("hidden");
                }
            }
        }

        // Add new columns (if necessary)
        for (let r = 1; r <= totalRows; r++) {
            let output = "";
            for (let c = totalCols+1; c <= cols; c++) {
                output += '<td class="col' + c + '" onmousedown="forceFillCell(this)" onmouseover="fillCell(this)"></td>';
            }
            const nextRow = document.querySelector("#foneGrid #row" + r);
            nextRow.innerHTML += output;
        }

        // If new columns were added, update totalCols
        if (totalCols < cols) {
            totalCols = cols;
        }
    } else if (curCols > cols) {
        // Hide columns
        for (let r = 1; r <= totalRows; r++) {
            for (let c = curCols; c > cols; c--) {
                const nextCell = document.querySelector("#foneGrid #row" + r + " .col" + c);
                nextCell.classList.toggle("hidden");
            }
        }
    }
    curCols = cols;
}

function fillCell(element) {
    if (mouseDown) {
        element.classList.toggle("filled");
    }
}

function forceFillCell(element) {
    element.classList.toggle("filled");
}

// User clicks "Save" to add a new map
saveForm.onsubmit = function(e) {
    event.preventDefault();
    let fieldValue = saveInput.value;

    if (fieldValue != null && fieldValue != "") {
        // Check if the name is already in use, and if so, override the data
        let newItem = true;
        for (let i = 0; i < saveItems.length; i++) {
            if (saveItems[i][0] == fieldValue) {
                newItem = false;
                saveItems[i] = [fieldValue, getGridData()];
                break;
            }
        }

        if (newItem) {
            saveItems.push([fieldValue, getGridData()]);
        }
        
        localStorage.setItem("rooms", JSON.stringify(saveItems));
        populateSaveList(saveItems);
        saveInput.value = "";
    }

    return false;
}

// Returns an array with the grid data
function getGridData() {
    const gridData = [];
    for (let r = 1; r <= curRows; r++) {
        let output = "";
        for (let c = 1; c <= curCols; c++) {
            const nextCell = document.querySelector("#foneGrid #row" + r + " .col" + c);
            if (nextCell.classList.contains("filled")) {
                output += "0";
            } else {
                output += "1";
            }
        }
        gridData.push(output);
    }
    return gridData;
}

// Clear the unordered list and add all elements from the array, in sorted order
function populateSaveList(items) {
    console.log(items);
    items.sort();
    saveList.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
        saveList.innerHTML += "<li><a href=\"#\" onclick=\"buildGrid(" + i + 
            "); return false;\">" + items[i][0] + "</a> " +
            "(<a href=\"#\" onclick=\"removeItem(" + i + "); return false;\">remove</a>)</li>";
    }
}

// Load data from saveItems based on the index and build the grid
function buildGrid(index) {
    console.log(saveItems[index]);
    const gridData = saveItems[index][1];

    // Resize the table
    rows = gridData.length;
    cols = gridData[0].length;
    updateTable();

    // Update grid size form
    rowInput.value = curRows;
    colInput.value = curCols;

    // Update save form
    saveInput.value = saveItems[index][0];

    // Fill/unfill sells as appropriate
    for (let r = 1; r <= curRows; r++) {
        let data = gridData[r-1];
        for (let c = 1; c <= curCols; c++) {
            const nextCell = document.querySelector("#foneGrid #row" + r + " .col" + c);
            if ((data.charAt(c-1) == "1" && nextCell.classList.contains("filled")) ||
            (data.charAt(c-1) == "0" && !nextCell.classList.contains("filled"))) {
                nextCell.classList.toggle("filled");
            }
        }
    }
}

// Remove a room from the list
function removeItem(index) {
    saveItems.splice(index, 1);
    localStorage.setItem("rooms", JSON.stringify(saveItems));
    populateSaveList(saveItems);
}

// Clear all cells, including hidden ones
function clearGrid() {
    for (let r = 1; r < totalRows; r++) {
        for (let c = 1; c < totalCols; c++) {
            const nextCell = document.querySelector("#foneGrid #row" + r + " .col" + c);
            if (nextCell.classList.contains("filled")) {
                nextCell.classList.toggle("filled");
            }
        }
    }
}

foneGrid.onmousedown = function(e) {
    console.log("mousedown");
    mouseDown = true;
}

foneGrid.onmouseup = function(e) {
    console.log("mouseup");
    mouseDown = false;
}