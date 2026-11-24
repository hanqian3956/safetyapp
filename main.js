const appShell = document.querySelector("#appShell");
const loadingView = document.querySelector("#loadingView");
const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item")];
const bottomNav = document.querySelector(".bottom-nav");
const activityEmbeddedFrame = document.querySelector(".activity-embedded-frame");
const workbenchScroll = document.querySelector(".workbench-scroll");
const screenModal = document.querySelector("#bottomSheet");
const sheetBackdrop = document.querySelector("#sheetBackdrop");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetContent = document.querySelector("#sheetContent");
const closeSheetButton = document.querySelector("#closeSheet");
const toast = document.querySelector("#toast");
const toastMessage = document.querySelector("[data-toast-message]");
const toastIcon = toast.querySelector(".toast-icon i");

let activePage = "workbench";
let workbenchScrollTop = 0;
let lastFocusedElement = null;
let toastTimer = null;
let preventionCatalogParent = "prevention";
let inspectionParentPage = "preventionCatalog";
let preventionTaskParent = "prevention";
let applicationDetailReturnPage = "favorites";

const sheetData = {
  messages: {
    context: "消息中心",
    title: "待处理消息",
    body: "消息按流程、预警和任务分类，完成事项后状态会自动更新。",
    items: [
      ["流程消息", "动火作业审批待处理"],
      ["预警消息", "东区临边防护需要复核"],
      ["任务消息", "完成班前安全确认"],
    ],
  },
  workflow: {
    context: "流程消息",
    title: "动火作业审批",
    body: "申请资料已提交，当前需要确认现场隔离措施与监护人安排。",
    action: "进入审批",
  },
  warning: {
    context: "预警消息",
    title: "临边防护复核",
    body: "东区作业面临边防护状态发生变化，请到现场确认并提交复核结果。",
    action: "查看位置",
  },
  task: {
    context: "任务消息",
    title: "班前安全确认",
    body: "请在作业开始前完成当班人员、劳保用品与作业环境确认。",
    action: "开始任务",
  },
  launch: {
    context: "新建",
    title: "发起工作表",
    body: "选择固定模板，或从业务系统中打开需要填报的工作表。",
    items: [
      ["临时工作表", "固定表模板"],
      ["临时任务", "固定表模板"],
      ["临时流程", "固定表模板"],
      ["现场检查记录", "安全管理系统"],
      ["设备保养记录", "设备保障系统"],
    ],
  },
  "activity-risk": {
    context: "风险提醒",
    title: "脚手架通道复核",
    body: "现场巡查发现东区脚手架通道的防护状态需要再次确认。复核完成后，请上传现场记录。",
    action: "查看详情",
  },
  "activity-fix": {
    context: "整改反馈",
    title: "临时用电检查",
    body: "责任部门已提交整改结果，目前等待安全管理人员复核。",
    action: "进入复核",
  },
  "activity-meeting": {
    context: "工作动态",
    title: "专项培训已归档",
    body: "高处作业专项培训记录已经归档，可在培训记录中查看人员签认情况。",
    action: "查看记录",
  },
  "activity-check": {
    context: "复查完成",
    title: "消防通道恢复畅通",
    body: "仓储区消防通道的堆放物已清理，现场复查完成，本事项已经闭环。",
    action: "查看记录",
  },
};

function createSheetMarkup(data) {
  const items = data.items
    ? `<div class="sheet-list">${data.items
        .map(
          ([title, meta]) => `
            <button type="button" data-sheet-item="${title}">
              <span class="row-icon" aria-hidden="true"><i class="ph ph-file-text"></i></span>
              <span><strong>${title}</strong><small>${meta}</small></span>
              <i class="ph ph-caret-right" aria-hidden="true"></i>
            </button>`,
        )
        .join("")}</div>`
    : "";

  const action = data.action
    ? `<button class="sheet-primary" type="button" data-sheet-action="${data.action}">${data.action}</button>`
    : "";

  return `<p class="sheet-summary">${data.body}</p>${items}${action}`;
}

function openSheet(key, trigger) {
  const data = sheetData[key];
  if (!data) return;

  lastFocusedElement = trigger || document.activeElement;
  sheetTitle.textContent = data.title;
  sheetContent.innerHTML = createSheetMarkup(data);
  sheetBackdrop.hidden = false;
  screenModal.hidden = false;
  document.body.classList.add("sheet-open");
  closeSheetButton.focus();
}

function closeSheet() {
  screenModal.hidden = true;
  sheetBackdrop.hidden = true;
  document.body.classList.remove("sheet-open");
  lastFocusedElement?.focus();
}

function hideToast() {
  window.clearTimeout(toastTimer);
  toast.hidden = true;
}

function showToast(message, type = "notice") {
  window.clearTimeout(toastTimer);
  toast.classList.toggle("is-favorite", type === "favorite");
  toastMessage.textContent = message;
  toastIcon.className = type === "favorite" ? "ph-fill ph-star" : "ph ph-check-circle";
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    hideToast();
  }, 3200);
}

function switchPage(pageName, navItem) {
  if (pageName === activePage) return;
  if (activePage === "workbench") workbenchScrollTop = workbenchScroll.scrollTop;
  if (pageName !== "activity") appShell.classList.remove("is-activity-detail", "is-activity-scrolled");
  appShell.classList.remove("is-detail-page");
  activePage = pageName;

  pages.forEach((page) => {
    const isActive = page.dataset.page === pageName;
    page.hidden = !isActive;
    page.classList.toggle("is-active", isActive);
    if (isActive) {
      page.classList.remove("is-entering");
      requestAnimationFrame(() => page.classList.add("is-entering"));
      page.querySelector(".page-scroll")?.scrollTo({ top: pageName === "workbench" ? workbenchScrollTop : 0 });
    }
  });

  navItems.forEach((item) => {
    const isActive = item === navItem;
    item.classList.toggle("is-active", isActive);
    item.toggleAttribute("aria-current", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
  });

  const index = navItems.indexOf(navItem);
  bottomNav.style.setProperty("--nav-index", index);
}

window.addEventListener("message", (event) => {
  if (event.source !== activityEmbeddedFrame?.contentWindow) return;
  if (event.data?.type === "activity-detail-state") {
    const isDetail = Boolean(event.data.isDetail);
    appShell.classList.toggle("is-activity-detail", isDetail);
    if (isDetail) appShell.classList.remove("is-activity-scrolled");
    return;
  }
  if (event.data?.type === "activity-scroll-state" && !appShell.classList.contains("is-activity-detail")) {
    appShell.classList.toggle("is-activity-scrolled", Boolean(event.data.isScrolled));
  }
});

activityEmbeddedFrame?.addEventListener("load", () => {
  appShell.classList.remove("is-activity-detail", "is-activity-scrolled");
});

function openMessagesPage() {
  openDetailPage("messages");
}

function closeDetailPage() {
  appShell.classList.remove("is-detail-page");
  activePage = "";
  switchPage("workbench", navItems[0]);
}

function openApplicationDetail(pageName, returnPage = "favorites") {
  applicationDetailReturnPage = returnPage;
  openDetailPage(pageName);
}

function closeApplicationDetail() {
  appShell.classList.remove("is-detail-page");
  activePage = "";
  const returnNavItem = navItems.find((item) => item.dataset.pageTarget === applicationDetailReturnPage);
  switchPage(applicationDetailReturnPage, returnNavItem);
}

function openDetailPage(pageName) {
  if (activePage === "workbench") workbenchScrollTop = workbenchScroll.scrollTop;
  activePage = pageName;
  pages.forEach((page) => {
    const isActive = page.dataset.page === pageName;
    page.hidden = !isActive;
    page.classList.toggle("is-active", isActive);
    if (isActive) {
      page.classList.remove("is-entering");
      requestAnimationFrame(() => page.classList.add("is-entering"));
      page.querySelector(".page-scroll")?.scrollTo({ top: 0 });
    }
  });
  appShell.classList.add("is-detail-page");
}

function closeProfileCenter() {
  appShell.classList.remove("is-detail-page");
  activePage = "";
  switchPage("profile", navItems.find((item) => item.dataset.pageTarget === "profile"));
}

function closeOfflineManagement() {
  appShell.classList.remove("is-detail-page");
  activePage = "";
  switchPage("profile", navItems.find((item) => item.dataset.pageTarget === "profile"));
}

function closePendingUploads() {
  openDetailPage("offlineManagement");
}

function closePreventionPage() {
  closeApplicationDetail();
}

function openPreventionCatalog(parentPage) {
  preventionCatalogParent = parentPage;
  openDetailPage("preventionCatalog");
}

function openPreventionTaskPublish(parentPage = "prevention") {
  preventionTaskParent = parentPage;
  openDetailPage("preventionTaskPublish");
}

let inspectionOfflineMode = false;
let inspectionOfflineReport = null;

function openInspection(parentPage = "preventionCatalog", report = null) {
  inspectionParentPage = parentPage;
  inspectionOfflineMode = parentPage === "workbench";
  inspectionOfflineReport = report;
  applyInspectionMode();
  setInspectionTab("page");
  openDetailPage("inspection");
}

/* 离线填报保留暂存语义；工作台工作表沿用完整的页面与草稿箱 mock。 */
const inspectionWorksheetMeta = {
  inspection: {
    checks: ["凿岩设备防护装置完好", "作业面通风与照明符合要求", "人员防护用品佩戴规范", "作业区域警示标识与现场秩序符合要求", "应急器材、通讯和避灾路线满足要求"],
    location: "西翼 3# 平巷",
  },
  "operation-post": {
    checks: ["作业前安全确认、交接班记录完整", "设备防护、制动及警示装置完好有效", "作业区域顶板、边帮和行车路线安全", "现场警戒、信号联络和人员站位符合要求", "劳动防护用品、应急器材和避灾路线符合要求"],
    location: "西翼运输巷装卸点",
    position: "装载机司机",
    operation: "装矿、行驶及卸载作业",
  },
  "fire-facility": {
    checks: ["灭火器压力正常、铅封完好", "消火栓箱体及水带完好", "疏散通道和安全出口畅通", "消防标识与巡检记录齐全", "应急照明及报警设施运行正常"],
    location: "主厂房消防通道",
  },
  "hoist-daily": {
    checks: ["提升机制动系统灵敏可靠", "钢丝绳无断丝、变形", "信号与保护装置有效", "作业区域警示标识与现场秩序符合要求", "应急器材、通讯和避灾路线满足要求"],
    location: "北区提升机房",
  },
};

function applyInspectionMode() {
  const titleEl = document.querySelector("#inspectionTitle");
  const tabsEl = document.querySelector("#inspectionTabs");
  const submitBtn = inspectionForm.querySelector(".inspection-action-submit");
  const defaultTitle = "平巷凿岩作业岗位隐患排查表";
  const meta = inspectionWorksheetMeta[inspectionOfflineReport?.id] || inspectionWorksheetMeta.inspection;

  if (titleEl) {
    titleEl.textContent = inspectionOfflineReport?.title
      ? inspectionOfflineReport.title
      : defaultTitle;
  }
  const isOperationWorksheet = inspectionOfflineReport?.id === "operation-post";
  inspectionForm.querySelectorAll(".inspection-operation-field").forEach((field) => {
    field.hidden = !isOperationWorksheet;
  });
  const position = inspectionForm.querySelector("#inspectionPosition");
  const operation = inspectionForm.querySelector("#inspectionOperation");
  if (position) position.value = isOperationWorksheet ? meta.position || "" : "";
  if (operation) operation.value = isOperationWorksheet ? meta.operation || "" : "";
  if (tabsEl) tabsEl.hidden = inspectionOfflineMode;
  saveInspectionDraft.textContent = inspectionOfflineMode ? "暂存" : "存草稿";
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "提交";
    submitBtn.classList.remove("is-submitting");
  }
  /* 两条离线工作表用各自的口径，避免标题与检查项对不上 */
  inspectionForm.querySelectorAll(".inspection-check-row > span").forEach((label, index) => {
    if (meta.checks[index]) label.textContent = meta.checks[index];
  });
  if (inspectionOfflineMode) prefillInspectionDemo(meta.location);
  renderInspectionDraft();
}

function prefillInspectionDemo(location) {
  const textInputs = inspectionForm.querySelectorAll('input[type="text"]');
  if (textInputs[1]) textInputs[1].value = location || "西翼 3# 平巷";
  ["equipment", "environment", "protection", "siteOrganization", "emergencyReadiness"].forEach((name) => {
    if (inspectionForm.querySelector(`input[name="${name}"]:checked`)) return;
    const normal = inspectionForm.querySelector(`input[name="${name}"][value="normal"]`);
    if (normal) normal.checked = true;
  });
}

function closeInspection() {
  if (inspectionParentPage === "favorites" || inspectionParentPage === "workbench" || inspectionParentPage === "workbenchWorksheet") {
    appShell.classList.remove("is-detail-page");
    activePage = "";
    if (inspectionParentPage === "workbench" || inspectionParentPage === "workbenchWorksheet") {
      switchPage("workbench", navItems.find((item) => item.dataset.pageTarget === "workbench"));
    } else {
      switchPage("favorites", navItems.find((item) => item.dataset.pageTarget === "favorites"));
    }
    return;
  }
  openDetailPage(inspectionParentPage);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => switchPage(item.dataset.pageTarget, item));
});

document.querySelectorAll("[data-open-messages-page]").forEach((trigger) => {
  trigger.addEventListener("click", openMessagesPage);
});

document.querySelector("[data-close-messages-page]").addEventListener("click", closeDetailPage);

document.querySelectorAll("[data-open-process-page]").forEach((trigger) => trigger.addEventListener("click", () => openDetailPage("processes")));
document.querySelector("[data-close-process-page]").addEventListener("click", closeDetailPage);
document.querySelector("[data-open-app-organizer]").addEventListener("click", openAppOrganizer);
document.querySelector("[data-close-app-organizer]").addEventListener("click", closeAppOrganizer);

const workbenchSearchInput = document.querySelector("[data-subsystem-search]");
const workbenchSearchForm = document.querySelector(".subsystem-search-form");
const workbenchSearchItems = [...document.querySelectorAll("[data-subsystem-search-item]")];
const workbenchSearchTypes = [...document.querySelectorAll("[data-subsystem-search-type]")];
const workbenchSearchCount = document.querySelector("[data-subsystem-search-count]");
const workbenchSearchEmpty = document.querySelector("[data-subsystem-search-empty]");
let activeWorkbenchSearchType = "all";

function isFuzzyMatch(query, text) {
  const normalizedQuery = query.toLocaleLowerCase().replace(/\s+/g, "");
  const normalizedText = text.toLocaleLowerCase().replace(/\s+/g, "");
  if (!normalizedQuery) return true;
  if (normalizedText.includes(normalizedQuery)) return true;

  let cursor = 0;
  for (const character of normalizedQuery) {
    cursor = normalizedText.indexOf(character, cursor);
    if (cursor === -1) return false;
    cursor += 1;
  }
  return true;
}

function applyWorkbenchSearch() {
  const query = workbenchSearchInput.value.trim();
  let visibleCount = 0;
  workbenchSearchItems.forEach((item) => {
    const matchesType = activeWorkbenchSearchType === "all" || item.dataset.searchType === activeWorkbenchSearchType;
    const matchesQuery = isFuzzyMatch(query, item.dataset.searchText);
    const isVisible = matchesType && matchesQuery;
    item.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });
  workbenchSearchCount.textContent = `${visibleCount} 项`;
  workbenchSearchEmpty.hidden = visibleCount !== 0;
}

function openWorkbenchSearch() {
  workbenchSearchInput.value = "";
  activeWorkbenchSearchType = "all";
  workbenchSearchTypes.forEach((type) => {
    const isActive = type.dataset.subsystemSearchType === "all";
    type.classList.toggle("is-active", isActive);
    type.setAttribute("aria-selected", String(isActive));
  });
  applyWorkbenchSearch();
  openDetailPage("workbenchSearch");
  window.setTimeout(() => workbenchSearchInput.focus(), 180);
}

document.querySelector("[data-open-workbench-search]").addEventListener("click", openWorkbenchSearch);
document.querySelector("[data-close-workbench-search]").addEventListener("click", closeDetailPage);
const warningTasksFrame = document.querySelector(".warning-tasks-frame");
const warningHelpToggle = document.querySelector("[data-warning-help-toggle]");
const warningDescriptionPanel = document.querySelector("[data-warning-description-panel]");
const taskTasksFrame = document.querySelector(".task-tasks-frame");
const taskHelpToggle = document.querySelector("[data-task-help-toggle]");
const taskDescriptionPanel = document.querySelector("[data-task-description-panel]");

function openWarningTasks() {
  warningHelpToggle.checked = false;
  warningDescriptionPanel.hidden = true;
  openDetailPage("warningTasks");
}

function openWarningTodo() {
  openWarningTasks();
  warningTasksFrame?.contentWindow?.postMessage({ type: "warning-tasks:show-todo" }, "*");
}

function closeWarningTasks() {
  warningHelpToggle.checked = false;
  warningDescriptionPanel.hidden = true;
  closeDetailPage();
}

function goBackFromWarningTasks() {
  warningTasksFrame?.contentWindow?.postMessage({ type: "warning-tasks:back" }, "*");
}

document.querySelectorAll("[data-open-warning-tasks]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (trigger.hasAttribute("data-warning-todo")) openWarningTodo();
    else openWarningTasks();
  });
});
document.querySelector("[data-close-warning-tasks]").addEventListener("click", goBackFromWarningTasks);
warningHelpToggle.addEventListener("change", () => {
  warningDescriptionPanel.hidden = !warningHelpToggle.checked;
});
window.addEventListener("message", (event) => {
  if (event.source === warningTasksFrame?.contentWindow && event.data?.type === "warning-tasks:close") closeWarningTasks();
  if (event.source === taskTasksFrame?.contentWindow && event.data?.type === "task-tasks:close") closeTaskTasks();
});
function openTaskTasks() {
  taskHelpToggle.checked = false;
  taskDescriptionPanel.hidden = true;
  openDetailPage("taskTasks");
}

function openTaskTodo() {
  openTaskTasks();
  taskTasksFrame?.contentWindow?.postMessage({ type: "task-tasks:show-todo" }, "*");
}

function closeTaskTasks() {
  taskHelpToggle.checked = false;
  taskDescriptionPanel.hidden = true;
  closeDetailPage();
}

document.querySelectorAll("[data-open-task-tasks]").forEach((trigger) => {
  trigger.addEventListener("click", openTaskTasks);
});
document.querySelector("[data-open-task-todo]")?.addEventListener("click", openTaskTodo);
document.querySelector("[data-close-task-tasks]").addEventListener("click", () => {
  taskTasksFrame?.contentWindow?.postMessage({ type: "task-tasks:back" }, "*");
});
taskHelpToggle.addEventListener("change", () => {
  taskDescriptionPanel.hidden = !taskHelpToggle.checked;
});
document.querySelector("[data-clear-subsystem-search]").addEventListener("click", () => {
  workbenchSearchInput.value = "";
  applyWorkbenchSearch();
  workbenchSearchInput.focus();
});
workbenchSearchForm.addEventListener("submit", (event) => event.preventDefault());
workbenchSearchInput.addEventListener("input", applyWorkbenchSearch);
workbenchSearchTypes.forEach((type) => {
  type.addEventListener("click", () => {
    activeWorkbenchSearchType = type.dataset.subsystemSearchType;
    workbenchSearchTypes.forEach((item) => {
      const isActive = item === type;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    applyWorkbenchSearch();
  });
});
workbenchSearchItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.dataset.searchTarget === "inspection") openInspection("workbenchSearch");
    else if (item.dataset.searchTarget === "prevention-two-catalog") {
      applicationDetailReturnPage = "workbench";
      openPreventionCatalog("preventionTwoHazards");
    }
    else if (item.dataset.searchTarget === "processes") openDetailPage("processes");
    else if (item.dataset.searchAction) showToast(item.dataset.searchAction);
  });
});

document.querySelectorAll("[data-open-profile-center]").forEach((button) => {
  button.addEventListener("click", () => openDetailPage("profileCenter"));
});
document.querySelector("[data-close-profile-center]").addEventListener("click", closeProfileCenter);
document.querySelectorAll("[data-open-signature-management]").forEach((button) => {
  button.addEventListener("click", openSignatureManagement);
});
document.querySelector("[data-close-signature-management]").addEventListener("click", closeSignatureManagement);
document.querySelector("[data-close-offline-management]").addEventListener("click", closeOfflineManagement);
document.querySelector("[data-open-pending-uploads]").addEventListener("click", () => openDetailPage("pendingUploads"));
document.querySelector("[data-close-pending-uploads]").addEventListener("click", closePendingUploads);

document.querySelectorAll("[data-open-prevention]").forEach((trigger) => trigger.addEventListener("click", () => openApplicationDetail("prevention")));
document.querySelector("[data-close-prevention]").addEventListener("click", closePreventionPage);
document.querySelector("[data-open-prevention-catalog]").addEventListener("click", () => openPreventionCatalog("prevention"));
document.querySelectorAll("[data-open-prevention-task-publish]").forEach((trigger) => {
  trigger.addEventListener("click", () => openPreventionTaskPublish(trigger.closest('[data-page]')?.dataset.page === "preventionTwoHazards" ? "preventionTwoHazards" : "prevention"));
});
document.querySelectorAll("[data-back-prevention-task-publish]").forEach((button) => {
  button.addEventListener("click", () => openDetailPage(preventionTaskParent));
});
document.querySelectorAll("[data-open-prevention-two]").forEach((trigger) => trigger.addEventListener("click", () => openApplicationDetail("preventionTwo")));
document.querySelector("[data-close-prevention-two]").addEventListener("click", closeApplicationDetail);
document.querySelector("[data-open-prevention-two-hazards]").addEventListener("click", () => openDetailPage("preventionTwoHazards"));
document.querySelector("[data-back-prevention-two]").addEventListener("click", () => openDetailPage("preventionTwo"));
document.querySelector("[data-open-prevention-two-catalog]").addEventListener("click", () => openPreventionCatalog("preventionTwoHazards"));
document.querySelector("[data-open-operation-inspection]").addEventListener("click", () => {
  openInspection("preventionCatalog", { id: "operation-post", title: "操作作业岗位隐患排查表" });
});
document.querySelector("[data-back-prevention-parent]").addEventListener("click", () => openDetailPage(preventionCatalogParent));
document.querySelector("[data-open-inspection]").addEventListener("click", () => openInspection());
document.querySelectorAll("[data-open-workbench-worksheet]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openInspection("workbenchWorksheet", { id: "inspection", title: trigger.dataset.worksheetTitle });
  });
});
document.querySelectorAll("[data-back-prevention-catalog]").forEach((button) => {
  button.addEventListener("click", closeInspection);
});

document.querySelectorAll("[data-open-fire-management]").forEach((trigger) => {
  trigger.addEventListener("click", () => openApplicationDetail("fireManagement"));
});
document.querySelector("[data-close-fire-management]").addEventListener("click", closeApplicationDetail);
document.querySelector("[data-open-fire-inspection-menu]").addEventListener("click", () => openDetailPage("fireInspectionMenu"));
document.querySelector("[data-back-fire-management]").addEventListener("click", () => openDetailPage("fireManagement"));
document.querySelector("[data-open-fire-worksheets]").addEventListener("click", () => openDetailPage("fireWorksheets"));
document.querySelector("[data-back-fire-inspection-menu]").addEventListener("click", () => openDetailPage("fireInspectionMenu"));
document.querySelector("[data-open-fire-worksheet-form]").addEventListener("click", () => openDetailPage("fireWorksheetForm"));
document.querySelectorAll("[data-back-fire-worksheets]").forEach((button) => {
  button.addEventListener("click", () => openDetailPage("fireWorksheets"));
});

const workbenchRecentsToggle = document.querySelector("[data-toggle-workbench-recents]");
const workbenchRecentsLabel = workbenchRecentsToggle.querySelector("span");
const extraRecentEntries = document.querySelectorAll("#workbenchRecentEntries [data-extra-recent]");

workbenchRecentsToggle.addEventListener("click", () => {
  const expanded = workbenchRecentsToggle.getAttribute("aria-expanded") === "false";
  workbenchRecentsToggle.setAttribute("aria-expanded", String(expanded));
  workbenchRecentsLabel.textContent = expanded ? "收起" : "展开";
  extraRecentEntries.forEach((entry) => {
    entry.hidden = !expanded;
  });
});

const favoriteAppGrid = document.querySelector("[data-favorite-app-grid]");
const applicationsHost = document.querySelector("[data-applications-host]");
const applicationRecentList = document.querySelector("#applicationRecentList");
const applicationRecentEmpty = document.querySelector("#applicationRecentEmpty");
const applicationRecentSection = applicationRecentList.closest(".application-recent-section");
const appSection = favoriteAppGrid?.closest(".app-section");
const applicationRecentStorageKey = "mobile-bottom-nav-application-recents";
let applicationRecents = [];

try {
  const savedApplicationRecents = JSON.parse(window.localStorage.getItem(applicationRecentStorageKey));
  if (Array.isArray(savedApplicationRecents)) applicationRecents = savedApplicationRecents.slice(0, 4);
} catch {
  // The current session can still keep recent applications when storage is unavailable.
}

applicationsHost?.append(appSection);

function persistApplicationRecents() {
  try {
    window.localStorage.setItem(applicationRecentStorageKey, JSON.stringify(applicationRecents));
  } catch {
    // The current session can still keep recent applications when storage is unavailable.
  }
}

function renderApplicationRecents() {
  const hasRecents = applicationRecents.length > 0;
  applicationRecentSection.hidden = !hasRecents;
  applicationRecentList.replaceChildren();
  applicationRecentList.hidden = !hasRecents;
  applicationRecentEmpty.hidden = hasRecents;

  applicationRecents.forEach((app) => {
    const entry = document.createElement("button");
    entry.className = "application-recent-entry";
    entry.type = "button";
    entry.innerHTML = `<span aria-hidden="true"><i class="${app.iconClass}"></i></span><strong>${app.name}</strong>`;
    entry.addEventListener("click", () => {
      favoriteAppGrid.querySelector(`[data-app-item="${app.id}"] .app-entry`)?.click();
    });
    applicationRecentList.append(entry);
  });
}

function rememberApplication(entry) {
  const item = entry.closest("[data-app-item]");
  if (!item) return;
  const app = {
    id: item.dataset.appItem,
    name: entry.querySelector("strong")?.textContent.trim() || "应用",
    iconClass: entry.querySelector("span i")?.className || "ph ph-squares-four",
  };
  applicationRecents = [app, ...applicationRecents.filter((recent) => recent.id !== app.id)].slice(0, 4);
  persistApplicationRecents();
  renderApplicationRecents();
}

favoriteAppGrid.addEventListener("click", (event) => {
  const entry = event.target.closest(".app-entry");
  if (entry) rememberApplication(entry);
});

renderApplicationRecents();

const appOrganizerList = document.querySelector("[data-app-organizer-list]");
const appOrganizerPage = document.querySelector("[data-page=\"appOrganizer\"]");
const appOrganizerTip = appOrganizerPage.querySelector(".app-organizer-tip");
const appOrganizerEditButton = document.querySelector("[data-toggle-app-organizer-edit]");
const appOrganizerSearchInput = document.querySelector("[data-app-organizer-search]");
const appOrganizerSearchClear = document.querySelector("[data-clear-app-organizer-search]");
const appOrganizerEmpty = document.querySelector("[data-app-organizer-empty]");
const appLayoutStorageKey = "mobile-bottom-nav-app-layout";
let draggedOrganizerItem = null;
let isEditingAppOrganizer = false;

/* 全部应用：按应用名称搜索（编辑态下也可以边搜边调顺序） */
function filterAppOrganizer(keyword) {
  const text = (keyword || "").trim().toLowerCase();
  let matched = 0;
  appOrganizerList.querySelectorAll("[data-app-organizer-item]").forEach((item) => {
    const name = (item.querySelector("strong")?.textContent || "").toLowerCase();
    const hit = !text || name.includes(text);
    item.hidden = !hit;
    if (hit) matched += 1;
  });
  if (appOrganizerEmpty) appOrganizerEmpty.hidden = matched > 0 || !text;
  if (appOrganizerSearchClear) appOrganizerSearchClear.hidden = !text;
}

if (appOrganizerSearchInput) {
  appOrganizerSearchInput.addEventListener("input", (event) => filterAppOrganizer(event.target.value));
  appOrganizerSearchInput.addEventListener("search", (event) => filterAppOrganizer(event.target.value));
}
if (appOrganizerSearchClear) {
  appOrganizerSearchClear.addEventListener("click", () => {
    if (!appOrganizerSearchInput) return;
    appOrganizerSearchInput.value = "";
    filterAppOrganizer("");
    appOrganizerSearchInput.focus();
  });
}

function setAppOrganizerEditing(isEditing) {
  isEditingAppOrganizer = isEditing;
  appOrganizerPage.classList.toggle("is-editing", isEditing);
  appOrganizerTip.hidden = !isEditing;
  appOrganizerEditButton.textContent = isEditing ? "完成" : "编辑";
  appOrganizerList.querySelectorAll("[data-app-organizer-item]").forEach((item) => {
    item.tabIndex = isEditing ? -1 : 0;
    item.setAttribute("role", isEditing ? "listitem" : "button");
  });
}

function openAppOrganizer() {
  setAppOrganizerEditing(false);
  if (appOrganizerSearchInput) appOrganizerSearchInput.value = "";
  filterAppOrganizer("");
  openDetailPage("appOrganizer");
}

function closeAppOrganizer() {
  setAppOrganizerEditing(false);
  appShell.classList.remove("is-detail-page");
  activePage = "";
  switchPage("favorites", navItems.find((item) => item.dataset.pageTarget === "favorites"));
}

function openOrganizerApp(item) {
  const appId = item.dataset.appOrganizerItem;
  if (appId === "prevention") {
    openApplicationDetail("prevention");
    return;
  }
  if (appId === "prevention-two") {
    openApplicationDetail("preventionTwo");
    return;
  }
  if (appId === "fire-protection") {
    openApplicationDetail("fireManagement");
    return;
  }
  showToast(`已进入${item.querySelector("strong").textContent}`);
}

function persistAppLayout() {
  const layout = [...appOrganizerList.querySelectorAll("[data-app-organizer-item]")].map((item) => ({
    id: item.dataset.appOrganizerItem,
    visible: item.querySelector("[data-app-visibility]").checked,
  }));
  try {
    window.localStorage.setItem(appLayoutStorageKey, JSON.stringify(layout));
  } catch {
    // The current session still keeps the latest layout when storage is unavailable.
  }
}

function syncFavoriteApps(shouldPersist = true) {
  [...appOrganizerList.querySelectorAll("[data-app-organizer-item]")].forEach((organizerItem) => {
    const appId = organizerItem.dataset.appOrganizerItem;
    const favoriteItem = favoriteAppGrid.querySelector(`[data-app-item="${appId}"]`);
    if (!favoriteItem) return;
    favoriteItem.hidden = !organizerItem.querySelector("[data-app-visibility]").checked;
    favoriteAppGrid.append(favoriteItem);
  });
  if (shouldPersist) persistAppLayout();
}

function restoreAppLayout() {
  try {
    const savedLayout = JSON.parse(window.localStorage.getItem(appLayoutStorageKey));
    if (Array.isArray(savedLayout)) {
      savedLayout.forEach(({ id, visible }) => {
        const organizerItem = appOrganizerList.querySelector(`[data-app-organizer-item="${id}"]`);
        if (!organizerItem) return;
        organizerItem.querySelector("[data-app-visibility]").checked = visible !== false;
        appOrganizerList.append(organizerItem);
      });
    }
  } catch {
    try {
      window.localStorage.removeItem(appLayoutStorageKey);
    } catch {
      // No recovery is needed when browser storage itself is unavailable.
    }
  }
  syncFavoriteApps(false);
}

function clearDropTargets() {
  appOrganizerList.querySelectorAll(".is-drop-target").forEach((item) => item.classList.remove("is-drop-target"));
}

function moveDraggedOrganizerItem(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY)?.closest("[data-app-organizer-item]");
  if (!target || target === draggedOrganizerItem || !appOrganizerList.contains(target)) return;
  const targetBounds = target.getBoundingClientRect();
  clearDropTargets();
  target.classList.add("is-drop-target");
  if (clientY < targetBounds.top + targetBounds.height / 2) {
    appOrganizerList.insertBefore(draggedOrganizerItem, target);
  } else {
    appOrganizerList.insertBefore(draggedOrganizerItem, target.nextElementSibling);
  }
}

function finishOrganizerDrag() {
  if (!draggedOrganizerItem) return;
  draggedOrganizerItem.classList.remove("is-dragging");
  clearDropTargets();
  draggedOrganizerItem = null;
  syncFavoriteApps();
}

appOrganizerList.addEventListener("pointerdown", (event) => {
  if (!isEditingAppOrganizer) return;
  const handle = event.target.closest(".app-drag-handle");
  if (!handle) return;
  draggedOrganizerItem = handle.closest("[data-app-organizer-item]");
  handle.setPointerCapture(event.pointerId);
  draggedOrganizerItem.classList.add("is-dragging");
  event.preventDefault();
});

appOrganizerList.addEventListener("pointermove", (event) => {
  if (!draggedOrganizerItem) return;
  moveDraggedOrganizerItem(event.clientX, event.clientY);
});

appOrganizerList.addEventListener("pointerup", finishOrganizerDrag);
appOrganizerList.addEventListener("pointercancel", finishOrganizerDrag);
appOrganizerList.addEventListener("change", (event) => {
  if (isEditingAppOrganizer && event.target.matches("[data-app-visibility]")) syncFavoriteApps();
});

appOrganizerList.addEventListener("click", (event) => {
  if (isEditingAppOrganizer) return;
  const item = event.target.closest("[data-app-organizer-item]");
  if (item) openOrganizerApp(item);
});

appOrganizerList.addEventListener("keydown", (event) => {
  if (isEditingAppOrganizer || !["Enter", " "].includes(event.key)) return;
  const item = event.target.closest("[data-app-organizer-item]");
  if (!item) return;
  event.preventDefault();
  openOrganizerApp(item);
});

appOrganizerEditButton.addEventListener("click", () => setAppOrganizerEditing(!isEditingAppOrganizer));

restoreAppLayout();

const hazardMenuToggle = document.querySelector("[data-toggle-hazard-menu]");
const hazardMenu = document.querySelector("#hazardMenu");

hazardMenuToggle.addEventListener("click", () => {
  const isExpanded = hazardMenuToggle.getAttribute("aria-expanded") === "true";
  hazardMenuToggle.setAttribute("aria-expanded", String(!isExpanded));
  hazardMenu.hidden = isExpanded;
  hazardMenuToggle.querySelector(".ph:last-child").className = isExpanded ? "ph ph-caret-right" : "ph ph-caret-down";
});

const inspectionForm = document.querySelector("#inspectionForm");
const saveInspectionDraft = document.querySelector("#saveInspectionDraft");
const inspectionTabs = [...document.querySelectorAll("[data-inspection-tab]")];
const inspectionPanels = [...document.querySelectorAll("[data-inspection-panel]")];
const inspectionDraftCard = document.querySelector("#inspectionDraftCard");
const inspectionDraftEmpty = document.querySelector("#inspectionDraftEmpty");
const inspectionDraftTime = document.querySelector("#inspectionDraftTime");
const openInspectionDraft = document.querySelector("#openInspectionDraft");
const preventionTaskPublishForm = document.querySelector("#preventionTaskPublishForm");
const savePreventionTaskDraft = document.querySelector("[data-save-prevention-task-draft]");
const inspectionDraftStorageKey = "mobile-bottom-nav-inspection-draft";
let inspectionDraft = null;

try {
  inspectionDraft = JSON.parse(localStorage.getItem(inspectionDraftStorageKey));
} catch {
  localStorage.removeItem(inspectionDraftStorageKey);
}

function setInspectionTab(tabName) {
  inspectionTabs.forEach((tab) => {
    const isActive = tab.dataset.inspectionTab === tabName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  inspectionPanels.forEach((panel) => {
    panel.hidden = panel.dataset.inspectionPanel !== tabName;
  });
}

function getInspectionDraftData() {
  return {
    title: document.querySelector("#inspectionTitle")?.textContent || "平巷凿岩作业岗位隐患排查表",
    reporter: inspectionForm.querySelector("#inspectionReporter").value,
    inspectionDate: inspectionForm.querySelector("#inspectionDate").value,
    shift: inspectionForm.querySelector("#inspectionShift").value,
    location: inspectionForm.querySelector("#inspectionLocation").value,
    position: inspectionForm.querySelector("#inspectionPosition").value,
    operation: inspectionForm.querySelector("#inspectionOperation").value,
    equipment: inspectionForm.querySelector('input[name="equipment"]:checked')?.value || "",
    environment: inspectionForm.querySelector('input[name="environment"]:checked')?.value || "",
    protection: inspectionForm.querySelector('input[name="protection"]:checked')?.value || "",
    siteOrganization: inspectionForm.querySelector('input[name="siteOrganization"]:checked')?.value || "",
    emergencyReadiness: inspectionForm.querySelector('input[name="emergencyReadiness"]:checked')?.value || "",
    note: inspectionForm.querySelector("textarea").value,
    savedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  };
}

function applyInspectionDraft(draft) {
  inspectionForm.querySelector("#inspectionReporter").value = draft.reporter || "";
  inspectionForm.querySelector("#inspectionDate").value = draft.inspectionDate || "";
  inspectionForm.querySelector("#inspectionShift").value = draft.shift || "早班";
  inspectionForm.querySelector("#inspectionLocation").value = draft.location || "";
  inspectionForm.querySelector("#inspectionPosition").value = draft.position || "";
  inspectionForm.querySelector("#inspectionOperation").value = draft.operation || "";
  ["equipment", "environment", "protection", "siteOrganization", "emergencyReadiness"].forEach((name) => {
    const selected = inspectionForm.querySelector(`input[name="${name}"][value="${draft[name]}"]`);
    if (selected) selected.checked = true;
  });
  inspectionForm.querySelector("textarea").value = draft.note || "";
}

function renderInspectionDraft() {
  const hasDraft = Boolean(inspectionDraft?.savedAt);
  inspectionDraftCard.hidden = !hasDraft;
  inspectionDraftEmpty.hidden = hasDraft;
  if (hasDraft) {
    inspectionDraftCard.querySelector("strong").textContent = inspectionDraft.title || "平巷凿岩作业岗位隐患排查表";
    inspectionDraftTime.textContent = `保存于 ${inspectionDraft.savedAt}`;
  }
}

inspectionTabs.forEach((tab) => {
  tab.addEventListener("click", () => setInspectionTab(tab.dataset.inspectionTab));
});

saveInspectionDraft.addEventListener("click", () => {
  const hadDraft = Boolean(inspectionDraft?.savedAt);
  inspectionDraft = getInspectionDraftData();
  localStorage.setItem(inspectionDraftStorageKey, JSON.stringify(inspectionDraft));
  renderInspectionDraft();
  showToast(inspectionOfflineMode
    ? (hadDraft ? "已更新暂存内容" : "已暂存到本机")
    : (hadDraft ? "已更新草稿" : "已保存到草稿箱"));
});

openInspectionDraft.addEventListener("click", () => {
  if (!inspectionDraft) return;
  applyInspectionDraft(inspectionDraft);
  setInspectionTab("page");
  showToast("草稿已载入");
});

renderInspectionDraft();
inspectionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitBtn = inspectionForm.querySelector(".inspection-action-submit");
  if (submitBtn?.disabled) return;
  /* 离线填报入口默认按无网处理，便于演示「提交中 → 置灰」 */
  if (!isNetworkAvailable() || inspectionOfflineMode) {
    /* 无网：先提示「提交中」，随后按钮置灰不可再点 */
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-submitting");
      submitBtn.textContent = "提交中…";
    }
    showToast("提交中…");
    saveInspectionForOfflineUpload();
    window.setTimeout(() => {
      if (submitBtn) submitBtn.textContent = "待上报";
      showToast("当前网络不可用，已保存到本机，网络恢复后自动上报");
    }, 1400);
    return;
  }
  showToast("排查记录已提交");
});

savePreventionTaskDraft.addEventListener("click", () => showToast("隐患排查任务已保存为草稿"));
preventionTaskPublishForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("隐患排查任务已发布，已通知执行人员");
});

const fireWorksheetForm = document.querySelector("#fireWorksheetForm");
const saveFireWorksheetDraft = document.querySelector("#saveFireWorksheetDraft");

saveFireWorksheetDraft.addEventListener("click", () => showToast("消防巡检表已保存为草稿"));
fireWorksheetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("消防巡检表已提交");
  openDetailPage("fireWorksheets");
});

const messageStatusTabs = [...document.querySelectorAll("[data-message-status]")];
const messageFeedRows = [...document.querySelectorAll("[data-message-read-state]")];
const messageFeedEmpty = document.querySelector(".message-feed-empty");
const messageFilterSelects = [...document.querySelectorAll("[data-message-filter]")];
let selectedMessageStatus = "all";

function applyMessageFilters() {
  const selectedSource = document.querySelector('[data-message-filter="source"]').value;
  const selectedType = document.querySelector('[data-message-filter="type"]').value;
  let visibleCount = 0;

  messageFeedRows.forEach((row) => {
    const matchesSource = selectedSource === "all" || row.dataset.messageSource === selectedSource;
    const matchesType = selectedType === "all" || row.dataset.messageType === selectedType;
    const matchesStatus = selectedMessageStatus === "all" || row.dataset.messageReadState === selectedMessageStatus;
    const isVisible = matchesSource && matchesType && matchesStatus;

    row.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  messageFeedEmpty.hidden = visibleCount > 0;
}

messageStatusTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedMessageStatus = tab.dataset.messageStatus;

    messageStatusTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    applyMessageFilters();
  });
});

messageFilterSelects.forEach((select) => {
  select.addEventListener("change", applyMessageFilters);
});

const processTabs = [...document.querySelectorAll("[data-process-tab]")];
const processRows = [...document.querySelectorAll(".process-row")];
const processSearch = document.querySelector("[data-process-search]");
const processAppFilter = document.querySelector("[data-process-app]");
const processList = document.querySelector(".process-list");
const processEmpty = document.querySelector(".process-empty");
const processCount = document.querySelector("[data-process-count]");
const processListTitle = document.querySelector("[data-process-list-title]");
let selectedProcessStatus = "pending";

const processLabels = {
  pending: "待审批",
  approved: "已审批",
  copied: "抄送我的",
  mine: "我发起的",
  draft: "草稿箱",
};

function applyProcessFilters() {
  const query = processSearch.value.trim().toLocaleLowerCase("zh-CN");
  const appName = processAppFilter.value;
  let visibleCount = 0;

  processRows.forEach((row) => {
    const matchesStatus = row.dataset.processStatus === selectedProcessStatus;
    const matchesApp = appName === "all" || row.dataset.processAppName === appName;
    const matchesQuery = !query || row.dataset.processKeywords.toLocaleLowerCase("zh-CN").includes(query);
    const isVisible = matchesStatus && matchesApp && matchesQuery;

    row.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  processCount.textContent = String(visibleCount);
  processList.hidden = visibleCount === 0;
  processEmpty.hidden = visibleCount > 0;
}

function selectProcessTab(status) {
  selectedProcessStatus = status;
  processTabs.forEach((item) => {
    const isActive = item.dataset.processTab === status;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });
  processListTitle.textContent = processLabels[status];
  applyProcessFilters();
}

processTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectProcessTab(tab.dataset.processTab));
});

processSearch.addEventListener("input", applyProcessFilters);
processAppFilter.addEventListener("change", applyProcessFilters);
document.querySelector("#processFilters").addEventListener("submit", (event) => event.preventDefault());

const templateFilters = [...document.querySelectorAll("[data-template-filter]")];
const templateSearch = document.querySelector("[data-template-search]");
const templateButtons = [...document.querySelectorAll("[data-process-template]")];
const templateGroups = [...document.querySelectorAll("[data-template-group]")];
const templateEmpty = document.querySelector(".process-template-empty");
const processLaunchForm = document.querySelector("#processLaunchForm");
const formTemplateName = document.querySelector("[data-form-template-name]");
const formTemplateType = document.querySelector("[data-form-template-type]");
const formTemplateApp = document.querySelector("[data-form-template-app]");
const formTitle = document.querySelector("[data-form-title]");
const formRoute = document.querySelector("[data-form-route]");
const detailTabs = [...document.querySelectorAll("[data-detail-tab]")];
const detailPanes = [...document.querySelectorAll("[data-detail-pane]")];
const approvalPanel = document.querySelector("[data-approval-panel]");
const ownerActions = document.querySelector("[data-owner-actions]");
const moreProcessActions = document.querySelector("[data-more-process-actions]");
const processActionDialog = document.querySelector("[data-process-action-dialog]");
const processRejectDialog = document.querySelector("[data-process-reject-dialog]");
const processRefuseDialog = document.querySelector("[data-process-refuse-dialog]");
const processPersonDialog = document.querySelector("[data-process-person-dialog]");
const personPickerTitle = document.querySelector("[data-person-picker-title]");
const subactionPersonValue = document.querySelector("[data-subaction-person-value]");
const personBreadcrumb = document.querySelector("[data-person-breadcrumb]");
const personOrgList = document.querySelector("[data-person-org-list]");
const personBrowserBody = document.querySelector("[data-person-browser-body]");
const selectedPersonPanel = document.querySelector("[data-selected-person]");
const selectedPersonEmpty = document.querySelector("[data-selected-person-empty]");
const selectedPersonList = document.querySelector("[data-selected-person-list]");
const selectedPersonCount = document.querySelector("[data-selected-person-count]");
const subactionReason = document.querySelector("[data-subaction-reason]");
const approvalOpinion = document.querySelector("[data-approval-opinion]");
const rejectOpinion = document.querySelector("[data-reject-opinion]");
const refuseOpinion = document.querySelector("[data-refuse-opinion]");
const rejectDestinationNotice = document.querySelector("[data-reject-destination-notice]");
let selectedTemplateFilter = "recent";
let selectedProcessRow = null;
let activeSubaction = "转办";
let selectedSubactionPeople = [];
let activeOrganizationPath = [];
let expandedOrganizationIds = new Set(["mine"]);
let nextRejectDestinationIndex = 0;
let activeRejectDestination = null;

const personOrganization = {
  id: "group",
  label: "华北矿业集团",
  children: [
    {
      id: "mine",
      label: "矿山事业部",
      people: ["王海"],
      children: [
        { id: "safety", label: "安全管理部", people: ["周敏", "陈晓"] },
        { id: "equipment", label: "设备管理部", people: ["赵磊", "宋然"] },
        { id: "production", label: "生产技术部", people: ["李杰"] },
      ],
    },
    {
      id: "processing",
      label: "选矿事业部",
      people: ["方博"],
      children: [
        { id: "operations", label: "选矿运行部", people: ["杜航", "韩清"] },
      ],
    },
  ],
};

const rejectDestinations = [
  {
    notice: "驳回后将退回至上一节点。",
    summary: "已驳回至上一节点",
    toast: "流程已驳回至上一节点",
  },
  {
    notice: "驳回后将退回至发起人。",
    summary: "已驳回至发起人",
    toast: "流程已驳回至发起人",
  },
];

function selectDetailTab(tabName) {
  detailTabs.forEach((tab) => {
    const isActive = tab.dataset.detailTab === tabName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  detailPanes.forEach((pane) => {
    pane.hidden = pane.dataset.detailPane !== tabName;
  });
  document.querySelector(".process-detail-scroll").scrollTo({ top: 0 });
}

function applyTemplateFilters() {
  const query = templateSearch.value.trim().toLocaleLowerCase("zh-CN");
  let totalVisible = 0;

  templateGroups.forEach((group) => {
    const groupButtons = [...group.querySelectorAll("[data-process-template]")];
    let groupVisible = 0;

    groupButtons.forEach((button) => {
      const keywords = `${button.dataset.templateName} ${button.dataset.templateApp} ${button.dataset.templateType}`.toLocaleLowerCase("zh-CN");
      const isVisible = !query || keywords.includes(query);
      button.hidden = !isVisible;
      if (isVisible) groupVisible += 1;
    });

    group.hidden = groupVisible === 0;
    if (query && groupVisible) group.classList.remove("is-collapsed");
    totalVisible += groupVisible;
  });

  templateEmpty.hidden = totalVisible > 0;
}

function loadProcessForm({ name, app, type, description = "" }) {
  formTemplateName.textContent = name;
  formTemplateType.textContent = type;
  formTemplateApp.textContent = app;
  formTitle.value = name;
  processLaunchForm.elements.description.value = description;
  document.querySelector("[data-attachment-state]").textContent = "支持图片与文档";
  formRoute.hidden = true;
  document.querySelector("[data-toggle-form-route]").textContent = "流程图";
  openDetailPage("processForm");
}

function getProcessMeta(row, label) {
  const match = [...row.querySelectorAll(".process-meta > div")].find((item) => item.querySelector("dt")?.textContent === label);
  return match?.querySelector("dd")?.textContent || "-";
}

function setProcessMeta(row, label, value) {
  const match = [...row.querySelectorAll(".process-meta > div")].find((item) => item.querySelector("dt")?.textContent === label);
  if (match) match.querySelector("dd").textContent = value;
}

function openProcessDetail(trigger) {
  const row = trigger.closest(".process-row");
  if (!row) return;

  selectedProcessRow = row;
  const mode = trigger.dataset.processMode;
  const name = row.querySelector("h3").textContent;
  const number = row.querySelector(".process-number").textContent;
  const applicant = getProcessMeta(row, "发起人") || getProcessMeta(row, "创建人");
  const time = getProcessMeta(row, "到达") !== "-" ? getProcessMeta(row, "到达") : getProcessMeta(row, "发起");
  const state = row.querySelector(".process-state");
  const departmentByApp = {
    设备管理: "机电管理部",
    安全管理: "安全管理部",
    综合管理: "综合管理部",
    双重预防机制: "安全管理部",
  };

  document.querySelector("[data-detail-name]").textContent = name;
  document.querySelector("[data-detail-number]").textContent = number;
  document.querySelector("[data-detail-applicant]").textContent = applicant;
  document.querySelector("[data-log-applicant]").textContent = applicant;
  document.querySelector("[data-detail-app]").textContent = row.dataset.processAppName;
  document.querySelector("[data-detail-department]").textContent = departmentByApp[row.dataset.processAppName] || `${row.dataset.processAppName}部`;
  document.querySelector("[data-detail-time]").textContent = time;
  document.querySelector("[data-detail-description]").textContent = `${name}相关事项，请按流程审核处理。`;

  const detailStatus = document.querySelector("[data-detail-status]");
  detailStatus.className = state.className;
  detailStatus.dataset.detailStatus = "";
  detailStatus.textContent = state.textContent;

  approvalPanel.hidden = mode !== "approval";
  ownerActions.hidden = mode !== "mine" || state.textContent !== "审批中";
  moreProcessActions.hidden = true;
  approvalOpinion.value = "";
  selectDetailTab("form");
  openDetailPage("processDetail");
}

function openProcessSubaction(action) {
  activeSubaction = action;
  document.querySelector("[data-subaction-title]").textContent = `${action}流程`;
  document.querySelector("[data-subaction-person-label]").textContent = action === "转办" ? "转办人" : "加签人员";
  document.querySelector("[data-subaction-reason-label]").textContent = action === "转办" ? "转办原因" : "加签说明";
  document.querySelector("[data-confirm-subaction]").textContent = `确认${action}`;
  selectedSubactionPeople = [];
  activeOrganizationPath = [personOrganization, personOrganization.children[0]];
  expandedOrganizationIds = new Set(["mine"]);
  subactionPersonValue.textContent = "请选择人员";
  subactionReason.value = "";
  processActionDialog.hidden = false;
  document.querySelector("[data-open-person-picker]").focus();
}

function closeProcessSubaction() {
  processActionDialog.hidden = true;
}

function renderPersonPicker() {
  personBreadcrumb.innerHTML = activeOrganizationPath
    .map((node, index) => `<button type="button" data-person-breadcrumb-index="${index}" ${index === activeOrganizationPath.length - 1 ? "aria-current=\"page\"" : ""}>${node.label}</button>`)
    .join('<i class="ph ph-caret-right" aria-hidden="true"></i>');

  personOrgList.hidden = false;
  personOrgList.innerHTML = renderOrganizationTree(personOrganization.children);

  selectedPersonPanel.hidden = false;
  selectedPersonEmpty.hidden = selectedSubactionPeople.length > 0;
  selectedPersonList.hidden = selectedSubactionPeople.length === 0;
  selectedPersonCount.textContent = selectedSubactionPeople.length ? `（${selectedSubactionPeople.length}）` : "";
  selectedPersonList.innerHTML = selectedSubactionPeople.map((person) => `<div class="process-selected-person-row"><strong>${person.name}</strong><button type="button" aria-label="移除${person.name}" data-remove-selected-person="${person.name}" data-remove-selected-department="${person.department}"><i class="ph ph-x" aria-hidden="true"></i></button></div>`).join("");
}

function renderOrganizationTree(nodes, depth = 0) {
  const isMultiSelect = activeSubaction === "加签";
  return nodes.map((node) => {
    const hasChildren = Boolean(node.children?.length);
    const canExpand = hasChildren || Boolean(node.people?.length);
    const isExpanded = expandedOrganizationIds.has(node.id);
    const organizationRow = `<button class="process-tree-node ${isExpanded ? "is-expanded" : ""}" type="button" data-person-org-node="${node.id}" style="--tree-depth:${depth}"><span class="process-org-node-icon"><i class="ph ${hasChildren ? "ph-folder" : "ph-users-three"}" aria-hidden="true"></i></span><strong>${node.label}</strong>${canExpand ? `<i class="ph ${isExpanded ? "ph-caret-down" : "ph-caret-right"}" aria-hidden="true"></i>` : ""}</button>`;
    if (!isExpanded) return organizationRow;

    const people = (node.people || []).map((name) => {
      const isSelected = selectedSubactionPeople.some((person) => person.name === name && person.department === node.label);
      const controlRole = isMultiSelect ? "checkbox" : "radio";
      const controlIcon = isMultiSelect ? (isSelected ? "ph-check-square" : "ph-square") : (isSelected ? "ph-check-circle" : "ph-circle");
      return `<button class="process-tree-person ${isSelected ? "is-selected" : ""}" type="button" role="${controlRole}" aria-checked="${isSelected}" data-person-option data-person-name="${name}" data-person-department="${node.label}" style="--tree-depth:${depth + 1}"><span class="process-person-avatar">${name.slice(0, 1)}</span><strong>${name}</strong><i class="ph ${controlIcon}" aria-hidden="true"></i></button>`;
    }).join("");
    return `${organizationRow}${people}${hasChildren ? renderOrganizationTree(node.children, depth + 1) : ""}`;
  }).join("");
}

function findOrganizationPath(id, node = personOrganization, path = [personOrganization]) {
  if (node.id === id) return path;
  for (const child of node.children || []) {
    const result = findOrganizationPath(id, child, [...path, child]);
    if (result) return result;
  }
  return null;
}

function collapseOrganizationBranch(node) {
  expandedOrganizationIds.delete(node.id);
  node.children?.forEach(collapseOrganizationBranch);
}

function openPersonPicker() {
  personPickerTitle.textContent = activeSubaction === "加签" ? "选择加签人员" : "选择转办人";
  if (!activeOrganizationPath.length) activeOrganizationPath = [personOrganization];
  renderPersonPicker();
  processPersonDialog.hidden = false;
  personOrgList.querySelector("button")?.focus();
}

function closePersonPicker() {
  processPersonDialog.hidden = true;
}

function openProcessRejectConfirm() {
  moreProcessActions.hidden = true;
  activeRejectDestination = rejectDestinations[nextRejectDestinationIndex];
  nextRejectDestinationIndex = (nextRejectDestinationIndex + 1) % rejectDestinations.length;
  rejectDestinationNotice.textContent = activeRejectDestination.notice;
  rejectOpinion.value = "";
  processRejectDialog.hidden = false;
  rejectOpinion.focus();
}

function closeProcessRejectConfirm() {
  processRejectDialog.hidden = true;
}

function openProcessRefuseConfirm() {
  moreProcessActions.hidden = true;
  refuseOpinion.value = "";
  processRefuseDialog.hidden = false;
  refuseOpinion.focus();
}

function closeProcessRefuseConfirm() {
  processRefuseDialog.hidden = true;
}

function completeProcess(action, opinion = "", rejectDestination = null) {
  if (!selectedProcessRow) return;

  const statusText = action === "同意" ? "已通过" : action === "驳回" ? "已驳回" : "已拒绝";
  const state = selectedProcessRow.querySelector(".process-state");
  state.textContent = statusText;
  state.className = `process-state ${action === "同意" ? "process-state-approved" : "process-state-rejected"}`;
  selectedProcessRow.dataset.processStatus = "approved";
  if (action === "驳回") {
    selectedProcessRow.dataset.rejectionOpinion = opinion;
    selectedProcessRow.dataset.rejectionDestination = rejectDestination?.summary || "已驳回至上一节点";
  }
  if (action === "拒绝") selectedProcessRow.dataset.refusalOpinion = opinion;
  const actionSummary = action === "驳回" ? rejectDestination?.summary || "已驳回至上一节点" : action === "拒绝" ? "已拒绝" : "审批已完成";
  selectedProcessRow.querySelector(".process-row-action").innerHTML = `<span>${actionSummary}</span><button class="process-secondary-action" type="button" data-open-process-detail data-process-mode="view">查看</button>`;
  processTabs[0].querySelector("span").textContent = String(processRows.filter((row) => row.dataset.processStatus === "pending").length);
  showToast(action === "驳回" ? rejectDestination?.toast || "流程已驳回至上一节点" : action === "拒绝" ? "流程已拒绝" : `${action}已提交`);
  selectProcessTab("pending");
  openDetailPage("processes");
}

templateFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    selectedTemplateFilter = filter.dataset.templateFilter;
    templateFilters.forEach((item) => {
      const isActive = item === filter;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    const target = templateGroups.find((group) => group.dataset.templateSection === selectedTemplateFilter);
    if (!target) return;

    target.classList.remove("is-collapsed");
    target.querySelector("[data-template-collapse]")?.setAttribute("aria-expanded", "true");
    const libraryScroll = document.querySelector(".process-template-groups");
    const targetTop = libraryScroll.scrollTop + target.getBoundingClientRect().top - libraryScroll.getBoundingClientRect().top;
    libraryScroll.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  });
});

templateSearch.addEventListener("input", applyTemplateFilters);

document.querySelectorAll("[data-template-collapse]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const group = trigger.closest("[data-template-group]");
    const isCollapsed = group.classList.toggle("is-collapsed");
    trigger.setAttribute("aria-expanded", String(!isCollapsed));
  });
});

document.querySelector("[data-open-process-library]").addEventListener("click", () => openDetailPage("processLibrary"));
document.querySelectorAll("[data-back-process-list]").forEach((button) => button.addEventListener("click", () => openDetailPage("processes")));
document.querySelector("[data-back-process-library]").addEventListener("click", () => openDetailPage("processLibrary"));
document.querySelector("[data-cancel-process-form]").addEventListener("click", () => openDetailPage("processLibrary"));

document.querySelector("[data-toggle-form-route]").addEventListener("click", (event) => {
  formRoute.hidden = !formRoute.hidden;
  event.currentTarget.textContent = formRoute.hidden ? "流程图" : "收起";
});

detailTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectDetailTab(tab.dataset.detailTab));
});

document.querySelector("[data-add-process-attachment]").addEventListener("click", () => {
  document.querySelector("[data-attachment-state]").textContent = "现场说明.pdf · 1.2 MB";
  showToast("示例附件已添加");
});

document.querySelector("[data-save-process-draft]").addEventListener("click", () => {
  const draftRow = processRows.find((row) => row.dataset.processStatus === "draft");
  draftRow.querySelector("h3").textContent = formTitle.value.trim() || formTemplateName.textContent;
  draftRow.dataset.processAppName = formTemplateApp.textContent;
  draftRow.dataset.processKeywords = `${formTitle.value} ${formTemplateType.textContent} ${formTemplateApp.textContent} 林舟`;
  setProcessMeta(draftRow, "类型", formTemplateType.textContent);
  setProcessMeta(draftRow, "应用", formTemplateApp.textContent);
  setProcessMeta(draftRow, "保存", "刚刚");
  showToast("草稿已保存");
  processSearch.value = "";
  processAppFilter.value = "all";
  selectProcessTab("draft");
  openDetailPage("processes");
});

processLaunchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const mineRow = processRows.find((row) => row.dataset.processStatus === "mine" && row.querySelector(".process-state")?.textContent === "审批中")
    || processRows.find((row) => row.dataset.processStatus === "mine");
  mineRow.querySelector("h3").textContent = formTitle.value.trim();
  mineRow.dataset.processAppName = formTemplateApp.textContent;
  mineRow.dataset.processKeywords = `${mineRow.querySelector(".process-number").textContent} ${formTitle.value} ${formTemplateType.textContent} ${formTemplateApp.textContent} 林舟`;
  setProcessMeta(mineRow, "类型", formTemplateType.textContent);
  setProcessMeta(mineRow, "应用", formTemplateApp.textContent);
  setProcessMeta(mineRow, "发起", "刚刚");
  mineRow.querySelector(".process-row-action > span").textContent = "当前节点：部门审核";
  showToast("流程已发起");
  processSearch.value = "";
  processAppFilter.value = "all";
  selectProcessTab("mine");
  openDetailPage("processes");
});

document.querySelector("[data-toggle-more-actions]").addEventListener("click", () => {
  moreProcessActions.hidden = !moreProcessActions.hidden;
});

document.querySelectorAll("[data-close-process-action]").forEach((button) => button.addEventListener("click", closeProcessSubaction));
document.querySelectorAll("[data-close-process-reject]").forEach((button) => button.addEventListener("click", closeProcessRejectConfirm));
document.querySelectorAll("[data-close-process-refuse]").forEach((button) => button.addEventListener("click", closeProcessRefuseConfirm));
document.querySelectorAll("[data-close-person-picker]").forEach((button) => button.addEventListener("click", closePersonPicker));
document.querySelector("[data-open-person-picker]").addEventListener("click", openPersonPicker);
personOrgList.addEventListener("click", (event) => {
  const nodeButton = event.target.closest("[data-person-org-node]");
  const personButton = event.target.closest("[data-person-option]");
  if (personButton) {
    const person = { name: personButton.dataset.personName, department: personButton.dataset.personDepartment };
    const existingIndex = selectedSubactionPeople.findIndex((item) => item.name === person.name && item.department === person.department);
    if (activeSubaction === "加签") {
      if (existingIndex >= 0) selectedSubactionPeople.splice(existingIndex, 1);
      else selectedSubactionPeople.push(person);
    } else {
      selectedSubactionPeople = [person];
    }
    renderPersonPicker();
    return;
  }
  if (!nodeButton) return;
  const path = findOrganizationPath(nodeButton.dataset.personOrgNode);
  if (!path) return;
  activeOrganizationPath = path;
  const node = path.at(-1);
  if (node.children?.length || node.people?.length) {
    if (expandedOrganizationIds.has(node.id)) expandedOrganizationIds.delete(node.id);
    else {
      const parent = path.at(-2);
      parent?.children?.forEach((sibling) => {
        if (sibling.id !== node.id) collapseOrganizationBranch(sibling);
      });
      expandedOrganizationIds.add(node.id);
    }
  }
  renderPersonPicker();
});
personBreadcrumb.addEventListener("click", (event) => {
  const breadcrumb = event.target.closest("[data-person-breadcrumb-index]");
  if (!breadcrumb) return;
  activeOrganizationPath = activeOrganizationPath.slice(0, Number(breadcrumb.dataset.personBreadcrumbIndex) + 1);
  expandedOrganizationIds = new Set(activeOrganizationPath.slice(1).map((node) => node.id));
  renderPersonPicker();
});
selectedPersonList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-selected-person]");
  if (!removeButton) return;
  selectedSubactionPeople = selectedSubactionPeople.filter((person) => person.name !== removeButton.dataset.removeSelectedPerson || person.department !== removeButton.dataset.removeSelectedDepartment);
  renderPersonPicker();
});
document.querySelector("[data-confirm-person-picker]").addEventListener("click", () => {
  if (!selectedSubactionPeople.length) {
    showToast(activeSubaction === "加签" ? "请选择加签人员" : "请选择转办人");
    return;
  }
  subactionPersonValue.textContent = activeSubaction === "加签"
    ? `已选 ${selectedSubactionPeople.length} 人`
    : `${selectedSubactionPeople[0].name} · ${selectedSubactionPeople[0].department}`;
  closePersonPicker();
});
document.querySelector("[data-confirm-subaction]").addEventListener("click", () => {
  if (!selectedSubactionPeople.length) {
    showToast(activeSubaction === "加签" ? "请选择加签人员" : "请选择转办人");
    return;
  }
  closeProcessSubaction();
  showToast(`${activeSubaction}已提交`);
});
document.querySelector("[data-confirm-process-reject]").addEventListener("click", () => {
  const opinion = rejectOpinion.value.trim();
  closeProcessRejectConfirm();
  completeProcess("驳回", opinion, activeRejectDestination);
});
document.querySelector("[data-confirm-process-refuse]").addEventListener("click", () => {
  const opinion = refuseOpinion.value.trim();
  closeProcessRefuseConfirm();
  completeProcess("拒绝", opinion);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!processPersonDialog.hidden) closePersonPicker();
  else if (!processRefuseDialog.hidden) closeProcessRefuseConfirm();
  else if (!processRejectDialog.hidden) closeProcessRejectConfirm();
  else if (!processActionDialog.hidden) closeProcessSubaction();
});

document.addEventListener("click", (event) => {
  const template = event.target.closest("[data-process-template]");
  const detailTrigger = event.target.closest("[data-open-process-detail]");
  const draftTrigger = event.target.closest("[data-edit-process-draft]");
  const resubmitTrigger = event.target.closest("[data-resubmit-process]");
  const quickAction = event.target.closest("[data-process-quick-action]");
  const subaction = event.target.closest("[data-open-subaction]");
  const rejectConfirmTrigger = event.target.closest("[data-open-reject-confirm]");
  const refuseConfirmTrigger = event.target.closest("[data-open-refuse-confirm]");
  const completeAction = event.target.closest("[data-complete-process]");

  if (template) {
    loadProcessForm({
      name: template.dataset.templateName,
      app: template.dataset.templateApp,
      type: template.dataset.templateType,
    });
  }
  if (detailTrigger) openProcessDetail(detailTrigger);
  if (draftTrigger || resubmitTrigger) {
    const row = event.target.closest(".process-row");
    loadProcessForm({
      name: row.querySelector("h3").textContent,
      app: row.dataset.processAppName,
      type: getProcessMeta(row, "类型"),
      description: draftTrigger ? "已完成现场资料整理，待补充负责人意见。" : "根据审批意见补充整改范围与完成时限。",
    });
  }
  if (quickAction) {
    const row = quickAction.closest(".process-row") || selectedProcessRow;
    const action = quickAction.dataset.processQuickAction;
    if (action === "撤销" && row) {
      const state = row.querySelector(".process-state");
      state.textContent = "已撤销";
      state.className = "process-state process-state-draft";
      row.querySelector(".process-row-action").innerHTML = `<span>流程已撤销</span><button class="process-secondary-action" type="button" data-open-process-detail data-process-mode="view">查看</button>`;
      selectProcessTab("mine");
      openDetailPage("processes");
    }
    showToast(`${action}流程已提交`);
  }
  if (subaction) openProcessSubaction(subaction.dataset.openSubaction);
  if (rejectConfirmTrigger) openProcessRejectConfirm();
  if (refuseConfirmTrigger) openProcessRefuseConfirm();
  if (completeAction) completeProcess(completeAction.dataset.completeProcess);
});

const activityFilters = [...document.querySelectorAll("[data-activity-filter]")];

activityFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    activityFilters.forEach((item) => {
      const isActive = item === filter;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
  });
});

document.addEventListener("click", (event) => {
  const sheetTrigger = event.target.closest("[data-open-sheet]");
  const toastTrigger = event.target.closest("[data-show-toast]");
  const sheetItem = event.target.closest("[data-sheet-item]");
  const sheetAction = event.target.closest("[data-sheet-action]");

  if (sheetTrigger) openSheet(sheetTrigger.dataset.openSheet, sheetTrigger);
  if (toastTrigger) showToast(toastTrigger.dataset.showToast);
  if (sheetItem) showToast(`已打开${sheetItem.dataset.sheetItem}`);
  if (sheetAction) {
    closeSheet();
    showToast(`${sheetAction.dataset.sheetAction}已响应`);
  }
});

closeSheetButton.addEventListener("click", closeSheet);
sheetBackdrop.addEventListener("click", closeSheet);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !screenModal.hidden) closeSheet();
});

const momentActionMenus = [...document.querySelectorAll(".moment-action-menu")];

function closeMomentMenus(exceptMenu = null) {
  momentActionMenus.forEach((menu) => {
    if (menu !== exceptMenu) menu.hidden = true;
  });
}

function ensureMomentDiscussion(moment) {
  let discussion = moment.querySelector(".moment-discussion");
  if (discussion) return discussion;

  discussion = document.createElement("div");
  discussion.className = "moment-discussion";
  moment.querySelector(".moment-comment-form").before(discussion);
  return discussion;
}

function ensureCurrentLike(moment) {
  const discussion = ensureMomentDiscussion(moment);
  let likes = discussion.querySelector(".moment-likes");

  if (!likes) {
    likes = document.createElement("p");
    likes.className = "moment-likes";
    const icon = document.createElement("i");
    icon.className = "ph ph-heart";
    icon.setAttribute("aria-hidden", "true");
    likes.append(icon);
    discussion.prepend(likes);
  }

  let currentLike = likes.querySelector("[data-current-like]");
  if (!currentLike) {
    currentLike = document.createElement("span");
    currentLike.dataset.currentLike = "";
    currentLike.textContent = "林舟";
    likes.append(currentLike);
  }

  likes.hidden = false;
  currentLike.hidden = false;
  return currentLike;
}

document.addEventListener("click", (event) => {
  const menuTrigger = event.target.closest("[data-moment-menu]");
  const likeTrigger = event.target.closest("[data-moment-like]");
  const commentTrigger = event.target.closest("[data-moment-comment]");

  if (menuTrigger) {
    const menu = menuTrigger.parentElement.querySelector(".moment-action-menu");
    const shouldOpen = menu.hidden;
    closeMomentMenus(menu);
    menu.hidden = !shouldOpen;
    return;
  }

  if (likeTrigger) {
    const moment = likeTrigger.closest(".moment-item");
    const isLiked = likeTrigger.classList.toggle("is-liked");
    const label = likeTrigger.querySelector("span");
    label.textContent = isLiked ? "取消" : "赞";

    if (isLiked) {
      ensureCurrentLike(moment);
    } else {
      const currentLike = moment.querySelector("[data-current-like]");
      if (currentLike) currentLike.hidden = true;
      const likes = moment.querySelector(".moment-likes");
      if (likes && ![...likes.querySelectorAll("span")].some((item) => !item.hidden)) {
        likes.hidden = true;
      }
    }

    likeTrigger.closest(".moment-action-menu").hidden = true;
    return;
  }

  if (commentTrigger) {
    const moment = commentTrigger.closest(".moment-item");
    const form = moment.querySelector(".moment-comment-form");
    form.hidden = false;
    commentTrigger.closest(".moment-action-menu").hidden = true;
    form.querySelector("input").focus();
    return;
  }

  if (!event.target.closest(".moment-action-menu")) closeMomentMenus();
});

document.querySelectorAll(".moment-comment-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    const message = input.value.trim();
    if (!message) return;

    const discussion = ensureMomentDiscussion(form.closest(".moment-item"));
    const comment = document.createElement("p");
    const author = document.createElement("strong");
    author.textContent = "林舟：";
    comment.append(author, document.createTextNode(message));
    discussion.append(comment);
    input.value = "";
    form.hidden = true;
    showToast("评论已添加");
  });
});

const favoriteList = document.querySelector("#favoriteList");
const favoritesEmpty = document.querySelector("#favoritesEmpty");
const editFavorites = document.querySelector("#editFavorites");
const restoreFavorites = document.querySelector("#restoreFavorites");
const favoritesAllList = document.querySelector("#favoritesAllList");
const favoritesAllEmpty = document.querySelector("#favoritesAllEmpty");
const openFavoriteListButton = document.querySelector("[data-open-favorite-list]");
const favoriteTemplate = favoriteList.innerHTML;
let isEditingFavorites = false;

function closeFavoritesDetail() {
  const returnToWorkbench = activePage === "collectedAll";
  if (activePage === "favoritesAll" && isEditingFavorites) {
    isEditingFavorites = false;
    editFavorites.textContent = "编辑";
    syncFavoriteOverview();
  }
  appShell.classList.remove("is-detail-page");
  activePage = "";
  if (returnToWorkbench) {
    switchPage("workbench", navItems.find((item) => item.dataset.pageTarget === "workbench"));
    return;
  }
  switchPage("favorites", navItems.find((item) => item.dataset.pageTarget === "favorites"));
}

function syncFavoriteOverview() {
  const hasFavorites = favoriteList.children.length > 0;
  favoritesAllList.innerHTML = favoriteList.innerHTML;
  favoritesAllList.classList.toggle("is-editing", isEditingFavorites);
  favoritesAllList.hidden = !hasFavorites;
  favoritesAllEmpty.hidden = hasFavorites;
  openFavoriteListButton.hidden = !hasFavorites;
}

editFavorites.addEventListener("click", () => {
  isEditingFavorites = !isEditingFavorites;
  syncFavoriteOverview();
  editFavorites.textContent = isEditingFavorites ? "完成" : "编辑";
});

favoritesAllList.addEventListener("click", (event) => {
  if (!isEditingFavorites) return;
  const row = event.target.closest(".favorite-row");
  if (!row) return;
  event.preventDefault();
  event.stopPropagation();
  const rowIndex = [...favoritesAllList.children].indexOf(row);
  favoriteList.children[rowIndex]?.remove();
  if (!favoriteList.children.length) {
    favoriteList.hidden = true;
    favoritesEmpty.hidden = false;
    isEditingFavorites = false;
    editFavorites.textContent = "编辑";
  }
  syncFavoriteOverview();
});

restoreFavorites.addEventListener("click", () => {
  favoriteList.innerHTML = favoriteTemplate;
  favoriteList.hidden = false;
  favoritesEmpty.hidden = true;
  isEditingFavorites = false;
  editFavorites.textContent = "编辑";
  syncFavoriteOverview();
  showToast("示例常用项目已恢复");
});

document.querySelector("[data-open-favorite-list]").addEventListener("click", () => openDetailPage("favoritesAll"));
document.querySelectorAll("[data-close-favorites-detail]").forEach((button) => button.addEventListener("click", closeFavoritesDetail));

syncFavoriteOverview();

const collectedList = document.querySelector("#collectedList");
const collectedEmpty = document.querySelector("#collectedEmpty");
const collectedAllList = document.querySelector("#collectedAllList");
const collectedAllEmpty = document.querySelector("#collectedAllEmpty");
const collectedHint = document.querySelector("#collectedHint");
const collectedAllHint = document.querySelector("#collectedAllHint");
const openCollectedListButton = document.querySelector("[data-open-collected-list]");
const collectionRemoveDialog = document.querySelector("[data-collection-remove-dialog]");
const collectionStorageKey = "mobile-bottom-nav-subsystem-collections";
const collectableMenuEntries = [...document.querySelectorAll(
  ".prevention-page .prevention-menu-row[data-show-toast], .prevention-page .prevention-submenu button, .prevention-catalog-page .inspection-catalog-list button",
)];
let collectedItems = [];
let pendingCollectionRemoval = null;
let collectionRemoveTrigger = null;
const COLLECTION_SWIPE_LIMIT = 96;
const COLLECTION_LONG_PRESS_MS = 550;

function getCollectionSystem(entry) {
  const pageName = entry.closest("[data-page]")?.dataset.page;
  return pageName === "preventionTwo" || pageName === "preventionTwoHazards" ? "双重预防2" : "双重预防管理";
}

function persistCollectedItems() {
  try {
    window.localStorage.setItem(collectionStorageKey, JSON.stringify(collectedItems));
  } catch {
    // The current session still keeps collection changes when storage is unavailable.
  }
}

function syncCollectionIcons() {
  collectableMenuEntries.forEach((entry) => {
    const isCollected = collectedItems.some((item) => item.id === entry.dataset.collectionId);
    const icon = entry.querySelector(".subsystem-favorite-icon i");
    entry.classList.toggle("is-collected", isCollected);
    icon.className = isCollected ? "ph-fill ph-star" : "ph ph-star";
    icon.parentElement.setAttribute("aria-label", isCollected ? `取消收藏${entry.dataset.collectionTitle}` : `收藏${entry.dataset.collectionTitle}`);
  });
}

function createCollectedRow(item) {
  const row = document.createElement("div");
  const iconClass = /清单|排查/.test(item.title) ? "ph-list-checks" : "ph-clipboard-text";
  row.className = "collected-swipe";
  row.innerHTML = `<button class="collected-remove" type="button" aria-label="取消收藏${item.title}"><i class="ph ph-trash" aria-hidden="true"></i><span>取消收藏</span></button><button class="collected-row-open" type="button"><span class="collected-entry-icon" aria-hidden="true"><i class="ph ${iconClass}"></i></span><span><strong>${item.title}</strong></span><i class="ph ph-caret-right" aria-hidden="true"></i></button>`;
  bindCollectionGestures(row, item);
  return row;
}

function openCollectedItem(item) {
  const sourceEntry = collectableMenuEntries.find((entry) => entry.dataset.collectionId === item.id);
  /* 历史收藏可能找不到原菜单节点，按名称兜底仍可进入统一工作表 mock。 */
  const isWorksheet = Boolean(sourceEntry?.closest(".inspection-catalog-list")) || /表|清单/.test(item.title);
  if (isWorksheet) openInspection("workbenchWorksheet", { id: "inspection", title: item.title });
  else if (sourceEntry) sourceEntry.click();
  else showToast(`已打开${item.title}`);
}

function closeCollectionSwipes(except) {
  document.querySelectorAll(".collected-swipe.is-open").forEach((row) => {
    if (row !== except) row.classList.remove("is-open");
  });
}

function bindCollectionGestures(row, item) {
  const surface = row.querySelector(".collected-row-open");
  let startX = 0;
  let startY = 0;
  let baseOffset = 0;
  let offset = 0;
  let dragging = false;
  let moved = false;
  let longPressTimer = null;

  const clearLongPress = () => {
    if (!longPressTimer) return;
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  };
  const resetTransform = () => {
    row.classList.remove("is-swiping");
    surface.style.transform = "";
  };

  surface.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    closeCollectionSwipes(row);
    dragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    baseOffset = row.classList.contains("is-open") ? -COLLECTION_SWIPE_LIMIT : 0;
    offset = baseOffset;
    clearLongPress();
    longPressTimer = window.setTimeout(() => {
      longPressTimer = null;
      if (!dragging || moved) return;
      dragging = false;
      resetTransform();
      row.classList.remove("is-open");
      if (navigator.vibrate) navigator.vibrate(15);
      openCollectionRemoveDialog(item, surface);
    }, COLLECTION_LONG_PRESS_MS);
  });

  surface.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!moved && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    moved = true;
    clearLongPress();
    if (Math.abs(dy) > Math.abs(dx)) return;
    event.preventDefault();
    offset = Math.max(-COLLECTION_SWIPE_LIMIT, Math.min(0, baseOffset + dx));
    row.classList.add("is-swiping");
    surface.style.transform = `translateX(${offset}px)`;
  });

  const finishSwipe = () => {
    if (!dragging) return;
    dragging = false;
    clearLongPress();
    resetTransform();
    if (!moved && baseOffset < 0) {
      row.classList.remove("is-open");
      return;
    }
    const shouldOpen = offset < -COLLECTION_SWIPE_LIMIT / 2;
    row.classList.toggle("is-open", shouldOpen);
    if (moved) return;
    openCollectedItem(item);
  };

  surface.addEventListener("pointerup", finishSwipe);
  surface.addEventListener("pointercancel", () => {
    dragging = false;
    clearLongPress();
    resetTransform();
  });

  row.querySelector(".collected-remove").addEventListener("click", (event) => {
    event.stopPropagation();
    row.classList.remove("is-open");
    openCollectionRemoveDialog(item, event.currentTarget);
  });
}

function openCollectionRemoveDialog(item, trigger) {
  pendingCollectionRemoval = item;
  collectionRemoveTrigger = trigger;
  collectionRemoveDialog.hidden = false;
  trigger.blur();
  collectionRemoveDialog.querySelector("[data-confirm-collection-remove]").focus();
}

function closeCollectionRemoveDialog(shouldRestoreFocus = true) {
  collectionRemoveDialog.hidden = true;
  pendingCollectionRemoval = null;
  if (shouldRestoreFocus) collectionRemoveTrigger?.focus();
  collectionRemoveTrigger = null;
}

function confirmCollectionRemoval() {
  if (!pendingCollectionRemoval) return;
  const { id, title } = pendingCollectionRemoval;
  closeCollectionRemoveDialog(false);
  const itemIndex = collectedItems.findIndex((item) => item.id === id);
  if (itemIndex !== -1) {
    collectedItems.splice(itemIndex, 1);
    persistCollectedItems();
    renderCollectedItems();
    showToast(`已取消收藏${title}`);
  }
}

function renderCollectedItems() {
  const hasCollections = collectedItems.length > 0;
  collectedList.replaceChildren();
  collectedAllList.replaceChildren();
  collectedList.hidden = !hasCollections;
  collectedAllList.hidden = !hasCollections;
  collectedEmpty.hidden = hasCollections;
  collectedAllEmpty.hidden = hasCollections;
  collectedHint.hidden = !hasCollections;
  collectedAllHint.hidden = !hasCollections;
  openCollectedListButton.hidden = collectedItems.length <= 3;

  collectedItems.slice(0, 3).forEach((item) => {
    collectedList.append(createCollectedRow(item));
  });
  collectedItems.forEach((item) => {
    collectedAllList.append(createCollectedRow(item));
  });
  syncCollectionIcons();
}

document.querySelector("[data-open-collected-list]").addEventListener("click", () => {
  openDetailPage("collectedAll");
});
document.querySelectorAll("[data-close-collection-remove]").forEach((button) => button.addEventListener("click", closeCollectionRemoveDialog));
document.querySelector("[data-confirm-collection-remove]").addEventListener("click", confirmCollectionRemoval);

function toggleCollection(entry) {
  const existingIndex = collectedItems.findIndex((item) => item.id === entry.dataset.collectionId);
  if (existingIndex === -1) {
    collectedItems.push({
      id: entry.dataset.collectionId,
      title: entry.dataset.collectionTitle,
      system: getCollectionSystem(entry),
    });
    showToast("收藏后展示在工作台“我收藏的”中", "favorite");
  } else {
    collectedItems.splice(existingIndex, 1);
    showToast(`已取消收藏${entry.dataset.collectionTitle}`);
  }
  persistCollectedItems();
  renderCollectedItems();
}

try {
  const savedCollections = JSON.parse(window.localStorage.getItem(collectionStorageKey));
  if (Array.isArray(savedCollections)) collectedItems = savedCollections.filter((item) => item?.id && item?.title);
} catch {
  // Invalid stored data is ignored so the prototype can continue normally.
}

collectableMenuEntries.forEach((entry, index) => {
  const title = entry.textContent.trim().replace(/\s+/g, " ");
  entry.dataset.collectionId = `${entry.closest("[data-page]")?.dataset.page || "subsystem"}-${index}-${title}`;
  entry.dataset.collectionTitle = title;
  entry.classList.add("is-collectable");

  const favoriteIcon = document.createElement("span");
  favoriteIcon.className = "subsystem-favorite-icon";
  favoriteIcon.setAttribute("aria-hidden", "true");
  favoriteIcon.innerHTML = '<i class="ph ph-star"></i>';
  const caret = [...entry.children].reverse().find((child) => child.classList.contains("ph-caret-right"));
  entry.insertBefore(favoriteIcon, caret || null);

  entry.addEventListener("click", (event) => {
    if (!event.target.closest(".subsystem-favorite-icon")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    toggleCollection(entry);
  }, true);
});

renderCollectedItems();

const offlineToggle = document.querySelector("#offlineToggle");
const offlineStatus = document.querySelector("#offlineStatus");
const autoUploadToggle = document.querySelector("#autoUploadToggle");
const downloadAll = document.querySelector("#downloadAll");
const downloadProgress = document.querySelector("#downloadProgress");
const downloadInspection = document.querySelector("#downloadInspection");
const offlineReportsSection = document.querySelector("[data-offline-reports-section]");
const offlineReportList = document.querySelector("#offlineReportList");
const offlineReportEmpty = document.querySelector("#offlineReportEmpty");
const offlineReportHint = document.querySelector("#offlineReportHint");
const offlineRemoveDialog = document.querySelector("[data-offline-remove-dialog]");
const offlineRemoveCopy = document.querySelector("[data-offline-remove-copy]");
let offlineRemoveTarget = null;
const pendingUploadList = document.querySelector("[data-pending-upload-list]");
const pendingUploadCount = document.querySelector("[data-pending-upload-count]");
const pendingUploadSyncCount = document.querySelector("[data-pending-upload-sync-count]");
let pendingUploadTotal = 4;
const profileEditDialog = document.querySelector("[data-profile-edit-dialog]");
const passwordDialog = document.querySelector("[data-password-dialog]");
const logoutDialog = document.querySelector("[data-logout-dialog]");
const profileEditForm = document.querySelector("[data-profile-edit-form]");
const passwordForm = document.querySelector("[data-password-form]");
const signatureCanvas = document.querySelector("#signatureCanvas");
const signatureContext = signatureCanvas.getContext("2d");
const signatureManagementPage = document.querySelector("[data-page=\"signatureManagement\"]");
const signatureLandscapeButton = document.querySelector("#enableSignatureLandscape");
const signatureStorageKey = "mobile-bottom-nav-electronic-signature";
const profileAvatarInput = document.querySelector("#profileAvatarInput");
const profileAvatarElements = [...document.querySelectorAll("[data-profile-avatar]")];
const profileAvatarStorageKey = "mobile-bottom-nav-profile-avatar";
const offlineReportStorageKey = "mobile-bottom-nav-offline-reports-v3";
/* 离线填报默认数据：直接铺在工作台上，保证没下载过也能看到这个小模块 */
const offlineReportSeed = [
  { id: "inspection", title: "平巷凿岩作业岗位隐患排查表", app: "双重预防管理" },
  { id: "fire-facility", title: "消防设施月度巡检表", app: "消防管理" },
  { id: "hoist-daily", title: "提升机日检记录表", app: "设备巡检" },
];
let offlineReports = [];
const profileValues = {
  name: "林舟",
  phone: "138 0000 2746",
  email: "linzhou@hbky.com",
  department: "安全管理部",
  role: "安全管理员",
  status: "正常",
};
let isDrawingSignature = false;
let signatureHasInk = false;
let signatureReturnPage = "profileCenter";

let hasStoredOfflineReports = false;
try {
  const rawOfflineReports = window.localStorage.getItem(offlineReportStorageKey);
  if (rawOfflineReports) {
    hasStoredOfflineReports = true;
    const savedOfflineReports = JSON.parse(rawOfflineReports);
    if (Array.isArray(savedOfflineReports)) offlineReports = savedOfflineReports;
  }
} catch {
  // The current session can still show newly downloaded worktables when storage is unavailable.
}
if (!hasStoredOfflineReports) {
  offlineReports = offlineReportSeed.map((item) => ({ ...item }));
}

function persistOfflineReports() {
  try {
    window.localStorage.setItem(offlineReportStorageKey, JSON.stringify(offlineReports));
  } catch {
    // The current session keeps the downloaded worktables when storage is unavailable.
  }
}

function hasOfflineReport(reportId) {
  return offlineReports.some((item) => item.id === reportId);
}

function updateInspectionDownloadButton() {
  const isDownloaded = hasOfflineReport("inspection");
  const icon = downloadInspection.querySelector("i");
  const label = downloadInspection.querySelector("span");
  downloadInspection.classList.toggle("is-downloaded", isDownloaded);
  /* 已下载 → 按钮置灰不可点，取消离线统一在「离线填报」列表里做 */
  downloadInspection.disabled = isDownloaded;
  downloadInspection.setAttribute("aria-disabled", String(isDownloaded));
  icon.className = isDownloaded ? "ph ph-check-circle" : "ph ph-download-simple";
  label.textContent = isDownloaded ? "已下载" : "离线下载";
}

/* ===== 离线填报列表：iOS 左滑 / Android 长按 取消离线 ===== */
const OFFLINE_SWIPE_LIMIT = 96;
const OFFLINE_LONG_PRESS_MS = 550;

function closeOfflineSwipes(except) {
  offlineReportList.querySelectorAll(".offline-report-swipe.is-open").forEach((row) => {
    if (row !== except) row.classList.remove("is-open");
  });
}

function renderOfflineReports() {
  const hasOfflineReports = offlineReports.length > 0;
  offlineReportsSection.hidden = !hasOfflineReports;
  offlineReportList.replaceChildren();
  offlineReportList.hidden = !hasOfflineReports;
  offlineReportEmpty.hidden = hasOfflineReports;
  if (offlineReportHint) offlineReportHint.hidden = !hasOfflineReports;

  offlineReports.forEach((report) => {
    const wrap = document.createElement("div");
    wrap.className = "offline-report-swipe";
    wrap.dataset.offlineReport = report.id;
    wrap.innerHTML = `
      <button class="offline-report-remove" type="button" data-remove-offline="${report.id}" aria-label="取消离线 ${report.title}">
        <i class="ph ph-trash" aria-hidden="true"></i><span>取消离线</span>
      </button>
      <button class="offline-report-row" type="button">
        <span class="offline-report-icon" aria-hidden="true"><i class="ph ph-clipboard-text"></i></span>
        <strong><span class="offline-report-title">${report.title}</span><em class="offline-report-app">（${report.app || "未命名应用"}）</em></strong>
        <i class="ph ph-caret-right" aria-hidden="true"></i>
      </button>`;
    bindOfflineReportGestures(wrap, report);
    offlineReportList.append(wrap);
  });
  updateInspectionDownloadButton();
}

function bindOfflineReportGestures(row, report) {
  const surface = row.querySelector(".offline-report-row");
  let startX = 0;
  let startY = 0;
  let baseOffset = 0;
  let offset = 0;
  let dragging = false;
  let moved = false;
  let longPressTimer = null;

  const clearLongPress = () => {
    if (!longPressTimer) return;
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  };
  const resetTransform = () => {
    row.classList.remove("is-swiping");
    surface.style.transform = "";
  };

  surface.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    closeOfflineSwipes(row);
    dragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    baseOffset = row.classList.contains("is-open") ? -OFFLINE_SWIPE_LIMIT : 0;
    offset = baseOffset;
    clearLongPress();
    longPressTimer = window.setTimeout(() => {
      longPressTimer = null;
      if (!dragging || moved) return;
      dragging = false;
      resetTransform();
      row.classList.remove("is-open");
      if (navigator.vibrate) navigator.vibrate(15);
      openOfflineRemoveDialog(report);
    }, OFFLINE_LONG_PRESS_MS);
  });

  surface.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!moved && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    moved = true;
    clearLongPress();
    if (Math.abs(dy) > Math.abs(dx)) return; /* 纵向滚动优先，不接管 */
    event.preventDefault();
    offset = Math.max(-OFFLINE_SWIPE_LIMIT, Math.min(0, baseOffset + dx));
    row.classList.add("is-swiping");
    surface.style.transform = `translateX(${offset}px)`;
  });

  const finishSwipe = () => {
    if (!dragging) return;
    dragging = false;
    clearLongPress();
    resetTransform();
    /* 轻点已展开的行：收起操作区；轻点收起态的行：进入离线填报详情 */
    if (!moved && baseOffset < 0) {
      row.classList.remove("is-open");
      return;
    }
    const shouldOpen = offset < -OFFLINE_SWIPE_LIMIT / 2;
    row.classList.toggle("is-open", shouldOpen);
    if (moved) return;
    openOfflineReport(report);
  };

  surface.addEventListener("pointerup", finishSwipe);
  surface.addEventListener("pointercancel", () => {
    dragging = false;
    clearLongPress();
    resetTransform();
  });

  row.querySelector("[data-remove-offline]").addEventListener("click", (event) => {
    event.stopPropagation();
    row.classList.remove("is-open");
    openOfflineRemoveDialog(report);
  });
}

function openOfflineReport(report) {
  openInspection("workbench", report);
}

function openOfflineRemoveDialog(report) {
  offlineRemoveTarget = report;
  if (offlineRemoveCopy) {
    offlineRemoveCopy.textContent = `取消后「${report.title}」将从离线填报中移除，需要重新下载才能离线填写。`;
  }
  offlineRemoveDialog.hidden = false;
  offlineRemoveDialog.querySelector("[data-confirm-offline-remove]")?.focus();
}

function closeOfflineRemoveDialog() {
  offlineRemoveDialog.hidden = true;
  offlineRemoveTarget = null;
}

offlineRemoveDialog.addEventListener("click", (event) => {
  if (event.target.closest("[data-confirm-offline-remove]")) {
    const target = offlineRemoveTarget;
    closeOfflineRemoveDialog();
    if (target) removeOfflineReport(target.id);
    return;
  }
  if (event.target.closest("[data-close-offline-remove]")) closeOfflineRemoveDialog();
});

function addOfflineReport() {
  const report = { id: "inspection", title: "平巷凿岩作业岗位隐患排查表", app: "双重预防管理" };
  if (!offlineReports.some((item) => item.id === report.id)) {
    offlineReports.push(report);
    persistOfflineReports();
  }
  renderOfflineReports();
}

function removeOfflineReport(reportId) {
  const removed = offlineReports.find((item) => item.id === reportId);
  offlineReports = offlineReports.filter((item) => item.id !== reportId);
  persistOfflineReports();
  renderOfflineReports();
  showToast(removed ? `已取消离线：${removed.title}` : "已取消离线");
}

function isNetworkAvailable() {
  return navigator.onLine && !offlineToggle.checked;
}

function updatePendingUploadCount() {
  pendingUploadCount.textContent = `${pendingUploadTotal} 项待上报记录`;
  pendingUploadSyncCount.textContent = `本机有 ${pendingUploadTotal} 项待上报记录`;
}

function saveInspectionForOfflineUpload() {
  pendingUploadTotal += 1;
  updatePendingUploadCount();

  const row = document.createElement("button");
  row.className = "pending-upload-row";
  row.type = "button";
  row.dataset.showToast = "已打开平巷凿岩作业岗位隐患排查表";
  row.innerHTML = `
    <span class="pending-upload-type is-form">表单</span>
    <span><strong>平巷凿岩作业岗位隐患排查表</strong><time>保存于刚刚</time></span>
    <i class="ph ph-caret-right" aria-hidden="true"></i>`;
  pendingUploadList.prepend(row);
}

function prepareSignatureContext() {
  signatureContext.lineCap = "round";
  signatureContext.lineJoin = "round";
  signatureContext.lineWidth = 6;
  signatureContext.strokeStyle = "#17263d";
}

function clearSignatureCanvas() {
  signatureContext.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  signatureHasInk = false;
}

function loadStoredSignature() {
  clearSignatureCanvas();
  try {
    const savedSignature = window.localStorage.getItem(signatureStorageKey);
    if (!savedSignature) return;
    const image = new Image();
    image.addEventListener("load", () => {
      signatureContext.drawImage(image, 0, 0, signatureCanvas.width, signatureCanvas.height);
      signatureHasInk = true;
    }, { once: true });
    image.src = savedSignature;
  } catch {
    // The signature remains usable for this session when storage is unavailable.
  }
}

function openSignatureManagement() {
  signatureReturnPage = activePage === "profile" ? "profile" : "profileCenter";
  setSignatureLandscapeMode(false);
  openDetailPage("signatureManagement");
  loadStoredSignature();
}

function closeSignatureManagement() {
  setSignatureLandscapeMode(false);
  if (signatureReturnPage === "profile") {
    appShell.classList.remove("is-detail-page");
    activePage = "";
    switchPage("profile", navItems.find((item) => item.dataset.pageTarget === "profile"));
    return;
  }
  openDetailPage("profileCenter");
}

function setSignatureLandscapeMode(isLandscape) {
  signatureManagementPage.classList.toggle("is-signature-landscape", isLandscape);
  signatureLandscapeButton.textContent = isLandscape ? "竖屏" : "横屏";
  signatureLandscapeButton.setAttribute("aria-pressed", String(isLandscape));
  if (isLandscape) {
    const orientationLock = window.screen.orientation?.lock?.("landscape");
    orientationLock?.catch(() => {});
  } else {
    window.screen.orientation?.unlock?.();
  }
}

function getSignaturePoint(event) {
  const bounds = signatureCanvas.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * (signatureCanvas.width / bounds.width),
    y: (event.clientY - bounds.top) * (signatureCanvas.height / bounds.height),
  };
}

function startSignature(event) {
  isDrawingSignature = true;
  signatureCanvas.setPointerCapture(event.pointerId);
  const point = getSignaturePoint(event);
  signatureContext.beginPath();
  signatureContext.moveTo(point.x, point.y);
  event.preventDefault();
}

function drawSignature(event) {
  if (!isDrawingSignature) return;
  const point = getSignaturePoint(event);
  signatureContext.lineTo(point.x, point.y);
  signatureContext.stroke();
  signatureHasInk = true;
  event.preventDefault();
}

function finishSignature(event) {
  if (!isDrawingSignature) return;
  isDrawingSignature = false;
  if (signatureCanvas.hasPointerCapture(event.pointerId)) signatureCanvas.releasePointerCapture(event.pointerId);
}

function updateProfileView() {
  document.querySelectorAll("[data-profile-field]").forEach((field) => {
    const key = field.dataset.profileField;
    field.textContent = profileValues[key];
    if (key === "status") field.classList.toggle("is-disabled", profileValues.status === "停用");
  });
  profileAvatarElements.filter((avatar) => !avatar.classList.contains("has-image")).forEach((avatar) => {
    avatar.textContent = profileValues.name.slice(0, 1);
  });
}

function applyProfileAvatar(imageData) {
  const hasImage = Boolean(imageData);
  profileAvatarElements.forEach((avatar) => {
    avatar.classList.toggle("has-image", hasImage);
    avatar.textContent = hasImage ? "" : profileValues.name.slice(0, 1);
    avatar.style.backgroundImage = hasImage ? `url("${imageData}")` : "";
  });
}

try {
  applyProfileAvatar(window.localStorage.getItem(profileAvatarStorageKey) || "");
} catch {
  applyProfileAvatar("");
}

profileAvatarInput.addEventListener("change", () => {
  const [file] = profileAvatarInput.files;
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    profileAvatarInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const imageData = typeof reader.result === "string" ? reader.result : "";
    applyProfileAvatar(imageData);
    try {
      window.localStorage.setItem(profileAvatarStorageKey, imageData);
    } catch {
      // The updated avatar remains available until this page is refreshed.
    }
    showToast("头像已更新");
  }, { once: true });
  reader.readAsDataURL(file);
});

function openProfileEdit(trigger) {
  Object.entries(profileValues).forEach(([key, value]) => {
    profileEditForm.elements[key].value = value;
  });
  profileEditDialog.hidden = false;
  (trigger || document.activeElement).blur();
  profileEditForm.elements.name.focus();
}

function closeProfileEdit() {
  profileEditDialog.hidden = true;
}

function openPasswordDialog(trigger) {
  passwordForm.reset();
  passwordDialog.hidden = false;
  (trigger || document.activeElement).blur();
  passwordForm.elements.currentPassword.focus();
}

function closePasswordDialog() {
  passwordDialog.hidden = true;
}

function openLogoutDialog(trigger) {
  logoutDialog.hidden = false;
  (trigger || document.activeElement).blur();
  logoutDialog.querySelector("[data-confirm-logout]").focus();
}

function closeLogoutDialog() {
  logoutDialog.hidden = true;
}

document.querySelectorAll("[data-open-profile-edit]").forEach((button) => {
  button.addEventListener("click", () => openProfileEdit(button));
});
document.querySelectorAll("[data-close-profile-edit]").forEach((button) => button.addEventListener("click", closeProfileEdit));
document.querySelector("[data-open-password-dialog]").addEventListener("click", (event) => openPasswordDialog(event.currentTarget));
document.querySelectorAll("[data-close-password-dialog]").forEach((button) => button.addEventListener("click", closePasswordDialog));
document.querySelector("[data-open-logout-dialog]").addEventListener("click", (event) => openLogoutDialog(event.currentTarget));
document.querySelectorAll("[data-close-logout-dialog]").forEach((button) => button.addEventListener("click", closeLogoutDialog));

profileEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  Object.keys(profileValues).forEach((key) => {
    profileValues[key] = profileEditForm.elements[key].value.trim();
  });
  updateProfileView();
  closeProfileEdit();
  showToast("个人资料已保存");
});

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const { newPassword, confirmPassword } = passwordForm.elements;
  if (newPassword.value !== confirmPassword.value) {
    confirmPassword.focus();
    showToast("两次输入的新密码不一致");
    return;
  }
  closePasswordDialog();
  showToast("密码已修改");
});

document.querySelector("[data-confirm-logout]").addEventListener("click", () => {
  closeLogoutDialog();
  showToast("已退出登录");
});

prepareSignatureContext();
signatureCanvas.addEventListener("pointerdown", startSignature);
signatureCanvas.addEventListener("pointermove", drawSignature);
signatureCanvas.addEventListener("pointerup", finishSignature);
signatureCanvas.addEventListener("pointercancel", finishSignature);
document.querySelector("#clearSignature").addEventListener("click", clearSignatureCanvas);
signatureLandscapeButton.addEventListener("click", () => {
  setSignatureLandscapeMode(!signatureManagementPage.classList.contains("is-signature-landscape"));
});
document.querySelector("#saveSignature").addEventListener("click", () => {
  if (!signatureHasInk) {
    showToast("请先完成电子签名");
    return;
  }
  try {
    window.localStorage.setItem(signatureStorageKey, signatureCanvas.toDataURL("image/png"));
  } catch {
    // Saving remains available in the visible session when storage is unavailable.
  }
  showToast("电子签名已保存");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!collectionRemoveDialog.hidden) closeCollectionRemoveDialog();
  else if (!profileEditDialog.hidden) closeProfileEdit();
  else if (!passwordDialog.hidden) closePasswordDialog();
  else if (!logoutDialog.hidden) closeLogoutDialog();
});

offlineToggle.addEventListener("change", () => {
  offlineStatus.textContent = offlineToggle.checked ? "离线模式已开启" : "当前使用在线数据";
  showToast(offlineToggle.checked ? "已切换到离线模式" : "已恢复在线模式");
});

autoUploadToggle.addEventListener("change", () => {
  showToast(autoUploadToggle.checked ? "已开启有网自动上报" : "已关闭自动上报");
});

downloadAll.addEventListener("click", () => {
  downloadAll.disabled = true;
  downloadAll.querySelector("span").textContent = "正在下载";
  downloadProgress.hidden = false;

  window.setTimeout(() => {
    downloadAll.disabled = false;
    downloadAll.querySelector("span").textContent = "重新下载所有表";
    downloadProgress.hidden = true;
    offlineToggle.checked = true;
    offlineStatus.textContent = "离线数据已准备";
    addOfflineReport();
    showToast("离线工作表已下载");
  }, 1500);
});

downloadInspection.addEventListener("click", () => {
  if (hasOfflineReport("inspection")) return; /* 已下载：按钮置灰，不再响应 */

  downloadInspection.disabled = true;
  downloadInspection.querySelector("span").textContent = "下载中";

  window.setTimeout(() => {
    addOfflineReport();
    downloadInspection.disabled = true;
    showToast("已下载到离线填报，可在工作台“离线填报”中打开");
  }, 700);
});

renderOfflineReports();

window.setTimeout(() => {
  appShell.classList.remove("is-loading");
  loadingView.hidden = true;
}, 520);
