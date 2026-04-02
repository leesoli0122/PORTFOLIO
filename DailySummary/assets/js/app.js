let records = [];
let filter = "all";
let editId = null;
let isDirty = false;
let dataSource = "data/records.json";

const DATA_FILE_PATH = "./data/records.json";
const PROMPT = "오늘 우리가 나눈 대화를 웹 퍼블리셔 업무 기록용으로 정리해줘.\n\n아래 형식으로 간결하게 작성해줘:\n\n• 주요 작업/질문\n• 해결 방법 또는 결론\n• 기억할 포인트";

async function init() {
    setDate();
    setDirty(false);
    await loadInitialData();
    renderSidebar();
    renderRecords();
}

async function loadInitialData() {
    try {
        const response = await fetch(DATA_FILE_PATH, { cache: "no-store" });

        if (!response.ok) {
            throw new Error("records.json 파일을 불러오지 못했습니다.");
        }

        const json = await response.json();
        records = normalizeRecords(json);
        dataSource = "repo: data/records.json";
        updateSourceText();
    } catch (error) {
        records = [];
        dataSource = "메모리 상태(파일 없음)";
        updateSourceText();
        toast("data/records.json을 찾지 못했어요. 새로 작성 후 JSON 내보내기로 파일을 만들어주세요.", "warning");
    }
}

function normalizeRecords(data) {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map(function (item) {
            return {
                id: Number(item.id) || Date.now() + Math.floor(Math.random() * 10000),
                title: typeof item.title === "string" ? item.title : "",
                project: typeof item.project === "string" ? item.project : "",
                date: typeof item.date === "string" && item.date ? item.date : todayISO(),
                content: typeof item.content === "string" ? item.content : ""
            };
        })
        .sort(function (a, b) {
            return b.date.localeCompare(a.date) || b.id - a.id;
        });
}

function updateSourceText() {
    document.getElementById("dataSourceText").textContent = dataSource;
}

function setDirty(value) {
    isDirty = value;
    document.getElementById("dirtyChip").style.display = isDirty ? "inline-flex" : "none";
}

function todayISO() {
    return new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    ).toISOString().split("T")[0];
}

function setDate() {
    document.getElementById("dateNow").textContent = new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        timeZone: "Asia/Seoul"
    });
}

function renderSidebar() {
    const today = todayISO();
    document.getElementById("cnt-all").textContent = records.length;
    document.getElementById("cnt-today").textContent = records.filter(function (item) {
        return item.date === today;
    }).length;

    const projects = Array.from(
        new Set(
            records
                .map(function (item) {
                    return item.project;
                })
                .filter(Boolean)
        )
    ).sort();

    document.getElementById("projectNav").innerHTML = projects.map(function (project) {
        const count = records.filter(function (item) {
            return item.project === project;
        }).length;
        const active = filter === "proj:" + project ? "active" : "";

        return (
            '<button class="nav-item ' + active + '" type="button" onclick="setFilter(\'proj:' + escapeSingleQuote(project) + '\')">' +
            "📁 " + escapeHtml(project) + ' <span class="cnt">' + count + "</span></button>"
        );
    }).join("");

    document.getElementById("projectList").innerHTML = projects.map(function (project) {
        return '<option value="' + escapeHtmlAttr(project) + '">';
    }).join("");
}

function setFilter(value) {
    filter = value;

    document.querySelectorAll(".nav-item").forEach(function (item) {
        item.classList.remove("active");
    });

    if (value === "all") {
        document.getElementById("nav-all").classList.add("active");
        document.getElementById("pageTitle").textContent = "전체 기록";
    } else if (value === "today") {
        document.getElementById("nav-today").classList.add("active");
        document.getElementById("pageTitle").textContent = "오늘";
    } else {
        document.getElementById("pageTitle").textContent = value.replace("proj:", "") + " 프로젝트";
    }

    renderSidebar();
    renderRecords();
}

function renderRecords() {
    const today = todayISO();
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const yesterday = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split("T")[0];

    let list = records.filter(function (item) {
        if (filter === "today" && item.date !== today) {
            return false;
        }

        if (filter.indexOf("proj:") === 0 && item.project !== filter.replace("proj:", "")) {
            return false;
        }

        if (query) {
            const merged = [item.title, item.project, item.content].join(" ").toLowerCase();
            if (!merged.includes(query)) {
                return false;
            }
        }

        return true;
    });

    list = list.sort(function (a, b) {
        return b.date.localeCompare(a.date) || b.id - a.id;
    });

    const container = document.getElementById("container");

    if (!list.length) {
        container.innerHTML =
            '<div class="empty-state">' +
            '<div class="empty-icon">📭</div>' +
            '<div class="empty-text">기록이 없어요.<br>상단 버튼으로 추가해보세요.</div>' +
            "</div>";
        return;
    }

    const groups = {};

    list.forEach(function (item) {
        if (!groups[item.date]) {
            groups[item.date] = [];
        }
        groups[item.date].push(item);
    });

    container.innerHTML = Object.keys(groups)
        .sort(function (a, b) {
            return b.localeCompare(a);
        })
        .map(function (date) {
            const label = date === today ? "오늘 · " + date : date === yesterdayISO ? "어제 · " + date : date;

            return (
                '<div class="date-group-label">' + label + "</div>" +
                '<div class="records-list">' +
                groups[date].map(function (item) {
                    return (
                        '<div class="record-card">' +
                        '<div class="record-top">' +
                        '<div class="record-meta">' +
                        '<span class="record-date">' + escapeHtml(item.date) + "</span>" +
                        (item.project ? '<span class="record-project">' + escapeHtml(item.project) + "</span>" : "") +
                        "</div>" +
                        '<div class="record-actions">' +
                        '<button class="btn-icon" type="button" onclick="openEdit(' + item.id + ')">✏️ 수정</button>' +
                        '<button class="btn-icon del" type="button" onclick="del(' + item.id + ')">🗑 삭제</button>' +
                        "</div>" +
                        "</div>" +
                        '<div class="record-title">' + escapeHtml(item.title || "제목 없음") + "</div>" +
                        '<div class="record-content">' + escapeHtml(item.content) + "</div>" +
                        "</div>"
                    );
                }).join("") +
                "</div>"
            );
        })
        .join("");
}

function openModal() {
    editId = null;
    document.getElementById("mTitle").textContent = "새 기록";
    document.getElementById("mTitleInput").value = "";
    document.getElementById("mProject").value = "";
    document.getElementById("mDate").value = todayISO();
    document.getElementById("mContent").value = "";
    document.getElementById("overlay").classList.add("show");
}

function openEdit(id) {
    const target = records.find(function (item) {
        return item.id === id;
    });

    if (!target) {
        return;
    }

    editId = id;
    document.getElementById("mTitle").textContent = "기록 수정";
    document.getElementById("mTitleInput").value = target.title || "";
    document.getElementById("mProject").value = target.project || "";
    document.getElementById("mDate").value = target.date || todayISO();
    document.getElementById("mContent").value = target.content || "";
    document.getElementById("overlay").classList.add("show");
}

function closeModal() {
    document.getElementById("overlay").classList.remove("show");
    editId = null;
}

function outsideClose(event) {
    if (event.target === document.getElementById("overlay")) {
        closeModal();
    }
}

function saveRecord() {
    const title = document.getElementById("mTitleInput").value.trim();
    const project = document.getElementById("mProject").value.trim();
    const date = document.getElementById("mDate").value || todayISO();
    const content = document.getElementById("mContent").value.trim();

    if (!content) {
        toast("내용을 입력해주세요.", "error");
        return;
    }

    if (editId !== null) {
        const index = records.findIndex(function (item) {
            return item.id === editId;
        });

        if (index !== -1) {
            records[index] = {
                id: records[index].id,
                title: title,
                project: project,
                date: date,
                content: content
            };
        }

        toast("수정됐어요. JSON 내보내기 후 파일 교체까지 해야 실제 저장 완료예요.", "success");
    } else {
        records.unshift({
            id: Date.now(),
            title: title,
            project: project,
            date: date,
            content: content
        });

        toast("추가됐어요. JSON 내보내기 후 파일 교체까지 해야 실제 저장 완료예요.", "success");
    }

    setDirty(true);
    renderSidebar();
    renderRecords();
    closeModal();
}

function del(id) {
    if (!confirm("이 기록을 삭제할까요?")) {
        return;
    }

    records = records.filter(function (item) {
        return item.id !== id;
    });

    setDirty(true);
    renderSidebar();
    renderRecords();
    toast("삭제됐어요. JSON 내보내기로 파일 반영해 주세요.", "warning");
}

function clearAllRecords() {
    if (!confirm("전체 기록을 삭제할까요? 이 작업은 되돌리기 어려워요.")) {
        return;
    }

    records = [];
    setDirty(true);
    renderSidebar();
    renderRecords();
    toast("전체 삭제됐어요. 필요하면 JSON 내보내기로 빈 파일을 반영하세요.", "warning");
}

function triggerImport() {
    document.getElementById("fileInput").value = "";
    document.getElementById("fileInput").click();
}

async function importJson(event) {
    const file = event.target.files && event.target.files[0];

    if (!file) {
        return;
    }

    try {
        const text = await file.text();
        const json = JSON.parse(text);

        records = normalizeRecords(json);
        dataSource = "imported: " + file.name;
        updateSourceText();
        setDirty(false);
        renderSidebar();
        renderRecords();
        toast("JSON 불러오기가 완료됐어요.", "success");
    } catch (error) {
        toast("JSON 파일 형식이 올바르지 않아요.", "error");
    }
}

function exportJson() {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "records.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setDirty(false);
    toast("records.json 파일을 내보냈어요. 기존 data/records.json을 이 파일로 교체한 뒤 깃 커밋하세요.", "success");
}

function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(function () {
        toast("복사됐어요!", "success");
    }).catch(function () {
        toast("복사에 실패했어요.", "error");
    });
}

function toast(message, type) {
    const element = document.getElementById("toast");
    element.textContent = message;
    element.className = "toast show " + (type || "");

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(function () {
        element.className = "toast";
    }, 3200);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(value) {
    return escapeHtml(value);
}

function escapeSingleQuote(value) {
    return String(value).replace(/'/g, "\\'");
}

window.setFilter = setFilter;
window.triggerImport = triggerImport;
window.exportJson = exportJson;
window.openModal = openModal;
window.closeModal = closeModal;
window.outsideClose = outsideClose;
window.saveRecord = saveRecord;
window.openEdit = openEdit;
window.del = del;
window.clearAllRecords = clearAllRecords;
window.importJson = importJson;
window.copyPrompt = copyPrompt;
window.renderRecords = renderRecords;

init();