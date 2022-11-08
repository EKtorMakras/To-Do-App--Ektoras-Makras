//* ============================= Global Variables ============================= //

// ========= Dom Elements ========= //
const formEl = document.querySelector('.form');
const formInputEls = document.querySelectorAll('.form__input');
const taskTitleEl = document.querySelector('#task-title');
const taskCategoryEl = document.querySelector('#task-category');
const taskDateEl = document.querySelector('#task-date');
const taskDescEl = document.querySelector('#task-description');
const addTaskBtn = document.querySelector('.form__btn');

const mainListEl = document.querySelector('.list--main');
const importantListEl = document.querySelector('.list--important');
const lists = document.querySelectorAll('.list');

const sortBtnWrapper = document.querySelector('.list__btn--sort-wrapper');
const sortBtn = document.querySelector('.list__btn--sort');


// ========= Other ========= //
const currentDate = new Date();
let tasksArr = [];
let mainTasksArr = [];
let importantTasksArr = [];
let order = 'asc';
let editFlag = false;
let editId;




//* ============================= Event Listeners ============================= //

addTaskBtn.addEventListener('click', (evt) => {
    evt.preventDefault();

    if (!editFlag) {
        addTaskObj();
        updateLists();
        createListItems(order);
    } else {
        saveEditedTask(editId)
    }

    setBackToDefault();
})


sortBtn.addEventListener('click', () => {
    changeListOrder();
})


// List Item Actions
lists.forEach(list => {
    list.addEventListener('click', evt => {
        const target = evt.target;
        const parentLiEl = target.closest('.list__item');
        const liElId = parentLiEl.dataset.id;

        if (target.classList.contains('fa-edit')) {
            editTask(liElId);
        } else if (target.classList.contains('fa-clone')) {
            duplicateTask(liElId);
        } else if (target.classList.contains('fa-trash')) {
            deleteTask(liElId);
        } else if (target.classList.contains('fa-star')) {
            markImportantTask(liElId);
        }
    })
})


//* ============================= Functions ============================= //


// ========= Main ========= //

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


function createListItems(order) {
    sortArrByDate(mainTasksArr, order);
    mainListEl.innerHTML = '';
    importantListEl.innerHTML = '';
    sortBtnWrapper.classList.remove('invisible')

    // Main List
    mainTasksArr.forEach(task => {
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



        // ----- New Li Element ----- //
        const newLiEl = document.createElement('li');
        newLiEl.classList.add('list__item');
        newLiEl.setAttribute('data-id', listItemId);

        newLiEl.innerHTML = `
                        <p class="list__item-text list__item-title">${listItemTitle}</p>
                        <p class="list__item-text list__item-category">${listItemCategory}</p>
                        <p class="list__item-text list__item-date">${listItemDate}</p>
                        <p class="list__item-text list__item-desc hidden">${listItemDesc}</p>

                        <div class="list__item-actions">
                            <a href="#form" class="list__item-icon list__item-icon--edit" title="Edit">
                                <i class="fas fa-edit"></i>
                            </a>
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

        seeMore.addEventListener('click', function () {
            newLiDesc.classList.toggle('hidden');
            this.classList.toggle('active');
        })

        // Disable Actions if passed date
        const newLiActions = newLiEl.querySelector('.list__item-actions')
        if (isPassedDate) {
            newLiActions.classList.add('invisible');
            newLiEl.classList.add('passed-date');
        }

        // Append Child to Main List
        mainListEl.appendChild(newLiEl);
    })


    // Important List
    importantTasksArr.forEach(task => {
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



        // ----- New Li Element ----- //
        const newLiEl = document.createElement('li');
        newLiEl.classList.add('list__item');
        newLiEl.setAttribute('data-id', listItemId);

        newLiEl.innerHTML = `
                        <p class="list__item-text list__item-title">${listItemTitle}</p>
                        <p class="list__item-text list__item-category">${listItemCategory}</p>
                        <p class="list__item-text list__item-date">${listItemDate}</p>
                        <p class="list__item-text list__item-desc hidden">${listItemDesc}</p>

                        <div class="list__item-actions">
                            <a href="#form" class="list__item-icon list__item-icon--edit" title="Edit">
                                <i class="fas fa-edit"></i>
                            </a>
                            <span class="list__item-icon list__item-icon--duplicate" title="Duplicate">
                                <i class="fas fa-clone"></i>
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

        seeMore.addEventListener('click', function () {
            newLiDesc.classList.toggle('hidden');
            this.classList.toggle('active');
        })

        // Disable Actions if passed date
        const newLiActions = newLiEl.querySelector('.list__item-actions')
        if (isPassedDate) {
            newLiActions.classList.add('invisible');
            newLiEl.classList.add('passed-date');
        }

        // Append Child to Main List
        importantListEl.appendChild(newLiEl);
    })
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
// ========= List Item Actions ========= //


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

    createListItems(order);
}

function deleteTask(id) {

    // Find Current Object
    const currentObjIndex = tasksArr.findIndex(task => {
        return task.id === id;
    })

    tasksArr.splice(currentObjIndex, 1);

    updateLists();

    createListItems(order);


    // Check if main list is empty
    if (mainListEl.children.length === 0) {
        sortBtnWrapper.classList.add('invisible');
    }
}


function markImportantTask(id) {

    const currentObj = tasksArr.find(task => {
        return task.id === id;
    })

    currentObj.isImportant = true;

    updateLists();

    createListItems(order);


    // Check if main list is empty
    if (mainListEl.children.length === 0) {
        sortBtnWrapper.classList.add('invisible');
    }
}



// ========= Utilities ========= //

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


function changeListOrder() {
    sortBtn.textContent = sortBtn.textContent === 'Asc' ? 'Desc' : 'Asc';
    order = order === 'asc' ? 'desc' : 'asc';
    createListItems(order)
}


function updateLists() {
    mainTasksArr = tasksArr.filter(task => {
        return !task.isImportant;
    })

    importantTasksArr = tasksArr.filter(task => {
        return task.isImportant;
    })
}


function setBackToDefault() {
    form.reset();
    editFlag = false;
    addTaskBtn.textContent = 'Add Task'
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