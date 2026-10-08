// Генератор мерцающих вспышек на Canvas.

class FlashStimulus {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = options; // { frequencyHz, durationMs, colorRgb, sizeRatio, fadeSoftness }

    this.running = false;
    this.startTime = 0;
    this.lastFlashTime = 0;
    this.rafId = null;

    this._resize = this._resize.bind(this);
    this._tick = this._tick.bind(this);

    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width  = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w;
    this.h = h;
    this._drawBackground();
  }

  _drawBackground() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  // Рисует одну вспышку с заданной прозрачностью (0..1)
  _drawFlash(alpha) {
    const { colorRgb, sizeRatio, fadeSoftness } = this.opts;
    const [r, g, b] = colorRgb;

    const minSide = Math.min(this.w, this.h);
    const radius = minSide * sizeRatio / 2;
    const cx = this.w / 2;
    const cy = this.h / 2;

    // Внутренний мягкий градиент, чтобы не было резкого края
    const inner = radius * (1 - fadeSoftness * 0.5);
    const outer = radius;

    const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, outer);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    grad.addColorStop(inner / outer, `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    this.ctx.fill();
  }

  _tick(now) {
    if (!this.running) return;

    const elapsedMs = now - this.startTime;
    const { frequencyHz, durationMs, totalDurationMs } = this.opts;

    if (elapsedMs >= totalDurationMs) {
      this.stop();
      if (typeof this.onFinish === 'function') this.onFinish();
      return;
    }

    const periodMs = 1000 / frequencyHz;
    const phase = elapsedMs % periodMs;

    // Очищаем и рисуем фон
    this._drawBackground();

    // Если мы внутри "вспышки" — рисуем с плавным затуханием
    if (phase < durationMs) {
      const t = phase / durationMs; // 0..1
      // Плавное затухание: в начале ярко, к концу — ноль
      const alpha = Math.pow(1 - t, 1 / (1 - this.opts.fadeSoftness + 0.001));
      this._drawFlash(alpha);
    }

    // Прогресс
    if (typeof this.onProgress === 'function') {
      this.onProgress(elapsedMs, totalDurationMs);
    }

    this.rafId = requestAnimationFrame(this._tick);
  }

  start(totalDurationMs) {
    this.running = true;
    this.startTime = performance.now();
    this.opts.totalDurationMs = totalDurationMs;
    this.rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this._drawBackground();
  }
}
