(() => {
  const buttons = [...document.querySelectorAll('[data-view-target]')];
  const panels = [...document.querySelectorAll('[data-view]')];
  function show(id, updateHash = true) {
    if (!panels.some(panel => panel.dataset.view === id)) id = 'home';
    panels.forEach(panel => panel.hidden = panel.dataset.view !== id);
    buttons.forEach(button => button.setAttribute('aria-selected', String(button.dataset.viewTarget === id)));
    if (updateHash) history.replaceState(null, '', `#${id}`);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  buttons.forEach(button => button.addEventListener('click', () => show(button.dataset.viewTarget)));
  window.addEventListener('hashchange', () => show(location.hash.slice(1), false));
  show(location.hash.slice(1) || 'home', false);
})();
