let tasks = [];
let taskIdCounter = 1;
let currentUser = null;
const LEADER_PASSWORD = "7777";

const userNames = {
  leader: "Mirzohid",
  member1: "Abdulfozil - Frontend Developer",
  member2: "Dilnora - Frontend Developer",
  member3: "Soadat - Frontend Developer",
};

function loadData() {
  const savedTasks = localStorage.getItem("teamTasks");
  const savedCounter = localStorage.getItem("taskCounter");

  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  if (savedCounter) {
    taskIdCounter = parseInt(savedCounter);
  }
}

function saveData() {
  localStorage.setItem("teamTasks", JSON.stringify(tasks));
  localStorage.setItem("taskCounter", taskIdCounter.toString());
}

loadData();

function showPasswordPrompt() {
  document.getElementById("userSelect").classList.add("hidden");
  document.getElementById("passwordPrompt").classList.remove("hidden");
  document.getElementById("leaderPassword").focus();
}

function cancelPassword() {
  document.getElementById("userSelect").classList.remove("hidden");
  document.getElementById("passwordPrompt").classList.add("hidden");
  document.getElementById("leaderPassword").value = "";
  document.getElementById("errorMsg").classList.add("hidden");
}

function checkPassword() {
  const password = document.getElementById("leaderPassword").value;
  if (password === LEADER_PASSWORD) {
    login("leader");
    document.getElementById("leaderPassword").value = "";
    document.getElementById("errorMsg").classList.add("hidden");
  } else {
    document.getElementById("errorMsg").classList.remove("hidden");
    document.getElementById("leaderPassword").value = "";
    document.getElementById("leaderPassword").focus();
  }
}

document.addEventListener("keypress", function (e) {
  if (
    e.key === "Enter" &&
    !document.getElementById("passwordPrompt").classList.contains("hidden")
  ) {
    checkPassword();
  }
});

function login(userType) {
  currentUser = userType;
  document.getElementById("loginScreen").classList.add("hidden");

  if (userType === "leader") {
    document.getElementById("leaderView").classList.remove("hidden");
    renderLeaderView();
  } else {
    document.getElementById("memberView").classList.remove("hidden");
    document.getElementById("memberName").textContent = userNames[userType];
    renderMemberView();
  }
}

function logout() {
  currentUser = null;
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("leaderView").classList.add("hidden");
  document.getElementById("memberView").classList.add("hidden");
  document.getElementById("userSelect").classList.remove("hidden");
  document.getElementById("passwordPrompt").classList.add("hidden");
  document.getElementById("leaderPassword").value = "";
  document.getElementById("errorMsg").classList.add("hidden");
}

const taskForm = document.getElementById("taskForm");
if (taskForm) {
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const task = {
      id: taskIdCounter++,
      title: document.getElementById("taskTitle").value,
      description: document.getElementById("taskDesc").value,
      assignee: document.getElementById("taskAssignee").value,
      priority: document.getElementById("taskPriority").value,
      status: "pending",
      createdAt: new Date().toLocaleString("uz-UZ"),
    };

    tasks.push(task);
    taskForm.reset();
    saveData();
    renderLeaderView();
  });
}

function renderLeaderView() {
  updateStats();

  const member1Tasks = document.getElementById("leaderMember1Tasks");
  const member2Tasks = document.getElementById("leaderMember2Tasks");
  const member3Tasks = document.getElementById("leaderMember3Tasks");

  member1Tasks.innerHTML = "";
  member2Tasks.innerHTML = "";
  member3Tasks.innerHTML = "";

  const member1TasksList = tasks.filter((t) => t.assignee === "member1");
  const member2TasksList = tasks.filter((t) => t.assignee === "member2");
  const member3TasksList = tasks.filter((t) => t.assignee === "member3");

  if (member1TasksList.length === 0) {
    member1Tasks.innerHTML = '<div class="empty-state">Vazifalar yo\'q</div>';
  } else {
    member1TasksList.forEach((task) => {
      member1Tasks.appendChild(createTaskElement(task, true));
    });
  }

  if (member2TasksList.length === 0) {
    member2Tasks.innerHTML = '<div class="empty-state">Vazifalar yo\'q</div>';
  } else {
    member2TasksList.forEach((task) => {
      member2Tasks.appendChild(createTaskElement(task, true));
    });
  }

  if (member3TasksList.length === 0) {
    member3Tasks.innerHTML = '<div class="empty-state">Vazifalar yo\'q</div>';
  } else {
    member3TasksList.forEach((task) => {
      member3Tasks.appendChild(createTaskElement(task, true));
    });
  }
}

function renderMemberView() {
  const myTasksContainer = document.getElementById("myTasks");
  myTasksContainer.innerHTML = "";

  const myTasks = tasks.filter((t) => t.assignee === currentUser);

  if (myTasks.length === 0) {
    myTasksContainer.innerHTML =
      '<div class="empty-state">Hozircha vazifalar yo\'q</div>';
  } else {
    myTasks.forEach((task) => {
      myTasksContainer.appendChild(createTaskElement(task, false));
    });
  }
}

function createTaskElement(task, isLeader) {
  const taskEl = document.createElement("div");
  taskEl.className = `task-item priority-${task.priority}`;

  const statusText = {
    pending: "Kutilmoqda",
    progress: "Jarayonda",
    completed: "Bajarilgan",
  };

  const priorityText = {
    high: "Yuqori",
    medium: "O'rta",
    low: "Past",
  };

  taskEl.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-status status-${task.status}">${
    statusText[task.status]
  }</div>
                </div>
                <div class="task-desc">${task.description}</div>
                <div class="task-desc" style="font-weight: 600; color: ${
                  task.priority === "high"
                    ? "#dc3545"
                    : task.priority === "medium"
                    ? "#ffc107"
                    : "#28a745"
                }">
                    Muhimlik: ${priorityText[task.priority]}
                </div>
                <div class="task-actions">
                    ${
                      task.status === "pending"
                        ? `<button class="btn-progress" onclick="updateStatus(${task.id}, 'progress')">Boshlash</button>`
                        : ""
                    }
                    ${
                      task.status === "progress"
                        ? `<button class="btn-complete" onclick="updateStatus(${task.id}, 'completed')">Yakunlash</button>`
                        : ""
                    }
                    ${
                      isLeader
                        ? `<button class="btn-delete" onclick="deleteTask(${task.id})">O'chirish</button>`
                        : ""
                    }
                </div>
            `;

  return taskEl;
}

function updateStatus(taskId, newStatus) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = newStatus;
    saveData();
    if (currentUser === "leader") {
      renderLeaderView();
    } else {
      renderMemberView();
    }
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  saveData();
  renderLeaderView();
}

function updateStats() {
  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("pendingTasks").textContent = tasks.filter(
    (t) => t.status === "pending"
  ).length;
  document.getElementById("inProgressTasks").textContent = tasks.filter(
    (t) => t.status === "progress"
  ).length;
  document.getElementById("completedTasks").textContent = tasks.filter(
    (t) => t.status === "completed"
  ).length;
}
