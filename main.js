const appShell = document.querySelector("#appShell");
const loadingView = document.querySelector("#loadingView");
const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item")];
const bottomNav = document.querySelector(".bottom-nav");
const screenModal = document.querySelector("#bottomSheet");
const sheetBackdrop = document.querySelector("#sheetBackdrop");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetContent = document.querySelector("#sheetContent");
const closeSheetButton = document.querySelector("#closeSheet");
const toast = document.querySelector("#toast");
const toastMessage = document.querySelector("[data-toast-message]");
const toastIcon = toast.querySelector(".toast-icon i");

let activePage = "workbench";
let lastFocusedElement = null;
let toastTimer = null;
let preventionCatalogParent = "prevention";
let inspectionParentPage = "preventionCatalog";

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
  appShell.classList.remove("is-detail-page");
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

  navItems.forEach((item) => {
    const isActive = item === navItem;
    item.classList.toggle("is-active", isActive);
    item.toggleAttribute("aria-current", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
  });

  const index = navItems.indexOf(navItem);
  bottomNav.style.setProperty("--nav-index", index);
}

function openMessagesPage() {
  openDetailPage("messages");
}

function closeDetailPage() {
  appShell.classList.remove("is-detail-page");
  activePage = "";
  switchPage("workbench", navItems[0]);
}

function openDetailPage(pageName) {
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

function closePreventionPage() {
  closeDetailPage();
}

function openPreventionCatalog(parentPage) {
  preventionCatalogParent = parentPage;
  openDetailPage("preventionCatalog");
}

function openInspection(parentPage = "preventionCatalog") {
  inspectionParentPage = parentPage;
  openDetailPage("inspection");
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
    else if (item.dataset.searchTarget === "prevention-two-catalog") openPreventionCatalog("preventionTwoHazards");
    else if (item.dataset.searchTarget === "processes") openDetailPage("processes");
    else if (item.dataset.searchAction) showToast(item.dataset.searchAction);
  });
});

document.querySelector("[data-open-profile-center]").addEventListener("click", () => openDetailPage("profileCenter"));
document.querySelector("[data-close-profile-center]").addEventListener("click", closeProfileCenter);
document.querySelector("[data-open-offline-management]").addEventListener("click", () => openDetailPage("offlineManagement"));
document.querySelector("[data-close-offline-management]").addEventListener("click", closeOfflineManagement);

document.querySelectorAll("[data-open-prevention]").forEach((trigger) => trigger.addEventListener("click", () => openDetailPage("prevention")));
document.querySelector("[data-close-prevention]").addEventListener("click", closePreventionPage);
document.querySelector("[data-open-prevention-catalog]").addEventListener("click", () => openPreventionCatalog("prevention"));
document.querySelectorAll("[data-open-prevention-two]").forEach((trigger) => trigger.addEventListener("click", () => openDetailPage("preventionTwo")));
document.querySelector("[data-close-prevention-two]").addEventListener("click", closeDetailPage);
document.querySelector("[data-open-prevention-two-hazards]").addEventListener("click", () => openDetailPage("preventionTwoHazards"));
document.querySelector("[data-back-prevention-two]").addEventListener("click", () => openDetailPage("preventionTwo"));
document.querySelector("[data-open-prevention-two-catalog]").addEventListener("click", () => openPreventionCatalog("preventionTwoHazards"));
document.querySelector("[data-back-prevention-parent]").addEventListener("click", () => openDetailPage(preventionCatalogParent));
document.querySelector("[data-open-inspection]").addEventListener("click", () => openInspection());
document.querySelectorAll("[data-back-prevention-catalog]").forEach((button) => {
  button.addEventListener("click", () => openDetailPage(inspectionParentPage));
});

const favoriteAppGrid = document.querySelector("[data-favorite-app-grid]");
const appOrganizerList = document.querySelector("[data-app-organizer-list]");
const appOrganizerPage = document.querySelector("[data-page=\"appOrganizer\"]");
const appOrganizerTip = appOrganizerPage.querySelector(".app-organizer-tip");
const appOrganizerEditButton = document.querySelector("[data-toggle-app-organizer-edit]");
const appLayoutStorageKey = "mobile-bottom-nav-app-layout";
let draggedOrganizerItem = null;
let isEditingAppOrganizer = false;

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
  openDetailPage("appOrganizer");
}

function closeAppOrganizer() {
  setAppOrganizerEditing(false);
  closeDetailPage();
}

function openOrganizerApp(item) {
  const appId = item.dataset.appOrganizerItem;
  if (appId === "prevention") {
    openDetailPage("prevention");
    return;
  }
  if (appId === "prevention-two") {
    openDetailPage("preventionTwo");
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

saveInspectionDraft.addEventListener("click", () => showToast("草稿已保存"));
inspectionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("排查记录已提交");
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
let selectedTemplateFilter = "all";
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
      const matchesCategory = selectedTemplateFilter === "all" || button.dataset.templateRecent === "true";
      const keywords = `${button.dataset.templateName} ${button.dataset.templateApp} ${button.dataset.templateType}`.toLocaleLowerCase("zh-CN");
      const isVisible = matchesCategory && (!query || keywords.includes(query));
      button.hidden = !isVisible;
      if (isVisible) groupVisible += 1;
    });

    group.hidden = groupVisible === 0;
    group.querySelector("header small").textContent = String(groupVisible);
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
    applyTemplateFilters();
  });
});

templateSearch.addEventListener("input", applyTemplateFilters);

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
  if (activePage === "favoritesAll" && isEditingFavorites) {
    isEditingFavorites = false;
    editFavorites.textContent = "编辑";
    syncFavoriteOverview();
  }
  appShell.classList.remove("is-detail-page");
  activePage = "";
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
const openCollectedListButton = document.querySelector("[data-open-collected-list]");
const collectionRemoveDialog = document.querySelector("[data-collection-remove-dialog]");
const collectionStorageKey = "mobile-bottom-nav-subsystem-collections";
const collectableMenuEntries = [...document.querySelectorAll(
  ".prevention-page .prevention-menu-row[data-show-toast], .prevention-page .prevention-submenu button, .prevention-two-page .prevention-two-category-list button[data-show-toast], .prevention-two-page .prevention-two-hazard-list button[data-show-toast], .prevention-catalog-page .inspection-catalog-list button",
)];
let collectedItems = [];
let pendingCollectionRemoval = null;
let collectionRemoveTrigger = null;

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
  const row = document.createElement("article");
  row.className = "favorite-row collected-row";
  row.innerHTML = `<button class="collected-remove" type="button" aria-label="取消收藏${item.title}"><span class="favorite-type" aria-hidden="true"><i class="ph-fill ph-star"></i></span></button><button class="collected-row-open" type="button"><span><strong>${item.title}</strong></span><i class="ph ph-caret-right" aria-hidden="true"></i></button>`;
  row.querySelector(".collected-row-open").addEventListener("click", () => {
    const sourceEntry = collectableMenuEntries.find((entry) => entry.dataset.collectionId === item.id);
    if (sourceEntry) sourceEntry.click();
    else showToast(`已打开${item.title}`);
  });
  row.querySelector(".collected-remove").addEventListener("click", (event) => openCollectionRemoveDialog(item, event.currentTarget));
  return row;
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
  openCollectedListButton.hidden = collectedItems.length <= 4;

  collectedItems.slice(0, 4).forEach((item) => {
    collectedList.append(createCollectedRow(item));
  });
  collectedItems.forEach((item) => {
    collectedAllList.append(createCollectedRow(item));
  });
  syncCollectionIcons();
}

document.querySelector("[data-open-collected-list]").addEventListener("click", () => openDetailPage("collectedAll"));
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
    showToast("收藏后展示在常用页面中我的收藏中", "favorite");
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
const profileEditDialog = document.querySelector("[data-profile-edit-dialog]");
const passwordDialog = document.querySelector("[data-password-dialog]");
const logoutDialog = document.querySelector("[data-logout-dialog]");
const profileEditForm = document.querySelector("[data-profile-edit-form]");
const passwordForm = document.querySelector("[data-password-form]");
const profileValues = {
  name: "林舟",
  phone: "138 0000 2746",
  email: "linzhou@hbky.com",
  department: "安全管理部",
  role: "安全管理员",
  status: "正常",
};

function updateProfileView() {
  document.querySelectorAll("[data-profile-field]").forEach((field) => {
    const key = field.dataset.profileField;
    field.textContent = profileValues[key];
    if (key === "status") field.classList.toggle("is-disabled", profileValues.status === "停用");
  });
  document.querySelector("[data-profile-heading]").textContent = profileValues.name;
  document.querySelector("[data-profile-avatar]").textContent = profileValues.name.slice(0, 1);
}

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
    showToast("离线工作表已下载");
  }, 1500);
});

window.setTimeout(() => {
  appShell.classList.remove("is-loading");
  loadingView.hidden = true;
}, 520);
