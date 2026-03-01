const CASTLE_SLOT_MAX_LEVEL = 3;
const CASTLE_COMPLETION_BONUS = { coins: 25000, crowns: 8 };
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

function createInitialRegions() {
    return [
        { id: 'home', name: '🏠 Home', icon: '🏠', unlocked: true, nodes: 3 },
        { id: 'desert', name: '🏜 Desert', icon: '🏜', unlocked: false, nodes: 3 },
        { id: 'snow', name: '❄ Snow', icon: '❄️', unlocked: false, nodes: 3 }
    ].map((region, idx) => {
        const castle = createRegionCastle();
        if (idx === 0) castle.unlocked = true; // Home building is available from start
        return {
            ...region,
            clearedNodes: 0,
            nodeProgress: 0,
            castle
        };
    });
}

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

// Helper to get current node's goal
function getNodeGoal(regionIdx, nodeNum) {
    const region = state.regions[regionIdx];
    if (nodeNum === region.nodes) {
        // Boss Node
        return 50;
    }
    // Normal Node
    return 10 + (nodeNum * 5) + (regionIdx * 20);
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
                        <div class="menu-item">🏆 Tournament</div>
                        <div class="menu-item">🎁 Events</div>
                        <div class="menu-item" style="color:#fbbf24;">📘 VIP</div>
                    </div>
                </div>
            `;
        } else {
            // --- KINGDOM HOME (in-place map) ---
            const curRegion = state.regions[state.currentRegionIdx];
            const activeNode = getRegionCurrentNode(curRegion);
            const regionCleared = isRegionCleared(curRegion);
            const regionThemes = {
                home: { border: '#22c55e', glow: 'rgba(34,197,94,0.55)', bg: 'rgba(20,83,45,0.18)', bossBorder: '#f87171' },
                desert: { border: '#f59e0b', glow: 'rgba(245,158,11,0.55)', bg: 'rgba(120,53,15,0.2)', bossBorder: '#f87171' },
                snow: { border: '#67e8f9', glow: 'rgba(103,232,249,0.55)', bg: 'rgba(14,116,144,0.2)', bossBorder: '#f87171' }
            };
            const theme = regionThemes[curRegion.id] || regionThemes.home;

            const nextRegion = state.currentRegionIdx < state.regions.length - 1 ? state.regions[state.currentRegionIdx + 1] : null;
            const nextArrow = nextRegion && nextRegion.unlocked
                ? `<button class="map-nav-arrow" onclick="travelToRegion(${state.currentRegionIdx + 1})">&#9654;</button>`
                : `<button class="map-nav-arrow invisible">&#9654;</button>`;
            const prevRegion = state.currentRegionIdx > 0 ? state.regions[state.currentRegionIdx - 1] : null;
            const prevArrow = prevRegion && prevRegion.unlocked
                ? `<button class="map-nav-arrow" onclick="travelToRegion(${state.currentRegionIdx - 1})">&#9664;</button>`
                : null;

            let mapHTML = '';
            let nodesInRow = 0;
            for (let i = 1; i <= curRegion.nodes; i++) {
                let status = 'locked', onclick = '';
                let goal = getNodeGoal(state.currentRegionIdx, i);
                let isBoss = (i === curRegion.nodes);
                if (i <= curRegion.clearedNodes) {
                    status = 'unlocked';
                    onclick = "switchScreen('kingdom-slot')";
                } else if (!regionCleared && i === activeNode) {
                    status = 'current';
                    onclick = "switchScreen('kingdom-slot')";
                }
                let nodeStyle = '';
                if (isBoss) nodeStyle = `border-color: ${theme.bossBorder}; box-shadow: 0 0 25px rgba(239,68,68,0.7);`;
                else if (status === 'unlocked') nodeStyle = `border-color: ${theme.border}; box-shadow: 0 0 20px ${theme.glow}; background: ${theme.border}22;`;
                else if (status === 'current') nodeStyle = `border-color: ${theme.border}; box-shadow: 0 0 35px ${theme.glow}; background: radial-gradient(circle, ${theme.border}88, ${theme.border}33);`;
                let extraClass = isBoss ? 'boss-node' : '';
                let innerText = isBoss ? '☠️' : i;
                let pathLine = (i !== curRegion.nodes && nodesInRow < 4) ? '<div class="path-line"></div>' : '';
                if (nodesInRow === 0) mapHTML += '<div class="node-row">';
                const tooltip = i <= curRegion.clearedNodes ? 'Cleared' : `Goal: ${goal} ⚔️`;
                mapHTML += `<div class="node-wrapper tooltip" data-tip="${tooltip}"><div class="level-node ${status} ${extraClass}" style="${nodeStyle}" ${onclick ? 'onclick="' + onclick + '"' : ''}>${innerText}${pathLine}</div></div>`;
                nodesInRow++;
                if (nodesInRow === 5 || i === curRegion.nodes) { mapHTML += '</div>'; nodesInRow = 0; }
            }

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
        html = `
            <div class="screen active slot-screen">
                <div class="slot-header">
                    <button class="back-btn" onclick="switchScreen('home')">◀ BACK</button>
                    <div class="slot-header-content" style="color:${m.color}">${m.icon} ${m.name}</div>
                </div>
                <div class="slot-reels-container">
                    <div class="reels-placeholder" style="border-color:${m.color}; box-shadow: 0 0 30px ${m.color}33, inset 0 0 50px rgba(0,0,0,0.8);">${m.icon}${m.icon}${m.icon}</div>
                    <div class="bet-controls">
                        <button onclick="changeBet(-1000)">-</button>
                        <div class="bet-amount">1000</div>
                        <button onclick="changeBet(1000)">+</button>
                    </div>
                    <button class="spin-btn" style="background: linear-gradient(to bottom, ${m.color}, ${m.color}aa); border-color: ${m.color}; box-shadow: 0 10px 0 ${m.color}55, 0 15px 20px rgba(0,0,0,0.6);" onclick="spinCasinoSlot()">SPIN</button>
                </div>
            </div>
        `;
    } else if (state.screen === 'kingdom-map') {
        const curRegion = state.regions[state.currentRegionIdx];
        const activeNode = getRegionCurrentNode(curRegion);
        const regionCleared = isRegionCleared(curRegion);

        // Per-region themes
        const regionThemes = {
            home: { border: '#22c55e', glow: 'rgba(34,197,94,0.55)', bg: 'rgba(20,83,45,0.18)', bossBorder: '#f87171' },
            desert: { border: '#f59e0b', glow: 'rgba(245,158,11,0.55)', bg: 'rgba(120,53,15,0.2)', bossBorder: '#f87171' },
            snow: { border: '#67e8f9', glow: 'rgba(103,232,249,0.55)', bg: 'rgba(14,116,144,0.2)', bossBorder: '#f87171' }
        };
        const theme = regionThemes[curRegion.id] || regionThemes.home;

        // Arrow nav: can go to adjacent unlocked regions
        const prevRegion = state.currentRegionIdx > 0 ? state.regions[state.currentRegionIdx - 1] : null;
        const nextRegion = state.currentRegionIdx < state.regions.length - 1 ? state.regions[state.currentRegionIdx + 1] : null;
        const prevArrow = prevRegion && prevRegion.unlocked
            ? `<button class="map-nav-arrow" onclick="travelToRegion(${state.currentRegionIdx - 1})">&#9664;</button>`
            : `<button class="map-nav-arrow invisible">&#9664;</button>`;
        const nextArrow = nextRegion && nextRegion.unlocked
            ? `<button class="map-nav-arrow" onclick="travelToRegion(${state.currentRegionIdx + 1})">&#9654;</button>`
            : `<button class="map-nav-arrow invisible">&#9654;</button>`;

        let mapHTML = '';
        let nodesInRow = 0;

        for (let i = 1; i <= curRegion.nodes; i++) {
            let status = 'locked';
            let onclick = '';
            let goal = getNodeGoal(state.currentRegionIdx, i);
            let isBoss = (i === curRegion.nodes);

            if (i <= curRegion.clearedNodes) {
                status = 'unlocked';
                onclick = "switchScreen('kingdom-slot')";
            } else if (!regionCleared && i === activeNode) {
                status = 'current';
                onclick = "switchScreen('kingdom-slot')";
            }

            // Per-region inline style for border/glow
            let nodeStyle = '';
            if (isBoss) {
                nodeStyle = `border-color: ${theme.bossBorder}; box-shadow: 0 0 25px rgba(239,68,68,0.7);`;
            } else if (status === 'unlocked') {
                nodeStyle = `border-color: ${theme.border}; box-shadow: 0 0 20px ${theme.glow}; background: ${theme.border}22;`;
            } else if (status === 'current') {
                nodeStyle = `border-color: ${theme.border}; box-shadow: 0 0 35px ${theme.glow}; background: radial-gradient(circle, ${theme.border}88, ${theme.border}33);`;
            }

            let extraClass = isBoss ? 'boss-node' : '';
            let innerText = isBoss ? '☠️' : i;
            let pathLine = (i !== curRegion.nodes && nodesInRow < 4) ? '<div class="path-line"></div>' : '';

            if (nodesInRow === 0) mapHTML += '<div class="node-row">';

            const tooltip = i <= curRegion.clearedNodes ? 'Cleared' : `Goal: ${goal} ⚔️`;
            mapHTML += `<div class="node-wrapper tooltip" data-tip="${tooltip}">
                            <div class="level-node ${status} ${extraClass}" style="${nodeStyle}" ${onclick ? 'onclick="' + onclick + '"' : ''}>${innerText}${pathLine}</div>
                        </div>`;

            nodesInRow++;
            if (nodesInRow === 5 || i === curRegion.nodes) {
                mapHTML += '</div>';
                nodesInRow = 0;
            }
        }

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
        const regionThemes = {
            home: { accent: '#22c55e', reelBorder: '#22c55e', reelGlow: 'rgba(34,197,94,0.25)' },
            desert: { accent: '#f59e0b', reelBorder: '#f59e0b', reelGlow: 'rgba(245,158,11,0.25)' },
            snow: { accent: '#67e8f9', reelBorder: '#67e8f9', reelGlow: 'rgba(103,232,249,0.25)' }
        };
        const theme = regionThemes[curRegion.id] || regionThemes.home;

        const curGoal = getNodeGoal(state.currentRegionIdx, activeNode);
        const pct = regionCleared ? 100 : Math.min(100, (curRegion.nodeProgress / curGoal) * 100);
        const isBoss = (activeNode === curRegion.nodes);
        const headerColor = isBoss ? '#ef4444' : theme.accent;
        const headerText = regionCleared
            ? 'REGION CLEARED'
            : `${isBoss ? '☠️ BOSS · ' : ''}${curRegion.nodeProgress} / ${curGoal} ⚔️`;

        html = `
            <div class="screen active slot-screen">
                <div class="slot-header" style="background: rgba(0,0,0,0.8);">
                    <button class="back-btn" onclick="switchScreen('home')">◀ BACK</button>
                    <div class="slot-region-tag" style="color: ${theme.accent};">${curRegion.name}</div>
                    <div class="slot-header-content" style="color: ${headerColor};">${headerText}</div>
                </div>
                <div class="slot-reels-container">
                    <div class="kingdom-slot-extras">
                        <div class="crown-progress-container">
                            <div class="crown-progress-bar ${isBoss ? 'boss-bar' : ''}" style="width: ${pct}%; background: linear-gradient(90deg, ${theme.accent}aa, ${theme.accent});" id="k-crown-bar"></div>
                            <div class="crown-progress-text" id="k-crown-txt">${regionCleared ? 'Completed' : `${curRegion.nodeProgress} / ${curGoal} Power`}</div>
                        </div>
                    </div>

                    <div class="reels-placeholder" style="border-color: ${theme.reelBorder}; box-shadow: 0 0 30px ${theme.reelGlow}, inset 0 0 50px rgba(0,0,0,0.8);">⚔️🛡️⚔️</div>

                    <div class="bet-controls">
                        <button onclick="changeBet(-500)">-</button>
                        <div class="bet-amount">500</div>
                        <button onclick="changeBet(500)">+</button>
                    </div>

                    <button class="spin-btn" style="background: linear-gradient(to bottom, ${theme.accent}, ${theme.accent}aa); border-color: ${theme.accent}; box-shadow: 0 10px 0 ${theme.accent}55, 0 15px 20px rgba(0,0,0,0.6);" ${regionCleared ? 'disabled' : 'onclick="spinKingdomSlot()"'}>${regionCleared ? 'CLEARED' : 'SPIN'}</button>
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
        const unlockedNavIdx = unlockedCastleIdxs.indexOf(state.buildingRegionIdx);
        const prevRegionIdx = unlockedNavIdx > 0 ? unlockedCastleIdxs[unlockedNavIdx - 1] : null;
        const nextRegionIdx = unlockedNavIdx >= 0 && unlockedNavIdx < unlockedCastleIdxs.length - 1
            ? unlockedCastleIdxs[unlockedNavIdx + 1]
            : null;

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
        const castleTabs = unlockedCastleIdxs.map((idx) => {
            const region = state.regions[idx];
            const active = idx === state.buildingRegionIdx;
            return `<button class="castle-region-tab ${active ? 'active' : ''}" onclick="switchBuildingRegion(${idx})">${region.icon || '🏰'} ${region.name.replace(/^[^\\s]+\\s/, '')}</button>`;
        }).join('');
        const bonusState = !castle.unlocked ? 'LOCKED' : (castle.completionClaimed ? 'CLAIMED' : 'PENDING');
        const bonusStateClass = !castle.unlocked ? 'locked' : (castle.completionClaimed ? 'claimed' : 'pending');

        html = `
            <div class="screen active castle-bg">
                <div class="castle-shell">
                    <div class="castle-hud castle-hud-compact">
                        <button class="castle-back-btn" onclick="switchScreen('home')" aria-label="Back">⮌</button>
                        <div class="castle-hud-center">
                            <div class="castle-region-pill">${curRegion.name}</div>
                            <div class="castle-progress-wheel" style="--pct:${completionPct}">
                                <span>🏰</span>
                            </div>
                            <div class="castle-progress-pips">
                                ${castle.slots.map((slot) => `<span class="castle-pip ${slot.level >= slot.maxLevel ? 'on' : ''}"></span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="castle-region-nav">
                        <button class="castle-region-arrow" ${prevRegionIdx !== null ? `onclick="switchBuildingRegion(${prevRegionIdx})"` : 'disabled'}>◀</button>
                        <div class="castle-region-tabs">${castleTabs}</div>
                        <button class="castle-region-arrow" ${nextRegionIdx !== null ? `onclick="switchBuildingRegion(${nextRegionIdx})"` : 'disabled'}>▶</button>
                    </div>
                    <div class="castle-bonus-card ${bonusStateClass}">
                        <div class="castle-bonus-title">🎁 Completion Bonus</div>
                        <div class="castle-bonus-value">🪙 ${CASTLE_COMPLETION_BONUS.coins.toLocaleString()} · 👑 ${CASTLE_COMPLETION_BONUS.crowns}</div>
                        <div class="castle-bonus-state">${bonusState}</div>
                    </div>

                    ${castle.unlocked
                ? `
                            <div class="build-objects-container castle-plot-grid">
                                ${buildHtml}
                            </div>
                            ${completed ? '<div class="castle-complete-banner">🏆 CASTLE COMPLETED</div>' : ''}
                        `
                : `
                            <div class="castle-lock-panel">
                                <div class="castle-lock-title">🔒 BUILDING LOCKED</div>
                                <div class="castle-lock-note">Defeat the boss of ${curRegion.name} to unlock this castle.</div>
                            </div>
                        `
            }
                </div>
            </div>
        `;
    }

    els.mainContent.innerHTML = html;
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

    const W = 900, H = 560;
    const positions = [
        { x: 200, y: 280 },
        { x: 460, y: 160 },
        { x: 720, y: 300 }
    ];
    const nodes = state.regions.map((region, idx) => {
        const pos = positions[idx] || { x: 180 + (idx * 220), y: 180 + ((idx % 2) * 120) };
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

    let svgNodes = nodes.map((n, i) => {
        const glow = n.isActive ? 'url(#glow-active)' : (n.unlocked ? 'url(#glow-unlocked)' : 'none');
        const color = n.id === 'home' ? '#22c55e' : (n.id === 'desert' ? '#f59e0b' : '#67e8f9');
        const r = 30;
        const opacity = n.unlocked ? 1 : 0.35;
        const clickable = n.unlocked;
        const onclick = n.unlocked ? `travelToRegion(${n.regionIdx}); closePanels();` : '';

        return `
        <g class="galaxy-node-g ${n.isActive ? 'galaxy-active' : ''} ${clickable ? 'galaxy-clickable' : ''}"
           style="opacity:${opacity}"
           onclick="${onclick}" transform="translate(${n.x}, ${n.y})">
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
                    <!-- Starfield dots -->
                    ${Array.from({ length: 40 }, () => {
        const x = Math.random() * W, y = Math.random() * H;
        const s = Math.random() * 1.5 + 0.5;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="white" opacity="${(Math.random() * 0.5 + 0.1).toFixed(2)}"/>`;
    }).join('')}
                </defs>
                ${svgLines}
                ${svgNodes}
            </svg>
            <button class="galaxy-close-btn" onclick="closePanels()">✕ CLOSE</button>
        </div>
    `;

    els.overlay.classList.remove('hidden');
    els.universalPanel.classList.remove('hidden');
}

function travelToRegion(idx) {
    state.currentRegionIdx = idx;
    state.mode = 'kingdom';
    state.screen = 'home';
    closePanels();
    renderScreen();
}

function switchBuildingRegion(idx) {
    if (!state.regions[idx] || !state.regions[idx].castle.unlocked) return;
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
    // Visual dummy
    console.log('Change bet', amt);
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
    const m = state.casinoMachines[state.selectedMachine];
    const wonCoins = 2000 + Math.floor(Math.random() * 3000);
    const xpGained = 15 + (state.selectedMachine * 5); // higher machines give more XP

    state.coins += wonCoins;
    state.casinoXP += xpGained;

    spawnFloatingReward(`🪙 +${wonCoins.toLocaleString()}`, window.innerWidth / 2 - 40, window.innerHeight / 2);
    spawnFloatingReward(`+${xpGained} XP`, window.innerWidth / 2 + 60, window.innerHeight / 2 + 40);

    // Level up check
    if (state.casinoXP >= state.casinoXPToNext) {
        state.casinoXP -= state.casinoXPToNext;
        state.casinoLevel++;
        state.casinoXPToNext = state.casinoLevel * 80;
        const bonusCoins = state.casinoLevel * 5000;
        state.coins += bonusCoins;

        // Check for newly unlocked machines
        const newMachines = state.casinoMachines.filter(mm => mm.unlockLevel === state.casinoLevel);
        let unlockMsg = newMachines.length > 0
            ? `<br>🎉 Unlocked: <b>${newMachines.map(mm => mm.icon + ' ' + mm.name).join(', ')}</b>!`
            : '';

        renderTopBar();
        renderScreen();
        setTimeout(() => {
            showPopup(
                `⭐ LEVEL UP! LV ${state.casinoLevel} ⭐`,
                `+${bonusCoins.toLocaleString()} Coins bonus!${unlockMsg}`,
                "closePopup();",
                true
            );
        }, 400);
        return;
    }

    renderTopBar();
}

function spinKingdomSlot() {
    const curRegion = state.regions[state.currentRegionIdx];
    if (isRegionCleared(curRegion)) {
        showPopup("🏆 REGION COMPLETE", "This region is already cleared.");
        return;
    }

    const wonCoins = 2000;
    const wonPower = Math.floor(Math.random() * 4) + 1;
    const activeNode = getRegionCurrentNode(curRegion);
    const curGoal = getNodeGoal(state.currentRegionIdx, activeNode);
    const isBoss = (activeNode === curRegion.nodes);

    state.coins += wonCoins;
    curRegion.nodeProgress += wonPower;

    spawnFloatingReward(`🪙 +${wonCoins}`, window.innerWidth / 2 - 50, window.innerHeight / 2);
    setTimeout(() => spawnFloatingReward(`⚔️ +${wonPower}`, window.innerWidth / 2 + 50, window.innerHeight / 2), 200);

    if (curRegion.nodeProgress >= curGoal) {
        curRegion.nodeProgress = 0;
        curRegion.clearedNodes += 1;
        state.crowns += 1;

        renderTopBar();
        renderScreen();

        setTimeout(() => {
            let popupTitle = "✨ NODE CLEARED ✨";
            let popupMsg = "+1 Crown earned.";
            let continueAction = "switchScreen('home'); closePopup();";

            if (isBoss && isRegionCleared(curRegion)) {
                popupTitle = "🔥 REGION CLEARED 🔥";
                curRegion.castle.unlocked = true;
                popupMsg = `+1 Crown (node).<br><b>${curRegion.name} Building</b> unlocked.`;

                if (state.currentRegionIdx < state.regions.length - 1) {
                    const nextIdx = state.currentRegionIdx + 1;
                    state.regions[nextIdx].unlocked = true;
                    popupMsg += `<br><b>${state.regions[nextIdx].name}</b> unlocked.`;
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
}

function upgradeCastleSlot(slotIdx) {
    const curRegion = state.regions[state.buildingRegionIdx];
    const castle = curRegion.castle;
    if (!castle.unlocked) {
        showPopup("🔒 BUILDING LOCKED", `Defeat ${curRegion.name} boss to unlock this building.`);
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
        castle.completionClaimed = true;
        state.coins += CASTLE_COMPLETION_BONUS.coins;
        state.crowns += CASTLE_COMPLETION_BONUS.crowns;
        renderTopBar();
        renderScreen();
        setTimeout(() => {
            showPopup(
                "🏰 CASTLE COMPLETE",
                `Completion bonus:<br>🪙 +${CASTLE_COMPLETION_BONUS.coins.toLocaleString()}<br>👑 +${CASTLE_COMPLETION_BONUS.crowns}`,
                "closePopup();",
                true
            );
        }, 350);
    }
}

// Initial Render
updateTabs();
renderTopBar();
renderScreen();
