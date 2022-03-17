const getListAPI = "https://622ad04c14ccb950d22601c4.mockapi.io/api/v1/todos";

function start() {
    getWorks(renderWorks);
    closeListWorks();
}

start();

function getWorks(callback) {
    fetch(getListAPI)
        .then((response) => {
            return response.json();
        })
        .then(callback);
}

function createWork(data, callback) {
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    fetch(getListAPI, options)
        .then((response) => {
            response.json();
        })
        .then(callback);
}

function handleDeleteWork(id) {
    let options = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    };
    fetch(getListAPI + "/" + id, options)
        .then((response) => {
            response.json();
        })
        .then(function () {
            let workItem = document.querySelector(".work-item-" + id);
            if (workItem) {
                workItem.remove();
            }
        });
}
function editWork(id, data, callback) {
    let options = {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    };
    fetch(getListAPI + "/" + id, options)
        .then((response) => {
            response.json();
        })
        .then(callback);
}

function handleEditWork(work) {
    modalUpdate(work);
    saveUpdate(work);
}

function renderWorks(works) {
    let listWorkBlock = document.querySelector("#list-work");
    let htmls = works.map((work) => {
        return `
        <li class="list-group-item d-flex justify-content-between gap-3 work-item-${work.id
            }" >
            <div>
                <p><b>Title: </b> ${work.title}</p>
                <p><b>Completed: </b> ${work.completed}</p>
                <p><b>Created_at: </b> ${new Date(work.created_at).toLocaleDateString() +
            " " +
            new Date(work.created_at).toLocaleTimeString()
            }</p>
            </div>
            <div class="d-flex gap-2">
                <span id="btnEdit" onclick='handleEditWork(${JSON.stringify(
                work
            )})' class="text-warning fs-4" data-id=${work.id
            } role="button"><i class="fa-solid fa-edit"></i></span>
                <span onclick="handleDeleteWork(${work.id
            })" class="text-danger fs-4" role="button"><i class="fa-solid fa-trash-can"></i></span>
            </div>
        </li>
        `;
    });
    listWorkBlock.innerHTML = htmls.join("");
}

function closeListWorks() {
    let listWorkBlock = document.querySelector("#list-work");
    let iconClose = document.querySelector("#icon-down");
    iconClose.onclick = () => {
        listWorkBlock.classList.toggle("d-none");
    };
}

function handleCreateForm() {

    let title = document.querySelector('input[name="title"]').value;
    let completed = document.querySelector('select[name="completed"]').value;
    let created_at = document.querySelector('input[name="created_at"]').value;
    let formData = {
        title,
        completed,
        created_at,
    };
    let errMessage = document.querySelector(".form-message").textContent;
    console.log(errMessage);
    if (errMessage === "") {
        createWork(formData, function () {
            getWorks(renderWorks);
        });
    }

    document.querySelector("#form-create").reset();
}

function modalUpdate(work) {
    let openModal = document.querySelector(".modal-update");
    let modalContainer = document.querySelector(".modal-container");
    let closeModal = document.querySelector(".modal-close");
    let closeModalBtn = document.querySelector("#modalClose");

    document.querySelector('input[name="title-update"]').value = work.title;
    document.querySelector('select[name="completed-update"]').value =
        work.completed;

    openModal.classList.toggle("open");
    closeModal.onclick = () => {
        openModal.classList.remove("open");
    };
    closeModalBtn.onclick = () => {
        openModal.classList.remove("open");
    };
    openModal.onclick = () => {
        openModal.classList.remove("open");
    };
    modalContainer.onclick = (e) => {
        e.stopPropagation();
    };
}
function saveUpdate(work) {
    btnSave = document.querySelector("#saveUpdate");
    btnSave.onclick = () => {
        let openModal = document.querySelector(".modal-update");
        let titleUpdate = document.querySelector(
            'input[name="title-update"]'
        ).value;
        let completedUpdate = document.querySelector(
            'select[name="completed-update"]'
        ).value;
        let data = {
            title: titleUpdate,
            completed: completedUpdate,
        };
        openModal.classList.remove("open");
        editWork(work.id, data, function () {
            getWorks(renderWorks);
        });
    };
}



// Đối tượng `Validator`

function Validator(options) {
    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        let errorMessage = rule.test(inputElement.value);
        let errorElement =
            inputElement.parentElement.querySelector(".form-message");

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add("invalid");
        } else {
            errorElement.innerText = "";
            inputElement.parentElement.classList.remove("invalid");
        }
    }
    // LấY element của form cần validate
    let formElement = document.querySelector(options.form);
    let errMessage = document.querySelector(".form-message").textContent;
    if (formElement) {
        const createBtn = document.querySelector("#create");

        // Lặp qua từng rules và validate
        createBtn.onclick = () => {
            options.rules.forEach((rule) => {
                let inputElement = formElement.querySelector(rule.selector);
                validate(inputElement, rule);
            });

            if (errMessage !== "") {
                return;
            } else {
                handleCreateForm();
            }
        };

        options.rules.forEach((rule) => {
            let inputElement = formElement.querySelector(rule.selector);
            let errorElement =
                inputElement.parentElement.querySelector(".form-message");

            if (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                    inputElement.parentElement.classList.add("invalid");
                };

                // Xử lý trường hợp người dùng nhập vào input

                inputElement.oninput = () => {
                    errorElement.innerText = "";
                    inputElement.parentElement.classList.remove("invalid");
                };
            }
        });
    }
}

// Định nghĩa rule

// Nguyên tắc của các rules
// 1. Khi có lỗi thì trả ra message lỗi
// 2. Khi hợp lệ => không trả ra gì cả (undifined)
Validator.isRequired = function (selector) {
    return {
        selector,
        test: function (value) {
            return value.trim() ? undefined : "Vui lòng nhập trường này";
        },
    };
};
Validator.isCompleted = function (selector) {
    return {
        selector,
        test: function (value) {
            return value !== "Choose..." ? undefined : "Vui lòng nhập trường này";
        },
    };
};
