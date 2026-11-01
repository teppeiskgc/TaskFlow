
// =========================
// HTMLの要素を取得する
// =========================

const taskInput = document.getElementById("taskInput");
const taskDeadline = document.getElementById("taskDeadline");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const filterButtons = document.querySelectorAll(".filter-button");

// =========================
// 現在の絞り込み条件
// =========================

let currentFilter = "all";

// =========================
// 保存されているタスクを読み込む
// =========================

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks;
    }
} catch (error) {
    console.error("タスクの読み込みに失敗しました:", error);
}

// 古いデータにも対応する
tasks = tasks.map(function(task) {
    return {
        name: task.name || "",
        completed: Boolean(task.completed),
        deadline: task.deadline || ""
    };
});

// =========================
// 今日の日付を取得する
// =========================

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

// =========================
// 日付を見やすい形式に変換する
// =========================

function formatDate(dateString) {
    const parts = dateString.split("-");

    return parts[0] + "年" +
        Number(parts[1]) + "月" +
        Number(parts[2]) + "日";
}

// =========================
// タスクを保存する
// =========================

function saveTasks() {
    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("タスクの保存に失敗しました:", error);
        alert("タスクを保存できませんでした。");
    }
}

// =========================
// タスクを画面に表示する
// =========================

function displayTasks() {

    taskList.innerHTML = "";

    // 絞り込み
    const filteredTasks = tasks
        .map(function(task, index) {
            return {
                task: task,
                index: index
            };
        })
        .filter(function(item) {

            if (currentFilter === "active") {
                return !item.task.completed;
            }

            if (currentFilter === "completed") {
                return item.task.completed;
            }

            return true;
        });

    // タスクを一つずつ表示
    filteredTasks.forEach(function(item) {

        const task = item.task;
        const index = item.index;

        const li = document.createElement("li");

        // チェックボックス
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", task.name + "を完了にする");

        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;
            displayTasks();
        });

        // タスク名
        const span = document.createElement("span");

        span.textContent = task.name;
        span.className = "task-name";

        if (task.completed) {
            span.classList.add("completed");
        }

        li.appendChild(checkbox);
        li.appendChild(span);

        // 期限表示
        if (task.deadline) {

            const deadlineSpan = document.createElement("span");

            deadlineSpan.className = "task-deadline";

            deadlineSpan.textContent =
                "期限：" + formatDate(task.deadline);

            if (!task.completed) {

                const today = getToday();

                if (task.deadline < today) {

                    deadlineSpan.classList.add("deadline-overdue");
                    deadlineSpan.textContent += "（期限超過）";

                } else if (task.deadline === today) {

                    deadlineSpan.classList.add("deadline-today");
                    deadlineSpan.textContent += "（今日が期限）";

                } else {

                    deadlineSpan.classList.add("deadline-future");

                }
            }

            li.appendChild(deadlineSpan);
        }

        // 削除ボタン
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "削除";
        deleteButton.className = "delete-button";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function() {
            tasks.splice(index, 1);
            displayTasks();
        });

        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });

    updateProgress();
    saveTasks();
}

// =========================
// タスクを追加する
// =========================

function addTask() {

    const taskName = taskInput.value.trim();

    if (taskName === "") {
        alert("タスクを入力してください。");
        taskInput.focus();
        return;
    }

    const deadline = taskDeadline.value;

    tasks.push({
        name: taskName,
        completed: false,
        deadline: deadline
    });

    taskInput.value = "";
    taskDeadline.value = "";

    displayTasks();

    taskInput.focus();
}

// =========================
// 進捗を更新する
// =========================

function updateProgress() {

    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const percentage = total === 0
        ? 0
        : (completed / total) * 100;

    progressText.textContent =
        completed + " / " + total + " 完了";

    progressFill.style.width = percentage + "%";
}

// =========================
// 追加ボタン
// =========================

addButton.addEventListener("click", addTask);

// =========================
// Enterキー
// =========================

taskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addTask();
    }

});

// =========================
// 絞り込みボタン
// =========================

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        displayTasks();
    });

});

// =========================
// 最初の画面表示
// =========================

displayTasks();

// =========================
// Service Workerの登録
// =========================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function() {

        navigator.serviceWorker.register("./service-worker.js")
            .then(function() {
                console.log("Service Workerの登録に成功しました");
            })
            .catch(function(error) {
                console.error("登録に失敗しました:", error);
            });

    });

}
