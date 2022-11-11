//* ============================= Global Variables ============================= //

// ========= Dom Elements ========= //

// Form
const formEl = document.querySelector('.form');
const formInputEls = document.querySelectorAll('.form__input');
const taskTitleEl = document.querySelector('#task-title');
const taskCategoryEl = document.querySelector('#task-category');
const taskDateEl = document.querySelector('#task-date');
const taskDescEl = document.querySelector('#task-description');
const addTaskBtn = document.querySelector('.form__btn');
const taskInputs = document.querySelectorAll('.form__input');

// Lists
const mainListEl = document.querySelector('.list--main');
const importantListEl = document.querySelector('.list--important');
const lists = document.querySelectorAll('.list');

// Sort Button
const sortBtnWrapper = document.querySelector('.list__btn--sort-wrapper');
const sortBtn = document.querySelector('.list__btn--sort');

// Clear Buttons
const clearMainBtnWrapper = document.querySelector('#clear-main-btn-wrapper');
const clearMainBtn = document.querySelector('#clear-main-btn');
const clearImportantBtnWrapper = document.querySelector('#clear-important-btn-wrapper');
const clearImportantBtn = document.querySelector('#clear-important-btn');

// No Tasks Added Elements
const noTasksImportant = document.querySelector('#no-tasks-important');
const noTasksMain = document.querySelector('#no-tasks-main');

// Alert Div
const alert = document.querySelector('.alert');


// ========= Other ========= //
const currentDate = new Date();
let tasksArr = [];
let mainTasksArr = [];
let importantTasksArr = [];
let order = getItemFromLs('order') ? getItemFromLs('order') : 'asc';
let editFlag = false;
let editId;
let displayTimeout;




//* ============================= Event Listeners ============================= //

// Get Items from Local Storage(if any)
window.addEventListener('DOMContentLoaded', () => {
    loadItemsFromLs();
    updateLists();
    updateElementsContent();
    checkListsStatus();
    displayListItems(order);
})

// Add/Edit Task Action
addTaskBtn.addEventListener('click', evt => {

    evt.preventDefault();

    const validation = validateInputs();


    if (validation) {

        if (!editFlag) {
            addTaskObj();
            updateLists();
            checkListsStatus();
            displayListItems(order);
            displayAlert('Task Added Successfully', 'success');
            setBackToDefault();
        } else {
            saveEditedTask(editId);
            displayListItems(order);
            displayAlert('Task Edited Successfully', 'success');
            setBackToDefault();
        }
    } else {
        displayAlert('Please fill out all fields', 'danger')
    }


})


// Change Sort Order Action
sortBtn.addEventListener('click', () => {
    changeListOrder();
})


// Task Manipulation Actions
lists.forEach(list => {
    list.addEventListener('click', evt => {

        const target = evt.target;

        if (target.closest('.list__item')) { //Check if  clicked in a li element

            const parentLiEl = target.closest('.list__item');
            const liElId = parentLiEl.dataset.id;

            if (target.classList.contains('fa-edit')) {
                editTask(liElId);
            } else if (target.classList.contains('fa-clone')) {
                duplicateTask(liElId);
            } else if (target.classList.contains('fa-trash')) {
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(liElId);
                    displayAlert('Task Deleted Successfully', 'danger');
                }
            } else if (target.classList.contains('fa-star')) {
                markImportantTask(liElId);
                displayAlert('Task Marked as Important', 'success')
            }
        }
    })
})


// Clear Lists Actions
clearImportantBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all important tasks?')) {
        clearList('important');
        displayAlert('Important Tasks List Cleared', 'danger');
    }
})


clearMainBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all main tasks?')) {
        clearList('main');
        displayAlert('Main Tasks List Cleared', 'danger');
    }
})


// Validate Inputs on Input Change Action
taskInputs.forEach(input => {
    input.addEventListener('input', () => {
        const validation = validateInputs();
        if (validation) {
            addTaskBtn.classList.remove('disabled');
        } else {
            addTaskBtn.classList.add('disabled');
        }
    })
})




//* ============================= Functions ============================= //


// ========= Main Functions ========= //

function addTaskObj() {

    // Capture User Inputs
    const taskTitleValue = taskTitleEl.value;
    const taskCategoryValue = taskCategoryEl.value;
    const taskDateValue = taskDateEl.value;
    const taskDescValue = taskDescEl.value;


    // Create Object From User Inputs
    const taskObj = {
        title: taskTitleValue,
        category: taskCategoryValue,
        date: new Date(`${taskDateValue}`),
        desc: taskDescValue,
        id: new Date().getTime().toString(),
        isImportant: false,
    }


    // Push the Object into the Tasks Array
    tasksArr.push(taskObj)
}


function displayListItems(order) {

    sortArrByDate(mainTasksArr, order);
    updateTasksArrInLs();

    mainListEl.innerHTML = '';
    importantListEl.innerHTML = '';

    // Main List
    mainTasksArr.forEach(task => {
        createListItem('main', task);
    })

    // Important List
    importantTasksArr.forEach(task => {
        createListItem('important', task);
    })
}


function createListItem(listName, task) {

    const currentList = document.querySelector(`.list--${listName}`);

    // Get Object Values
    const listItemTitle = task.title;
    const listItemCategory = task.category;
    const listItemDesc = task.desc;
    const listItemDate = task.date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    })
    const listItemId = task.id;

    let isPassedDate = currentDate > task.date;



    // ------- New Li Element ------- //

    const newLiEl = document.createElement('li');
    newLiEl.classList.add('list__item');
    newLiEl.setAttribute('data-id', listItemId);

    newLiEl.innerHTML = `
                    <p class="list__item-text list__item-title">${listItemTitle}</p>
                    <p class="list__item-text list__item-category">${listItemCategory}</p>
                    <p class="list__item-text list__item-date">${listItemDate}</p>
                    <p class="list__item-text list__item-desc hidden">${listItemDesc}</p>

                    <div class="list__item-actions">
                        <span class="list__item-icon list__item-icon--edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </span>
                        <span class="list__item-icon list__item-icon--duplicate" title="Duplicate">
                            <i class="fas fa-clone"></i>
                        </span>
                        <span class="list__item-icon list__item-icon--important" title="Mark as Important">
                            <i class="far fa-star"></i>
                        </span>
                        <span class="list__item-icon list__item-icon--delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </span>
                    </div>

                    <div class="list__item-see-more">
                        <span>See more</span>
                    </div>
        `

    // See more functionality
    const seeMore = newLiEl.querySelector('.list__item-see-more');
    const newLiDesc = newLiEl.querySelector('.list__item-desc');

    if (newLiDesc.textContent === '') {
        seeMore.classList.add('invisible')
    }

    seeMore.addEventListener('click', function () {
        newLiDesc.classList.toggle('hidden');
        this.classList.toggle('active');
    })


    // Disable mark-important btn if not needed
    const markImportantBtn = newLiEl.querySelector('.list__item-icon--important');
    if (listName === 'important') {
        markImportantBtn.classList.add('hidden')
    }


    // Disable Actions if passed date
    const newLiActions = newLiEl.querySelectorAll('.list__item-actions > *');
    const newLiDeleteBtn = newLiEl.querySelector('.list__item-icon--delete')
    if (isPassedDate) {
        newLiActions.forEach(action => {
            action.classList.add('invisible');
        })
        newLiDeleteBtn.classList.remove('invisible');
        newLiEl.classList.add('passed-date');
    }


    // Append Child to Current List
    currentList.appendChild(newLiEl);
}


function saveEditedTask(id) {

    // Capture User Inputs
    const taskTitleValue = taskTitleEl.value;
    const taskCategoryValue = taskCategoryEl.value;
    const taskDateValue = taskDateEl.value;
    const taskDescValue = taskDescEl.value;


    // Find current Obj
    const currentObj = tasksArr.find(task => {
        return task.id === id;
    })

    // Change Object Values
    currentObj.title = taskTitleValue;
    currentObj.category = taskCategoryValue;
    currentObj.date = new Date(`${taskDateValue}`);
    currentObj.desc = taskDescValue;
}



// ========= Task Manipulation Functions ========= //

function editTask(id) {

    editFlag = true;
    editId = id;

    const currentObj = tasksArr.find(task => {
        return task.id === id;
    })

    // const currentTaskEl = document.querySelector(`[data-id ="${id}"]`)

    // Current Task Properties
    const currentTitle = currentObj.title;
    const currentCategory = currentObj.category;
    const currentDate = currentObj.date;
    const currentDesc = currentObj.desc;


    // Format elements accordingly
    const formattedDate = formatDate(currentDate);

    const optionsArr = [...taskCategoryEl.options];
    optionsArr.shift();
    optionToSelect = optionsArr.find(option => option.value === currentCategory);


    // Setting Form Inputs from current task
    taskTitleEl.value = currentTitle;
    taskCategoryEl.value = optionToSelect.value;
    taskDateEl.value = formattedDate;
    taskDescEl.value = currentDesc;


    // Change Form Btn Text
    addTaskBtn.textContent = 'Edit Task'


    // Scroll To Form
    let scrollTarget = formEl.offsetTop;
    window.scrollTo({
        top: scrollTarget - 100,
        behavior: 'smooth'
    });
    taskTitleEl.focus();
}


function duplicateTask(id) {

    const currentObj = tasksArr.find(task => {
        return task.id === id;
    })

    const cloneObj = {
        ...currentObj
    };

    cloneObj.id = new Date().getTime().toString();

    tasksArr.push(cloneObj);

    updateLists();

    displayListItems(order);
}


function deleteTask(id) {

    // Find Current Object
    const currentObjIndex = tasksArr.findIndex(task => {
        return task.id === id;
    })

    tasksArr.splice(currentObjIndex, 1);

    updateLists();

    displayListItems(order);

    checkListsStatus();
}


function markImportantTask(id) {

    const currentObj = tasksArr.find(task => {
        return task.id === id;
    })

    currentObj.isImportant = true;

    updateLists();

    displayListItems(order);

    checkListsStatus();
}



// ========= Secondary Functions ========= //

function changeListOrder() {
    sortBtn.textContent = sortBtn.textContent === 'Asc' ? 'Desc' : 'Asc';
    order = order === 'asc' ? 'desc' : 'asc';
    setDefaultOrderToLs();
    displayListItems(order);
}


function updateLists() {
    mainTasksArr = tasksArr.filter(task => {
        return !task.isImportant;
    })

    importantTasksArr = tasksArr.filter(task => {
        return task.isImportant;
    })
}


function updateElementsContent() {
    sortBtn.textContent = toProperCase(order);
}


function checkListsStatus() {

    if (mainTasksArr.length === 0) {
        sortBtnWrapper.classList.add('invisible');
        clearMainBtnWrapper.classList.add('invisible');
        noTasksMain.classList.add('shown');
    } else {
        sortBtnWrapper.classList.remove('invisible');
        clearMainBtnWrapper.classList.remove('invisible');
        noTasksMain.classList.remove('shown');
    }

    if (importantTasksArr.length === 0) {
        clearImportantBtnWrapper.classList.add('invisible');
        noTasksImportant.classList.add('shown');
    } else {
        clearImportantBtnWrapper.classList.remove('invisible');
        noTasksImportant.classList.remove('shown');
    }
}


function clearList(listName) {

    // Main List
    if (listName === 'main') {
        for (let i = tasksArr.length - 1; i >= 0; --i) {
            if (!tasksArr[i].isImportant) {
                tasksArr.splice(i, 1)
            }
        }
    }

    // Important List
    if (listName === 'important') {
        for (let i = tasksArr.length - 1; i >= 0; --i) {
            if (tasksArr[i].isImportant) {
                tasksArr.splice(i, 1)
            }
        }
    }

    updateLists();

    checkListsStatus();

    displayListItems(order);
}


function validateInputs() {
    const inputsArr = [...taskInputs];

    const check = inputsArr.every(input => {
        return input.value !== "";
    })

    return check;
}


function displayAlert(msg, action) {

    alert.textContent = msg;

    alert.className = 'alert'
    alert.classList.add('fade-in');
    alert.classList.add(`alert-${action}`);

    clearTimeout(displayTimeout);


    displayTimeout = setTimeout(() => {
        alert.classList.remove('fade-in');
        alert.classList.add('fade-out');
    }, 2000);
}


function setBackToDefault() {
    form.reset();
    editFlag = false;
    addTaskBtn.classList.add('disabled');
    addTaskBtn.textContent = 'Add Task';
}



// ========= Local Storage Functions ========= //

function getItemFromLs(item) {
    return localStorage.getItem(item) ? JSON.parse(localStorage.getItem(item)) : null;
}


function loadItemsFromLs() {
    let tasks = getItemFromLs('tasks');

    if (!tasks) tasks = [];

    if (tasks.length > 0) {
        tasks.forEach(task => {
            let date = JSON.stringify(task.date);
            task.date = new Date(JSON.parse(date));
            tasksArr.push(task);
        })
    } else {
        tasksArr = [];
    }
}


function setDefaultOrderToLs() {
    localStorage.setItem('order', JSON.stringify(order));
}


function updateTasksArrInLs() {
    localStorage.setItem('tasks', JSON.stringify(tasksArr));
}




// ========= Utility Functions ========= //

function sortArrByDate(arr, order) {
    if (order === 'asc') {
        arr.sort((a, b) => {
            if (a.date < b.date) {
                return -1;
            } else if (a.date > b.date) {
                return 1;
            }
            return 0;
        });
    } else if (order === 'desc') {
        arr.sort((a, b) => {
            if (a.date < b.date) {
                return 1;
            } else if (a.date > b.date) {
                return -1;
            }
            return 0;
        });
    }
}


function formatDate(date = new Date()) {
    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
    ].join('-');
}


function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}


function toProperCase(str) {
    return (str[0].toUpperCase() + str.substring(1).toLowerCase())
}