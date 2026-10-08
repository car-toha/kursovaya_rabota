// Логика страницы эксперимента: две фазы — стимуляция и наблюдение.

(function () {
  const raw = localStorage.getItem('phospheneParams');
  if (!raw) {
    window.location.href = 'index.html';
    return;
  }
  const params = JSON.parse(raw);

  const canvas = document.getElementById('flashCanvas');
  const timerEl = document.getElementById('expTimer');
  const progressFill = document.getElementById('expProgressFill');
  const statusEl = document.getElementById('expStatus');
  const hintEl = document.getElementById('centerHint');
  const stopBtn = document.getElementById('stopBtn');
  const finishOverlay = document.getElementById('finishOverlay');

  const colorRgb = CONFIG.flash.colors[params.color].rgb;
  const stimulus = new FlashStimulus(canvas, {
    frequencyHz: params.frequencyHz,
    durationMs: CONFIG.flash.durationMs,
    colorRgb,
    sizeRatio: CONFIG.flash.sizeRatio,
    fadeSoftness: CONFIG.flash.fadeSoftness
  });


  // Ненавязчивый звуковой сигнал перехода между фазами.
  // В браузерах с запретом autoplay сигнал будет пропущен без ошибки.
  let audioCtx = null;

  function phaseSignal(kind) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const now = audioCtx.currentTime;
      const notes = kind === 'finish'
        ? [{f: 660, t: 0}, {f: 880, t: 0.13}]
        : [{f: 520, t: 0}, {f: 620, t: 0.13}];

      notes.forEach(note => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.value = note.f;

        gain.gain.setValueAtTime(0.0001, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.045, now + note.t + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + 0.12);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + note.t);
        osc.stop(now + note.t + 0.13);
      });
    } catch (_) {
      // Звук необязателен: эксперимент продолжает работать без него.
    }
  }

  const stimulationMs = params.stimulationSec * 1000;
  const observationMs = params.observationSec * 1000;
  let finished = false;

  // ---------- ФАЗА 1: подготовка (3 сек) ----------
  statusEl.textContent = 'Приготовьтесь';
  hintEl.classList.remove('hidden');
  hintEl.innerHTML = `
    <h2>Смотрите на центр экрана</h2>
    <p>Глаза открыты. Не отводите взгляд.</p>
  `;

  setTimeout(() => {
    if (finished) return;
    phaseSignal('phase');
    startStimulationPhase();
  }, 3000);

  // ---------- ФАЗА 2: стимуляция ----------
  function startStimulationPhase() {
    hintEl.classList.add('hidden');
    statusEl.textContent = 'Стимуляция — глаза открыты';

    stimulus.onProgress = (elapsed, total) => {
      const remain = Math.max(0, total - elapsed);
      timerEl.textContent = (remain / 1000).toFixed(1) + ' с';
      progressFill.style.width = ((elapsed / total) * 100) + '%';
    };

    stimulus.onFinish = () => {
      if (finished) return;
      phaseSignal('phase');
      startObservationPhase();
    };

    stimulus.start(stimulationMs);
  }

  // ---------- ФАЗА 3: наблюдение ----------
  function startObservationPhase() {
    // Останавливаем стимул, гасим экран
    stimulus.stop();
    canvas.style.background = '#000';

    // Показываем большую инструкцию
    hintEl.classList.remove('hidden');
    hintEl.innerHTML = `
      <h2>Закройте глаза</h2>
      <p>Перекройте свет и наблюдайте ощущения до конца отсчёта.</p>
    `;

    statusEl.textContent = 'Наблюдение — глаза закрыты';
    progressFill.style.width = '100%';

    const startObs = performance.now();
    const totalObsMs = observationMs;

    // Таймер наблюдения
    const obsTimer = setInterval(() => {
      if (finished) {
        clearInterval(obsTimer);
        return;
      }
      const elapsed = performance.now() - startObs;
      if (elapsed >= totalObsMs) {
        clearInterval(obsTimer);
        phaseSignal('finish');
        finishExperiment();
        return;
      }
      const remain = Math.max(0, totalObsMs - elapsed);
      timerEl.textContent = (remain / 1000).toFixed(1) + ' с';
      // Прогресс-бар идёт "обратно" — от 100% к 0%
      progressFill.style.width = (100 - (elapsed / totalObsMs) * 100) + '%';
    }, 100);
  }

  // ---------- ФИНАЛ ----------
  function finishExperiment() {
    if (finished) return;
    finished = true;
    hintEl.classList.add('hidden');
    statusEl.textContent = 'Готово';
    finishOverlay.classList.remove('hidden');
  }

  // Кнопка "Стоп"
  stopBtn.addEventListener('click', () => {
    if (finished) return;
    finished = true;
    stimulus.stop();
    finishOverlay.classList.remove('hidden');
  });

  // Кнопка "Продолжить"
  document.getElementById('finishNextBtn').addEventListener('click', () => {
    params.finishedAt = new Date().toISOString();
    localStorage.setItem('phospheneParams', JSON.stringify(params));
    window.location.href = 'result.html';
  });

})();