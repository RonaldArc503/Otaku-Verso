const showcase = document.querySelector<HTMLElement>('[data-showcase]');
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-screen]')];
const panels = [...document.querySelectorAll<HTMLElement>('[data-panel]')];
const descriptions = [...document.querySelectorAll<HTMLElement>('[data-description]')];
const dialog = document.querySelector<HTMLDialogElement>('[data-screenshot-dialog]');
const expandedImage = document.querySelector<HTMLImageElement>('[data-expanded-image]');
const expandButton = document.querySelector<HTMLButtonElement>('[data-expand]');
let currentScreen = 'home';

function selectScreen(screen: string) {
  if (!tabs.some(tab => tab.dataset.screen === screen)) return;
  currentScreen = screen;
  tabs.forEach(tab => {
    const active = tab.dataset.screen === screen;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panels.forEach(panel => { panel.hidden = panel.dataset.panel !== screen; });
  descriptions.forEach(description => { description.hidden = description.dataset.description !== screen; });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectScreen(tab.dataset.screen!));
  tab.addEventListener('keydown', event => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectScreen(tabs[next].dataset.screen!);
    tabs[next].focus();
  });
});

expandButton?.addEventListener('click', () => {
  const current = panels.find(panel => panel.dataset.panel === currentScreen)?.querySelector('img');
  if (!dialog || !expandedImage || !current) return;
  expandedImage.src = current.src;
  expandedImage.alt = current.alt;
  document.querySelector('#screenshot-dialog-title')!.textContent = tabs.find(tab => tab.dataset.screen === currentScreen)!.textContent?.trim() ?? 'Captura de la app';
  dialog.showModal();
});
document.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog?.addEventListener('close', () => expandButton?.focus());
if (showcase) showcase.dataset.ready = 'true';
