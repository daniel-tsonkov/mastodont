// Тема система за User CMS
(function () {
  "use strict";

  // DOM елементи
  const themeToggle = document.getElementById("themeToggle");
  const htmlElement = document.documentElement;

  // Константи
  const STORAGE_KEY = "cms-theme";
  const DARK_THEME_CLASS = "dark-theme";

  // Текст за бутона според темата
  const BUTTON_TEXT = {
    dark: "☀️ Светла тема",
    light: "🌙 Тъмна тема",
  };

  /**
   * Задава темата на страницата
   */
  function setTheme(theme) {
    if (theme === "dark") {
      htmlElement.classList.add(DARK_THEME_CLASS);
      themeToggle.textContent = BUTTON_TEXT.dark;
      localStorage.setItem(STORAGE_KEY, "dark");

      // Добавя Bootstrap тъмна тема ако съществува
      document.body.classList.remove("bg-light");
      document.body.classList.add("bg-dark");
    } else {
      htmlElement.classList.remove(DARK_THEME_CLASS);
      themeToggle.textContent = BUTTON_TEXT.light;
      localStorage.setItem(STORAGE_KEY, "light");

      // Връща Bootstrap светла тема
      document.body.classList.remove("bg-dark");
      document.body.classList.add("bg-light");
    }
  }

  /**
   * Превключва между темите
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
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  /**
   * Добавя поддръжка за клавишна комбинация Alt+T
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
   * Следи за промени в системната тема
   */
  function watchSystemTheme() {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener("change", (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setTheme(e.matches ? "dark" : "light");
        }
      });
    }
  }

  // Инициализация след зареждане на DOM
  document.addEventListener("DOMContentLoaded", function () {
    if (themeToggle) {
      initTheme();
      watchSystemTheme();
      addKeyboardSupport();

      themeToggle.addEventListener("click", toggleTheme);
    } else {
      console.warn("Theme toggle button not found!");
    }
  });

  // Експорт за дебъгване
  window.themeSystem = {
    setTheme,
    toggleTheme,
    getCurrentTheme: () =>
      htmlElement.classList.contains(DARK_THEME_CLASS) ? "dark" : "light",
  };
})();
