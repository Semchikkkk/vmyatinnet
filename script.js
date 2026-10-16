"use strict";

// Мобильное меню. Без JavaScript ссылки остаются видимыми.
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
const mobileViewport = window.matchMedia("(max-width: 1024px)");

if (menuButton && navigation) {
  document.documentElement.classList.add("js");

  function closeMenu() {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "Меню";
  }

  function syncMenu() {
    menuButton.hidden = !mobileViewport.matches;
    closeMenu();
  }

  menuButton.addEventListener("click", () => {
    const opened = menuButton.getAttribute("aria-expanded") === "true";
    navigation.classList.toggle("is-open", !opened);
    menuButton.setAttribute("aria-expanded", String(!opened));
    menuButton.textContent = opened ? "Меню" : "Закрыть";
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
      closeMenu();
      menuButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
      closeMenu();
    }
  });

  mobileViewport.addEventListener("change", syncMenu);
  syncMenu();
}

// Данные двух отдельных результатов ремонта.
const caseImages = {
  work01: { src: "work-01.webp", number: "01 / 02", caption: "Ремонт заднего крыла", alt: "Заднее крыло до ремонта сверху и после ремонта снизу" },
  work02: { src: "work-02.webp", number: "02 / 02", caption: "Восстановление арки", alt: "Колёсная арка до ремонта сверху и после ремонта снизу" }
};
const caseImage = document.querySelector("#case-image");
const caseCaption = document.querySelector("#case-caption");
const caseFull = document.querySelector("#case-full");
const caseStatus = document.querySelector("#case-status");
const workNumber = document.querySelector("#work-number");
const caseControls = document.querySelector(".case-controls");
const caseButtons = document.querySelectorAll(".case-tab");
if (caseImage && caseCaption && caseFull && caseStatus && caseControls) {
  Object.values(caseImages).forEach((item) => { const image = new Image(); image.src = item.src; });
  caseButtons.forEach((button) => button.addEventListener("click", () => {
    const selected = caseImages[button.dataset.case];
    if (!selected || button.getAttribute("aria-pressed") === "true") return;
    caseButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    caseImage.src = selected.src;
    caseImage.alt = selected.alt;
    caseCaption.textContent = selected.caption;
    caseFull.href = selected.src;
    if (workNumber) workNumber.textContent = selected.number;
    caseStatus.textContent = "Показана работа: " + selected.caption;
    document.dispatchEvent(new CustomEvent("site:workchange", { detail: { button } }));
  }));
  caseControls.hidden = false;
}

// Крупный просмотр внутри сайта; обычная ссылка остаётся запасным вариантом.
const workDialog = document.querySelector("#work-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogTitle = document.querySelector("#dialog-title");
const dialogClose = document.querySelector("#dialog-close");
if (workDialog && dialogImage && dialogTitle && dialogClose && caseFull && caseImage && caseCaption && typeof workDialog.showModal === "function") {
  caseFull.addEventListener("click", (event) => {
    event.preventDefault();
    dialogImage.src = caseImage.src;
    dialogImage.alt = caseImage.alt;
    dialogTitle.textContent = caseCaption.textContent;
    workDialog.showModal();
    document.body.classList.add("dialog-open");
    document.dispatchEvent(new CustomEvent("site:vieweropen"));
  });
  dialogClose.addEventListener("click", () => workDialog.close());
  workDialog.addEventListener("click", (event) => { if (event.target === workDialog) workDialog.close(); });
  workDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
}

// Выбор услуги и подготовка обращения. Отправка сообщения остаётся у посетителя.
const serviceNames = {
  pdr: "Удаление вмятин без покраски",
  polish: "Полировка кузова",
  ceramic: "Керамическое покрытие",
  ppf: "Защитная плёнка",
  consultation: "Консультация по выбору услуги"
};
function buildBookingUrl(service, car, message) {
  const lines = ["Здравствуйте! Хочу обсудить запись в ВмятинНет.", "Услуга: " + (serviceNames[service] || serviceNames.consultation)];
  const carText = String(car || "").trim().slice(0, 100);
  const messageText = String(message || "").trim().slice(0, 1000);
  if (carText) lines.push("Автомобиль: " + carText);
  if (messageText) lines.push("Задача: " + messageText);
  const url = new URL("https://wa.me/79294050285");
  url.searchParams.set("text", lines.join("\n"));
  return url.href;
}
const bookingForm = document.querySelector("#booking-form");
const serviceSelect = document.querySelector("#booking-service");
const carInput = document.querySelector("#booking-car");
const messageInput = document.querySelector("#booking-message");
if (bookingForm && serviceSelect && carInput && messageInput) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;
    window.location.assign(buildBookingUrl(serviceSelect.value, carInput.value, messageInput.value));
  });
  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      const service = link.dataset.service;
      if (serviceNames[service]) serviceSelect.value = service;
    });
  });
  bookingForm.hidden = false;
}

// Состояние шапки независимо от доступности библиотеки анимаций.
const header = document.querySelector(".header");
const bookingSection = document.querySelector("#booking");
let headerFramePending = false;
function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 32);
  if (bookingSection && mobileViewport.matches) {
    const bounds = bookingSection.getBoundingClientRect();
    const bookingVisible = bounds.top < window.innerHeight * 0.82 && bounds.bottom > window.innerHeight * 0.18;
    document.body.classList.toggle("booking-visible", bookingVisible);
  } else {
    document.body.classList.remove("booking-visible");
  }
  headerFramePending = false;
}
window.addEventListener("scroll", () => {
  if (headerFramePending) return;
  headerFramePending = true;
  requestAnimationFrame(updateHeader);
}, { passive: true });
window.addEventListener("resize", updateHeader, { passive: true });
updateHeader();
