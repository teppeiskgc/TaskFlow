
// HTMLの要素を取得する
const taskInput = document.getElementById("taskInput");
const taskDeadline = document.getElementById("taskDeadline");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

// 絞り込みボタンを取得する
const filterButtons = document.querySelectorAll(".filter-button");

// 現在の絞り込み条件
let currentFilter = "all";

// 保存されているタスクを読み込む
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


// タスクを画面に表示する関数
function displayTasks() {

    // リストを一度空にする
    taskList.innerHTML = "";

    // 現在の絞り込み条件に合うタスクだけを取得
    const filteredTasks = tasks.filter(function(task) {

        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    // 絞り込んだタスクを画面に表示する
    filteredTasks.forEach(function(task) {

        // 元の配列での位置を取得
        const index = tasks.indexOf(task);

        const li = document.createElement("li");

        // チェックボックス
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

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

        // 期限を表示
        const deadlineSpan = document.createElement("span");
        deadlineSpan.className = "task-deadline";

        if (task.deadline) {

            const deadlineDate = new Date(
                task.deadline + "T00:00:00"
            );

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const deadlineText =
                task.deadline.replace(/-/g, "/");

            deadlineSpan.textContent =
                "期限：" + deadlineText;

            // 完了済みの場合は期限の警告を出さない
            if (!task.completed) {

                if (deadlineDate < today) {
                    deadlineSpan.textContent += "（期限超過）";
                    deadlineSpan.classList.add("deadline-overdue");

                } else if (deadlineDate.getTime() === today.getTime()) {
                    deadlineSpan.textContent += "（今日が期限）";
                    deadlineSpan.classList.add("deadline-today");

                } else {
                    deadlineSpan.classList.add("deadline-future");
                }
            }

        } else {
            deadlineSpan.textContent = "期限なし";
        }

        // 削除ボタン
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", function() {
            tasks.splice(index, 1);
            displayTasks();
        });

        // 要素を追加
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deadlineSpan);
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });

    // 進捗を更新
    updateProgress();

    // タスクを保存
    saveTasks();
}


// タスクを保存する関数
function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}


// タスクを追加する関数
function addTask() {

    // 入力された文字を取得する
    const taskName = taskInput.value.trim();

    // 空欄なら登録しない
    if (taskName === "") {
        alert("タスクを入力してください。");
        return;
    }

    // 新しいタスクを追加する
    tasks.push({
        name: taskName,
        completed: false,
        deadline: taskDeadline.value
    });

    // 入力欄を空にする
    taskInput.value = "";
    taskDeadline.value = "";

    // 画面を更新する
    displayTasks();
}


// 進捗を計算する関数
function updateProgress() {

    // タスクの総数
    const total = tasks.length;

    // 完了したタスクの数
    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    // 進捗率を計算する
    const percentage = total === 0
        ? 0
        : (completed / total) * 100;

    // 進捗の文字を更新する
    progressText.textContent =
        completed + " / " + total + " 完了";

    // 進捗バーの長さを更新する
    progressFill.style.width = percentage + "%";
}


// 追加ボタンを押したときの処理
addButton.addEventListener("click", addTask);


// Enterキーを押したときもタスクを追加する
taskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addTask();
    }

});


// 絞り込みボタンをクリックしたときの処理
filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // 押されたボタンの絞り込み条件を取得
        currentFilter = button.dataset.filter;

        // 選択中のボタンの見た目を更新
        filterButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        // タスク一覧を更新
        displayTasks();

    });

});


// 最初に保存済みのタスクを画面に表示する
displayTasks();


// Service Workerを登録する
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
