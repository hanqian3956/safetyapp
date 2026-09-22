const appShell = document.querySelector("#appShell");
const loadingView = document.querySelector("#loadingView");
const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item")];
const bottomNav = document.querySelector(".bottom-nav");
const bottomSheet = document.querySelector("#bottomSheet");
const sheetBackdrop = document.querySelector("#sheetBackdrop");
const sheetContext = document.querySelector("#sheetContext");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetContent = document.querySelector("#sheetContent");
const closeSheetButton = document.querySelector("#closeSheet");
const toast = document.querySelector("#toast");

let activePage = "workbench";
let lastFocusedElement = null;
let toastTimer = null;

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
  sheetContext.textContent = data.context;
  sheetTitle.textContent = data.title;
  sheetContent.innerHTML = createSheetMarkup(data);
  sheetBackdrop.hidden = false;
  bottomSheet.hidden = false;
  document.body.classList.add("sheet-open");
  closeSheetButton.focus();
}

function closeSheet() {
  bottomSheet.hidden = true;
  sheetBackdrop.hidden = true;
  document.body.classList.remove("sheet-open");
  lastFocusedElement?.focus();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 1800);
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
  activePage = "messages";
  pages.forEach((page) => {
    const isActive = page.dataset.page === "messages";
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

function closeMessagesPage() {
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

function closePreventionPage() {
  appShell.classList.remove("is-detail-page");
  activePage = "";
  switchPage("workbench", navItems[0]);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => switchPage(item.dataset.pageTarget, item));
});

document.querySelectorAll("[data-open-messages-page]").forEach((trigger) => {
  trigger.addEventListener("click", openMessagesPage);
});

document.querySelector("[data-close-messages-page]").addEventListener("click", closeMessagesPage);

document.querySelector("[data-open-prevention]").addEventListener("click", () => openDetailPage("prevention"));
document.querySelector("[data-close-prevention]").addEventListener("click", closePreventionPage);
document.querySelector("[data-open-inspection]").addEventListener("click", () => openDetailPage("inspection"));
document.querySelectorAll("[data-back-prevention]").forEach((button) => {
  button.addEventListener("click", () => openDetailPage("prevention"));
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
  if (event.key === "Escape" && !bottomSheet.hidden) closeSheet();
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
const favoriteTemplate = favoriteList.innerHTML;
let isEditingFavorites = false;

editFavorites.addEventListener("click", () => {
  isEditingFavorites = !isEditingFavorites;
  favoriteList.classList.toggle("is-editing", isEditingFavorites);
  editFavorites.textContent = isEditingFavorites ? "完成" : "编辑";
});

favoriteList.addEventListener("click", (event) => {
  if (!isEditingFavorites) return;
  const row = event.target.closest(".favorite-row");
  if (!row) return;
  event.preventDefault();
  event.stopPropagation();
  row.remove();
  if (!favoriteList.children.length) {
    favoriteList.hidden = true;
    favoritesEmpty.hidden = false;
    isEditingFavorites = false;
    favoriteList.classList.remove("is-editing");
    editFavorites.textContent = "编辑";
  }
});

restoreFavorites.addEventListener("click", () => {
  favoriteList.innerHTML = favoriteTemplate;
  favoriteList.classList.remove("is-editing");
  favoriteList.hidden = false;
  favoritesEmpty.hidden = true;
  showToast("示例常用项目已恢复");
});

const offlineToggle = document.querySelector("#offlineToggle");
const offlineStatus = document.querySelector("#offlineStatus");
const autoUploadToggle = document.querySelector("#autoUploadToggle");
const downloadAll = document.querySelector("#downloadAll");
const downloadProgress = document.querySelector("#downloadProgress");

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
