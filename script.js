const searchInput = document.querySelector('#siteSearch');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const termo = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('[data-search]').forEach(card => {
      const texto = card.dataset.search.toLowerCase();
      card.style.display = texto.includes(termo) ? '' : 'none';
    });
  });
}


/* =========================================================
   POMODORO FLUTUANTE BIOGUARÁ
   Aparece como botão discreto em todas as páginas.
   O timer continua rodando ao trocar de página, usando localStorage.
   ========================================================= */
(function(){
  const isFullPomodoroPage = location.pathname.toLowerCase().includes('pomodoro-bioguara');
  const STORAGE_KEY = 'bioguaraFloatingPomodoro';
  const DEFAULT_STATE = {
    mode: 'Foco',
    minutes: 25,
    remaining: 25 * 60,
    running: false,
    endTime: null
  };

  function loadState(){
    try{
      return Object.assign({}, DEFAULT_STATE, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    }catch(e){
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  function saveState(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function format(seconds){
    seconds = Math.max(0, Math.floor(seconds));
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return m + ':' + s;
  }

  function computeRemaining(state){
    if(state.running && state.endTime){
      return Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
    }
    return Math.max(0, state.remaining || state.minutes * 60);
  }

  function beep(){
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    }catch(e){}
  }

  function createWidget(){
    if(document.querySelector('#floatingPomodoroBioguara')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'floatingPomodoroBioguara';
    wrapper.className = 'floating-pomodoro collapsed';
    wrapper.innerHTML = `
      <button class="fp-toggle" type="button" aria-label="Abrir Pomodoro Bioguará">
        <span class="fp-emoji">🍅</span>
        <span class="fp-toggle-text">Pomodoro</span>
        <span class="fp-mini-time">25:00</span>
      </button>

      <div class="fp-panel" aria-label="Pomodoro Bioguará">
        <div class="fp-head">
          <div>
            <strong>🍅 Pomodoro Bioguará</strong>
            <span id="fpMode">Modo Foco</span>
          </div>
          <button class="fp-close" type="button" aria-label="Fechar Pomodoro">×</button>
        </div>

        <div class="fp-time" id="fpTime">25:00</div>

        <div class="fp-modes">
          <button type="button" data-min="25" data-mode="Foco">Foco<br><span>25 min</span></button>
          <button type="button" data-min="15" data-mode="Revisão">Revisão<br><span>15 min</span></button>
          <button type="button" data-min="20" data-mode="Questões">Questões<br><span>20 min</span></button>
          <button type="button" data-min="5" data-mode="Pausa">Pausa<br><span>5 min</span></button>
        </div>

        <div class="fp-actions">
          <button type="button" id="fpStart">▶ Iniciar</button>
          <button type="button" id="fpPause">⏸ Pausar</button>
          <button type="button" id="fpReset">↺ Reiniciar</button>
        </div>

        <a class="fp-full-link" href="pomodoro-bioguara.html">Abrir versão completa</a>
      </div>
    `;
    document.body.appendChild(wrapper);
  }

  function initWidget(){
    if(isFullPomodoroPage) return;
    createWidget();

    const root = document.querySelector('#floatingPomodoroBioguara');
    const toggle = root.querySelector('.fp-toggle');
    const close = root.querySelector('.fp-close');
    const mini = root.querySelector('.fp-mini-time');
    const time = root.querySelector('#fpTime');
    const mode = root.querySelector('#fpMode');
    const startBtn = root.querySelector('#fpStart');
    const pauseBtn = root.querySelector('#fpPause');
    const resetBtn = root.querySelector('#fpReset');
    const modeBtns = root.querySelectorAll('.fp-modes button');

    let state = loadState();
    let finishedNotified = false;

    function render(){
      state.remaining = computeRemaining(state);

      if(state.running && state.remaining <= 0){
        state.running = false;
        state.endTime = null;
        state.remaining = 0;
        saveState(state);
        if(!finishedNotified){
          finishedNotified = true;
          beep();
          root.classList.remove('collapsed');
          alert('Pomodoro Bioguará: ciclo concluído! Faça uma pausa.');
        }
      }

      const label = format(state.remaining);
      time.textContent = label;
      mini.textContent = label;
      mode.textContent = 'Modo ' + state.mode;

      modeBtns.forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.min) === Number(state.minutes) && btn.dataset.mode === state.mode);
      });

      startBtn.textContent = state.running ? 'Rodando...' : '▶ Iniciar';
      saveState(state);
    }

    toggle.addEventListener('click', () => {
      root.classList.toggle('collapsed');
    });

    close.addEventListener('click', () => {
      root.classList.add('collapsed');
    });

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        state.minutes = Number(btn.dataset.min);
        state.remaining = state.minutes * 60;
        state.running = false;
        state.endTime = null;
        finishedNotified = false;
        render();
      });
    });

    startBtn.addEventListener('click', () => {
      if(state.running) return;
      state.remaining = computeRemaining(state);
      if(state.remaining <= 0) state.remaining = state.minutes * 60;
      state.running = true;
      state.endTime = Date.now() + state.remaining * 1000;
      finishedNotified = false;
      render();
    });

    pauseBtn.addEventListener('click', () => {
      state.remaining = computeRemaining(state);
      state.running = false;
      state.endTime = null;
      render();
    });

    resetBtn.addEventListener('click', () => {
      state.running = false;
      state.endTime = null;
      state.remaining = state.minutes * 60;
      finishedNotified = false;
      render();
    });

    render();
    setInterval(render, 1000);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initWidget);
  }else{
    initWidget();
  }
})();
