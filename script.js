// Константы
const CANVAS_W = 1012;
const CANVAS_H = 1350;

// Доступные начертания для каждого шрифта
const FONT_WEIGHTS = {
    'Helvetica': [
        { value: '300', label: 'Light' },
        { value: '400', label: 'Regular' },
        { value: '500', label: 'Medium' },
        { value: '600', label: 'Semibold' },
        { value: '700', label: 'Bold' }
    ],
    'Inter': [
        { value: '300', label: 'Light' },
        { value: '400', label: 'Regular' },
        { value: '500', label: 'Medium' },
        { value: '600', label: 'Semibold' },
        { value: '700', label: 'Bold' }
    ],
    'Better VCR': [
        { value: '400', label: 'Regular' }
    ],
    'Brusnika': [
        { value: '400', label: 'Regular' }
    ],
    'Maki Sans': [
        { value: '400', label: 'Regular' },
        { value: '700', label: 'Bold' }
    ],
    'Nauryz': [
        { value: '400', label: 'Regular' }
    ]
};

// Типограф - базовая обработка текста
function typograph(text) {
    if (!text) return text;
    return text;
}

// Состояние приложения
let slides = [];
const settings = {
    username: 'Design.kudry',
    opacity: 0.6,
    overlayStyle: 'shadow',
    layoutStyle: 'top',
    bgColor: '#667eea',
    titleColor: '#ffffff',
    textColor: '#ffffff',
    footerColor: '#ffffff',
    fontSize: 40,
    titleSize: 44,
    footerSize: 32,
    titleFont: 'Helvetica',
    textFont: 'Helvetica',
    footerFont: 'Helvetica',
    titleWeight: '400',
    textWeight: '400',
    footerWeight: '400'
};

let currentSlideImage = null;
let editingIndex = null;
let currentMode = 'manual'; // 'manual' или 'ai'

// Элементы DOM
const manualModeBtn = document.getElementById('manualModeBtn');
const aiModeBtn = document.getElementById('aiModeBtn');
const manualMode = document.getElementById('manualMode');
const aiMode = document.getElementById('aiMode');
const aiText = document.getElementById('aiText');
const aiApiKey = document.getElementById('aiApiKey');
const aiProvider = document.getElementById('aiProvider');
const slideTitle = document.getElementById('slideTitle');
const slideText = document.getElementById('slideText');
const slideImage = document.getElementById('slideImage');
const uploadImageBtn = document.getElementById('uploadImageBtn');
const imageFileName = document.getElementById('imageFileName');
const addSlideBtn = document.getElementById('addSlideBtn');
const usernameInput = document.getElementById('username');
const layoutStyleSelect = document.getElementById('layoutStyle');
const overlayStyleSelect = document.getElementById('overlayStyle');
const opacitySlider = document.getElementById('opacity');
const fontSizeSlider = document.getElementById('fontSize');
const titleSizeSlider = document.getElementById('titleSize');
const footerSizeSlider = document.getElementById('footerSize');
const titleFontInput = document.getElementById('titleFont');
const titleFontCustom = document.getElementById('titleFontCustom');
const titleWeightInput = document.getElementById('titleWeight');
const textFontInput = document.getElementById('textFont');
const textFontCustom = document.getElementById('textFontCustom');
const textWeightInput = document.getElementById('textWeight');
const footerSizeInput = document.getElementById('footerSize');
const footerFontInput = document.getElementById('footerFont');
const footerFontCustom = document.getElementById('footerFontCustom');
const footerWeightInput = document.getElementById('footerWeight');
const slidesContainer = document.getElementById('slidesContainer');
const opacityValue = document.getElementById('opacityValue');
const bgColorInput = document.getElementById('bgColor');
const titleColorInput = document.getElementById('titleColor');
const textColorInput = document.getElementById('textColor');
const footerColorInput = document.getElementById('footerColor');
const bgColorHexInput = document.getElementById('bgColorHex');
const titleColorHexInput = document.getElementById('titleColorHex');
const textColorHexInput = document.getElementById('textColorHex');
const footerColorHexInput = document.getElementById('footerColorHex');

// Глобальный file picker для замены изображений
let pendingIndex = null;
const filePicker = document.createElement('input');
filePicker.type = 'file';
filePicker.accept = 'image/*';
filePicker.style.display = 'none';
document.body.appendChild(filePicker);

// Функция сохранения настроек
function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Функция загрузки настроек
function loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(settings, parsed);
        
        // Обновляем UI элементы
        usernameInput.value = settings.username;
        layoutStyleSelect.value = settings.layoutStyle;
        overlayStyleSelect.value = settings.overlayStyle;
        opacitySlider.value = settings.opacity * 100;
        opacityValue.textContent = settings.opacity.toFixed(2);
        
        bgColorInput.value = settings.bgColor;
        bgColorHexInput.value = settings.bgColor;
        titleColorInput.value = settings.titleColor;
        titleColorHexInput.value = settings.titleColor;
        textColorInput.value = settings.textColor;
        textColorHexInput.value = settings.textColor;
        footerColorInput.value = settings.footerColor;
        footerColorHexInput.value = settings.footerColor;
        
        titleSizeSlider.value = settings.titleSize;
        fontSizeSlider.value = settings.fontSize;
        footerSizeInput.value = settings.footerSize;
        
        titleFontInput.value = settings.titleFont;
        textFontInput.value = settings.textFont;
        footerFontInput.value = settings.footerFont;
        
        titleWeightInput.value = settings.titleWeight;
        textWeightInput.value = settings.textWeight;
        footerWeightInput.value = settings.footerWeight;
        
        // Обновляем доступные веса для каждого шрифта
        updateFontWeights(settings.titleFont, titleWeightInput);
        titleWeightInput.value = settings.titleWeight;
        
        updateFontWeights(settings.textFont, textWeightInput);
        textWeightInput.value = settings.textWeight;
        
        updateFontWeights(settings.footerFont, footerWeightInput);
        footerWeightInput.value = settings.footerWeight;
        
        // Обновляем видимость прозрачности
        const opacityGroup = document.getElementById('opacityGroup');
        if (settings.overlayStyle === 'none') {
            opacityGroup.style.display = 'none';
        } else {
            opacityGroup.style.display = 'flex';
        }
    }
}

// Функция предзагрузки шрифтов для Canvas
async function preloadFonts() {
    const fonts = [
        new FontFace('Better VCR', 'url(BetterVCR9.0.1.ttf)', { weight: '400' }),
        new FontFace('Brusnika', 'url(Brusnika-normal_version_02.otf)', { weight: '400' }),
        new FontFace('Maki Sans', 'url(MakiSans-Regular.otf)', { weight: '400' }),
        new FontFace('Maki Sans', 'url(MakiSans-Bold.otf)', { weight: '700' }),
        new FontFace('Nauryz', 'url(NAURYZREDKEDS.ttf)', { weight: '400' })
    ];
    
    try {
        const loadedFonts = await Promise.all(fonts.map(font => font.load()));
        loadedFonts.forEach(font => document.fonts.add(font));
        console.log('Все шрифты загружены');
    } catch (err) {
        console.error('Ошибка загрузки шрифтов:', err);
    }
}

// Загружаем сохраненный API ключ
if (localStorage.getItem('aiApiKey')) {
    aiApiKey.value = localStorage.getItem('aiApiKey');
}
if (localStorage.getItem('aiProvider')) {
    aiProvider.value = localStorage.getItem('aiProvider');
}

// Загружаем сохраненные настройки
loadSettings();

// Предзагружаем шрифты для Canvas
preloadFonts();

// Обработчики событий - переключение режимов
manualModeBtn.addEventListener('click', () => {
    currentMode = 'manual';
    manualModeBtn.classList.add('active');
    aiModeBtn.classList.remove('active');
    manualMode.style.display = 'flex';
    aiMode.style.display = 'none';
    addSlideBtn.textContent = 'Добавить слайд';
});

aiModeBtn.addEventListener('click', () => {
    currentMode = 'ai';
    aiModeBtn.classList.add('active');
    manualModeBtn.classList.remove('active');
    aiMode.style.display = 'flex';
    manualMode.style.display = 'none';
    addSlideBtn.textContent = 'Сгенерировать слайды';
});

// Сохранение API ключа
aiApiKey.addEventListener('change', () => {
    localStorage.setItem('aiApiKey', aiApiKey.value);
});

aiProvider.addEventListener('change', () => {
    localStorage.setItem('aiProvider', aiProvider.value);
    updateApiKeyHint();
});

// Обновление подсказки в зависимости от провайдера
function updateApiKeyHint() {
    const hint = document.getElementById('apiKeyHint');
    const provider = aiProvider.value;
    
    if (provider === 'free') {
        hint.innerHTML = 'Автоматически разбивает текст на слайды по параграфам. Работает без интернета!';
        aiApiKey.placeholder = 'Ключ не требуется';
        aiApiKey.required = false;
        aiApiKey.style.display = 'none';
        hint.style.display = 'block';
    } else if (provider === 'groq') {
        hint.innerHTML = 'Groq бесплатный и быстрый! <a href="https://console.groq.com/keys" target="_blank">Получить бесплатный ключ Groq</a> (регистрация 1 минута)';
        aiApiKey.placeholder = 'gsk-...';
        aiApiKey.required = true;
        aiApiKey.style.display = 'block';
        hint.style.display = 'block';
    } else if (provider === 'openai') {
        hint.innerHTML = 'Ваш ключ сохраняется локально. <a href="https://platform.openai.com/api-keys" target="_blank">Получить ключ OpenAI</a>';
        aiApiKey.placeholder = 'sk-...';
        aiApiKey.required = true;
        aiApiKey.style.display = 'block';
        hint.style.display = 'block';
    } else {
        hint.innerHTML = 'Ваш ключ сохраняется локально. <a href="https://console.anthropic.com/account/keys" target="_blank">Получить ключ Claude</a>';
        aiApiKey.placeholder = 'sk-ant-...';
        aiApiKey.required = true;
        aiApiKey.style.display = 'block';
        hint.style.display = 'block';
    }
}

// Инициализация подсказки
updateApiKeyHint();

// Обработчики событий - остальное
uploadImageBtn.addEventListener('click', () => slideImage.click());

slideImage.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    imageFileName.textContent = file.name;
    const url = await fileToDataURL(file);
    currentSlideImage = await urlToImage(url);
    
    // Live preview при редактировании
    if (editingIndex !== null) {
        slides[editingIndex].image = currentSlideImage;
        renderOne(editingIndex);
    }
});

// Live preview для заголовка
slideTitle.addEventListener('input', () => {
    if (editingIndex !== null) {
        slides[editingIndex].title = slideTitle.value;
        renderOne(editingIndex);
    }
});

// Live preview для текста
slideText.addEventListener('input', () => {
    if (editingIndex !== null) {
        slides[editingIndex].text = slideText.value;
        renderOne(editingIndex);
    }
});

addSlideBtn.addEventListener('click', async () => {
    if (currentMode === 'ai') {
        // AI режим - генерация слайдов
        const text = aiText.value.trim();
        const apiKey = aiApiKey.value.trim();
        const provider = aiProvider.value;
        
        if (!text) {
            alert('Введите текст для разбиения на слайды');
            return;
        }
        
        if (provider !== 'free' && !apiKey) {
            alert('Введите API ключ или выберите "Бесплатно для всех"');
            return;
        }
        
        addSlideBtn.disabled = true;
        addSlideBtn.textContent = 'Генерация...';
        
        try {
            const generatedSlides = await generateSlidesWithAI(text, apiKey, provider);
            
            // Добавляем сгенерированные слайды
            generatedSlides.forEach(slide => {
                slides.push({
                    title: slide.title,
                    text: slide.text,
                    image: null,
                    opacity: settings.opacity,
                    overlayStyle: settings.overlayStyle,
                    layoutStyle: settings.layoutStyle
                });
            });
            
            renderAllSlides();
            
            // Очистка формы
            aiText.value = '';
            
            // Сохраняем ключ
            if (apiKey) {
                localStorage.setItem('aiApiKey', apiKey);
            }
            localStorage.setItem('aiProvider', provider);
            
            alert(`Успешно создано ${generatedSlides.length} слайдов!`);
        } catch (error) {
            alert('Ошибка генерации: ' + error.message);
        } finally {
            addSlideBtn.disabled = false;
            addSlideBtn.textContent = 'Сгенерировать слайды';
        }
        return;
    }
    
    // Ручной режим - добавление/редактирование слайда
    const title = slideTitle.value.trim();
    const text = slideText.value.trim();
    
    if (!title && !text) {
        alert('Заполните хотя бы заголовок или текст слайда');
        return;
    }
    
    if (editingIndex !== null) {
        // Редактируем существующий слайд
        slides[editingIndex] = {
            title: title,
            text: text,
            image: currentSlideImage !== null ? currentSlideImage : slides[editingIndex].image,
            opacity: settings.opacity
        };
        editingIndex = null;
        addSlideBtn.textContent = 'Добавить слайд';
    } else {
        // Добавляем новый слайд
        slides.push({
            title: title,
            text: text,
            image: currentSlideImage,
            opacity: settings.opacity,
            overlayStyle: settings.overlayStyle,
            layoutStyle: settings.layoutStyle
        });
    }
    
    // Очистка формы
    slideTitle.value = '';
    slideText.value = '';
    slideImage.value = '';
    imageFileName.textContent = '';
    currentSlideImage = null;
    
    renderAllSlides();
});

usernameInput.addEventListener('input', (e) => {
    settings.username = e.target.value;
    saveSettings();
    renderAllSlides();
});

layoutStyleSelect.addEventListener('change', (e) => {
    settings.layoutStyle = e.target.value;
    
    // Обновляем layoutStyle для всех существующих слайдов
    slides.forEach(slide => {
        slide.layoutStyle = settings.layoutStyle;
    });
    
    saveSettings();
    renderAllSlides();
});

overlayStyleSelect.addEventListener('change', (e) => {
    settings.overlayStyle = e.target.value;
    
    // Показываем/скрываем прозрачность в зависимости от стиля
    const opacityGroup = document.getElementById('opacityGroup');
    if (e.target.value === 'none') {
        opacityGroup.style.display = 'none';
    } else {
        opacityGroup.style.display = 'flex';
    }
    
    // Обновляем overlayStyle для всех существующих слайдов
    slides.forEach(slide => {
        slide.overlayStyle = settings.overlayStyle;
    });
    
    saveSettings();
    renderAllSlides();
});

opacitySlider.addEventListener('input', (e) => {
    settings.opacity = e.target.value / 100;
    opacityValue.textContent = (e.target.value / 100).toFixed(2);
    
    // Обновляем прозрачность для всех существующих слайдов
    slides.forEach(slide => {
        slide.opacity = settings.opacity;
    });
    
    saveSettings();
    renderAllSlides();
});

fontSizeSlider.addEventListener('change', (e) => {
    settings.fontSize = parseInt(e.target.value);
    saveSettings();
    renderAllSlides();
});

titleSizeSlider.addEventListener('change', (e) => {
    settings.titleSize = parseInt(e.target.value);
    saveSettings();
    renderAllSlides();
});

// Footer size
footerSizeInput.addEventListener('change', (e) => {
    settings.footerSize = parseInt(e.target.value);
    saveSettings();
    renderAllSlides();
});

// Функция для обновления доступных весов шрифта
function updateFontWeights(fontName, weightSelect) {
    const weights = FONT_WEIGHTS[fontName] || FONT_WEIGHTS['Helvetica'];
    
    // Очищаем текущие опции
    weightSelect.innerHTML = '';
    
    // Добавляем доступные веса
    weights.forEach(weight => {
        const option = document.createElement('option');
        option.value = weight.value;
        option.textContent = weight.label;
        weightSelect.appendChild(option);
    });
    
    // Если только один вес - делаем disabled
    if (weights.length === 1) {
        weightSelect.disabled = true;
        weightSelect.value = weights[0].value;
    } else {
        weightSelect.disabled = false;
        // Пытаемся сохранить текущий вес или ставим первый доступный
        const currentWeight = weightSelect.dataset.currentWeight || '400';
        const availableValues = weights.map(w => w.value);
        weightSelect.value = availableValues.includes(currentWeight) ? currentWeight : weights[0].value;
    }
}

titleFontInput.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        titleFontCustom.style.display = 'block';
    } else {
        titleFontCustom.style.display = 'none';
        settings.titleFont = e.target.value;
        
        // Обновляем доступные веса
        titleWeightInput.dataset.currentWeight = settings.titleWeight;
        updateFontWeights(e.target.value, titleWeightInput);
        settings.titleWeight = titleWeightInput.value;
        
        loadFontIfNeeded(settings.titleFont);
        saveSettings();
        renderAllSlides();
    }
});

titleFontCustom.addEventListener('input', (e) => {
    settings.titleFont = e.target.value || 'Inter';
    loadFontIfNeeded(settings.titleFont);
    saveSettings();
    renderAllSlides();
});

titleWeightInput.addEventListener('change', (e) => {
    settings.titleWeight = e.target.value;
    saveSettings();
    renderAllSlides();
});

textFontInput.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        textFontCustom.style.display = 'block';
    } else {
        textFontCustom.style.display = 'none';
        settings.textFont = e.target.value;
        
        // Обновляем доступные веса
        textWeightInput.dataset.currentWeight = settings.textWeight;
        updateFontWeights(e.target.value, textWeightInput);
        settings.textWeight = textWeightInput.value;
        
        loadFontIfNeeded(settings.textFont);
        saveSettings();
        renderAllSlides();
    }
});

textFontCustom.addEventListener('input', (e) => {
    settings.textFont = e.target.value || 'Inter';
    loadFontIfNeeded(settings.textFont);
    saveSettings();
    renderAllSlides();
});

textWeightInput.addEventListener('change', (e) => {
    settings.textWeight = e.target.value;
    saveSettings();
    renderAllSlides();
});

// Обработчики цветов
bgColorInput.addEventListener('input', (e) => {
    settings.bgColor = e.target.value;
    bgColorHexInput.value = e.target.value;
    saveSettings();
    renderAllSlides();
});

bgColorHexInput.addEventListener('input', (e) => {
    const color = e.target.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        settings.bgColor = color;
        bgColorInput.value = color;
        saveSettings();
        renderAllSlides();
    }
});

titleColorInput.addEventListener('input', (e) => {
    settings.titleColor = e.target.value;
    titleColorHexInput.value = e.target.value;
    saveSettings();
    renderAllSlides();
});

titleColorHexInput.addEventListener('input', (e) => {
    const color = e.target.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        settings.titleColor = color;
        titleColorInput.value = color;
        saveSettings();
        renderAllSlides();
    }
});

textColorInput.addEventListener('input', (e) => {
    settings.textColor = e.target.value;
    textColorHexInput.value = e.target.value;
    saveSettings();
    renderAllSlides();
});

textColorHexInput.addEventListener('input', (e) => {
    const color = e.target.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        settings.textColor = color;
        textColorInput.value = color;
        saveSettings();
        renderAllSlides();
    }
});

footerColorInput.addEventListener('input', (e) => {
    settings.footerColor = e.target.value;
    footerColorHexInput.value = e.target.value;
    saveSettings();
    renderAllSlides();
});

footerColorHexInput.addEventListener('input', (e) => {
    const color = e.target.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        settings.footerColor = color;
        footerColorInput.value = color;
        saveSettings();
        renderAllSlides();
    }
});

// Обработчики для футера
footerFontInput.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        footerFontCustom.style.display = 'block';
    } else {
        footerFontCustom.style.display = 'none';
        settings.footerFont = e.target.value;
        
        // Обновляем доступные веса
        footerWeightInput.dataset.currentWeight = settings.footerWeight;
        updateFontWeights(e.target.value, footerWeightInput);
        settings.footerWeight = footerWeightInput.value;
        
        loadFontIfNeeded(settings.footerFont);
        saveSettings();
        renderAllSlides();
    }
});

footerFontCustom.addEventListener('input', (e) => {
    settings.footerFont = e.target.value || 'Inter';
    loadFontIfNeeded(settings.footerFont);
    saveSettings();
    renderAllSlides();
});

footerWeightInput.addEventListener('change', (e) => {
    settings.footerWeight = e.target.value;
    saveSettings();
    renderAllSlides();
});

clearBtn.addEventListener('click', clearAll);

filePicker.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (pendingIndex == null) return;
    
    const url = await fileToDataURL(file);
    const img = await urlToImage(url);
    slides[pendingIndex].image = img;
    await renderOne(pendingIndex);
    
    pendingIndex = null;
    filePicker.value = '';
});

// Функции
async function loadFontIfNeeded(fontName) {
    // Если это URL, загружаем как веб-шрифт
    if (fontName.startsWith('http://') || fontName.startsWith('https://')) {
        try {
            const font = new FontFace('CustomFont', `url(${fontName})`);
            await font.load();
            document.fonts.add(font);
        } catch (err) {
            console.error('Ошибка загрузки шрифта:', err);
        }
    }
}

async function renderAllSlides() {
    slidesContainer.innerHTML = '';
    
    for (let i = 0; i < slides.length; i++) {
        await renderOne(i);
    }
}

async function renderOne(index) {
    const slide = slides[index];
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    
    // Рисуем фон
    if (slide.image) {
        drawCover(ctx, slide.image, CANVAS_W, CANVAS_H);
    } else {
        // Градиент по умолчанию используя выбранный цвет
        const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
        grad.addColorStop(0, settings.bgColor);
        grad.addColorStop(1, '#764ba2');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    
    // Применяем оверлей в зависимости от выбранного стиля
    const slideOpacity = slide.opacity !== undefined ? slide.opacity : settings.opacity;
    const overlayStyle = slide.overlayStyle !== undefined ? slide.overlayStyle : settings.overlayStyle;
    const layoutStyle = slide.layoutStyle !== undefined ? slide.layoutStyle : settings.layoutStyle;
    
    if (overlayStyle === 'shadow') {
        // Тёмный полупрозрачный оверлей (текущий стиль)
        ctx.fillStyle = `rgba(0, 0, 0, ${slideOpacity})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (overlayStyle === 'gradient') {
        // Градиент меняет направление в зависимости от layoutStyle
        let gradient;
        if (layoutStyle === 'bottom') {
            // Для стиля 3 - градиент снизу вверх
            gradient = ctx.createLinearGradient(0, CANVAS_H, 0, 0);
        } else {
            // Для стилей 1 и 2 - градиент сверху вниз
            gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        }
        gradient.addColorStop(0, `rgba(0, 0, 0, ${slideOpacity * 0.85})`);
        gradient.addColorStop(0.5, `rgba(0, 0, 0, ${slideOpacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    // Если 'none' - ничего не делаем
    
    // Настройки текста
    ctx.textBaseline = 'top';
    
    const padding = 48;
    const contentWidth = CANVAS_W - padding * 2;
    
    // Предварительно считаем высоту контента для стиля 3
    let titleY, textY, footerY;
    let totalContentHeight = 0;
    
    if (layoutStyle === 'bottom') {
        // Для стиля 3 нужно посчитать высоту всего контента
        ctx.font = `${settings.titleWeight} ${settings.titleSize}px ${settings.titleFont}`;
        const titleLines = wrapText(ctx, typograph(slide.title), contentWidth);
        const titleHeight = titleLines.length * settings.titleSize * 1.2;
        
        let textHeight = 0;
        if (slide.text) {
            ctx.font = `${settings.textWeight} ${settings.fontSize}px ${settings.textFont}`;
            const textLines = wrapText(ctx, typograph(slide.text), contentWidth);
            textHeight = textLines.length * settings.fontSize * 1.4;
        }
        
        totalContentHeight = titleHeight + settings.titleSize * 0.3 + textHeight;
    }
    
    // Рассчитываем позиции в зависимости от layoutStyle
    if (layoutStyle === 'top') {
        // Стиль 1 - Сверху (текущий)
        titleY = padding;
        footerY = CANVAS_H - padding - settings.footerSize;
    } else if (layoutStyle === 'center') {
        // Стиль 2 - По центру
        titleY = 391;
        footerY = CANVAS_H - padding - settings.footerSize;
    } else if (layoutStyle === 'bottom') {
        // Стиль 3 - Снизу (прижат к низу, растет вверх)
        footerY = padding;
        // Контент заканчивается на padding (48px) от низа
        titleY = CANVAS_H - padding - totalContentHeight;
    }
    
    // Градиент для футера (затемнение для лучшей читаемости)
    const footerGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    if (layoutStyle === 'bottom') {
        // Если футер вверху - затемнение сверху
        footerGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        footerGradient.addColorStop(0.15, 'rgba(0, 0, 0, 0)');
        footerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
        // Если футер внизу - затемнение снизу
        footerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        footerGradient.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
        footerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    }
    ctx.fillStyle = footerGradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // Футер (рендерим первым, так как может быть вверху или внизу)
    ctx.fillStyle = settings.footerColor;
    ctx.font = `${settings.footerWeight} ${settings.footerSize}px ${settings.footerFont}`;
    
    // Username слева
    ctx.textAlign = 'left';
    ctx.fillText(settings.username, padding, footerY);
    
    // Номер справа
    ctx.textAlign = 'right';
    ctx.fillText(`${index + 1}/${slides.length}`, CANVAS_W - padding, footerY);
    
    // Заголовок (с типографом)
    ctx.fillStyle = settings.titleColor;
    ctx.font = `${settings.titleWeight} ${settings.titleSize}px ${settings.titleFont}`;
    ctx.textAlign = 'left';
    const titleLines = wrapText(ctx, typograph(slide.title), contentWidth);
    let y = titleY;
    
    titleLines.forEach(line => {
        ctx.fillText(line, padding, y);
        y += settings.titleSize * 1.2;
    });
    
    // Отступ между заголовком и текстом
    textY = y + settings.titleSize * 0.3;
    
    // Основной текст (с типографом)
    if (slide.text) {
        ctx.fillStyle = settings.textColor;
        ctx.font = `${settings.textWeight} ${settings.fontSize}px ${settings.textFont}`;
        const textLines = wrapText(ctx, typograph(slide.text), contentWidth);
        
        y = textY;
        textLines.forEach(line => {
            ctx.fillText(line, padding, y);
            y += settings.fontSize * 1.4;
        });
    }
    
    // Создаем превью
    const dataURL = canvas.toDataURL('image/png');
    
    // Сохраняем dataURL в слайде для скачивания
    slide.dataURL = dataURL;
    
    // Создаем или обновляем элемент в DOM
    let wrapper = slidesContainer.querySelector(`[data-slide="${index}"]`);
    
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        wrapper.dataset.slide = String(index);
        wrapper.draggable = true;
        
        const img = document.createElement('img');
        img.className = 'slide-preview';
        img.alt = `Слайд ${index + 1}`;
        
        // Клик для редактирования
        img.addEventListener('click', () => editSlide(index));
        
        // Drag and Drop
        wrapper.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', wrapper.innerHTML);
            wrapper.classList.add('dragging');
            e.dataTransfer.setData('slideIndex', index);
        });
        
        wrapper.addEventListener('dragend', (e) => {
            wrapper.classList.remove('dragging');
        });
        
        wrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            wrapper.classList.add('drag-over');
        });
        
        wrapper.addEventListener('dragleave', (e) => {
            wrapper.classList.remove('drag-over');
        });
        
        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            wrapper.classList.remove('drag-over');
            
            const fromIndex = parseInt(e.dataTransfer.getData('slideIndex'));
            const toIndex = parseInt(wrapper.dataset.slide);
            
            if (fromIndex !== toIndex) {
                // Перемещаем слайд в массиве
                const movedSlide = slides.splice(fromIndex, 1)[0];
                slides.splice(toIndex, 0, movedSlide);
                
                // Перерендериваем все слайды
                renderAllSlides();
            }
        });
        
        wrapper.appendChild(img);
        
        // Кнопки управления
        const controls = document.createElement('div');
        controls.className = 'slide-controls';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'slide-btn';
        downloadBtn.textContent = 'Скачать';
        downloadBtn.onclick = (e) => {
            e.stopPropagation();
            const link = document.createElement('a');
            link.href = slide.dataURL;
            link.download = `slide_${String(index + 1).padStart(2, '0')}.png`;
            link.click();
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'slide-btn slide-btn-secondary';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteSlide(index);
        };
        
        controls.appendChild(downloadBtn);
        controls.appendChild(deleteBtn);
        wrapper.appendChild(controls);
        
        slidesContainer.appendChild(wrapper);
    }
    
    // Обновляем визуальное состояние редактирования
    if (editingIndex === index) {
        wrapper.classList.add('editing');
    } else {
        wrapper.classList.remove('editing');
    }
    
    wrapper.querySelector('.slide-preview').src = dataURL;
}

function drawCover(ctx, img, w, h) {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
        // Изображение шире
        drawHeight = h;
        drawWidth = h * imgRatio;
        offsetX = (w - drawWidth) / 2;
        offsetY = 0;
    } else {
        // Изображение выше
        drawWidth = w;
        drawHeight = w / imgRatio;
        offsetX = 0;
        offsetY = (h - drawHeight) / 2;
    }
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    
    const lines = [];
    const paragraphs = text.split('\n');
    
    paragraphs.forEach(paragraph => {
        if (!paragraph.trim()) {
            lines.push('');
            return;
        }
        
        // Разделяем только по обычным пробелам, сохраняя неразрывные
        const words = paragraph.split(' ');
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
    });
    
    return lines;
}

function editSlide(index) {
    const slide = slides[index];
    
    // Заполняем форму данными слайда
    slideTitle.value = slide.title;
    slideText.value = slide.text;
    currentSlideImage = slide.image;
    
    if (slide.image) {
        imageFileName.textContent = 'Текущее изображение';
    } else {
        imageFileName.textContent = '';
    }
    
    // Загружаем прозрачность слайда в слайдер
    const slideOpacity = slide.opacity !== undefined ? slide.opacity : settings.opacity;
    opacitySlider.value = slideOpacity * 100;
    opacityValue.textContent = slideOpacity.toFixed(2);
    settings.opacity = slideOpacity;
    
    // Устанавливаем режим редактирования
    editingIndex = index;
    addSlideBtn.textContent = 'Сохранить изменения';
    
    // Обновляем визуальное выделение
    renderAllSlides();
    
    // Прокручиваем к форме
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteSlide(index) {
    if (confirm('Вы уверены, что хотите удалить этот слайд?')) {
        slides.splice(index, 1);
        
        // Если удаляем редактируемый слайд, сбрасываем форму
        if (editingIndex === index) {
            editingIndex = null;
            addSlideBtn.textContent = 'Добавить слайд';
            slideTitle.value = '';
            slideText.value = '';
            slideImage.value = '';
            imageFileName.textContent = '';
            currentSlideImage = null;
        } else if (editingIndex !== null && editingIndex > index) {
            // Корректируем индекс если удаляем слайд перед редактируемым
            editingIndex--;
        }
        
        renderAllSlides();
    }
}

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function urlToImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

// AI функции
async function generateSlidesWithAI(text, apiKey, provider) {
    const prompt = `Проанализируй следующий текст и разбей его на оптимальные слайды для Instagram карусели. 
Каждый слайд должен иметь короткий заголовок (до 50 символов) и текст (до 200 символов).
Создай 3-7 слайдов в зависимости от объема контента.

Верни результат строго в формате JSON массива:
[
  {"title": "Заголовок 1", "text": "Текст первого слайда"},
  {"title": "Заголовок 2", "text": "Текст второго слайда"}
]

Текст для разбиения:
${text}`;

    if (provider === 'free') {
        return await generateWithFree(prompt);
    } else if (provider === 'openai') {
        return await generateWithOpenAI(prompt, apiKey);
    } else if (provider === 'claude') {
        return await generateWithClaude(prompt, apiKey);
    } else {
        return await generateWithGroq(prompt, apiKey);
    }
}

async function generateWithOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Ты эксперт по созданию контента для Instagram. Отвечай только валидным JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Извлекаем JSON из ответа
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Не удалось извлечь JSON из ответа AI');
    }
    
    return JSON.parse(jsonMatch[0]);
}

async function generateWithClaude(prompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Извлекаем JSON из ответа
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Не удалось извлечь JSON из ответа AI');
    }
    
    return JSON.parse(jsonMatch[0]);
}

async function generateWithFree(prompt) {
    // Простое разбиение текста по параграфам (работает офлайн без API)
    const textMatch = prompt.match(/Текст для разбиения:\n(.+)/s);
    const text = textMatch ? textMatch[1].trim() : prompt;
    
    // Разбиваем по параграфам или по предложениям
    let paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    
    // Если параграфов мало, разбиваем по предложениям
    if (paragraphs.length < 3) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        paragraphs = [];
        for (let i = 0; i < sentences.length; i += 2) {
            paragraphs.push(sentences.slice(i, i + 2).join('. ') + '.');
        }
    }
    
    return paragraphs.slice(0, 7).map((para, i) => {
        const sentences = para.split(/[.!?]+/).filter(s => s.trim());
        let title = sentences[0]?.trim() || `Слайд ${i + 1}`;
        
        // Укорачиваем заголовок если нужно
        if (title.length > 50) {
            title = title.slice(0, 47) + '...';
        }
        
        // Ограничиваем текст
        let content = para.trim();
        if (content.length > 200) {
            content = content.slice(0, 197) + '...';
        }
        
        return {
            title: title,
            text: content
        };
    });
}

async function generateWithFree(prompt) {
    // Используем Hugging Face Inference API с бесплатной моделью
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 2000,
                temperature: 0.7,
                return_full_text: false
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ошибка бесплатной AI: ${error}`);
    }

    const data = await response.json();
    const content = data[0].generated_text;
    
    // Извлекаем JSON из ответа
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Не удалось извлечь JSON из ответа AI');
    }
    
    return JSON.parse(jsonMatch[0]);
}

async function generateWithGroq(prompt, apiKey) {
    if (!apiKey) {
        throw new Error('Для Groq нужен API ключ. Получите бесплатный ключ на https://console.groq.com/keys - регистрация занимает 1 минуту!');
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Ты эксперт по созданию контента для Instagram. Отвечай только валидным JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Извлекаем JSON из ответа
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Не удалось извлечь JSON из ответа AI');
    }
    
    return JSON.parse(jsonMatch[0]);
}
