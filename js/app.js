/**
 * RPG桌遊助手 - 主要應用邏輯
 */

// 全局遊戲狀態
const gameState = {
    player: {
        lifePoints: 1500,
        economyPoints: 1500
    },
    opponent: {
        lifePoints: 1500,
        economyPoints: 1500
    },
    currentRound: 1,
    eventHistory: [],
    activeEvent: null,
    shouldTriggerEvent: false, // 用於10回合提示QR掃描
    selectedCard: null, // 當前選中的卡牌
    activeEffects: [], // 當前有效的特殊效果
    gameEndCondition: {
        enabled: false,
        threshold: 500
    }
};

// DOM元素快取
const DOM = {
    // 自身計分面板
    playerLifePointsEl: document.getElementById('playerLifePoints'),
    playerEconomyPointsEl: document.getElementById('playerEconomyPoints'),

    // 對方計分面板
    opponentLifePointsEl: document.getElementById('opponentLifePoints'),
    opponentEconomyPointsEl: document.getElementById('opponentEconomyPoints'),

    // 卡牌選擇
    playerCardSelector: document.getElementById('playerCardSelector'),
    opponentCardSelector: document.getElementById('opponentCardSelector'),
    playerLifeAdjustmentEl: document.getElementById('playerLifeAdjustment'),
    playerEconomyAdjustmentEl: document.getElementById('playerEconomyAdjustment'),
    opponentLifeAdjustmentEl: document.getElementById('opponentLifeAdjustment'),
    opponentEconomyAdjustmentEl: document.getElementById('opponentEconomyAdjustment'),
    applyCardEffectBtn: document.getElementById('applyCardEffect'),

    // 事件區域
    generateEventBtn: document.getElementById('generateEvent'),
    eventContainer: document.getElementById('eventContainer'),
    noEventContainer: document.getElementById('noEventContainer'),
    eventTitle: document.getElementById('eventTitle'),
    eventDescription: document.getElementById('eventDescription'),
    questionContainer: document.getElementById('questionContainer'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    resultContainer: document.getElementById('resultContainer'),
    resultText: document.getElementById('resultText'),
    effectsContainer: document.getElementById('effectsContainer'),

    // 歷史記錄
    historyList: document.getElementById('historyList'),

    // 模態對話框
    tutorialModal: new bootstrap.Modal(document.getElementById('tutorialModal'))
};

// 添加變數用於追蹤目前選擇的卡牌來源
let activeCardSource = null; // 'player' 或 'opponent'

// 初始化應用
function initApp() {
    // 初始化卡牌選擇器
    initCardSelector();

    // 註冊事件監聽器
    registerEventListeners();

    // 初始化遊戲狀態
    updatePointsDisplay();

    // 創建回合計數器
    createRoundCounter();

    // 創建特效顯示區
    createActiveEffectsDisplay();

    // 顯示歡迎教學
    setTimeout(() => {
        DOM.tutorialModal.show();
    }, 1000);
}

// 初始化卡牌選擇器
function initCardSelector() {
    // 清空現有選項
    DOM.playerCardSelector.innerHTML = '<option value="">-- 選擇卡牌 --</option>';
    DOM.opponentCardSelector.innerHTML = '<option value="">-- 選擇卡牌 --</option>';

    // 獲取所有卡牌類別
    const categories = getCardCategories();

    // 初始化兩個選擇器
    initSingleCardSelector(DOM.playerCardSelector, categories);
    initSingleCardSelector(DOM.opponentCardSelector, categories);

    // 初始化卡牌提示工具
    initCardTooltips();
}

// 初始化單個卡牌選擇器
function initSingleCardSelector(selectorElement, categories) {
    // 為每個類別創建一個選項組
    categories.forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;

        // 獲取該類別下的所有卡牌
        const cards = getCardsByCategory(category);

        // 如果是攻擊或防禦類別，按等級排序
        if (category === '攻擊' || category === '防禦') {
            // 按等級分組
            const levels = ['初階', '中階', '高階'];

            levels.forEach(level => {
                const levelCards = cards.filter(card => card.level === level);
                if (levelCards.length > 0) {
                    const levelOptgroup = document.createElement('optgroup');
                    levelOptgroup.label = `${category} - ${level}`;

                    levelCards.forEach(card => {
                        const option = document.createElement('option');
                        option.value = card.id;
                        option.textContent = card.name;
                        option.dataset.tooltip = getCardTooltip(card);
                        levelOptgroup.appendChild(option);
                    });

                    selectorElement.appendChild(levelOptgroup);
                }
            });
        } else {
            // 為每張卡牌創建一個選項
            cards.forEach(card => {
                const option = document.createElement('option');
                option.value = card.id;
                option.textContent = card.name;
                option.dataset.tooltip = getCardTooltip(card);
                optgroup.appendChild(option);
            });

            selectorElement.appendChild(optgroup);
        }
    });
}

// 初始化卡牌提示工具
function initCardTooltips() {
    // 如果使用Bootstrap工具提示，則啟用它
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-tooltip]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl, {
                title: tooltipTriggerEl.dataset.tooltip,
                html: true,
                placement: 'right'
            });
        });
    }
}

// 創建特效顯示區
function createActiveEffectsDisplay() {
    const effectsBar = document.createElement('div');
    effectsBar.id = 'activeEffectsBar';
    effectsBar.className = 'active-effects-bar';
    document.body.appendChild(effectsBar);
    updateActiveEffectsDisplay();
}

// 更新特效顯示
function updateActiveEffectsDisplay() {
    const effectsBar = document.getElementById('activeEffectsBar');
    if (!effectsBar) return;

    if (gameState.activeEffects.length === 0) {
        effectsBar.style.display = 'none';
        return;
    }

    effectsBar.style.display = 'block';
    effectsBar.innerHTML = '';

    gameState.activeEffects.forEach(effect => {
        const effectBadge = document.createElement('div');
        effectBadge.className = 'effect-badge';

        let effectText = '';
        let badgeClass = '';

        switch (effect.type) {
            case 'attack_boost':
                effectText = `攻擊+30% (${effect.duration}回合)`;
                badgeClass = 'effect-badge-attack';
                break;
            case 'defense_boost':
                effectText = `防禦+30% (${effect.duration}回合)`;
                badgeClass = 'effect-badge-defense';
                break;
            case 'change_end_condition':
                effectText = `遊戲結束條件：生命值<500`;
                badgeClass = 'effect-badge-warning';
                break;
        }

        effectBadge.textContent = effectText;
        effectBadge.classList.add(badgeClass);
        effectsBar.appendChild(effectBadge);
    });
}

// 註冊事件監聽器
function registerEventListeners() {
    // 卡牌選擇
    DOM.playerCardSelector.addEventListener('change', handleCardSelection);
    DOM.opponentCardSelector.addEventListener('change', handleCardSelection);

    // 應用卡牌效果按鈕
    DOM.applyCardEffectBtn.addEventListener('click', applyCardEffect);

    // 生成事件按鈕
    DOM.generateEventBtn.addEventListener('click', generateRandomEvent);
}

// 處理卡牌選擇
function handleCardSelection(event) {
    // 判斷選擇的是自身出牌還是對方出牌
    const isPlayerCard = event.target.id === 'playerCardSelector';
    const isOpponentCard = event.target.id === 'opponentCardSelector';

    // 取得卡牌ID
    const cardId = event.target.value;

    // 清空另一個選擇器
    if (isPlayerCard && cardId) {
        DOM.opponentCardSelector.value = '';
        activeCardSource = 'player';
    } else if (isOpponentCard && cardId) {
        DOM.playerCardSelector.value = '';
        activeCardSource = 'opponent';
    }

    if (cardId) {
        // 獲取選中的卡牌
        const card = getCardById(cardId);
        gameState.selectedCard = card;

        // 使用處理過的卡牌效果
        const effects = card.processedEffects || card.effects;

        if (isPlayerCard) {
            // 自身出牌時的效果設定（自身通常消耗經濟值，對對方造成傷害）
            if (card.category === '攻擊') {
                // 攻擊卡：消耗自身經濟值，對對方造成生命值傷害
                DOM.playerLifeAdjustmentEl.textContent = 0;
                DOM.playerEconomyAdjustmentEl.textContent = effects.economy || 0;
                DOM.opponentLifeAdjustmentEl.textContent = effects.life || 0;
                DOM.opponentEconomyAdjustmentEl.textContent = 0;
            } else if (card.category === '防禦') {
                // 防禦卡：消耗自身經濟值，提升自身生命值
                DOM.playerLifeAdjustmentEl.textContent = effects.life || 0;
                DOM.playerEconomyAdjustmentEl.textContent = effects.economy || 0;
                DOM.opponentLifeAdjustmentEl.textContent = 0;
                DOM.opponentEconomyAdjustmentEl.textContent = 0;
            } else {
                // 道具卡：通常影響自身
                DOM.playerLifeAdjustmentEl.textContent = effects.life || 0;
                DOM.playerEconomyAdjustmentEl.textContent = effects.economy || 0;
                DOM.opponentLifeAdjustmentEl.textContent = 0;
                DOM.opponentEconomyAdjustmentEl.textContent = 0;
            }
        } else if (isOpponentCard) {
            // 對方出牌時的效果設定（反向處理）
            if (card.category === '攻擊') {
                // 如果對方使用攻擊卡，對方消耗經濟值，自身受到生命值傷害
                DOM.playerLifeAdjustmentEl.textContent = effects.life || 0;
                DOM.playerEconomyAdjustmentEl.textContent = 0;
                DOM.opponentLifeAdjustmentEl.textContent = 0;
                DOM.opponentEconomyAdjustmentEl.textContent = effects.economy || 0;
            } else if (card.category === '防禦') {
                // 如果對方使用防禦卡，對方消耗經濟值，提升對方生命值
                DOM.playerLifeAdjustmentEl.textContent = 0;
                DOM.playerEconomyAdjustmentEl.textContent = 0;
                DOM.opponentLifeAdjustmentEl.textContent = effects.life || 0;
                DOM.opponentEconomyAdjustmentEl.textContent = effects.economy || 0;
            } else {
                // 道具卡：對方使用道具卡，影響對方
                DOM.playerLifeAdjustmentEl.textContent = 0;
                DOM.playerEconomyAdjustmentEl.textContent = 0;
                DOM.opponentLifeAdjustmentEl.textContent = effects.life || 0;
                DOM.opponentEconomyAdjustmentEl.textContent = effects.economy || 0;
            }
        }

        // 高亮顯示卡牌效果數值
        highlightAdjustmentValues();

        // 顯示卡牌詳情
        showCardDetails(card);
    } else {
        // 未選中卡牌，重置數值
        gameState.selectedCard = null;
        activeCardSource = null;
        DOM.playerLifeAdjustmentEl.textContent = 0;
        DOM.playerEconomyAdjustmentEl.textContent = 0;
        DOM.opponentLifeAdjustmentEl.textContent = 0;
        DOM.opponentEconomyAdjustmentEl.textContent = 0;
        DOM.playerLifeAdjustmentEl.className = 'bg-secondary rounded p-2 text-center text-white';
        DOM.playerEconomyAdjustmentEl.className = 'bg-secondary rounded p-2 text-center text-white';
        DOM.opponentLifeAdjustmentEl.className = 'bg-secondary rounded p-2 text-center text-white';
        DOM.opponentEconomyAdjustmentEl.className = 'bg-secondary rounded p-2 text-center text-white';
        hideCardDetails();
    }
}

// 高亮顯示卡牌效果數值
function highlightAdjustmentValues() {
    // 玩家生命值調整
    const playerLifeValue = parseInt(DOM.playerLifeAdjustmentEl.textContent) || 0;
    if (playerLifeValue > 0) {
        DOM.playerLifeAdjustmentEl.classList.add('text-success');
        DOM.playerLifeAdjustmentEl.classList.remove('text-danger', 'text-white');
    } else if (playerLifeValue < 0) {
        DOM.playerLifeAdjustmentEl.classList.add('text-danger');
        DOM.playerLifeAdjustmentEl.classList.remove('text-success', 'text-white');
    } else {
        DOM.playerLifeAdjustmentEl.classList.add('text-white');
        DOM.playerLifeAdjustmentEl.classList.remove('text-success', 'text-danger');
    }

    // 玩家經濟值調整
    const playerEconomyValue = parseInt(DOM.playerEconomyAdjustmentEl.textContent) || 0;
    if (playerEconomyValue > 0) {
        DOM.playerEconomyAdjustmentEl.classList.add('text-success');
        DOM.playerEconomyAdjustmentEl.classList.remove('text-danger', 'text-white');
    } else if (playerEconomyValue < 0) {
        DOM.playerEconomyAdjustmentEl.classList.add('text-danger');
        DOM.playerEconomyAdjustmentEl.classList.remove('text-success', 'text-white');
    } else {
        DOM.playerEconomyAdjustmentEl.classList.add('text-white');
        DOM.playerEconomyAdjustmentEl.classList.remove('text-success', 'text-danger');
    }

    // 對手生命值調整
    const opponentLifeValue = parseInt(DOM.opponentLifeAdjustmentEl.textContent) || 0;
    if (opponentLifeValue > 0) {
        DOM.opponentLifeAdjustmentEl.classList.add('text-success');
        DOM.opponentLifeAdjustmentEl.classList.remove('text-danger', 'text-white');
    } else if (opponentLifeValue < 0) {
        DOM.opponentLifeAdjustmentEl.classList.add('text-danger');
        DOM.opponentLifeAdjustmentEl.classList.remove('text-success', 'text-white');
    } else {
        DOM.opponentLifeAdjustmentEl.classList.add('text-white');
        DOM.opponentLifeAdjustmentEl.classList.remove('text-success', 'text-danger');
    }

    // 對手經濟值調整
    const opponentEconomyValue = parseInt(DOM.opponentEconomyAdjustmentEl.textContent) || 0;
    if (opponentEconomyValue > 0) {
        DOM.opponentEconomyAdjustmentEl.classList.add('text-success');
        DOM.opponentEconomyAdjustmentEl.classList.remove('text-danger', 'text-white');
    } else if (opponentEconomyValue < 0) {
        DOM.opponentEconomyAdjustmentEl.classList.add('text-danger');
        DOM.opponentEconomyAdjustmentEl.classList.remove('text-success', 'text-white');
    } else {
        DOM.opponentEconomyAdjustmentEl.classList.add('text-white');
        DOM.opponentEconomyAdjustmentEl.classList.remove('text-success', 'text-danger');
    }
}

// 顯示卡牌詳情
function showCardDetails(card) {
    // 如果已有詳情面板，則移除
    hideCardDetails();

    // 創建卡牌詳情面板
    const detailsPanel = document.createElement('div');
    detailsPanel.id = 'cardDetailsPanel';
    detailsPanel.className = 'card mt-3 bg-dark';

    let cardContent = `
        <div class="card-body">
            <h5 class="card-title">${card.name}</h5>
    `;

    if (card.level) {
        cardContent += `<h6 class="card-subtitle mb-2 text-muted">${card.level}</h6>`;
    }

    cardContent += `<p class="card-text">${card.description}</p>`;

    if (card.condition) {
        cardContent += `<p class="card-text text-warning"><small>使用條件: ${card.condition}</small></p>`;
    }

    if (card.principle) {
        cardContent += `<p class="card-text text-info"><small>原理: ${card.principle}</small></p>`;
    }

    detailsPanel.innerHTML = cardContent;

    // 插入到卡牌調整面板之前
    const adjustmentPanel = document.getElementById('adjustmentPanel');
    adjustmentPanel.parentNode.insertBefore(detailsPanel, adjustmentPanel);
}

// 隱藏卡牌詳情
function hideCardDetails() {
    const detailsPanel = document.getElementById('cardDetailsPanel');
    if (detailsPanel) {
        detailsPanel.parentNode.removeChild(detailsPanel);
    }
}

// 應用卡牌效果
function applyCardEffect() {
    if (!gameState.selectedCard) {
        alert('請先選擇一張卡牌');
        return;
    }

    const card = gameState.selectedCard;
    let playerLifeEffect = parseInt(DOM.playerLifeAdjustmentEl.textContent) || 0;
    let playerEconomyEffect = parseInt(DOM.playerEconomyAdjustmentEl.textContent) || 0;
    let opponentLifeEffect = parseInt(DOM.opponentLifeAdjustmentEl.textContent) || 0;
    let opponentEconomyEffect = parseInt(DOM.opponentEconomyAdjustmentEl.textContent) || 0;

    // 檢查經濟值是否足夠支付卡牌成本
    if (activeCardSource === 'player' && (card.category === '攻擊' || card.category === '防禦')) {
        // 自身出牌，檢查自身經濟值
        const economyCost = Math.abs(playerEconomyEffect);
        if (gameState.player.economyPoints < economyCost) {
            alert(`自身經濟值不足以使用此卡牌！需要 ${economyCost} 經濟值。`);
            return;
        }
    } else if (activeCardSource === 'opponent' && (card.category === '攻擊' || card.category === '防禦')) {
        // 對方出牌，檢查對方經濟值
        const economyCost = Math.abs(opponentEconomyEffect);
        if (gameState.opponent.economyPoints < economyCost) {
            alert(`對方經濟值不足以使用此卡牌！需要 ${economyCost} 經濟值。`);
            return;
        }
    }

    // 處理特殊效果卡牌
    if (card.effects.specialEffect) {
        handleSpecialEffect(card);
    } else {
        // 處理基本效果
        // 應用效果到遊戲狀態

        // 自身狀態變更
        gameState.player.lifePoints += playerLifeEffect;
        if (gameState.player.lifePoints < 0) gameState.player.lifePoints = 0;

        gameState.player.economyPoints += playerEconomyEffect;
        if (gameState.player.economyPoints < 0) gameState.player.economyPoints = 0;

        // 對方狀態變更
        gameState.opponent.lifePoints += opponentLifeEffect;
        if (gameState.opponent.lifePoints < 0) gameState.opponent.lifePoints = 0;

        gameState.opponent.economyPoints += opponentEconomyEffect;
        if (gameState.opponent.economyPoints < 0) gameState.opponent.economyPoints = 0;
    }

    // 更新顯示
    updatePointsDisplay();

    // 添加到歷史記錄
    let title = '';
    if (activeCardSource === 'player') {
        title = `自身使用卡牌：${gameState.selectedCard.name}`;
    } else if (activeCardSource === 'opponent') {
        title = `對方使用卡牌：${gameState.selectedCard.name}`;
    } else {
        title = `使用卡牌：${gameState.selectedCard.name}`;
    }

    addToHistory(
        title,
        `${gameState.selectedCard.description}`,
        playerLifeEffect,
        playerEconomyEffect,
        opponentLifeEffect,
        opponentEconomyEffect
    );

    // 重置選擇
    DOM.playerCardSelector.value = '';
    DOM.opponentCardSelector.value = '';
    gameState.selectedCard = null;
    activeCardSource = null;
    DOM.playerLifeAdjustmentEl.textContent = 0;
    DOM.playerEconomyAdjustmentEl.textContent = 0;
    DOM.opponentLifeAdjustmentEl.textContent = 0;
    DOM.opponentEconomyAdjustmentEl.textContent = 0;
    DOM.playerLifeAdjustmentEl.className = 'bg-secondary rounded p-2 text-center text-white';
    DOM.playerEconomyAdjustmentEl.className = 'bg-secondary rounded p-2 text-center text-white';
    DOM.opponentLifeAdjustmentEl.className = 'bg-secondary rounded p-2 text-center text-white';
    DOM.opponentEconomyAdjustmentEl.className = 'bg-secondary rounded p-2 text-center text-white';
    hideCardDetails();

    // 增加回合數
    gameState.currentRound++;
    updateRoundDisplay();
    updateActiveEffects();
    checkRoundForEvent();
    checkGameEndCondition();
}

// 處理特殊效果
function handleSpecialEffect(card) {
    const effect = card.effects.specialEffect;

    switch (effect) {
        case 'reset':
            // 重置遊戲狀態
            gameState.player.lifePoints = 1500;
            gameState.player.economyPoints = 1500;
            gameState.opponent.lifePoints = 1500;
            gameState.opponent.economyPoints = 1500;

            // 格式化標題
            let title = '';
            if (activeCardSource === 'player') {
                title = `自身使用卡牌：${card.name}`;
            } else if (activeCardSource === 'opponent') {
                title = `對方使用卡牌：${card.name}`;
            } else {
                title = `使用卡牌：${card.name}`;
            }

            // 第5個和第6個參數是對方的效果
            addToHistory(
                title,
                '重置雙方生命值和經濟值至初始狀態',
                1500 - gameState.player.lifePoints,
                1500 - gameState.player.economyPoints,
                1500 - gameState.opponent.lifePoints,
                1500 - gameState.opponent.economyPoints
            );
            break;

        case 'change_end_condition':
            // 修改遊戲結束條件
            gameState.gameEndCondition.enabled = true;
            gameState.gameEndCondition.threshold = 500;

            // 添加到活動效果
            gameState.activeEffects.push({
                type: 'change_end_condition',
                duration: -1, // 永久效果
                source: card.id
            });

            let endTitle = '';
            if (activeCardSource === 'player') {
                endTitle = `自身使用卡牌：${card.name}`;
            } else if (activeCardSource === 'opponent') {
                endTitle = `對方使用卡牌：${card.name}`;
            } else {
                endTitle = `使用卡牌：${card.name}`;
            }

            addToHistory(endTitle, '遊戲結束條件：生命值低於500時結束', 0, 0, 0, 0);
            break;

        case 'attack_boost':
            // 添加攻擊效果加成
            gameState.activeEffects.push({
                type: 'attack_boost',
                duration: card.effects.duration,
                source: card.id,
                appliedBy: activeCardSource // 記錄誰應用的效果
            });

            let attackTitle = '';
            if (activeCardSource === 'player') {
                attackTitle = `自身使用卡牌：${card.name}`;
            } else if (activeCardSource === 'opponent') {
                attackTitle = `對方使用卡牌：${card.name}`;
            } else {
                attackTitle = `使用卡牌：${card.name}`;
            }

            addToHistory(attackTitle, `攻擊效果+30%（持續${card.effects.duration}回合）`, 0, 0, 0, 0);
            break;

        case 'defense_boost':
            // 添加防禦效果加成
            gameState.activeEffects.push({
                type: 'defense_boost',
                duration: card.effects.duration,
                source: card.id,
                appliedBy: activeCardSource // 記錄誰應用的效果
            });

            let defenseTitle = '';
            if (activeCardSource === 'player') {
                defenseTitle = `自身使用卡牌：${card.name}`;
            } else if (activeCardSource === 'opponent') {
                defenseTitle = `對方使用卡牌：${card.name}`;
            } else {
                defenseTitle = `使用卡牌：${card.name}`;
            }

            addToHistory(defenseTitle, `被攻擊效果-30%（持續${card.effects.duration}回合）`, 0, 0, 0, 0);
            break;
    }

    updateActiveEffectsDisplay();
}

// 更新活動特效
function updateActiveEffects() {
    // 減少持續時間
    gameState.activeEffects = gameState.activeEffects.filter(effect => {
        if (effect.duration > 0) {
            effect.duration -= 1;
            return effect.duration > 0;
        }

        // 持續時間為-1表示永久效果
        return effect.duration === -1;
    });

    updateActiveEffectsDisplay();
}

// 檢查遊戲結束條件
function checkGameEndCondition() {
    if (gameState.gameEndCondition.enabled && gameState.player.lifePoints < gameState.gameEndCondition.threshold) {
        // 顯示遊戲結束提示
        alert(`遊戲結束！生命值已低於${gameState.gameEndCondition.threshold}點。`);
    }
}

// 更新顯示
function updatePointsDisplay() {
    // 顯示自身狀態
    DOM.playerLifePointsEl.textContent = gameState.player.lifePoints;
    DOM.playerEconomyPointsEl.textContent = gameState.player.economyPoints;

    // 顯示對方狀態
    DOM.opponentLifePointsEl.textContent = gameState.opponent.lifePoints;
    DOM.opponentEconomyPointsEl.textContent = gameState.opponent.economyPoints;
}

// 創建回合計數器
function createRoundCounter() {
    const counter = document.createElement('div');
    counter.className = 'round-counter';
    counter.id = 'roundCounter';
    counter.innerHTML = `回合: ${gameState.currentRound}`;
    document.body.appendChild(counter);
}

// 更新回合顯示
function updateRoundDisplay() {
    const counter = document.getElementById('roundCounter');
    if (counter) {
        counter.innerHTML = `回合: ${gameState.currentRound}`;
    }
}

// 檢查回合數，決定是否顯示掃描QR碼提示
function checkRoundForEvent() {
    if (gameState.currentRound % 10 === 0 && !gameState.shouldTriggerEvent) {
        gameState.shouldTriggerEvent = true;
        showQRScanPrompt();
    } else if (gameState.currentRound % 10 !== 0) {
        gameState.shouldTriggerEvent = false;
    }
}

// 顯示QR掃描提示
function showQRScanPrompt() {
    // 隱藏現有事件內容
    DOM.eventContainer.classList.add('d-none');
    DOM.noEventContainer.classList.remove('d-none');

    // 創建QR掃描提示
    const qrPrompt = document.createElement('div');
    qrPrompt.className = 'text-center mt-3';
    qrPrompt.innerHTML = `
        <p class="alert alert-warning">你已經達到10回合，該進行隨機事件了！</p>
        <div class="qr-scan-btn" id="qrScanBtn">
            <i class="fas fa-qrcode me-2"></i>
            <span>模擬掃描QR碼</span>
        </div>
    `;

    DOM.noEventContainer.innerHTML = '';
    DOM.noEventContainer.appendChild(qrPrompt);

    // 添加QR掃描按鈕事件
    document.getElementById('qrScanBtn').addEventListener('click', () => {
        generateRandomEvent();
    });
}

// 生成隨機事件
function generateRandomEvent() {
    // 隨機選擇一個事件
    const randomIndex = Math.floor(Math.random() * gameEvents.length);
    const event = gameEvents[randomIndex];

    gameState.activeEvent = event;

    // 顯示事件
    DOM.eventTitle.textContent = event.title;
    DOM.eventDescription.textContent = event.description;
    DOM.questionText.textContent = event.question;

    // 清空選項容器
    DOM.optionsContainer.innerHTML = '';

    // 根據事件類型處理
    if (event.type === 'password') {
        handlePasswordEvent(event);
    } else if (event.type === 'choice') {
        handleChoiceEvent(event);
    }

    // 顯示事件容器，隱藏空事件提示
    DOM.eventContainer.classList.remove('d-none');
    DOM.noEventContainer.classList.add('d-none');

    // 隱藏結果容器
    DOM.resultContainer.classList.add('d-none');
}

// 處理密碼設定事件
function handlePasswordEvent(event) {
    // 創建密碼輸入
    const passwordDiv = document.createElement('div');
    passwordDiv.className = 'mb-3';
    passwordDiv.innerHTML = `
        <input type="password" class="form-control" id="passwordInput" placeholder="輸入一個安全的密碼">
        <div class="password-strength-meter mt-2">
            <div class="password-strength-meter-fill" id="passwordStrengthFill"></div>
        </div>
        <small id="passwordStrengthText" class="form-text text-light">密碼強度: 尚未輸入</small>
        <div class="mt-3">
            <button class="btn btn-primary w-100" id="submitPassword">確認密碼</button>
        </div>
    `;

    DOM.optionsContainer.appendChild(passwordDiv);

    // 添加密碼強度監聽
    const passwordInput = document.getElementById('passwordInput');
    const strengthFill = document.getElementById('passwordStrengthFill');
    const strengthText = document.getElementById('passwordStrengthText');

    passwordInput.addEventListener('input', () => {
        const strength = checkPasswordStrength(passwordInput.value, event.passwordCriteria);
        updatePasswordStrengthUI(strength, strengthFill, strengthText);
    });

    // 添加提交按鈕監聽
    document.getElementById('submitPassword').addEventListener('click', () => {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password, event.passwordCriteria);

        let result;
        let effects;

        if (strength >= 80) {
            result = event.effects.strong;
        } else if (strength >= 40) {
            result = event.effects.medium;
        } else {
            result = event.effects.weak;
        }

        // 顯示結果
        showEventResult(result.description, result.life, result.economy);

        // 添加到歷史記錄
        addToHistory(event.title, result.description, result.life, result.economy);

        // 檢查遊戲結束條件
        checkGameEndCondition();
    });
}

// 檢查密碼強度
function checkPasswordStrength(password, criteria) {
    if (!password) return 0;

    let score = 0;

    // 長度檢查
    if (password.length >= criteria.minLength) {
        score += 20;
    } else {
        score += (password.length / criteria.minLength * 10);
    }

    // 大寫字母
    if (criteria.requiresUppercase && /[A-Z]/.test(password)) {
        score += 20;
    }

    // 小寫字母
    if (criteria.requiresLowercase && /[a-z]/.test(password)) {
        score += 20;
    }

    // 數字
    if (criteria.requiresNumber && /[0-9]/.test(password)) {
        score += 20;
    }

    // 特殊字符
    if (criteria.requiresSpecial && /[^A-Za-z0-9]/.test(password)) {
        score += 20;
    }

    return score;
}

// 更新密碼強度UI
function updatePasswordStrengthUI(strength, fillElement, textElement) {
    fillElement.style.width = `${strength}%`;

    if (strength < 40) {
        fillElement.className = 'password-strength-meter-fill password-strength-weak';
        textElement.textContent = '密碼強度: 弱';
    } else if (strength < 80) {
        fillElement.className = 'password-strength-meter-fill password-strength-medium';
        textElement.textContent = '密碼強度: 中';
    } else {
        fillElement.className = 'password-strength-meter-fill password-strength-strong';
        textElement.textContent = '密碼強度: 強';
    }
}

// 處理選擇型事件
function handleChoiceEvent(event) {
    event.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.className = 'list-group-item list-group-item-action';
        optionButton.textContent = option.text;

        optionButton.addEventListener('click', () => {
            // 顯示結果
            showEventResult(option.result, option.effects.life, option.effects.economy);

            // 添加到歷史記錄
            addToHistory(event.title, option.result, option.effects.life, option.effects.economy);

            // 高亮顯示選中項
            document.querySelectorAll('#optionsContainer .list-group-item').forEach(item => {
                item.classList.remove('selected');
            });
            optionButton.classList.add('selected');

            // 檢查遊戲結束條件
            checkGameEndCondition();
        });

        DOM.optionsContainer.appendChild(optionButton);
    });
}

// 顯示事件結果
function showEventResult(resultText, lifeEffect, economyEffect) {
    DOM.resultText.textContent = resultText;

    // 創建效果顯示
    let effectsHTML = '<div class="mt-3">';

    if (lifeEffect !== 0) {
        const effectClass = lifeEffect > 0 ? 'text-success' : 'text-danger';
        const effectSymbol = lifeEffect > 0 ? '+' : '';
        effectsHTML += `<p class="${effectClass}">生命值: ${effectSymbol}${lifeEffect}</p>`;
    }

    if (economyEffect !== 0) {
        const effectClass = economyEffect > 0 ? 'text-success' : 'text-danger';
        const effectSymbol = economyEffect > 0 ? '+' : '';
        effectsHTML += `<p class="${effectClass}">經濟值: ${effectSymbol}${economyEffect}</p>`;
    }

    effectsHTML += '</div>';

    DOM.effectsContainer.innerHTML = effectsHTML;

    // 顯示結果容器
    DOM.resultContainer.classList.remove('d-none');

    // 應用效果
    gameState.player.lifePoints += lifeEffect;
    if (gameState.player.lifePoints < 0) gameState.player.lifePoints = 0;

    gameState.player.economyPoints += economyEffect;
    if (gameState.player.economyPoints < 0) gameState.player.economyPoints = 0;

    updatePointsDisplay();
}

// 添加到歷史記錄
function addToHistory(title, result, lifeEffect, economyEffect) {
    // 清除"無歷史記錄"的佔位符
    if (DOM.historyList.querySelector('li').textContent === '尚無歷史記錄') {
        DOM.historyList.innerHTML = '';
    }

    const historyItem = document.createElement('li');
    historyItem.className = 'list-group-item bg-transparent text-light border-bottom border-secondary';

    let effectText = '';
    if (lifeEffect !== 0) {
        const symbol = lifeEffect > 0 ? '+' : '';
        effectText += `生命值: ${symbol}${lifeEffect} `;
    }

    if (economyEffect !== 0) {
        const symbol = economyEffect > 0 ? '+' : '';
        effectText += `經濟值: ${symbol}${economyEffect}`;
    }

    // 如果沒有數值效果，檢查是否有特殊效果
    if (effectText === '' && gameState.selectedCard && gameState.selectedCard.effects.specialEffect) {
        let specialEffectText = '';
        switch (gameState.selectedCard.effects.specialEffect) {
            case 'reset':
                specialEffectText = '重置遊戲';
                break;
            case 'change_end_condition':
                specialEffectText = '修改結束條件';
                break;
            case 'attack_boost':
                specialEffectText = '攻擊加成';
                break;
            case 'defense_boost':
                specialEffectText = '防禦加成';
                break;
        }
        effectText = specialEffectText;
    }

    historyItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6>${title}</h6>
                <small>${result}</small>
            </div>
            <span class="badge ${lifeEffect >= 0 ? 'bg-success' : 'bg-danger'}">${effectText}</span>
        </div>
    `;

    DOM.historyList.prepend(historyItem);

    // 保存到遊戲狀態
    gameState.eventHistory.push({
        title,
        result,
        lifeEffect,
        economyEffect,
        round: gameState.currentRound
    });
}

// 在頁面加載完成後初始化應用
document.addEventListener('DOMContentLoaded', initApp); 