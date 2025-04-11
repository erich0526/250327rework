/**
 * RPG桌遊助手 - 隨機事件資料
 */

// 隨機事件數據
const gameEvents = [
    {
        id: 'password_security',
        title: '設定密碼',
        description: '你需要為你的角色設置一個安全的密碼。密碼的強度將決定你是否能抵禦黑客的攻擊。',
        type: 'password',
        question: '請設置一個安全的密碼：',
        options: [], // 動態生成
        effects: {
            strong: {
                description: '你的密碼非常安全！你成功地抵禦了黑客的攻擊，並獲得了額外的防護。',
                life: 200,
                economy: 0
            },
            medium: {
                description: '你的密碼安全性一般，黑客花了一些時間才破解，但還是造成了一些損失。',
                life: 0,
                economy: 0
            },
            weak: {
                description: '你的密碼太弱了！黑客輕易地入侵了你的系統，造成了嚴重的損失。',
                life: -200,
                economy: 0
            }
        },
        passwordCriteria: {
            minLength: 8,
            requiresUppercase: true,
            requiresLowercase: true,
            requiresNumber: true,
            requiresSpecial: true
        }
    },
    {
        id: 'two_factor_auth',
        title: '二步驟驗證',
        description: '你的帳戶可以啟用二步驟驗證以增加安全性。這可以防止未經授權的訪問。',
        type: 'choice',
        question: '你要啟用二步驟驗證嗎？',
        options: [
            {
                text: '是，我要啟用二步驟驗證',
                result: '你啟用了二步驟驗證。即使有人知道你的密碼，也無法未經授權訪問你的帳戶。',
                effects: {
                    life: 500,
                    economy: 0
                }
            },
            {
                text: '否，我不需要二步驟驗證',
                result: '你沒有啟用二步驟驗證。駭客成功入侵了你的帳戶，造成了嚴重的安全問題。',
                effects: {
                    life: -400,
                    economy: 0
                }
            }
        ]
    },
    {
        id: 'data_backup',
        title: '定期備份',
        description: '你的數據需要定期備份以防止意外或惡意的數據丟失。',
        type: 'choice',
        question: '你要如何設置數據備份？',
        options: [
            {
                text: '自動每日備份到雲端',
                result: '你設置了自動每日備份到雲端。當你遇到勒索軟件攻擊時，你能夠快速恢復你的數據。',
                effects: {
                    life: 500,
                    economy: 100
                }
            },
            {
                text: '自動每週備份到本地硬碟',
                result: '你設置了自動每週備份到本地硬碟。當系統崩潰時，你丟失了部分數據，但大部分還是保留了。',
                effects: {
                    life: 300,
                    economy: 0
                }
            },
            {
                text: '不設置備份',
                result: '你沒有設置任何備份。當勒索軟件鎖定了你的文件時，你不得不支付贖金或永久丟失數據。',
                effects: {
                    life: -700,
                    economy: -300
                }
            }
        ]
    },
    {
        id: 'public_wifi',
        title: '使用公用網路的風險',
        description: '你正在咖啡廳工作，需要連接到互聯網。',
        type: 'choice',
        question: '你要如何連接到互聯網？',
        options: [
            {
                text: '使用咖啡廳的免費Wi-Fi',
                result: '你連接到了咖啡廳的免費Wi-Fi。駭客通過中間人攻擊竊取了你的敏感信息。',
                effects: {
                    life: -400,
                    economy: -200
                }
            },
            {
                text: '使用個人移動熱點',
                result: '你使用了個人移動熱點。雖然速度較慢，但你的數據傳輸是安全的。',
                effects: {
                    life: 100,
                    economy: -50
                }
            },
            {
                text: '使用VPN連接咖啡廳的Wi-Fi',
                result: '你通過VPN連接到咖啡廳的Wi-Fi。你的數據被加密，防止了潛在的攻擊。',
                effects: {
                    life: 200,
                    economy: -50
                }
            }
        ]
    },
    {
        id: 'software_update',
        title: '定期更新軟體',
        description: '你的系統提示有新的安全更新可用。',
        type: 'choice',
        question: '你要如何處理這個更新提示？',
        options: [
            {
                text: '立即更新',
                result: '你立即更新了系統。新的更新修復了一個嚴重的安全漏洞，保護了你的系統免受最新發現的惡意軟件攻擊。',
                effects: {
                    life: 300,
                    economy: 200
                }
            },
            {
                text: '稍後更新',
                result: '你決定稍後再更新。在你更新之前，駭客利用了這個漏洞攻擊了你的系統。',
                effects: {
                    life: -500,
                    economy: -100
                }
            },
            {
                text: '忽略更新',
                result: '你完全忽略了更新提示。你的系統變得容易受到多種攻擊，最終導致了嚴重的數據洩露。',
                effects: {
                    life: -800,
                    economy: -300
                }
            }
        ]
    }
];

// 導出事件數據供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameEvents };
} 