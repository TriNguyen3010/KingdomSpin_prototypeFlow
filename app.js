const CASTLE_SLOT_MAX_LEVEL = 3;
const CASTLE_COMPLETION_BONUS = { coins: 25000, crowns: 8 };
const KINGDOM_CHEST_BASE_COINS = 1800;
const KINGDOM_CHEST_REGION_COINS_STEP = 700;
const KINGDOM_CHEST_NODE_COINS_STEP = 450;
const MISSION_STATUS = {
    LOCKED: 'locked',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CLAIMED: 'claimed'
};
const CASTLE_SLOT_BLUEPRINT = [
    { key: 'keep', name: 'Keep', baseCost: 4, visuals: ['🪨', '🧱', '🏯', '🏰'] },
    { key: 'gate', name: 'Gate', baseCost: 5, visuals: ['🚧', '🚪', '🛡️', '🚪✨'] },
    { key: 'tower', name: 'Tower', baseCost: 6, visuals: ['🪵', '🗼', '🏛️', '🗼✨'] },
    { key: 'garden', name: 'Garden', baseCost: 4, visuals: ['🌱', '🌿', '🌳', '🌺'] }
];

function createRegionCastle() {
    return {
        unlocked: false,
        completionClaimed: false,
        slots: CASTLE_SLOT_BLUEPRINT.map((slot) => ({
            ...slot,
            level: 0,
            maxLevel: CASTLE_SLOT_MAX_LEVEL
        }))
    };
}

function createRegionChests(regionIdx, nodeCount) {
    const chestCount = Math.max(0, nodeCount - 1);
    return Array.from({ length: chestCount }, (_, idx) => {
        const fromNode = idx + 1;
        const coins = KINGDOM_CHEST_BASE_COINS
            + (regionIdx * KINGDOM_CHEST_REGION_COINS_STEP)
            + (fromNode * KINGDOM_CHEST_NODE_COINS_STEP);

        return {
            fromNode,
            toNode: fromNode + 1,
            claimed: false,
            reward: {
                coins,
                crowns: 1
            }
        };
    });
}

function createInitialRegions() {
    return [
        { id: 'home', name: '🏠 Home', icon: '🏠', unlocked: true, nodes: 3 },
        { id: 'forest', name: '🌲 Forest', icon: '🌲', unlocked: false, nodes: 4 },
        { id: 'desert', name: '🏜 Desert', icon: '🏜', unlocked: false, nodes: 4 },
        { id: 'snow', name: '❄ Snow', icon: '❄️', unlocked: false, nodes: 4 },
        { id: 'volcano', name: '🌋 Volcano', icon: '🌋', unlocked: false, nodes: 4 }
    ].map((region, idx) => {
        const castle = createRegionCastle();
        if (idx === 0) castle.unlocked = true; // Home building is available from start
        return {
            ...region,
            clearedNodes: 0,
            castle,
            chests: createRegionChests(idx, region.nodes),
            nodeMissions: {}
        };
    });
}

const KINGDOM_MAP_THEMES = {
    home: { border: '#38bdf8', glow: 'rgba(56,189,248,0.55)', bg: 'rgba(12,74,110,0.2)', bossBorder: '#f87171' },
    forest: { border: '#22c55e', glow: 'rgba(34,197,94,0.55)', bg: 'rgba(20,83,45,0.2)', bossBorder: '#f87171' },
    desert: { border: '#f59e0b', glow: 'rgba(245,158,11,0.55)', bg: 'rgba(120,53,15,0.22)', bossBorder: '#f87171' },
    snow: { border: '#67e8f9', glow: 'rgba(103,232,249,0.55)', bg: 'rgba(14,116,144,0.2)', bossBorder: '#f87171' },
    volcano: { border: '#ef4444', glow: 'rgba(239,68,68,0.55)', bg: 'rgba(127,29,29,0.24)', bossBorder: '#fb7185' }
};

const KINGDOM_SLOT_THEMES = {
    home: { accent: '#38bdf8', reelBorder: '#38bdf8', reelGlow: 'rgba(56,189,248,0.25)' },
    forest: { accent: '#22c55e', reelBorder: '#22c55e', reelGlow: 'rgba(34,197,94,0.25)' },
    desert: { accent: '#f59e0b', reelBorder: '#f59e0b', reelGlow: 'rgba(245,158,11,0.25)' },
    snow: { accent: '#67e8f9', reelBorder: '#67e8f9', reelGlow: 'rgba(103,232,249,0.25)' },
    volcano: { accent: '#ef4444', reelBorder: '#ef4444', reelGlow: 'rgba(239,68,68,0.25)' }
};

const UNIVERSAL_REGION_COLORS = {
    home: '#38bdf8',
    forest: '#22c55e',
    desert: '#f59e0b',
    snow: '#67e8f9',
    volcano: '#ef4444'
};

function isRegionCleared(region) {
    return region.clearedNodes >= region.nodes;
}

function getRegionCurrentNode(region) {
    return Math.min(region.clearedNodes + 1, region.nodes);
}

function getSlotUpgradeCost(slot) {
    return slot.baseCost * (slot.level + 1);
}

function isCastleCompleted(castle) {
    return castle.slots.every((slot) => slot.level >= slot.maxLevel);
}

function getUnlockedCastleIndexes() {
    return state.regions
        .map((region, idx) => ({ region, idx }))
        .filter(({ region }) => region.castle.unlocked)
        .map(({ idx }) => idx);
}

function getDefaultBuildingRegionIdx() {
    if (state.regions[state.currentRegionIdx]?.castle?.unlocked) return state.currentRegionIdx;
    const unlocked = getUnlockedCastleIndexes();
    return unlocked.length > 0 ? unlocked[0] : 0;
}

// State Management
const state = {
    coins: 402685,
    crowns: 500,
    mode: 'casino', // 'casino' | 'kingdom'
    screen: 'home', // 'home' | 'casino-slot' | 'kingdom-slot' | 'castle'

    // Expanded Region & Node State
    regions: createInitialRegions(),
    currentRegionIdx: 0,
    buildingRegionIdx: 0,
    casinoBet: 1000,
    casinoSlotEngine: null,
    casinoSpinBusy: false,
    kingdomSlotEngine: null,
    kingdomSpinBusy: false,

    universalOpen: false,

    // Casino Level System
    casinoLevel: 1,
    casinoXP: 0,
    casinoXPToNext: 80,
    selectedMachine: 0,
    casinoMachines: [
        { name: 'Wild West', icon: '🎰', unlockLevel: 1, color: '#f59e0b', rarity: 'Common' },
        { name: 'Diamond Rush', icon: '💎', unlockLevel: 1, color: '#3b82f6', rarity: 'Common' },
        { name: 'Mystic Fox', icon: '🦊', unlockLevel: 3, color: '#8b5cf6', rarity: 'Rare' },
        { name: 'Dragon Nest', icon: '🐉', unlockLevel: 5, color: '#ef4444', rarity: 'Rare' },
        { name: 'Golden Temple', icon: '🏙️', unlockLevel: 7, color: '#eab308', rarity: 'Epic' },
        { name: 'Neon City', icon: '🌆', unlockLevel: 10, color: '#06b6d4', rarity: 'Epic' },
        { name: 'Ocean Deep', icon: '🌊', unlockLevel: 12, color: '#0ea5e9', rarity: 'Legendary' },
        { name: 'Dark Magic', icon: '🔮', unlockLevel: 15, color: '#a855f7', rarity: 'Legendary' },
        { name: 'Star Realm', icon: '⭐', unlockLevel: 18, color: '#f97316', rarity: 'Mythic' }
    ]
};

const KINGDOM_SLOT_SYMBOLS = ['crown', 'shield', 'sword', 'gem', 'leaf', 'hammer', 'helm'];
const KINGDOM_SLOT_SYMBOL_MAP = {
    crown: '👑',
    shield: '🛡️',
    sword: '⚔️',
    gem: '💎',
    leaf: '🍀',
    hammer: '🔨',
    helm: '🪖'
};

const CASINO_SLOT_SYMBOLS = ['seven', 'diamond', 'crown', 'bell', 'bar', 'star', 'cherry'];
const CASINO_SLOT_SYMBOL_MAP = {
    seven: '7️⃣',
    diamond: '💎',
    crown: '👑',
    bell: '🔔',
    bar: '🟦',
    star: '⭐',
    cherry: '🍒'
};

class CasinoSlotSymbol {
    constructor(name = CasinoSlotSymbol.random(CASINO_SLOT_SYMBOLS)) {
        this.name = name;
        this.el = document.createElement('div');
        this.el.className = 'slot-symbol';
        this.el.textContent = CASINO_SLOT_SYMBOL_MAP[name] || '❔';
    }

    static random(symbols) {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }
}

class CasinoReel {
    constructor(reelContainer, idx, initialSymbols, symbols) {
        this.reelContainer = reelContainer;
        this.idx = idx;
        this.symbols = symbols;
        this.symbolContainer = document.createElement('div');
        this.symbolContainer.classList.add('icons');
        this.reelContainer.appendChild(this.symbolContainer);
        initialSymbols.forEach((symbol) => this.symbolContainer.appendChild(this.createSymbolEl(symbol)));
    }

    get factor() {
        return 1 + Math.pow(this.idx / 2, 2);
    }

    createSymbolEl(name) {
        const symbol = new CasinoSlotSymbol(name);
        const cellHeight = this.reelContainer.clientHeight / 3;
        symbol.el.style.height = `${cellHeight}px`;
        return symbol.el;
    }

    renderSymbols(nextSymbols) {
        const rounds = Math.floor(this.factor) * 7;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < rounds; i++) {
            const name = i >= rounds - 3
                ? nextSymbols[i - (rounds - 3)]
                : CasinoSlotSymbol.random(this.symbols);
            fragment.appendChild(this.createSymbolEl(name));
        }

        this.symbolContainer.appendChild(fragment);
        return rounds;
    }

    spin(rounds) {
        const symbolHeight = this.reelContainer.clientHeight / 3;
        const shiftPx = rounds * symbolHeight;
        const animation = this.symbolContainer.animate(
            [
                { transform: 'translateY(0px)', filter: 'blur(0px)' },
                { filter: 'blur(2px)', offset: 0.5 },
                { transform: `translateY(-${shiftPx}px)`, filter: 'blur(0px)' }
            ],
            {
                duration: this.factor * 550,
                easing: 'ease-in-out'
            }
        );

        const animationPromise = new Promise((resolve) => {
            animation.onfinish = resolve;
        });
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(resolve, this.factor * 580);
        });

        return Promise.race([animationPromise, timeoutPromise]).then(() => {
            if (animation.playState !== 'finished') animation.finish();
            for (let i = 0; i < rounds; i++) {
                if (this.symbolContainer.firstChild) this.symbolContainer.firstChild.remove();
            }
        });
    }
}

class CasinoSlotEngine {
    constructor(domElement, config = {}) {
        this.container = domElement;
        this.symbols = config.symbols || CASINO_SLOT_SYMBOLS;
        this.currentSymbols = Array.from({ length: 5 }, () => [
            CasinoSlotSymbol.random(this.symbols),
            CasinoSlotSymbol.random(this.symbols),
            CasinoSlotSymbol.random(this.symbols)
        ]);
        this.nextSymbols = this.currentSymbols.map((col) => [...col]);
        this.reels = Array.from(this.container.getElementsByClassName('c-reel')).map(
            (reelContainer, idx) => new CasinoReel(reelContainer, idx, this.currentSymbols[idx], this.symbols)
        );
        this._spinning = false;
    }

    spin() {
        if (this._spinning) return Promise.resolve(this.nextSymbols);
        this._spinning = true;

        this.currentSymbols = this.nextSymbols;
        this.nextSymbols = Array.from({ length: 5 }, () => [
            CasinoSlotSymbol.random(this.symbols),
            CasinoSlotSymbol.random(this.symbols),
            CasinoSlotSymbol.random(this.symbols)
        ]);

        return Promise.all(
            this.reels.map((reel) => {
                const rounds = reel.renderSymbols(this.nextSymbols[reel.idx]);
                return reel.spin(rounds);
            })
        ).then(() => {
            this._spinning = false;
            return this.nextSymbols;
        }).catch((err) => {
            this._spinning = false;
            throw err;
        });
    }
}

class KingdomSlotSymbol {
    constructor(name = KingdomSlotSymbol.random(KINGDOM_SLOT_SYMBOLS)) {
        this.name = name;
        this.el = document.createElement('div');
        this.el.className = 'slot-symbol';
        this.el.textContent = KINGDOM_SLOT_SYMBOL_MAP[name] || '❔';
    }

    static random(symbols) {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }
}

class KingdomReel {
    constructor(reelContainer, idx, initialSymbols, symbols) {
        this.reelContainer = reelContainer;
        this.idx = idx;
        this.symbols = symbols;
        this.symbolContainer = document.createElement('div');
        this.symbolContainer.classList.add('icons');
        this.reelContainer.appendChild(this.symbolContainer);
        initialSymbols.forEach((symbol) => this.symbolContainer.appendChild(this.createSymbolEl(symbol)));
    }

    get factor() {
        return 1 + Math.pow(this.idx / 2, 2);
    }

    createSymbolEl(name) {
        const symbol = new KingdomSlotSymbol(name);
        const cellHeight = this.reelContainer.clientHeight / 3;
        symbol.el.style.height = `${cellHeight}px`;
        return symbol.el;
    }

    renderSymbols(nextSymbols) {
        const rounds = Math.floor(this.factor) * 7;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < rounds; i++) {
            const name = i >= rounds - 3
                ? nextSymbols[i - (rounds - 3)]
                : KingdomSlotSymbol.random(this.symbols);
            fragment.appendChild(this.createSymbolEl(name));
        }

        this.symbolContainer.appendChild(fragment);
        return rounds;
    }

    spin(rounds) {
        const symbolHeight = this.reelContainer.clientHeight / 3;
        const shiftPx = rounds * symbolHeight;
        const animation = this.symbolContainer.animate(
            [
                { transform: 'translateY(0px)', filter: 'blur(0px)' },
                { filter: 'blur(2px)', offset: 0.5 },
                { transform: `translateY(-${shiftPx}px)`, filter: 'blur(0px)' }
            ],
            {
                duration: this.factor * 550,
                easing: 'ease-in-out'
            }
        );

        const animationPromise = new Promise((resolve) => {
            animation.onfinish = resolve;
        });
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(resolve, this.factor * 580);
        });

        return Promise.race([animationPromise, timeoutPromise]).then(() => {
            if (animation.playState !== 'finished') animation.finish();
            for (let i = 0; i < rounds; i++) {
                if (this.symbolContainer.firstChild) this.symbolContainer.firstChild.remove();
            }
        });
    }
}

class KingdomSlotEngine {
    constructor(domElement, config = {}) {
        this.container = domElement;
        this.symbols = config.symbols || KINGDOM_SLOT_SYMBOLS;
        this.currentSymbols = Array.from({ length: 5 }, () => [
            KingdomSlotSymbol.random(this.symbols),
            KingdomSlotSymbol.random(this.symbols),
            KingdomSlotSymbol.random(this.symbols)
        ]);
        this.nextSymbols = this.currentSymbols.map((col) => [...col]);
        this.reels = Array.from(this.container.getElementsByClassName('k-reel')).map(
            (reelContainer, idx) => new KingdomReel(reelContainer, idx, this.currentSymbols[idx], this.symbols)
        );
        this._spinning = false;
    }

    spin() {
        if (this._spinning) return Promise.resolve(this.nextSymbols);
        this._spinning = true;

        this.currentSymbols = this.nextSymbols;
        this.nextSymbols = Array.from({ length: 5 }, () => [
            KingdomSlotSymbol.random(this.symbols),
            KingdomSlotSymbol.random(this.symbols),
            KingdomSlotSymbol.random(this.symbols)
        ]);

        return Promise.all(
            this.reels.map((reel) => {
                const rounds = reel.renderSymbols(this.nextSymbols[reel.idx]);
                return reel.spin(rounds);
            })
        ).then(() => {
            this._spinning = false;
            return this.nextSymbols;
        }).catch((err) => {
            this._spinning = false;
            throw err;
        });
    }
}

function mountKingdomSlotEngine() {
    const slotElement = document.getElementById('kingdom-slot-machine');
    if (!slotElement) return;
    state.kingdomSlotEngine = new KingdomSlotEngine(slotElement, { symbols: KINGDOM_SLOT_SYMBOLS });
}

function mountCasinoSlotEngine() {
    const slotElement = document.getElementById('casino-slot-machine');
    if (!slotElement) return;
    state.casinoSlotEngine = new CasinoSlotEngine(slotElement, { symbols: CASINO_SLOT_SYMBOLS });
}

function evaluateKingdomSpinSymbols(symbolGrid) {
    const centerLine = symbolGrid.map((reel) => reel[1]);
    const frequencies = centerLine.reduce((acc, symbol) => {
        acc[symbol] = (acc[symbol] || 0) + 1;
        return acc;
    }, {});
    const maxMatch = Math.max(...Object.values(frequencies));

    let wonPower = 1;
    let wonCoins = 1800;

    if (maxMatch >= 5) {
        wonPower = 5;
        wonCoins = 5000;
    } else if (maxMatch === 4) {
        wonPower = 4;
        wonCoins = 3600;
    } else if (maxMatch === 3) {
        wonPower = 3;
        wonCoins = 2800;
    } else if (centerLine.includes('crown')) {
        wonPower = 2;
        wonCoins = 2300;
    }

    return { wonPower, wonCoins };
}

function evaluateCasinoSpinSymbols(symbolGrid, machineIdx) {
    const centerLine = symbolGrid.map((reel) => reel[1]);
    const frequencies = centerLine.reduce((acc, symbol) => {
        acc[symbol] = (acc[symbol] || 0) + 1;
        return acc;
    }, {});
    const maxMatch = Math.max(...Object.values(frequencies));
    const machineBoost = 1 + (machineIdx * 0.08);

    let multiplier = 0;
    let resultLabel = 'MISS';

    if (maxMatch >= 5) {
        multiplier = centerLine[0] === 'seven' ? 18 : 12;
        resultLabel = '5 OF A KIND';
    } else if (maxMatch === 4) {
        multiplier = 6.5;
        resultLabel = '4 OF A KIND';
    } else if (maxMatch === 3) {
        multiplier = 3.2;
        resultLabel = '3 OF A KIND';
    } else if (centerLine.includes('seven') && centerLine.includes('diamond')) {
        multiplier = 1.8;
        resultLabel = 'LUCKY MIX';
    } else if (new Set(centerLine).size <= 3) {
        multiplier = 1.2;
        resultLabel = 'SMALL WIN';
    }

    multiplier = Number((multiplier * machineBoost).toFixed(2));
    const xpGained = (10 + (machineIdx * 4)) + (multiplier > 0 ? Math.ceil(multiplier * 2) : 3);

    return { multiplier, xpGained, resultLabel };
}

function resolveCasinoLevelUps() {
    let levelsGained = 0;
    let totalBonusCoins = 0;
    const unlockedMachines = [];

    while (state.casinoXP >= state.casinoXPToNext) {
        state.casinoXP -= state.casinoXPToNext;
        state.casinoLevel += 1;
        levelsGained += 1;

        state.casinoXPToNext = state.casinoLevel * 80;
        const bonusCoins = state.casinoLevel * 5000;
        state.coins += bonusCoins;
        totalBonusCoins += bonusCoins;

        const newMachines = state.casinoMachines.filter((machine) => machine.unlockLevel === state.casinoLevel);
        unlockedMachines.push(...newMachines);
    }

    return { levelsGained, totalBonusCoins, unlockedMachines };
}

function getMissionCountByRegion(regionIdx) {
    if (regionIdx <= 0) return 1;
    if (regionIdx === 1) return 2;
    return 3;
}

function getDemoMissionTargets(regionIdx, nodeNum, isBoss = false) {
    const regionScale = Math.min(regionIdx, 2);
    const nodeScale = Math.max(0, nodeNum - 1);

    return {
        power: Math.min(8, 4 + regionScale + (isBoss ? 1 : 0) + (nodeScale >= 2 ? 1 : 0)),
        spins: Math.min(4, 2 + (regionIdx >= 2 ? 1 : 0) + (isBoss ? 1 : 0)),
        coins: Math.min(1800, 600 + (regionIdx * 250) + (nodeScale * 150) + (isBoss ? 200 : 0))
    };
}

function getMissionReward(regionIdx, type, isBoss = false) {
    const rewardByType = {
        power_accumulate: { coins: 700, crowns: 0 },
        spin_count: { coins: 600, crowns: 0 },
        coin_win: { coins: 950, crowns: 1 }
    };

    const baseReward = rewardByType[type] || { coins: 500, crowns: 0 };
    return {
        coins: baseReward.coins + (regionIdx * 160) + (isBoss ? 120 : 0),
        crowns: baseReward.crowns
    };
}

function createNodeMissions(regionIdx, nodeNum) {
    const region = state.regions[regionIdx];
    if (!region) return [];

    const safeNode = Math.max(1, Math.min(nodeNum, region.nodes));
    const isBoss = safeNode === region.nodes;
    const missionCount = getMissionCountByRegion(regionIdx);
    const targets = getDemoMissionTargets(regionIdx, safeNode, isBoss);
    const missionDefs = [
        {
            type: 'power_accumulate',
            title: `Gain ${targets.power} Power`,
            target: targets.power
        },
        {
            type: 'spin_count',
            title: `Spin ${targets.spins} Times`,
            target: targets.spins
        },
        {
            type: 'coin_win',
            title: `Win ${targets.coins.toLocaleString()} Coins`,
            target: targets.coins
        }
    ];

    return missionDefs.slice(0, missionCount).map((mission, idx) => ({
        id: `r${regionIdx + 1}n${safeNode}_${mission.type}_${idx + 1}`,
        ...mission,
        progress: 0,
        status: MISSION_STATUS.LOCKED,
        reward: getMissionReward(regionIdx, mission.type, isBoss)
    }));
}

function syncNodeMissionStatuses(regionIdx, nodeNum) {
    const region = state.regions[regionIdx];
    if (!region) return [];

    const missionKey = String(nodeNum);
    const missions = region.nodeMissions?.[missionKey];
    if (!Array.isArray(missions)) return [];

    const activeNode = getRegionCurrentNode(region);
    const isCurrentNode = !isRegionCleared(region) && activeNode === nodeNum;

    missions.forEach((mission) => {
        const target = Math.max(1, Number(mission.target) || 1);
        const progress = Math.max(0, Number(mission.progress) || 0);
        mission.target = target;
        mission.progress = Math.min(progress, target);

        if (mission.status === MISSION_STATUS.CLAIMED) return;
        if (mission.progress >= mission.target) {
            mission.status = MISSION_STATUS.COMPLETED;
            return;
        }

        mission.status = isCurrentNode ? MISSION_STATUS.ACTIVE : MISSION_STATUS.LOCKED;
    });

    return missions;
}

function ensureNodeMissions(regionIdx, nodeNum) {
    const region = state.regions[regionIdx];
    if (!region) return [];

    const safeNode = Math.max(1, Math.min(nodeNum, region.nodes));
    if (!region.nodeMissions || typeof region.nodeMissions !== 'object') {
        region.nodeMissions = {};
    }

    const missionKey = String(safeNode);
    if (!Array.isArray(region.nodeMissions[missionKey])) {
        region.nodeMissions[missionKey] = createNodeMissions(regionIdx, safeNode);
    }

    return syncNodeMissionStatuses(regionIdx, safeNode);
}

function applyMissionProgress(regionIdx, nodeNum, spinResult = {}) {
    const region = state.regions[regionIdx];
    if (!region) return [];

    const safeNode = Math.max(1, Math.min(nodeNum, region.nodes));
    if (isRegionCleared(region) || getRegionCurrentNode(region) !== safeNode) return [];

    const missions = ensureNodeMissions(regionIdx, safeNode);
    if (missions.length === 0) return [];

    const wonPower = Math.max(0, Number(spinResult.wonPower) || 0);
    const wonCoins = Math.max(0, Number(spinResult.wonCoins) || 0);
    const spinCount = Math.max(0, Number(spinResult.spinCount) || 0);
    const newlyCompleted = [];

    missions.forEach((mission) => {
        if (mission.status === MISSION_STATUS.CLAIMED) return;

        const wasCompleted = mission.progress >= mission.target;
        if (mission.type === 'power_accumulate') {
            mission.progress += wonPower;
        } else if (mission.type === 'spin_count') {
            mission.progress += spinCount;
        } else if (mission.type === 'coin_win') {
            mission.progress += wonCoins;
        }

        mission.progress = Math.min(mission.target, mission.progress);
        if (!wasCompleted && mission.progress >= mission.target) {
            mission.status = MISSION_STATUS.COMPLETED;
            newlyCompleted.push(mission);
        }
    });

    syncNodeMissionStatuses(regionIdx, safeNode);
    return newlyCompleted;
}

function getNodeMissionStats(regionIdx, nodeNum) {
    const missions = ensureNodeMissions(regionIdx, nodeNum);
    const completedCount = missions.filter((mission) => (
        mission.status === MISSION_STATUS.COMPLETED || mission.status === MISSION_STATUS.CLAIMED
    )).length;

    return {
        missions,
        completedCount,
        total: missions.length
    };
}

function isCurrentNodeMissionCleared(regionIdx, nodeNum) {
    const stats = getNodeMissionStats(regionIdx, nodeNum);
    return stats.total > 0 && stats.completedCount >= stats.total;
}

function claimCompletedMissionsForNode(regionIdx, nodeNum) {
    const missions = ensureNodeMissions(regionIdx, nodeNum);
    let rewardCoins = 0;
    let rewardCrowns = 0;
    let claimedCount = 0;

    missions.forEach((mission) => {
        if (mission.status !== MISSION_STATUS.COMPLETED) return;
        mission.status = MISSION_STATUS.CLAIMED;
        rewardCoins += Math.max(0, Number(mission.reward?.coins) || 0);
        rewardCrowns += Math.max(0, Number(mission.reward?.crowns) || 0);
        claimedCount += 1;
    });

    return { rewardCoins, rewardCrowns, claimedCount };
}

function getMissionTypeIcon(type) {
    if (type === 'power_accumulate') return '⚔️';
    if (type === 'spin_count') return '🎰';
    if (type === 'coin_win') return '🪙';
    return '🎯';
}

function getMissionStatusLabel(status) {
    if (status === MISSION_STATUS.CLAIMED) return 'Claimed';
    if (status === MISSION_STATUS.COMPLETED) return 'Completed';
    if (status === MISSION_STATUS.ACTIVE) return 'Active';
    return 'Locked';
}

function formatMissionReward(reward) {
    const coinReward = Math.max(0, Number(reward?.coins) || 0);
    const crownReward = Math.max(0, Number(reward?.crowns) || 0);
    const parts = [];
    if (coinReward > 0) parts.push(`🪙 ${coinReward.toLocaleString()}`);
    if (crownReward > 0) parts.push(`👑 ${crownReward}`);
    return parts.join(' · ') || 'No reward';
}

function renderNodeMissionBoard(regionIdx, nodeNum) {
    const missions = ensureNodeMissions(regionIdx, nodeNum);
    if (missions.length === 0) return '';

    const missionCount = getMissionCountByRegion(regionIdx);
    const missionListHtml = missions.map((mission) => {
        const status = mission.status || MISSION_STATUS.LOCKED;
        const pct = mission.target > 0 ? Math.round((mission.progress / mission.target) * 100) : 0;
        const progressPct = Math.min(100, Math.max(0, pct));
        const statusLabel = getMissionStatusLabel(status);
        const canClaim = status === MISSION_STATUS.COMPLETED;
        const claimAction = canClaim && !state.kingdomSpinBusy ? `onclick="claimNodeMission('${mission.id}')"` : '';
        const claimDisabled = canClaim && state.kingdomSpinBusy ? 'disabled' : '';
        const rewardLabel = formatMissionReward(mission.reward);

        let actionHTML = '';
        if (canClaim) {
            actionHTML = `<button type="button" class="node-mission-claim-btn" ${claimAction} ${claimDisabled}>Claim</button>`;
        } else if (status === MISSION_STATUS.CLAIMED) {
            actionHTML = `<div class="node-mission-chip ${status}">${statusLabel}</div>`;
        }

        return `
            <div class="node-mission-card ${status}">
                <div class="node-mission-head">
                    <div class="node-mission-title">${getMissionTypeIcon(mission.type)} ${mission.title}</div>
                    <div class="node-mission-status ${status}">${statusLabel}</div>
                </div>
                <div class="node-mission-progress-row">
                    <div class="node-mission-progress-track">
                        <div class="node-mission-progress-fill" style="width:${progressPct}%"></div>
                    </div>
                    <div class="node-mission-progress-text">${mission.progress}/${mission.target}</div>
                </div>
                <div class="node-mission-footer">
                    <div class="node-mission-reward">${rewardLabel}</div>
                    ${actionHTML}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="node-mission-board">
            <div class="node-mission-board-head">
                <span>🎯 Node Missions</span>
                <span>${missionCount} mission${missionCount > 1 ? 's' : ''} · demo easy</span>
            </div>
            <div class="node-mission-list">${missionListHtml}</div>
        </div>
    `;
}

function getChestStatus(region, chestIdx) {
    const chest = region?.chests?.[chestIdx];
    if (!chest) return 'missing';
    if (chest.claimed) return 'claimed';
    return region.clearedNodes >= chest.fromNode ? 'claimable' : 'locked';
}

function getChestTooltip(chest, status) {
    if (!chest) return '';
    if (status === 'claimed') return 'Chest claimed';
    if (status === 'locked') return `Clear node ${chest.fromNode} to unlock chest`;
    return `Claim: 🪙 ${chest.reward.coins.toLocaleString()} · 👑 ${chest.reward.crowns}`;
}

function renderKingdomMapNodes(curRegion, regionIdx, theme) {
    const activeNode = getRegionCurrentNode(curRegion);
    const regionCleared = isRegionCleared(curRegion);
    let mapHTML = '';
    let nodesInRow = 0;

    for (let i = 1; i <= curRegion.nodes; i++) {
        let status = 'locked';
        let onclick = '';
        const isBoss = (i === curRegion.nodes);

        if (i <= curRegion.clearedNodes) {
            status = 'unlocked';
            // Không gán onclick, không cho màn hình slot khi đã cleared
        } else if (!regionCleared && i === activeNode) {
            status = 'current';
            onclick = "switchScreen('kingdom-slot')";
        }

        let nodeStyle = '';
        if (isBoss) nodeStyle = `border-color: ${theme.bossBorder}; box-shadow: 0 0 25px rgba(239,68,68,0.7);`;
        else if (status === 'unlocked') nodeStyle = `border-color: ${theme.border}; box-shadow: 0 0 20px ${theme.glow}; background: ${theme.border}22;`;
        else if (status === 'current') nodeStyle = `border-color: ${theme.border}; box-shadow: 0 0 35px ${theme.glow}; background: radial-gradient(circle, ${theme.border}88, ${theme.border}33);`;

        const extraClass = isBoss ? 'boss-node' : '';
        const innerText = isBoss ? '☠️' : i;
        const hasPathToNext = (i !== curRegion.nodes && nodesInRow < 4);
        const pathLine = hasPathToNext ? '<div class="path-line"></div>' : '';
        const missionCount = getMissionCountByRegion(regionIdx);
        const tooltip = i <= curRegion.clearedNodes
            ? 'Cleared'
            : `${isBoss ? 'Boss node · ' : ''}${missionCount} mission${missionCount > 1 ? 's' : ''}`;

        let chestHtml = '';
        const chest = curRegion.chests?.[i - 1];
        if (hasPathToNext && chest) {
            const chestIdx = i - 1;
            const chestStatus = getChestStatus(curRegion, chestIdx);
            const chestTooltip = getChestTooltip(chest, chestStatus);
            const chestAction = chestStatus === 'claimable' ? `onclick="claimChest(${chestIdx})"` : '';
            const chestIcon = chestStatus === 'claimed' ? '✅' : (chestStatus === 'claimable' ? '🎁' : '🧰');
            chestHtml = `
                <button type="button" class="reward-chest ${chestStatus}" title="${chestTooltip}" aria-label="${chestTooltip}" ${chestAction}>${chestIcon}</button>
            `;
        }

        if (nodesInRow === 0) mapHTML += '<div class="node-row">';
        mapHTML += `
            <div class="node-wrapper">
                <div class="level-node ${status} ${extraClass} tooltip" data-tip="${tooltip}" style="${nodeStyle}" ${onclick ? 'onclick="' + onclick + '"' : ''}>${innerText}${pathLine}</div>
                ${chestHtml}
            </div>
        `;

        nodesInRow++;
        if (nodesInRow === 5 || i === curRegion.nodes) {
            mapHTML += '</div>';
            nodesInRow = 0;
        }
    }

    return mapHTML;
}

// DOM Elements
const els = {
    coinAmount: document.getElementById('coin-amount'),
    crownAmount: document.getElementById('crown-amount'),
    topBarRight: document.getElementById('top-bar-right'),
    mainContent: document.getElementById('main-content'),
    overlay: document.getElementById('overlay'),
    universalPanel: document.getElementById('universal-panel'),
    popup: document.getElementById('popup')
};

// --- RENDERERS ---

function renderTopBar() {
    els.coinAmount.innerText = state.coins.toLocaleString();
    els.crownAmount.innerText = state.crowns.toLocaleString();

    if (state.mode === 'casino') {
        const xpPct = Math.round((state.casinoXP / state.casinoXPToNext) * 100);
        els.topBarRight.innerHTML = `
            <button class="btn" style="background: linear-gradient(to bottom, #10b981, #047857); border-color: #34d399;">BUY</button>
            <div class="lv-badge">
                <span class="lv-label">LV ${state.casinoLevel}</span>
                <div class="lv-xp-bar"><div class="lv-xp-fill" style="width:${xpPct}%"></div></div>
            </div>
            <button class="btn btn-icon" style="background: #374151; border-color: #4b5563;">⚙</button>
        `;
    } else {
        els.topBarRight.innerHTML = `
            <button class="btn" id="btn-universal" style="background: linear-gradient(to bottom, #8b5cf6, #5b21b6); border-color: #a78bfa;">🌍 Universal</button>
            <button class="btn" id="btn-building" style="background: linear-gradient(to bottom, #d946ef, #a21caf); border-color: #e879f9;">🏗️ Building</button>
        `;
        document.getElementById('btn-universal').addEventListener('click', toggleUniversalPanel);
        document.getElementById('btn-building').addEventListener('click', () => switchScreen('castle'));
    }
}

// Centered horizontal mode tabs — rendered above main content
function modeCenterTabsHtml() {
    return `
        <div class="mode-tabs-center">
            <button class="mode-tab-btn ${state.mode === 'casino' ? 'active' : ''}" onclick="switchMode('casino')">\ud83c\udfb0 Casino</button>
            <button class="mode-tab-btn ${state.mode === 'kingdom' ? 'active' : ''}" onclick="switchMode('kingdom')">\ud83c\udff0 Kingdom</button>
        </div>
    `;
}

function renderScreen() {
    // Clear main content
    els.mainContent.innerHTML = '';

    // Depending on state.screen, inject the HTML
    let html = '';
    if (state.screen === 'home') {
        // Render based on active mode
        if (state.mode === 'casino') {
            // --- CASINO HOME ---
            const xpPct = Math.round((state.casinoXP / state.casinoXPToNext) * 100);
            html = `
                <div class="screen active" id="sec-home">
                    ${modeCenterTabsHtml()}
                    <div class="casino-xp-bar-wrap">
                        <span class="casino-xp-label">LV ${state.casinoLevel}</span>
                        <div class="casino-xp-track"><div class="casino-xp-fill" style="width:${xpPct}%"></div></div>
                        <span class="casino-xp-label">${state.casinoXP}/${state.casinoXPToNext} XP</span>
                    </div>
                    <div class="casino-carousel" id="casino-carousel">
                        ${state.casinoMachines.map((m, i) => {
                const isUnlocked = state.casinoLevel >= m.unlockLevel;
                return `
                            <div class="card ${isUnlocked ? '' : 'locked'}" ${isUnlocked ? `onclick="selectMachine(${i}); switchScreen('casino-slot');"` : ''}
                                style="${isUnlocked ? `border-color:${m.color}44; box-shadow: 0 4px 20px ${m.color}22;` : ''}">
                                ${!isUnlocked ? `<div class="lock-icon">🔒</div>` : ''}
                                <div class="card-img-placeholder" style="${isUnlocked ? `color:${m.color};` : ''}">${m.icon}</div>
                                <div class="card-title">${m.name}</div>
                                <div class="card-rarity" style="color:${isUnlocked ? m.color : '#6b7280'}">${m.rarity}</div>
                                ${!isUnlocked ? `<div class="card-unlock-lv">🔓 Unlock LV ${m.unlockLevel}</div>` : ''}
                            </div>`;
            }).join('')}
                    </div>
                    <div class="casino-menu">
                        <div class="menu-item tooltip demo-tooltip" data-tip="Tournament is not available in this demo yet." title="Tournament is not available in this demo yet.">🏆 Tournament</div>
                        <div class="menu-item tooltip demo-tooltip" data-tip="Events are not available in this demo yet." title="Events are not available in this demo yet.">🎁 Events</div>
                        <div class="menu-item tooltip demo-tooltip" style="color:#fbbf24;" data-tip="VIP is not available in this demo yet." title="VIP is not available in this demo yet.">📘 VIP</div>
                    </div>
                </div>
            `;
        } else {
            // --- KINGDOM HOME (in-place map) ---
            const curRegion = state.regions[state.currentRegionIdx];
            const theme = KINGDOM_MAP_THEMES[curRegion.id] || KINGDOM_MAP_THEMES.home;
            const nextRegion = state.currentRegionIdx < state.regions.length - 1 ? state.regions[state.currentRegionIdx + 1] : null;
            const prevRegion = state.currentRegionIdx > 0 ? state.regions[state.currentRegionIdx - 1] : null;
            const mapHTML = renderKingdomMapNodes(curRegion, state.currentRegionIdx, theme);

            html = `
                <div class="screen active map-screen" style="background-color: ${theme.bg};">
                    ${modeCenterTabsHtml()}
                    <div class="map-region-nav">
                        ${prevRegion && prevRegion.unlocked
                    ? `<button class="map-nav-arrow" onclick="travelToRegion(${state.currentRegionIdx - 1})">&#9664;</button>`
                    : `<button class="map-nav-arrow invisible">&#9664;</button>`}
                        <div class="region-title">${curRegion.name}</div>
                        ${nextRegion && nextRegion.unlocked
                    ? `<button class="map-nav-arrow" onclick="travelToRegion(${state.currentRegionIdx + 1})">&#9654;</button>`
                    : `<button class="map-nav-arrow invisible">&#9654;</button>`}
                    </div>
                    <div class="map-nodes">${mapHTML}</div>
                </div>
            `;
        }
    } else if (state.screen === 'casino-slot') {
        const m = state.casinoMachines[state.selectedMachine];
        const canAffordSpin = state.coins >= state.casinoBet;
        html = `
            <div class="screen active slot-screen">
                <div class="slot-header">
                    <button class="back-btn" onclick="switchScreen('home')">◀ BACK</button>
                    <div class="slot-header-content" style="color:${m.color}">${m.icon} ${m.name}</div>
                </div>
                <div class="slot-reels-container">
                    <div class="casino-slot-machine" id="casino-slot-machine" style="--slot-accent: ${m.color}; --slot-glow: ${m.color}55;">
                        <div class="c-reel"></div>
                        <div class="c-reel"></div>
                        <div class="c-reel"></div>
                        <div class="c-reel"></div>
                        <div class="c-reel"></div>
                    </div>
                    <div class="bet-controls">
                        <button onclick="changeBet(-500)" ${state.casinoSpinBusy ? 'disabled' : ''}>-</button>
                        <div class="bet-amount">${state.casinoBet.toLocaleString()}</div>
                        <button onclick="changeBet(500)" ${state.casinoSpinBusy ? 'disabled' : ''}>+</button>
                    </div>
                    <button id="casino-spin-btn" class="spin-btn" style="background: linear-gradient(to bottom, ${m.color}, ${m.color}aa); border-color: ${m.color}; box-shadow: 0 10px 0 ${m.color}55, 0 15px 20px rgba(0,0,0,0.6);" onclick="spinCasinoSlot()" ${state.casinoSpinBusy || !canAffordSpin ? 'disabled' : ''}>SPIN</button>
                </div>
            </div>
        `;
    } else if (state.screen === 'kingdom-map') {
        const curRegion = state.regions[state.currentRegionIdx];
        const theme = KINGDOM_MAP_THEMES[curRegion.id] || KINGDOM_MAP_THEMES.home;

        // Arrow nav: can go to adjacent unlocked regions
        const nextRegion = state.currentRegionIdx < state.regions.length - 1 ? state.regions[state.currentRegionIdx + 1] : null;
        const nextArrow = nextRegion && nextRegion.unlocked
            ? `<button class="map-nav-arrow" onclick="travelToRegion(${state.currentRegionIdx + 1})">&#9654;</button>`
            : `<button class="map-nav-arrow invisible">&#9654;</button>`;
        const mapHTML = renderKingdomMapNodes(curRegion, state.currentRegionIdx, theme);

        html = `
            <div class="screen active map-screen" style="background-color: ${theme.bg};">
                <div class="map-region-nav">
                    <button class="map-nav-arrow map-back-btn" onclick="switchMode('casino')">\u25c0</button>
                    <div class="region-title">${curRegion.name}</div>
                    ${nextArrow}
                </div>
                <div class="map-nodes">
                    ${mapHTML}
                </div>
            </div>
        `;
    } else if (state.screen === 'kingdom-slot') {
        const curRegion = state.regions[state.currentRegionIdx];
        const activeNode = getRegionCurrentNode(curRegion);
        const regionCleared = isRegionCleared(curRegion);
        const theme = KINGDOM_SLOT_THEMES[curRegion.id] || KINGDOM_SLOT_THEMES.home;
        const missionBoardHTML = renderNodeMissionBoard(state.currentRegionIdx, activeNode);
        const missionStats = getNodeMissionStats(state.currentRegionIdx, activeNode);
        const isBoss = (activeNode === curRegion.nodes);
        const headerColor = isBoss ? '#ef4444' : theme.accent;
        const headerText = regionCleared
            ? 'REGION CLEARED'
            : `${isBoss ? '☠️ BOSS · ' : ''}${missionStats.completedCount} / ${missionStats.total} MISSIONS`;

        html = `
            <div class="screen active slot-screen">
                <div class="slot-header" style="background: rgba(0,0,0,0.8);">
                    <button class="back-btn" onclick="switchScreen('home')">◀ BACK</button>
                    <div class="slot-region-tag" style="color: ${theme.accent};">${curRegion.name}</div>
                    <div class="slot-header-content" style="color: ${headerColor};">${headerText}</div>
                </div>
                <div class="slot-reels-container kingdom-slot-layout">
                    <div class="kingdom-slot-main">
                        <div class="kingdom-slot-machine" id="kingdom-slot-machine" style="--slot-accent: ${theme.reelBorder}; --slot-glow: ${theme.reelGlow};">
                            <div class="k-reel"></div>
                            <div class="k-reel"></div>
                            <div class="k-reel"></div>
                            <div class="k-reel"></div>
                            <div class="k-reel"></div>
                        </div>

                        <div class="bet-controls">
                            <button onclick="changeBet(-500)">-</button>
                            <div class="bet-amount">500</div>
                            <button onclick="changeBet(500)">+</button>
                        </div>

                        <button id="kingdom-spin-btn" class="spin-btn" style="background: linear-gradient(to bottom, ${theme.accent}, ${theme.accent}aa); border-color: ${theme.accent}; box-shadow: 0 10px 0 ${theme.accent}55, 0 15px 20px rgba(0,0,0,0.6);" ${regionCleared ? 'disabled' : 'onclick="spinKingdomSlot()"'} ${state.kingdomSpinBusy ? 'disabled' : ''}>${regionCleared ? 'CLEARED' : 'SPIN'}</button>
                    </div>

                    <aside class="kingdom-slot-side">
                        ${missionBoardHTML}
                    </aside>
                </div>
            </div>
        `;
    } else if (state.screen === 'castle') {
        const unlockedCastleIdxs = getUnlockedCastleIndexes();
        if (!unlockedCastleIdxs.includes(state.buildingRegionIdx)) {
            state.buildingRegionIdx = getDefaultBuildingRegionIdx();
        }

        const curRegion = state.regions[state.buildingRegionIdx];
        const castle = curRegion.castle;
        const totalLevels = castle.slots.reduce((sum, slot) => sum + slot.maxLevel, 0);
        const builtLevels = castle.slots.reduce((sum, slot) => sum + slot.level, 0);
        const completionPct = totalLevels === 0 ? 0 : Math.round((builtLevels / totalLevels) * 100);
        const completed = isCastleCompleted(castle);
        const prevRegionIdx = state.buildingRegionIdx > 0 ? state.buildingRegionIdx - 1 : null;
        const nextRegionIdx = state.buildingRegionIdx < state.regions.length - 1 ? state.buildingRegionIdx + 1 : null;
        const regionLabel = curRegion.name.replace(/^[^\s]+\s/, '');
        const lockInstruction = getCastleUnlockHint(state.buildingRegionIdx);

        const buildHtml = castle.slots.map((slot, idx) => {
            const isMax = slot.level >= slot.maxLevel;
            const upgradeCost = isMax ? 0 : getSlotUpgradeCost(slot);
            const canBuild = state.crowns >= upgradeCost;
            const stateIcon = isMax ? '✅' : (canBuild ? '⚒️' : '🔒');
            const actionAttr = isMax ? 'disabled' : `onclick="upgradeCastleSlot(${idx})"`;
            const visual = slot.visuals[Math.min(slot.level, slot.visuals.length - 1)];
            const cls = [
                'build-obj',
                'castle-plot',
                isMax ? 'built' : '',
                (!isMax && !canBuild) ? 'insufficient' : ''
            ].filter(Boolean).join(' ');
            const chip = isMax ? 'MAX' : `👑 ${upgradeCost}`;
            return `
                <button class="${cls}" ${actionAttr}>
                    <div class="build-state">${stateIcon}</div>
                    <div class="castle-plot-id">#${idx + 1}</div>
                    <div class="build-obj-icon">${visual}</div>
                    <div class="castle-slot-name">${slot.name}</div>
                    <div class="castle-slot-level">LV ${slot.level}/${slot.maxLevel}</div>
                    <div class="build-cost-chip">${chip}</div>
                </button>
            `;
        }).join('');
        const canClaimBonus = castle.unlocked && completed && !castle.completionClaimed;
        const bonusStateClass = !castle.unlocked
            ? 'locked'
            : (castle.completionClaimed ? 'claimed' : (canClaimBonus ? 'claimable' : 'pending'));
        const bonusControl = canClaimBonus
            ? `<button class="castle-bonus-claim-btn" onclick="claimCastleCompletionBonus()" aria-label="Claim completion bonus">🎁</button>`
            : `<div class="castle-bonus-icon" aria-hidden="true">${!castle.unlocked ? '🔒' : (castle.completionClaimed ? '✓' : '•')}</div>`;

        html = `
            <div class="screen active castle-bg">
                <div class="castle-shell ${completed ? 'castle-shell-completed' : ''}">
                    <div class="castle-topbar">
                        <div class="castle-top-side castle-top-left">
                            <button class="castle-ui-btn castle-home-btn" onclick="switchScreen('home')" aria-label="Back to Home">⌂</button>
                            <button class="castle-ui-btn" ${prevRegionIdx !== null ? `onclick="switchBuildingRegion(${prevRegionIdx})"` : 'disabled'} aria-label="Previous Castle">◀</button>
                        </div>
                        <div class="castle-top-center-cluster">
                            <div class="castle-pill-row">
                                <div class="castle-region-pill">${curRegion.icon || '🏰'} ${regionLabel}</div>
                            </div>
                            <div class="castle-bonus-row">
                                <div class="castle-progress-wheel castle-progress-wheel-mini" style="--pct:${completionPct}">
                                    <span>🏰</span>
                                </div>
                                <div class="castle-bonus-card castle-bonus-card-floating ${bonusStateClass}">
                                    <div class="castle-bonus-value">🎁 🪙 ${CASTLE_COMPLETION_BONUS.coins.toLocaleString()}  👑 ${CASTLE_COMPLETION_BONUS.crowns}</div>
                                    <div class="castle-bonus-meta">
                                        ${bonusControl}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="castle-top-side castle-top-right">
                            <button class="castle-ui-btn" ${nextRegionIdx !== null ? `onclick="switchBuildingRegion(${nextRegionIdx})"` : 'disabled'} aria-label="Next Castle">▶</button>
                        </div>
                    </div>

                    ${castle.unlocked
                ? `
                            <div class="build-objects-container castle-plot-grid ${completed ? 'castle-plot-grid-completed' : ''}">
                                ${buildHtml}
                            </div>
                        `
                : `
                            <div class="castle-lock-panel">
                                <div class="castle-lock-title">🔒 BUILDING LOCKED</div>
                                <div class="castle-lock-note">${lockInstruction}</div>
                            </div>
                        `
            }
                </div>
            </div>
        `;
    }

    els.mainContent.innerHTML = html;

    if (state.screen === 'kingdom-slot') {
        mountKingdomSlotEngine();
    } else {
        state.kingdomSlotEngine = null;
    }

    if (state.screen === 'casino-slot') {
        mountCasinoSlotEngine();
    } else {
        state.casinoSlotEngine = null;
    }
}

function updateTabs() {
    // No static tabs anymore - tabs are injected inline per screen
    // Nothing to update here, active state is set at render time
}

// --- ACTIONS & INTERACTIONS ---

function switchMode(newMode) {
    if (state.mode === newMode && state.screen === 'home') return;

    state.mode = newMode;
    state.screen = 'home';
    renderTopBar();

    // Out: shrink + fade to center
    els.mainContent.style.transition = 'opacity 0.12s ease, transform 0.12s ease';
    els.mainContent.style.opacity = '0';
    els.mainContent.style.transform = 'scale(0.93)';

    setTimeout(() => {
        renderScreen();
        // In: expand from center
        els.mainContent.style.transition = 'none';
        els.mainContent.style.opacity = '0';
        els.mainContent.style.transform = 'scale(1.05)';
        void els.mainContent.offsetWidth;
        els.mainContent.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
        els.mainContent.style.opacity = '1';
        els.mainContent.style.transform = 'scale(1)';
    }, 130);
}

function switchScreen(newScreen) {
    const goingBack = (newScreen === 'home');

    // Out: zoom out (going deeper) or zoom in (going back)
    els.mainContent.style.transition = 'opacity 0.1s ease, transform 0.1s ease';
    els.mainContent.style.opacity = '0';
    els.mainContent.style.transform = goingBack ? 'scale(1.06)' : 'scale(0.94)';

    setTimeout(() => {
        if (newScreen === 'castle') {
            state.buildingRegionIdx = getDefaultBuildingRegionIdx();
        }
        state.screen = newScreen;
        closePanels();
        renderScreen();
        // In: opposite direction
        els.mainContent.style.transition = 'none';
        els.mainContent.style.opacity = '0';
        els.mainContent.style.transform = goingBack ? 'scale(0.95)' : 'scale(1.06)';
        void els.mainContent.offsetWidth;
        els.mainContent.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
        els.mainContent.style.opacity = '1';
        els.mainContent.style.transform = 'scale(1)';
    }, 110);
}

function toggleUniversalPanel() {
    state.universalOpen = !state.universalOpen;
    if (!state.universalOpen) { closePanels(); return; }

    const H = 560;
    const nodeSpacing = 220;
    const leftPad = 140;
    const rightPad = 180;
    const W = Math.max(920, leftPad + ((state.regions.length - 1) * nodeSpacing) + rightPad);
    const midY = Math.round(H / 2);
    const yOffsets = [0, -92, 74, -58, 86, -44, 62, -72];

    const positions = state.regions.map((_, idx) => ({
        x: leftPad + (idx * nodeSpacing),
        y: midY + yOffsets[idx % yOffsets.length]
    }));

    const nodes = state.regions.map((region, idx) => {
        const pos = positions[idx];
        return {
            id: region.id,
            label: region.name.replace(/^[^\s]+\s/, ''),
            icon: region.icon || '🏰',
            x: pos.x,
            y: pos.y,
            unlocked: region.unlocked,
            isActive: state.currentRegionIdx === idx,
            regionIdx: idx
        };
    });
    const links = nodes.slice(0, -1).map((_, idx) => [idx, idx + 1]);

    // SVG lines
    let svgLines = links.map(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        const unlocked = nb.unlocked;
        return `<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}"
            stroke="${unlocked ? 'rgba(168,85,247,0.7)' : 'rgba(255,255,255,0.1)'}"
            stroke-width="${unlocked ? 2 : 1}"
            stroke-dasharray="${unlocked ? '6 3' : '4 6'}"
            class="${unlocked ? 'galaxy-link-active' : ''}" />`;
    }).join('');

    const stars = Array.from({ length: 70 }, () => {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const s = Math.random() * 1.5 + 0.5;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="white" opacity="${(Math.random() * 0.5 + 0.08).toFixed(2)}"/>`;
    }).join('');

    let svgNodes = nodes.map((n, i) => {
        const glow = n.isActive ? 'url(#glow-active)' : (n.unlocked ? 'url(#glow-unlocked)' : 'none');
        const color = UNIVERSAL_REGION_COLORS[n.id] || '#a78bfa';
        const r = 30;
        const opacity = n.unlocked ? 1 : 0.48;

        return `
        <g class="galaxy-node-g ${n.isActive ? 'galaxy-active' : ''} galaxy-clickable ${n.unlocked ? '' : 'galaxy-locked'}"
           data-x="${n.x}"
           style="opacity:${opacity}"
           onclick="onUniversalRegionClick(${n.regionIdx})" transform="translate(${n.x}, ${n.y})">
            ${n.isActive ? `<circle r="${r + 10}" fill="${color}" opacity="0.15" class="pulse-ring"/>` : ''}
            <circle r="${r}" fill="rgba(15,15,30,0.9)"
                stroke="${color}" stroke-width="${n.isActive ? 3 : 1.5}"
                filter="${glow}" />
            <text text-anchor="middle" dominant-baseline="central" font-size="18">${n.icon}</text>
            ${!n.unlocked ? `<text text-anchor="middle" dominant-baseline="central" font-size="13" y="1">🔒</text>` : ''}
            <text text-anchor="middle" y="${r + 16}" font-size="11" fill="${n.unlocked ? 'white' : '#6b7280'}"
                font-family="Outfit, sans-serif" font-weight="700">${n.label}</text>
            ${n.isActive ? `<text text-anchor="middle" y="${r + 28}" font-size="9" fill="${color}"
                font-family="Outfit, sans-serif" font-weight="700">● ACTIVE</text>` : ''}
        </g>`;
    }).join('');

    els.universalPanel.innerHTML = `
        <div class="galaxy-panel">
            <div class="galaxy-title">🌌 UNIVERSE MAP</div>
            <div class="galaxy-scroll" id="galaxy-scroll">
                <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="galaxy-svg">
                    <defs>
                        <filter id="glow-active" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
                            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                        <filter id="glow-unlocked" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                    </defs>
                    ${stars}
                    ${svgLines}
                    ${svgNodes}
                </svg>
            </div>
            <button class="galaxy-close-btn" onclick="closePanels()">✕ CLOSE</button>
        </div>
    `;

    els.overlay.classList.remove('hidden');
    els.universalPanel.classList.remove('hidden');

    requestAnimationFrame(() => {
        const scrollEl = document.getElementById('galaxy-scroll');
        if (!scrollEl) return;

        const activeNode = scrollEl.querySelector('.galaxy-node-g.galaxy-active');
        const activeX = activeNode ? Number(activeNode.getAttribute('data-x')) : (W / 2);
        const targetLeft = Math.max(
            0,
            Math.min(scrollEl.scrollWidth - scrollEl.clientWidth, activeX - (scrollEl.clientWidth / 2))
        );
        scrollEl.scrollTo({ left: targetLeft, behavior: 'smooth' });
    });
}

function getRegionUnlockHint(idx) {
    const targetRegion = state.regions[idx];
    if (!targetRegion) return "This region is not available yet.";
    if (targetRegion.unlocked) return "This region is already unlocked.";
    if (idx === 0) return "Home is available from the start.";

    const prerequisiteRegion = state.regions[idx - 1];
    if (!prerequisiteRegion) return "Clear the previous region boss to unlock this region.";

    const progressText = `Progress: ${prerequisiteRegion.clearedNodes}/${prerequisiteRegion.nodes} nodes cleared.`;
    return `Defeat the boss of ${prerequisiteRegion.name} to unlock ${targetRegion.name}.<br>${progressText}`;
}

function onUniversalRegionClick(idx) {
    const targetRegion = state.regions[idx];
    if (!targetRegion) return;

    if (targetRegion.unlocked) {
        travelToRegion(idx);
        return;
    }

    showPopup("🔒 REGION LOCKED", getRegionUnlockHint(idx), "closePopup();");
}

function travelToRegion(idx) {
    state.currentRegionIdx = idx;
    state.mode = 'kingdom';
    state.screen = 'home';
    closePanels();
    renderScreen();
}

function getCastleUnlockHint(idx) {
    const targetRegion = state.regions[idx];
    if (!targetRegion) return "This castle is not available yet.";
    if (targetRegion.castle.unlocked) return "This castle is already unlocked.";
    if (idx === 0) return "Home Castle is available from the start.";

    const prerequisiteRegion = state.regions[idx - 1];
    if (!prerequisiteRegion) return "Clear the previous region boss to unlock this castle.";

    const prerequisiteName = prerequisiteRegion.name;
    const targetName = targetRegion.name;
    const progressText = `Progress: ${prerequisiteRegion.clearedNodes}/${prerequisiteRegion.nodes} nodes cleared.`;
    return `Defeat the boss of ${prerequisiteName} to unlock ${targetName} Castle.<br>${progressText}`;
}

function switchBuildingRegion(idx) {
    const targetRegion = state.regions[idx];
    if (!targetRegion) return;

    if (!targetRegion.castle.unlocked) {
        showPopup("🔒 CASTLE LOCKED", getCastleUnlockHint(idx), "closePopup();");
        return;
    }

    state.buildingRegionIdx = idx;
    renderScreen();
}

function closePanels() {
    state.universalOpen = false;
    els.overlay.classList.add('hidden');
    els.universalPanel.classList.add('hidden');
    closePopup();
}

els.overlay.addEventListener('click', closePanels);

// Casino carousel swipe support
let _touchStartX = 0;
els.mainContent.addEventListener('touchstart', e => {
    _touchStartX = e.touches[0].clientX;
}, { passive: true });
els.mainContent.addEventListener('touchend', e => {
    if (state.screen !== 'casino-main') return;
    const dx = e.changedTouches[0].clientX - _touchStartX;
    if (Math.abs(dx) > 50) {
        showToast(dx < 0 ? 'Next ➡' : '⬅ Prev');
    }
}, { passive: true });

function changeBet(amt) {
    if (state.screen !== 'casino-slot' || state.casinoSpinBusy) return;
    const minBet = 500;
    const maxBet = 20000;
    const nextBet = Math.max(minBet, Math.min(maxBet, state.casinoBet + amt));
    if (nextBet === state.casinoBet) return;
    state.casinoBet = nextBet;
    renderScreen();
}

function claimNodeMission(missionId) {
    const curRegion = state.regions[state.currentRegionIdx];
    if (!curRegion) return;
    if (state.kingdomSpinBusy) {
        showToast('Wait for spin to finish.');
        return;
    }

    const nodeNum = getRegionCurrentNode(curRegion);
    const missions = ensureNodeMissions(state.currentRegionIdx, nodeNum);
    const mission = missions.find((item) => item.id === missionId);
    if (!mission) return;

    if (mission.status === MISSION_STATUS.CLAIMED) {
        showToast('Mission already claimed.');
        return;
    }
    if (mission.status !== MISSION_STATUS.COMPLETED) {
        showToast('Mission is not complete yet.');
        return;
    }

    mission.status = MISSION_STATUS.CLAIMED;
    const rewardCoins = Math.max(0, Number(mission.reward?.coins) || 0);
    const rewardCrowns = Math.max(0, Number(mission.reward?.crowns) || 0);
    state.coins += rewardCoins;
    state.crowns += rewardCrowns;

    renderTopBar();
    renderScreen();

    if (rewardCoins > 0) {
        spawnFloatingReward(`🪙 +${rewardCoins.toLocaleString()}`, window.innerWidth / 2 - 70, window.innerHeight / 2);
    }
    if (rewardCrowns > 0) {
        setTimeout(() => {
            spawnFloatingReward(`👑 +${rewardCrowns}`, window.innerWidth / 2 + 70, window.innerHeight / 2 + 20);
        }, 120);
    }

    const rewardParts = [];
    if (rewardCoins > 0) rewardParts.push(`+${rewardCoins.toLocaleString()} coins`);
    if (rewardCrowns > 0) rewardParts.push(`+${rewardCrowns} crown${rewardCrowns > 1 ? 's' : ''}`);
    showToast(`🎯 Mission claimed${rewardParts.length > 0 ? ` · ${rewardParts.join(', ')}` : ''}`);
}

function claimChest(chestIdx) {
    const curRegion = state.regions[state.currentRegionIdx];
    const chest = curRegion?.chests?.[chestIdx];
    if (!chest) return;

    const chestStatus = getChestStatus(curRegion, chestIdx);
    if (chestStatus === 'locked') {
        showToast(`Chest locked. Clear node ${chest.fromNode} first.`);
        return;
    }
    if (chestStatus === 'claimed') {
        showToast('Chest already claimed.');
        return;
    }

    chest.claimed = true;
    state.coins += chest.reward.coins;
    state.crowns += chest.reward.crowns;

    renderTopBar();
    renderScreen();

    spawnFloatingReward(`🪙 +${chest.reward.coins.toLocaleString()}`, window.innerWidth / 2 - 70, window.innerHeight / 2);
    setTimeout(() => spawnFloatingReward(`👑 +${chest.reward.crowns}`, window.innerWidth / 2 + 70, window.innerHeight / 2 + 20), 120);
    showToast(`🎁 Chest opened: +${chest.reward.coins.toLocaleString()} coins, +${chest.reward.crowns} crown`);
}

function showPopup(title, msg, onContinueStr = "closePopup()", isBoss = false) {
    let border = isBoss ? '#ef4444' : 'var(--gold)';
    els.popup.innerHTML = `
        <h2 style="color: ${border}">${title}</h2>
        <p>${msg}</p>
        <button class="btn" style="background: linear-gradient(to bottom, #10b981, #047857); border-color: #34d399;" onclick="${onContinueStr}">Continue</button>
    `;
    els.popup.style.borderColor = border;
    if (isBoss) { els.popup.style.boxShadow = '0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(239, 68, 68, 0.5)'; }
    else { els.popup.style.boxShadow = ''; }
    // Remove hidden FIRST, then add show so display:none is cleared before opacity animates
    els.overlay.classList.remove('hidden');
    els.popup.classList.remove('hidden');
    // Force reflow so transition triggers
    void els.popup.offsetWidth;
    els.popup.classList.add('show');
}

function closePopup() {
    els.popup.classList.remove('show');
    els.overlay.classList.add('hidden');
    // Add hidden back after transition ends
    setTimeout(() => { els.popup.classList.add('hidden'); }, 350);
}

function spawnFloatingReward(emoji, x, y) {
    const el = document.createElement('div');
    el.className = 'anim-coin';
    el.innerText = emoji;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000); // Increased duration to 2s
}

function showToast(msg) {
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.innerText = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

function selectMachine(idx) {
    state.selectedMachine = idx;
}

function spinCasinoSlot() {
    if (state.screen !== 'casino-slot') return;
    if (state.casinoSpinBusy) return;

    const m = state.casinoMachines[state.selectedMachine];
    const bet = state.casinoBet;

    if (state.coins < bet) {
        showPopup("🚫 NOT ENOUGH COINS", `Need ${bet.toLocaleString()} coins to spin.`);
        return;
    }

    if (!state.casinoSlotEngine) mountCasinoSlotEngine();
    if (!state.casinoSlotEngine) {
        showToast('Casino machine is not ready');
        return;
    }

    state.casinoSpinBusy = true;
    const spinButton = document.getElementById('casino-spin-btn');
    if (spinButton) spinButton.disabled = true;

    state.coins -= bet;
    renderTopBar();
    spawnFloatingReward(`🪙 -${bet.toLocaleString()}`, window.innerWidth / 2 - 20, window.innerHeight / 2 + 30);

    state.casinoSlotEngine.spin().then((symbols) => {
        const { multiplier, xpGained, resultLabel } = evaluateCasinoSpinSymbols(symbols, state.selectedMachine);
        const wonCoins = Math.floor(bet * multiplier);

        if (wonCoins > 0) {
            state.coins += wonCoins;
            spawnFloatingReward(`🪙 +${wonCoins.toLocaleString()}`, window.innerWidth / 2 - 50, window.innerHeight / 2);
        } else {
            spawnFloatingReward('💨 MISS', window.innerWidth / 2 - 10, window.innerHeight / 2);
        }

        state.casinoXP += xpGained;
        spawnFloatingReward(`+${xpGained} XP`, window.innerWidth / 2 + 70, window.innerHeight / 2 + 40);
        showToast(`${m.icon} ${resultLabel}${wonCoins > 0 ? ` · +${wonCoins.toLocaleString()}` : ''}`);

        const levelResult = resolveCasinoLevelUps();
        renderTopBar();
        renderScreen();

        if (levelResult.levelsGained > 0) {
            const unlockMsg = levelResult.unlockedMachines.length > 0
                ? `<br>🎉 Unlocked: <b>${levelResult.unlockedMachines.map(mm => mm.icon + ' ' + mm.name).join(', ')}</b>!`
                : '';
            setTimeout(() => {
                showPopup(
                    `⭐ LEVEL UP! LV ${state.casinoLevel} ⭐`,
                    `+${levelResult.totalBonusCoins.toLocaleString()} Coins bonus!${unlockMsg}`,
                    "closePopup();",
                    true
                );
            }, 400);
        }
    }).catch((err) => {
        console.error('casino slot spin error', err);
        state.coins += bet;
        renderTopBar();
        showToast('Spin failed');
    }).finally(() => {
        state.casinoSpinBusy = false;
        const btn = document.getElementById('casino-spin-btn');
        if (btn && state.screen === 'casino-slot' && state.coins >= state.casinoBet) {
            btn.disabled = false;
        }
    });
}

function spinKingdomSlot() {
    const curRegion = state.regions[state.currentRegionIdx];
    if (isRegionCleared(curRegion)) {
        showPopup("🏆 REGION COMPLETE", "This region is already cleared.");
        return;
    }

    if (state.kingdomSpinBusy) return;
    if (!state.kingdomSlotEngine) mountKingdomSlotEngine();
    if (!state.kingdomSlotEngine) {
        showToast('Slot machine is not ready');
        return;
    }

    state.kingdomSpinBusy = true;
    const spinButton = document.getElementById('kingdom-spin-btn');
    if (spinButton) spinButton.disabled = true;

    state.kingdomSlotEngine.spin().then((symbols) => {
        const { wonPower, wonCoins } = evaluateKingdomSpinSymbols(symbols);
        const activeNode = getRegionCurrentNode(curRegion);
        const isBoss = (activeNode === curRegion.nodes);

        state.coins += wonCoins;
        const newlyCompletedMissions = applyMissionProgress(
            state.currentRegionIdx,
            activeNode,
            { wonPower, wonCoins, spinCount: 1 }
        );

        spawnFloatingReward(`🪙 +${wonCoins}`, window.innerWidth / 2 - 50, window.innerHeight / 2);
        setTimeout(() => spawnFloatingReward(`⚔️ +${wonPower}`, window.innerWidth / 2 + 50, window.innerHeight / 2), 200);

        if (newlyCompletedMissions.length === 1) {
            showToast(`✅ Mission complete: ${newlyCompletedMissions[0].title}`);
        } else if (newlyCompletedMissions.length > 1) {
            showToast(`✅ ${newlyCompletedMissions.length} missions completed`);
        }

        if (isCurrentNodeMissionCleared(state.currentRegionIdx, activeNode)) {
            const missionAutoClaim = claimCompletedMissionsForNode(state.currentRegionIdx, activeNode);
            if (missionAutoClaim.rewardCoins > 0) {
                state.coins += missionAutoClaim.rewardCoins;
                spawnFloatingReward(`🪙 +${missionAutoClaim.rewardCoins.toLocaleString()}`, window.innerWidth / 2 - 90, window.innerHeight / 2 - 20);
            }
            if (missionAutoClaim.rewardCrowns > 0) {
                state.crowns += missionAutoClaim.rewardCrowns;
                setTimeout(() => {
                    spawnFloatingReward(`👑 +${missionAutoClaim.rewardCrowns}`, window.innerWidth / 2 + 90, window.innerHeight / 2);
                }, 120);
            }

            curRegion.clearedNodes += 1;
            state.crowns += 1;

            renderTopBar();
            renderScreen();

            setTimeout(() => {
                let popupTitle = "✨ NODE CLEARED ✨";
                let popupMsg = "+1 Crown earned.";
                let continueAction = "switchScreen('home'); closePopup();";
                if (missionAutoClaim.claimedCount > 0) {
                    popupMsg += `<br>🎯 Mission rewards auto-claimed (${missionAutoClaim.claimedCount}).`;
                }

                if (isBoss && isRegionCleared(curRegion)) {
                    popupTitle = "🔥 REGION CLEARED 🔥";
                    popupMsg = "+1 Crown (node).";
                    if (missionAutoClaim.claimedCount > 0) {
                        popupMsg += `<br>🎯 Mission rewards auto-claimed (${missionAutoClaim.claimedCount}).`;
                    }

                    if (state.currentRegionIdx < state.regions.length - 1) {
                        const nextIdx = state.currentRegionIdx + 1;
                        state.regions[nextIdx].unlocked = true;
                        state.regions[nextIdx].castle.unlocked = true;
                        popupMsg += `<br><b>${state.regions[nextIdx].name}</b> unlocked.`;
                        popupMsg += `<br><b>${state.regions[nextIdx].name} Building</b> unlocked.`;
                        continueAction = `travelToRegion(${nextIdx}); closePopup();`;
                    } else {
                        popupMsg += "<br><b>All regions conquered!</b>";
                    }
                }

                renderTopBar();
                renderScreen();
                showPopup(popupTitle, popupMsg, continueAction, isBoss);
            }, 900);
        } else {
            renderTopBar();
            renderScreen();
        }
    }).catch((err) => {
        console.error('kingdom slot spin error', err);
        showToast('Spin failed');
    }).finally(() => {
        state.kingdomSpinBusy = false;
        const btn = document.getElementById('kingdom-spin-btn');
        if (btn && state.screen === 'kingdom-slot' && !isRegionCleared(state.regions[state.currentRegionIdx])) {
            btn.disabled = false;
        }
    });
}

function upgradeCastleSlot(slotIdx) {
    const curRegion = state.regions[state.buildingRegionIdx];
    const castle = curRegion.castle;
    if (!castle.unlocked) {
        showPopup("🔒 BUILDING LOCKED", getCastleUnlockHint(state.buildingRegionIdx));
        return;
    }

    const slot = castle.slots[slotIdx];
    if (!slot || slot.level >= slot.maxLevel) return;

    const cost = getSlotUpgradeCost(slot);
    if (state.crowns < cost) {
        showPopup("🚫 NOT ENOUGH CROWNS", `Need ${cost} crowns to upgrade ${slot.name}.`);
        return;
    }

    state.crowns -= cost;
    slot.level += 1;

    renderTopBar();
    renderScreen();
    spawnFloatingReward(`🏗 ${slot.name} LV ${slot.level}`, window.innerWidth / 2, window.innerHeight / 2);

    if (isCastleCompleted(castle) && !castle.completionClaimed) {
        renderScreen();
        showToast('🏰 Castle completed! Claim bonus from top panel.');
    }
}

function claimCastleCompletionBonus() {
    const curRegion = state.regions[state.buildingRegionIdx];
    const castle = curRegion?.castle;
    if (!castle || !castle.unlocked) return;
    if (!isCastleCompleted(castle) || castle.completionClaimed) return;

    castle.completionClaimed = true;
    state.coins += CASTLE_COMPLETION_BONUS.coins;
    state.crowns += CASTLE_COMPLETION_BONUS.crowns;

    renderTopBar();
    renderScreen();
    spawnFloatingReward(`🪙 +${CASTLE_COMPLETION_BONUS.coins.toLocaleString()}`, window.innerWidth / 2 - 60, window.innerHeight / 2);
    setTimeout(() => spawnFloatingReward(`👑 +${CASTLE_COMPLETION_BONUS.crowns}`, window.innerWidth / 2 + 60, window.innerHeight / 2 + 20), 150);
    showPopup(
        "🎁 BONUS CLAIMED",
        `🪙 +${CASTLE_COMPLETION_BONUS.coins.toLocaleString()}<br>👑 +${CASTLE_COMPLETION_BONUS.crowns}`,
        "closePopup();",
        true
    );
}

// Initial Render
updateTabs();
renderTopBar();
renderScreen();
