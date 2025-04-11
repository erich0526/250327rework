/**
 * RPG桌遊助手 - 卡牌數據
 */

// 卡牌數據列表
const gameCards = [
    // 攻擊卡牌
    {
        id: "phishing_attack",
        name: "網路釣魚攻擊",
        level: "初階",
        description: "攻擊者偽裝成可信賴的實體，以誘導用戶提供敏感訊息，例如密碼或信用卡號",
        category: "攻擊",
        condition: "扣自身經濟500",
        principle: "利用心理操縱（如緊急通知或獎勳）吸引用戶進入惡意網站或打開有害附件",
        effects: {
            life: -200,
            economy: -500,
            isAttack: true,
            targetSelf: false
        }
    },
    {
        id: "brute_force",
        name: "蠻力攻擊(物理攻擊)",
        level: "初階",
        description: "攻擊者嘗試所有可能的密碼組合，直到猜中正確密碼",
        category: "攻擊",
        condition: "扣自身經濟500",
        principle: "依靠高計算能力，系統性測試所有密碼組合，針對簡單或弱密碼特別有效",
        effects: {
            life: -200,
            economy: -500,
            isAttack: true,
            targetSelf: false
        }
    },
    {
        id: "dos_ddos",
        name: "DoS和DDoS攻擊",
        level: "初階",
        description: "攻擊者向目標發送大量請求，使其無法處理正常流量，導致服務中斷",
        category: "攻擊",
        condition: "扣自身經濟500",
        principle: "DoS 是單一來源發起攻擊，而 DDoS 由多個分佈式來源協調發起，透過耗盡伺服器資源或頻寬造成癱瘓",
        effects: {
            life: -200,
            economy: -500,
            isAttack: true,
            targetSelf: false
        }
    },
    {
        id: "ransomware",
        name: "勒索軟體攻擊",
        level: "中階",
        description: "攻擊者使用惡意軟體加密用戶的數據，要求支付贖金才能解鎖",
        category: "攻擊",
        condition: "扣自身經濟1000",
        principle: "透過社交工程（如釣魚郵件）或漏洞攻擊感染目標設備，執行強加密程序阻止用戶訪問文件",
        effects: {
            life: -500,
            economy: -1000,
            isAttack: true,
            targetSelf: false
        }
    },
    {
        id: "mitm",
        name: "中間人攻擊",
        level: "中階",
        description: "攻擊者攔截用戶與伺服器之間的通信，可能竊取或篡改數據",
        category: "攻擊",
        condition: "扣自身經濟1000",
        principle: "攻擊者將自己置於通信雙方之間，冒充合法節點，未加密的數據極易被攔截或修改",
        effects: {
            life: -500,
            economy: -1000,
            isAttack: true,
            targetSelf: false
        }
    },
    {
        id: "url_attack",
        name: "URL攻擊",
        level: "高階",
        description: "攻擊者通過操作 URL 中的參數執行未授權的操作或訪問受限制的資源",
        category: "攻擊",
        condition: "扣自身經濟1500",
        principle: "在未充分驗證的情況下，攻擊者手動修改 URL 參數，例如更改 ID 欄位或管理權限標誌，以執行不合法的請求",
        effects: {
            life: -1000,
            economy: -1500,
            isAttack: true,
            targetSelf: false
        }
    },
    {
        id: "dns_spoofing",
        name: "DNS記錄偽造",
        level: "高階",
        description: "攻擊者偽造 DNS 回應，將用戶導向惡意網站或錯誤的 IP 地址",
        category: "攻擊",
        condition: "扣自身經濟1500",
        principle: "通過篡改 DNS 查詢結果，攻擊者將合法域名指向惡意伺服器，誘使用戶與之互動",
        effects: {
            life: -1000,
            economy: -1500,
            isAttack: true,
            targetSelf: false
        }
    },

    // 防禦卡牌
    {
        id: "phishing_defense",
        name: "網路釣魚防護-過濾系統",
        level: "初階",
        description: "自動檢測並阻擋釣魚郵件或惡意網站",
        category: "防禦",
        condition: "扣自身經濟500",
        principle: "使用機器學習或黑名單技術，分析電子郵件和網址內容以識別釣魚特徵",
        effects: {
            life: 100,  // 50% of 200
            economy: -500,
            isDefense: true,
            counters: ["phishing_attack"]
        }
    },
    {
        id: "brute_force_defense",
        name: "蠻力攻擊防護-密碼複雜化",
        level: "初階",
        description: "要求使用者設置強密碼以增加破解難度",
        category: "防禦",
        condition: "扣自身經濟500",
        principle: "強密碼包含多種字符類型和長度，使暴力破解耗時指數級增長",
        effects: {
            life: 100,  // 50% of 200
            economy: -500,
            isDefense: true,
            counters: ["brute_force"]
        }
    },
    {
        id: "dos_ddos_defense",
        name: "DoS和DDoS防護-負載均衡",
        level: "初階",
        description: "將流量分配到多個伺服器或節點，避免單點過載導致服務癱瘓",
        category: "防禦",
        condition: "扣自身經濟500",
        principle: "使用負載均衡設備或雲端服務檢測流量，智能分配到不同資源以保持穩定性",
        effects: {
            life: 100,  // 50% of 200
            economy: -500,
            isDefense: true,
            counters: ["dos_ddos"]
        }
    },
    {
        id: "ransomware_defense",
        name: "勒索軟體防護-定期備份及更新",
        level: "中階",
        description: "透過備份數據和更新系統減少勒索軟體影響",
        category: "防禦",
        condition: "扣自身經濟1000",
        principle: "定期備份確保數據可恢復，更新系統修補漏洞，降低攻擊成功率",
        effects: {
            life: 375,  // 75% of 500
            economy: -1000,
            isDefense: true,
            counters: ["ransomware"]
        }
    },
    {
        id: "mitm_defense",
        name: "中間人攻擊防護-VPN",
        level: "中階",
        description: "通過加密通信隧道，保護數據在不安全網絡中的傳輸安全",
        category: "防禦",
        condition: "扣自身經濟1000",
        principle: "VPN 使用加密協議（如 IPsec 或 TLS）保護傳輸數據，防止攔截和篡改",
        effects: {
            life: 375,  // 75% of 500
            economy: -1000,
            isDefense: true,
            counters: ["mitm"]
        }
    },
    {
        id: "url_defense",
        name: "URL防護-區分管理權限",
        level: "高階",
        description: "根據用戶角色限制敏感資源的訪問權限",
        category: "防禦",
        condition: "扣自身經濟1500",
        principle: "透過後端檢查權限，確保只有授權用戶才能訪問高權限功能或資料",
        effects: {
            life: 1000,  // 100% of 1000
            economy: -1500,
            isDefense: true,
            counters: ["url_attack"]
        }
    },
    {
        id: "dns_defense",
        name: "DNS記錄偽造防護-DNSSEC",
        level: "高階",
        description: "驗證 DNS 查詢結果的真實性，防止偽造",
        category: "防禦",
        condition: "扣自身經濟1500",
        principle: "DNSSEC 使用數字簽名對 DNS 回應進行驗證，保證查詢未被篡改",
        effects: {
            life: 1000,  // 100% of 1000
            economy: -1500,
            isDefense: true,
            counters: ["dns_spoofing"]
        }
    },

    // 道具卡牌
    {
        id: "good_sleep",
        name: "睡滿八小時",
        description: "上班前都有睡飽，身體很健康",
        category: "道具",
        effects: {
            life: 500,
            economy: 0
        }
    },
    {
        id: "lottery",
        name: "中大獎",
        description: "下班去彩券行買刮刮樂，運氣超好",
        category: "道具",
        effects: {
            life: 0,
            economy: 1000
        }
    },
    {
        id: "restart",
        name: "重新啟動",
        description: "有隻貓不小心踩到電源線，導致遊戲需重新啟動",
        category: "道具",
        effects: {
            life: 0,
            economy: 0,
            specialEffect: "reset"
        }
    },
    {
        id: "hardware_upgrade",
        name: "硬體升級",
        description: "設備更新，讓遊戲可以提前收尾",
        category: "道具",
        effects: {
            life: 0,
            economy: 0,
            specialEffect: "change_end_condition"
        }
    },
    {
        id: "hacker_rise",
        name: "駭客興起",
        description: "駭客技術日漸成熟，新攻擊層出不窮",
        category: "道具",
        effects: {
            life: 0,
            economy: 0,
            specialEffect: "attack_boost",
            duration: 2
        }
    },
    {
        id: "vulnerability_fix",
        name: "漏洞彌補",
        description: "新攻擊一一被擋下，硬軟體設備慢慢的在更新",
        category: "道具",
        effects: {
            life: 0,
            economy: 0,
            specialEffect: "defense_boost",
            duration: 2
        }
    }
];

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

// 導出卡牌數據供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameCards,
        getCardCategories,
        getCardLevels,
        getCardById,
        getCardsByCategory,
        getCardsByLevel,
        getCardTooltip
    };
} 