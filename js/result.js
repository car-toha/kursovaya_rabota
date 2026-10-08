// Логика страницы результата: заполнение карточки.

(function () {
  const raw = localStorage.getItem('phospheneParams');
  if (!raw) {
    window.location.href = 'index.html';
    return;
  }
  const params = JSON.parse(raw);

  // Заполняем поля
  document.getElementById('rId').textContent = params.experimentId;
  document.getElementById('rFreq').textContent = params.frequencyHz + ' Гц';
  document.getElementById('rColor').textContent = params.colorName;
  document.getElementById('rStim').textContent = params.stimulationSec + ' сек';
  document.getElementById('rObs').textContent = params.observationSec + ' сек';
  document.getElementById('rDate').textContent = new Date().toLocaleString('ru-RU');

  // Цветная точка
  const [r, g, b] = CONFIG.flash.colors[params.color].rgb;
  const dot = document.getElementById('rColorDot');
  dot.style.background = `rgb(${r}, ${g}, ${b})`;
  dot.style.boxShadow = `0 0 10px rgba(${r}, ${g}, ${b}, 0.8)`;

  // Кнопка "Скопировать ID"
  document.getElementById('copyIdBtn').addEventListener('click', async () => {
    const btn = document.getElementById('copyIdBtn');
    try {
      await navigator.clipboard.writeText(params.experimentId);
      const original = btn.innerHTML;
      btn.innerHTML = '<span class="btn-icon">✓</span> Скопировано';
      setTimeout(() => { btn.innerHTML = original; }, 1500);
    } catch (e) {
      alert('ID: ' + params.experimentId);
    }
  });

  // Кнопка "Перейти к форме"
  document.getElementById('goToFormBtn').addEventListener('click', () => {
    const url = CONFIG.yandexFormUrl;
    window.open(url, '_blank');
  });

})();