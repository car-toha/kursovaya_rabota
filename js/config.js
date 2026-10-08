// Все настройки эксперимента в одном месте.

const CONFIG = {

  // Параметры вспышек и фаз
  flash: {
    // Частота по умолчанию (Гц)
    defaultFrequencyHz: 10,

    // Длительность одной вспышки (мс). Должна быть меньше периода:
    // период = 1000 / frequencyHz. Для 10 Гц период = 100 мс.
    durationMs: 55,

    // Длительность фазы стимуляции (сек) — глаза ОТКРЫТЫ
    defaultStimulationSec: 10,

    // Длительность фазы наблюдения (сек) — глаза ЗАКРЫТЫ, ладони на лице
    defaultObservationSec: 25,

    // Цвета вспышек
    colors: {
      white: { name: 'Белый',   rgb: [255, 255, 255] },
      red:   { name: 'Красный', rgb: [255, 60, 60] },
      green: { name: 'Зелёный', rgb: [60, 255, 120] },
      blue:  { name: 'Синий',   rgb: [80, 140, 255] }
    },
    defaultColor: 'red',

    // Размер вспышки: доля от меньшей стороны экрана (0..1)
    sizeRatio: 0.45,

    // Плавность затухания (0..1)
    fadeSoftness: 0.7
  },

  // Разрешённые частоты (слайдер на главной)
  allowedFrequencies: [5, 8, 10, 12, 15],

  // Разрешённые длительности стимуляции (сек)
  allowedStimulationDurations: [5, 10, 15],

  // Разрешённые длительности наблюдения (сек)
  allowedObservationDurations: [15, 25, 40],

  // Ссылка на Яндекс.Форму (замени на свою)
  yandexFormUrl: 'https://forms.yandex.ru/u/6abfbc7be010db5d4dfdf21a/',

  // Префикс ID эксперимента
  experimentIdPrefix: 'PHOS'
};