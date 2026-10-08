// Логика главной страницы: выбор параметров, согласие, запуск.

(function () {
  const freqButtonsEl = document.getElementById('freqButtons');
  const colorButtonsEl = document.getElementById('colorButtons');
  const stimButtonsEl = document.getElementById('stimButtons');
  const obsButtonsEl = document.getElementById('obsButtons');
  const consentCheck = document.getElementById('consentCheck');
  const startBtn = document.getElementById('startBtn');

  // Текущий выбор
  const state = {
    frequencyHz: CONFIG.flash.defaultFrequencyHz,
    color: CONFIG.flash.defaultColor,
    stimulationSec: CONFIG.flash.defaultStimulationSec,
    observationSec: CONFIG.flash.defaultObservationSec
  };

  // --- Кнопки частоты ---
  CONFIG.allowedFrequencies.forEach(hz => {
    const btn = document.createElement('button');
    btn.className = 'freq-btn';
    btn.textContent = hz + ' Гц';
    btn.dataset.value = hz;
    if (hz === state.frequencyHz) btn.classList.add('active');
    btn.addEventListener('click', () => {
      state.frequencyHz = hz;
      freqButtonsEl.querySelectorAll('.freq-btn')
        .forEach(b => b.classList.toggle('active', b === btn));
    });
    freqButtonsEl.appendChild(btn);
  });

  // --- Кнопки цвета ---
  Object.entries(CONFIG.flash.colors).forEach(([key, color]) => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.dataset.value = key;
    if (key === state.color) btn.classList.add('active');

    const [r, g, b] = color.rgb;
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = `rgb(${r}, ${g}, ${b})`;
    dot.style.boxShadow = `0 0 8px rgba(${r}, ${g}, ${b}, 0.7)`;

    btn.appendChild(dot);
    btn.appendChild(document.createTextNode(color.name));

    btn.addEventListener('click', () => {
      state.color = key;
      colorButtonsEl.querySelectorAll('.color-btn')
        .forEach(b => b.classList.toggle('active', b === btn));
    });
    colorButtonsEl.appendChild(btn);
  });

  // --- Кнопки длительности стимуляции ---
  CONFIG.allowedStimulationDurations.forEach(sec => {
    const btn = document.createElement('button');
    btn.className = 'duration-btn';
    btn.textContent = sec + ' сек';
    btn.dataset.value = sec;
    if (sec === state.stimulationSec) btn.classList.add('active');
    btn.addEventListener('click', () => {
      state.stimulationSec = sec;
      stimButtonsEl.querySelectorAll('.duration-btn')
        .forEach(b => b.classList.toggle('active', b === btn));
    });
    stimButtonsEl.appendChild(btn);
  });

  // --- Кнопки длительности наблюдения ---
  CONFIG.allowedObservationDurations.forEach(sec => {
    const btn = document.createElement('button');
    btn.className = 'duration-btn';
    btn.textContent = sec + ' сек';
    btn.dataset.value = sec;
    if (sec === state.observationSec) btn.classList.add('active');
    btn.addEventListener('click', () => {
      state.observationSec = sec;
      obsButtonsEl.querySelectorAll('.duration-btn')
        .forEach(b => b.classList.toggle('active', b === btn));
    });
    obsButtonsEl.appendChild(btn);
  });

  // --- Согласие ---
  consentCheck.addEventListener('change', () => {
    startBtn.disabled = !consentCheck.checked;
  });

  // --- Генерация ID эксперимента ---
  function generateExperimentId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${CONFIG.experimentIdPrefix}-${y}${m}${d}-${rand}`;
  }

  // --- Запуск эксперимента ---
  startBtn.addEventListener('click', () => {
    const experimentId = generateExperimentId();
    const params = {
      experimentId,
      frequencyHz: state.frequencyHz,
      color: state.color,
      colorName: CONFIG.flash.colors[state.color].name,
      stimulationSec: state.stimulationSec,
      observationSec: state.observationSec
    };
    localStorage.setItem('phospheneParams', JSON.stringify(params));
    window.location.href = 'experiment.html';
  });
})();