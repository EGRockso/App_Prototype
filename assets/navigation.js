/* Navigation du site, sans dépendance aux services de connexion. */
(() => {
  const header = document.querySelector(".site-header-v2, .site-header");
  const versionTwo = header?.classList.contains("site-header-v2");
  const toggle = header?.querySelector(versionTwo ? ".nav-toggle-v2" : ".nav-toggle");
  const navigation = header?.querySelector(versionTwo ? ".main-nav-v2" : ".main-nav");
  if (!toggle || !navigation) return;

  const compact = window.matchMedia(versionTwo ? "(max-width: 1199px)" : "(max-width: 1100px)");
  const openClass = versionTwo ? "nav-open-v2" : "nav-open";
  const english = document.documentElement.lang === "en";
  const openLabel = english ? "Open menu" : "Ouvrir le menu";
  const closeLabel = english ? "Close menu" : "Fermer le menu";
  navigation.id ||= "rockso-navigation";
  navigation.setAttribute("aria-label", english ? "Main navigation" : "Navigation principale");
  toggle.setAttribute("aria-controls", navigation.id);

  function setOpen(open, restoreFocus = false) {
    document.body.classList.toggle(openClass, open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? closeLabel : openLabel);
    if (open) navigation.querySelector("a")?.focus({ preventScroll: true });
    else if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  setOpen(false);
  toggle.addEventListener("click", () => {
    if (compact.matches) {
      const open = !document.body.classList.contains(openClass);
      setOpen(open, !open);
    }
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains(openClass)) {
      setOpen(false, true);
    }
  });
  header.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  compact.addEventListener("change", () => setOpen(false));
})();
