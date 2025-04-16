/**
 * RPG桌遊助手 - 卡牌數據
 * 從 cards.json 檔案讀取卡牌數據
 */

// 存儲所有卡牌的數組
let gameCards = [];

// 初始化卡牌數據
async function initCards() {
    try {
        const response = await fetch('cards.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 轉換 JSON 數據為卡牌數組格式
        gameCards = processCardsData(data);

        // 觸發一個事件通知卡牌數據已加載完成
        const event = new CustomEvent('cardsLoaded');
        document.dispatchEvent(event);

        return gameCards;
    } catch (error) {
        console.error('無法加載卡牌數據:', error);
        return [];
    }
}

// 處理 JSON 數據，轉換為卡牌數組
function processCardsData(data) {
    const cards = [];

    // 處理攻擊卡牌
    if (data.AttackCards) {
        data.AttackCards.forEach((card, index) => {
            // 從條件和效果文本中提取數值
            const economyValue = extractEconomyValue(card.condition);
            const lifeValue = extractLifeValue(card.effect);

            cards.push({
                id: `attack_${index}`,
                name: card.name,
                level: card.level,
                description: card.description,
                category: "攻擊",
                condition: card.condition,
                principle: card.principle,
                effects: {
                    life: lifeValue,
                    economy: economyValue,
                    isAttack: true,
                    targetSelf: false
                }
            });
        });
    }

    // 處理防禦卡牌
    if (data.DefenseCards) {
        data.DefenseCards.forEach((card, index) => {
            // 從條件中提取經濟值
            const economyValue = extractEconomyValue(card.condition);

            // 根據等級計算生命值增加量
            let lifeValue = 0;
            if (card.level === "初階") {
                lifeValue = 100; // 50% of 200
            } else if (card.level === "中階") {
                lifeValue = 375; // 75% of 500
            } else if (card.level === "高階") {
                lifeValue = 1000; // 100% of 1000
            }

            cards.push({
                id: `defense_${index}`,
                name: card.name,
                level: card.level,
                description: card.description,
                category: "防禦",
                condition: card.condition,
                principle: card.principle,
                effects: {
                    life: lifeValue,
                    economy: economyValue,
                    isDefense: true,
                    counters: [`attack_${index}`]
                }
            });
        });
    }

    // 處理道具卡牌
    if (data.ItemCards) {
        data.ItemCards.forEach((card, index) => {
            const cardObj = {
                id: `item_${index}`,
                name: card.name,
                description: card.description,
                category: "道具",
                effects: {}
            };

            // 處理不同類型的道具卡效果
            if (card.effect.includes("隨機事件")) {
                cardObj.effects = {
                    life: 0,
                    economy: 0,
                    specialEffect: "random_event"
                };
            } else if (card.effect.includes("增加自身生命值")) {
                const lifeValue = extractLifeValue(card.effect);
                cardObj.effects = {
                    life: lifeValue,
                    economy: 0
                };
            } else if (card.effect.includes("增加自身經濟")) {
                const economyValue = extractEconomyValue(card.effect);
                cardObj.effects = {
                    life: 0,
                    economy: economyValue
                };
            } else if (card.effect.includes("重置")) {
                cardObj.effects = {
                    life: 0,
                    economy: 0,
                    specialEffect: "reset"
                };
            } else if (card.effect.includes("遊戲結束條件")) {
                cardObj.effects = {
                    life: 0,
                    economy: 0,
                    specialEffect: "change_end_condition"
                };
            } else if (card.effect.includes("攻擊效果加成")) {
                cardObj.effects = {
                    life: 0,
                    economy: 0,
                    specialEffect: "attack_boost",
                    duration: 2
                };
            } else if (card.effect.includes("被攻擊效果減少")) {
                cardObj.effects = {
                    life: 0,
                    economy: 0,
                    specialEffect: "defense_boost",
                    duration: 2
                };
            }

            cards.push(cardObj);
        });
    }

    return cards;
}

// 從文本中提取經濟值
function extractEconomyValue(text) {
    if (!text) return 0;

    const match = text.match(/經濟(\d+)/);
    if (match) {
        return text.includes("扣") ? -parseInt(match[1]) : parseInt(match[1]);
    }
    return 0;
}

// 從文本中提取生命值
function extractLifeValue(text) {
    if (!text) return 0;

    const match = text.match(/生命值(\d+)/);
    if (match) {
        return text.includes("扣") ? -parseInt(match[1]) : parseInt(match[1]);
    }
    return 0;
}

// 獲取卡牌類別列表（用於分組）
function getCardCategories() {
    const categories = new Set();
    gameCards.forEach(card => {
        categories.add(card.category);
    });
    return Array.from(categories);
}

// 獲取卡牌等級列表（用於分組）
function getCardLevels() {
    const levels = new Set();
    gameCards.forEach(card => {
        if (card.level) {
            levels.add(card.level);
        }
    });
    return Array.from(levels);
}

// 根據ID獲取卡牌
function getCardById(id) {
    return gameCards.find(card => card.id === id);
}

// 根據類別獲取卡牌
function getCardsByCategory(category) {
    return gameCards.filter(card => card.category === category);
}

// 根據等級獲取卡牌
function getCardsByLevel(level) {
    return gameCards.filter(card => card.level === level);
}

// 獲取特定卡牌的提示說明
function getCardTooltip(card) {
    let tooltip = `<strong>${card.name}</strong>`;

    if (card.level) {
        tooltip += ` (${card.level})`;
    }

    tooltip += `<br>${card.description}`;

    if (card.condition) {
        tooltip += `<br>使用條件: ${card.condition}`;
    }

    if (card.principle) {
        tooltip += `<br>原理: ${card.principle}`;
    }

    if (card.effects.life !== 0) {
        const prefix = card.effects.life > 0 ? '+' : '';
        tooltip += `<br>生命值效果: ${prefix}${card.effects.life}`;
    }

    if (card.effects.economy !== 0) {
        const prefix = card.effects.economy > 0 ? '+' : '';
        tooltip += `<br>經濟值效果: ${prefix}${card.effects.economy}`;
    }

    if (card.effects.specialEffect) {
        let specialEffectText = '';
        switch (card.effects.specialEffect) {
            case 'random_event':
                specialEffectText = '觸發一個隨機事件';
                break;
            case 'reset':
                specialEffectText = '重置雙方數值至初始狀態';
                break;
            case 'change_end_condition':
                specialEffectText = '遊戲結束條件變更（生命值低於500時結束）';
                break;
            case 'attack_boost':
                specialEffectText = `攻擊效果+30%（持續${card.effects.duration}回合）`;
                break;
            case 'defense_boost':
                specialEffectText = `被攻擊效果-30%（持續${card.effects.duration}回合）`;
                break;
        }

        if (specialEffectText) {
            tooltip += `<br>特殊效果: ${specialEffectText}`;
        }
    }

    return tooltip;
}

// 自動初始化卡牌數據
initCards();

// 導出卡牌數據供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initCards,
        getCardCategories,
        getCardLevels,
        getCardById,
        getCardsByCategory,
        getCardsByLevel,
        getCardTooltip
    };
} 