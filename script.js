// 號碼池：儲存尚未被抽過的號碼
let numberPool = [];
let drawnNumbers = [];

// DOM 元素
const minNumberInput = document.getElementById('min-number');
const maxNumberInput = document.getElementById('max-number');
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
const currentNumberDisplay = document.getElementById('current-number');
const drawnListContainer = document.getElementById('drawn-list');
const emptyMessage = document.getElementById('empty-message');
const currentNumberSection = document.querySelector('.current-number-section');
const drawingHint = document.getElementById('drawing-hint');
const fireworksOverlay = document.getElementById('fireworks-overlay');
const confettiLayer = document.getElementById('confetti-layer');

// 初始化號碼池
function initializePool() {
    const min = parseInt(minNumberInput.value);
    const max = parseInt(maxNumberInput.value);
    
    // 驗證輸入
    if (isNaN(min) || isNaN(max)) {
        return false;
    }
    
    if (min >= max) {
        return false;
    }
    
    if (min < 1 || max < 1) {
        return false;
    }
    
    // 建立號碼池
    numberPool = [];
    for (let i = min; i <= max; i++) {
        numberPool.push(i);
    }
    
    return true;
}

// 抽獎動畫是否進行中
let isDrawing = false;

// 抽獎功能（含滾動動畫）
function drawNumber() {
    if (isDrawing) return;
    // 如果號碼池為空，先嘗試初始化
    if (numberPool.length === 0) {
        if (!initializePool()) {
            showError('請輸入有效的數字範圍（最小號碼 < 最大號碼）');
            return;
        }
    }

    isDrawing = true;
    drawBtn.disabled = true;
    currentNumberDisplay.classList.add('rolling');
    if (drawingHint) drawingHint.classList.remove('hidden');

    // 先決定最終號碼
    const randomIndex = Math.floor(Math.random() * numberPool.length);
    const drawnNumber = numberPool.splice(randomIndex, 1)[0];
    drawnNumbers.push(drawnNumber);

    const min = parseInt(minNumberInput.value);
    const max = parseInt(maxNumberInput.value);
    const total = max - min + 1;

    // 滾動動畫：由快到慢，最後揭曉
    const totalDuration = 2200;
    const minInterval = 50;
    const maxInterval = 200;
    const startTime = performance.now();

    function tick() {
        const elapsed = performance.now() - startTime;

        if (elapsed >= totalDuration) {
            if (drawingHint) drawingHint.classList.add('hidden');
            currentNumberDisplay.textContent = drawnNumber;
            currentNumberDisplay.classList.remove('rolling');
            currentNumberDisplay.classList.add('draw-animation');
            triggerFireworks();
            triggerConfetti();
            setTimeout(() => {
                currentNumberDisplay.classList.remove('draw-animation');
                updateDrawnList();
                updateButtonState();
                isDrawing = false;
                hideError();
            }, 600);
            return;
        }

        const progress = elapsed / totalDuration;
        const easeOut = 1 - Math.pow(1 - progress, 2);
        const interval = Math.round(minInterval + (maxInterval - minInterval) * easeOut);
        const showRandom = total > 0 ? min + Math.floor(Math.random() * total) : min;
        currentNumberDisplay.textContent = showRandom;
        setTimeout(tick, interval);
    }

    setTimeout(tick, minInterval);
}

// 揭曉時觸發煙火特效
function triggerFireworks() {
    if (!fireworksOverlay) return;
    fireworksOverlay.classList.remove('active');
    fireworksOverlay.offsetHeight;
    fireworksOverlay.classList.add('active');
    setTimeout(() => {
        fireworksOverlay.classList.remove('active');
    }, 1200);
}

function triggerConfetti() {
    if (!confettiLayer) return;
    const colors = ['#FFD166', '#EF476F', '#06D6A0', '#118AB2', '#9B5DE5', '#F15BB5', '#FFFFFF'];
    const pieceCount = 42;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // 清空上一輪殘留（保險）
    confettiLayer.innerHTML = '';

    for (let i = 0; i < pieceCount; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';

        const w = 7 + Math.random() * 10;
        const h = 10 + Math.random() * 16;
        const c = colors[Math.floor(Math.random() * colors.length)];

        // 往外爆開 + 下落
        const angle = Math.random() * Math.PI * 2;
        const radius = 120 + Math.random() * 170;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.55 - (90 + Math.random() * 70);
        const y2 = y + (240 + Math.random() * 220);

        const r0 = (Math.random() * 360) + 'deg';
        const r1 = (720 + Math.random() * 720) + 'deg';
        const r2 = (1080 + Math.random() * 900) + 'deg';

        const t = (900 + Math.random() * 450) + 'ms';
        const delay = (Math.random() * 90) + 'ms';

        el.style.setProperty('--w', `${w.toFixed(1)}px`);
        el.style.setProperty('--h', `${h.toFixed(1)}px`);
        el.style.setProperty('--c', c);
        el.style.setProperty('--x', `${x.toFixed(1)}px`);
        el.style.setProperty('--y', `${y.toFixed(1)}px`);
        el.style.setProperty('--y2', `${y2.toFixed(1)}px`);
        el.style.setProperty('--r0', r0);
        el.style.setProperty('--r1', r1);
        el.style.setProperty('--r2', r2);
        el.style.setProperty('--t', t);
        el.style.animationDelay = delay;

        confettiLayer.appendChild(el);
    }

    // 動畫結束後回收 DOM
    setTimeout(() => {
        if (confettiLayer) confettiLayer.innerHTML = '';
    }, 1600);
}

// 更新當前號碼顯示（僅用於重置等非動畫情境）
function updateCurrentNumber(number) {
    currentNumberDisplay.textContent = number;
    currentNumberDisplay.classList.add('draw-animation');
    setTimeout(() => currentNumberDisplay.classList.remove('draw-animation'), 600);
}

// 更新已抽號碼列表
function updateDrawnList() {
    // 清空容器
    drawnListContainer.innerHTML = '';
    
    // 更新已抽數量顯示
    const drawnCountSpan = document.querySelector('#drawn-count span');
    if (drawnCountSpan) {
        drawnCountSpan.textContent = drawnNumbers.length;
    }
    
    // 如果有已抽號碼，隱藏空訊息
    if (drawnNumbers.length > 0) {
        emptyMessage.classList.add('hidden');
        
        // 依序顯示已抽號碼
        drawnNumbers.forEach((number, index) => {
            const numberElement = document.createElement('div');
            numberElement.className = 'drawn-number';
            numberElement.textContent = number;
            drawnListContainer.appendChild(numberElement);
        });
    } else {
        emptyMessage.classList.remove('hidden');
        if (drawnCountSpan) {
            drawnCountSpan.textContent = '0';
        }
    }
}

// 更新按鈕狀態
function updateButtonState() {
    const btnText = drawBtn.querySelector('.btn-text');
    if (numberPool.length === 0) {
        drawBtn.disabled = true;
        if (btnText) btnText.textContent = '已全部抽完';
    } else {
        drawBtn.disabled = false;
        if (btnText) btnText.textContent = `抽獎 (剩餘 ${numberPool.length} 個)`;
    }
}

// 重置功能
function reset() {
    // 清空已抽列表
    drawnNumbers = [];
    
    // 重新初始化號碼池
    if (!initializePool()) {
        showError('請輸入有效的數字範圍（最小號碼 < 最大號碼）');
        numberPool = [];
    }
    
    // 更新顯示
    currentNumberDisplay.textContent = '—';
    updateDrawnList();
    updateButtonState();
    
    // 清除錯誤訊息
    hideError();
}

// 顯示錯誤訊息
function showError(message) {
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.range-section').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// 隱藏錯誤訊息
function hideError() {
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
}

// 驗證範圍輸入
function validateRange() {
    const min = parseInt(minNumberInput.value);
    const max = parseInt(maxNumberInput.value);
    
    if (isNaN(min) || isNaN(max)) {
        return false;
    }
    
    if (min >= max) {
        return false;
    }
    
    if (min < 1 || max < 1) {
        return false;
    }
    
    return true;
}

// 更新號碼池資訊顯示
function updatePoolInfo() {
    const min = parseInt(minNumberInput.value);
    const max = parseInt(maxNumberInput.value);
    const totalCountElement = document.getElementById('total-count');
    
    if (!isNaN(min) && !isNaN(max) && min < max && min >= 1) {
        const total = max - min + 1;
        if (totalCountElement) {
            totalCountElement.textContent = total;
        }
    }
}

// 當範圍改變時，如果正在進行抽獎，提示需要重置
function onRangeChange() {
    updatePoolInfo();
    
    if (drawnNumbers.length > 0) {
        // 如果已經有抽過的號碼，提示使用者需要重置
        showError('範圍已變更，請點擊「重置」按鈕以套用新範圍');
    } else {
        // 如果沒有抽過的號碼，直接重新初始化
        if (validateRange()) {
            initializePool();
            updateButtonState();
            hideError();
        } else {
            showError('請輸入有效的數字範圍（最小號碼 < 最大號碼）');
        }
    }
}

// 事件監聽器
drawBtn.addEventListener('click', drawNumber);
resetBtn.addEventListener('click', reset);

minNumberInput.addEventListener('change', onRangeChange);
maxNumberInput.addEventListener('change', onRangeChange);

// 初始化
if (initializePool()) {
    updateButtonState();
    updateDrawnList();
    updatePoolInfo();
} else {
    showError('請輸入有效的數字範圍（最小號碼 < 最大號碼）');
    drawBtn.disabled = true;
}
