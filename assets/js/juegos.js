document.querySelectorAll('[data-game]').forEach(panel => {
  const stage = panel.querySelector('.stage');
  const cover = stage.querySelector('.cover');
  const start = panel.querySelector('[data-play]');
  const fullscreen = panel.querySelector('[data-fullscreen]');
  const status = panel.querySelector('.game-status');
  let frame;

  start.addEventListener('click', async () => {
    if (window.location.protocol === 'file:') {
      status.textContent = 'Abriste el portal como archivo. Abre index.html con Live Server en VS Code y pulsa START otra vez.';
      return;
    }

    start.disabled = true;
    status.textContent = 'Cargando…';

    try {
      const file = await fetch(panel.dataset.game, { method: 'HEAD' });
      if (!file.ok) throw new Error('Juego no disponible');

      frame = document.createElement('iframe');
      frame.title = panel.dataset.title;
      frame.allow = 'fullscreen; autoplay; gamepad';
      frame.src = panel.dataset.game;
      frame.addEventListener('load', () => {
        cover.hidden = true;
        status.textContent = '';
        fullscreen.hidden = !document.fullscreenEnabled;
        frame.focus();
      }, { once: true });
      stage.append(frame);
    } catch {
      status.textContent = 'No se pudo cargar el juego. Comprueba que su carpeta esté en el sitio y vuelve a pulsar START.';
      start.disabled = false;
    }
  });

  fullscreen.addEventListener('click', async () => {
    if (document.fullscreenElement === panel) {
      await document.exitFullscreen();
    } else {
      await panel.requestFullscreen();
    }
    frame?.focus();
  });

  document.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = document.fullscreenElement === panel
      ? 'Salir de pantalla completa'
      : 'Pantalla completa';
  });
});
