// Тема система за Mastodont IT Firm
(function () {
  "use strict";

  // DOM елементи
  const themeToggle = document.getElementById("themeToggle");
  const htmlElement = document.documentElement;

  // Константи
  const STORAGE_KEY = "mastodont-theme";
  const DARK_THEME_CLASS = "dark-theme";

  // Текст за бутона според темата
  const BUTTON_TEXT = {
    dark: "☀️ Светла тема",
    light: "🌙 Тъмна тема",
  };

  /**
   * Задава темата на страницата
   * @param {string} theme - 'light' или 'dark'
   */
  function setTheme(theme) {
    if (theme === "dark") {
      htmlElement.classList.add(DARK_THEME_CLASS);
      themeToggle.textContent = BUTTON_TEXT.dark;
      localStorage.setItem(STORAGE_KEY, "dark");
      console.log("Тъмна тема активирана");
    } else {
      htmlElement.classList.remove(DARK_THEME_CLASS);
      themeToggle.textContent = BUTTON_TEXT.light;
      localStorage.setItem(STORAGE_KEY, "light");
      console.log("Светла тема активирана");
    }
  }

  /**
   * Превключва между светла и тъмна тема
   */
  function toggleTheme() {
    if (htmlElement.classList.contains(DARK_THEME_CLASS)) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }

  /**
   * Инициализира темата при зареждане
   * Приоритет:
   * 1. Запазена тема в localStorage
   * 2. Системни предпочитания (prefers-color-scheme)
   * 3. Светла тема (по подразбиране)
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    console.log("Инициализация на темата...");
    console.log("Запазена тема:", savedTheme);
    console.log("Системни предпочитания:", prefersDark ? "тъмна" : "светла");

    if (savedTheme) {
      // Ако има запазена тема - използваме нея
      setTheme(savedTheme);
    } else if (prefersDark) {
      // Ако няма запазена, но ОС е на тъмна тема
      setTheme("dark");
    } else {
      // По подразбиране - светла тема
      setTheme("light");
    }
  }

  /**
   * Слушател за промяна на системните предпочитания
   * (ако потребителят промени темата на ОС докато страницата е отворена)
   */
  function watchSystemTheme() {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    // Съвременен браузъри използват addEventListener
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener("change", (e) => {
        // Променяме темата само ако няма запазена потребителска тема
        if (!localStorage.getItem(STORAGE_KEY)) {
          setTheme(e.matches ? "dark" : "light");
        }
      });
    }
  }

  /**
   * Добавя поддръжка за клавишна комбинация Alt+T за превключване на темата
   */
  function addKeyboardSupport() {
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.key === "t") {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  /**
   * Проверка дали бутонът съществува (ако не - създава го)
   */
  function ensureButtonExists() {
    if (!themeToggle) {
      console.warn("Бутон за тема не е намерен! Създаване...");
      const newButton = document.createElement("button");
      newButton.id = "themeToggle";
      newButton.className = "theme-toggle-btn";
      document.body.insertBefore(newButton, document.body.firstChild);

      // Повторно вземане на референция
      window.themeToggle = document.getElementById("themeToggle");
    }
  }

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  document.addEventListener("DOMContentLoaded", function () {
    ensureButtonExists();
    initTheme();
    watchSystemTheme();
    addKeyboardSupport();

    // Слагаме слушател на бутона
    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
  });

  // Експорт за дебъгване (достъп от конзолата)
  window.themeSystem = {
    setTheme,
    toggleTheme,
    getCurrentTheme: () =>
      htmlElement.classList.contains(DARK_THEME_CLASS) ? "dark" : "light",
  };
})();
