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
const FLOW2_CASTLE_TASK_STATUS = {
    LOCKED: 'locked',
    ACTIVE: 'active',
    DONE: 'done'
};
const CASTLE_SLOT_BLUEPRINT = [
    { key: 'keep', name: 'Keep', baseCost: 4, visuals: ['🪨', '🧱', '🏯', '🏰'] },
    { key: 'gate', name: 'Gate', baseCost: 5, visuals: ['🚧', '🚪', '🛡️', '🚪✨'] },
    { key: 'tower', name: 'Tower', baseCost: 6, visuals: ['🪵', '🗼', '🏛️', '🗼✨'] },
    { key: 'garden', name: 'Garden', baseCost: 4, visuals: ['🌱', '🌿', '🌳', '🌺'] }
];
const FLOW2_CASTLE_MISSIONS = [
    { id: 'build_castle', title: 'Build castle', cost: 1, visual: '🏰' },
    { id: 'build_fountain', title: 'Build the fountain', cost: 1, visual: '⛲' }
];
const REGION_HOUSE_BLUEPRINTS = {
    home: {
        name: 'Home House',
        stageVisuals: ['🪵', '🏚️', '🏡', '🏠'],
        tasks: [
            { id: 'home_foundation', title: 'Lay foundation', cost: 1, visual: '🧱' },
            { id: 'home_walls', title: 'Raise the walls', cost: 2, visual: '🪵' },
            { id: 'home_roof', title: 'Finish the roof', cost: 2, visual: '🏠' }
        ]
    },
    forest: {
        name: 'Forest Lodge',
        stageVisuals: ['🪵', '🏚️', '🛖', '🏡', '🏘️'],
        tasks: [
            { id: 'forest_base', title: 'Build timber base', cost: 1, visual: '🪵' },
            { id: 'forest_hall', title: 'Frame the lodge', cost: 2, visual: '🪚' },
            { id: 'forest_roof', title: 'Set the roof beams', cost: 2, visual: '🛖' },
            { id: 'forest_path', title: 'Light the forest path', cost: 2, visual: '🏮' }
        ]
    },
    desert: {
        name: 'Desert Villa',
        stageVisuals: ['🪨', '🏚️', '🏜️', '🏯'],
        tasks: [
            { id: 'desert_base', title: 'Place stone base', cost: 2, visual: '🪨' },
            { id: 'desert_hall', title: 'Raise cool walls', cost: 2, visual: '🧱' },
            { id: 'desert_tower', title: 'Finish the wind tower', cost: 3, visual: '🏯' }
        ]
    },
    snow: {
        name: 'Snow Chalet',
        stageVisuals: ['🪵', '🏚️', '🏡', '🏠', '🏘️'],
        tasks: [
            { id: 'snow_base', title: 'Insulate the base', cost: 1, visual: '🧊' },
            { id: 'snow_chimney', title: 'Build the chimney', cost: 2, visual: '🪵' },
            { id: 'snow_roof', title: 'Seal the roof', cost: 1, visual: '🏠' },
            { id: 'snow_lights', title: 'Warm the windows', cost: 3, visual: '🕯️' }
        ]
    },
    volcano: {
        name: 'Forge Keep',
        stageVisuals: ['🪨', '🏚️', '🏯', '🏰', '🏰'],
        tasks: [
            { id: 'volcano_base', title: 'Cast the magma base', cost: 1, visual: '🪨' },
            { id: 'volcano_hall', title: 'Raise the forge hall', cost: 2, visual: '🔥' },
            { id: 'volcano_roof', title: 'Lock the obsidian roof', cost: 2, visual: '🏯' },
            { id: 'volcano_rune', title: 'Engrave the warding rune', cost: 2, visual: '✨' }
        ]
    }
};
const REGION_STORY_POPUPS = {
    home: {
        imageUrl: 'https://res.cloudinary.com/db37npbp6/image/upload/v1773850606/Gemini_Generated_Image_b2ziwdb2ziwdb2zi_mzetm4.png',
        title: 'Home Chapter',
        caption: 'The village asks for a safe house before sunset, and your crew answers with hammers, timber, and a little luck.',
        ctaLabel: 'Enter Home',
        palette: {
            skyTop: '#7dd3fc',
            skyBottom: '#2563eb',
            ground: '#14532d',
            accent: '#f59e0b',
            panelBorder: '#fef3c7'
        },
        heroIcon: '🧑‍🌾',
        buildIcon: '🏠',
        supportIcon: '🪵',
        burstText: 'POW!',
        speech: 'Raise the first roof before nightfall!'
    },
    forest: {
        imageUrl: 'https://res.cloudinary.com/db37npbp6/image/upload/v1773488268/Concept_3_Story_Overall_cmtikp.png',
        title: 'Forest Chapter',
        caption: 'Deep in the pines, lantern scouts race ahead to frame a lodge before the woods disappear into mist.',
        ctaLabel: 'Enter Forest',
        palette: {
            skyTop: '#86efac',
            skyBottom: '#166534',
            ground: '#14532d',
            accent: '#facc15',
            panelBorder: '#dcfce7'
        },
        heroIcon: '🧝',
        buildIcon: '🛖',
        supportIcon: '🌲',
        burstText: 'RUSTLE!',
        speech: 'Light the lodge. The forest is waking up!'
    },
    desert: {
        imageUrl: 'https://res.cloudinary.com/db37npbp6/image/upload/v1773488235/Concept_2_Story_Overall_npidjt.png',
        title: 'Desert Chapter',
        caption: 'A caravan reaches the dunes at golden hour and begs for a cool villa before the sandstorm rolls in.',
        ctaLabel: 'Enter Desert',
        palette: {
            skyTop: '#fde68a',
            skyBottom: '#d97706',
            ground: '#92400e',
            accent: '#fb7185',
            panelBorder: '#ffedd5'
        },
        heroIcon: '🧕',
        buildIcon: '🏯',
        supportIcon: '🏜️',
        burstText: 'WHOOSH!',
        speech: 'Build fast. The storm is chasing us!'
    },
    snow: {
        title: 'Snow Chapter',
        caption: 'The mountain trail freezes over, so the crew must finish a warm chalet before the blizzard takes the valley.',
        ctaLabel: 'Enter Snow',
        palette: {
            skyTop: '#bfdbfe',
            skyBottom: '#0f766e',
            ground: '#164e63',
            accent: '#fef08a',
            panelBorder: '#e0f2fe'
        },
        heroIcon: '🧥',
        buildIcon: '🏠',
        supportIcon: '❄️',
        burstText: 'CRACK!',
        speech: 'Seal the windows. Keep the fire alive!'
    },
    volcano: {
        title: 'Volcano Chapter',
        caption: 'Molten rivers surge below the ridge, and only a forge keep with ancient wards can hold the mountain back.',
        ctaLabel: 'Enter Volcano',
        palette: {
            skyTop: '#fb7185',
            skyBottom: '#7f1d1d',
            ground: '#431407',
            accent: '#f59e0b',
            panelBorder: '#fecaca'
        },
        heroIcon: '🛡️',
        buildIcon: '🏰',
        supportIcon: '🌋',
        burstText: 'BOOM!',
        speech: 'Raise the keep before the lava climbs higher!'
    }
};
const FLOW2_BUILD_CINEMATIC_MS = 4000;
const FLOW2_TASK_REVEAL_EXIT_MS = 810;
const FLOW2_TASK_REVEAL_ENTER_MS = 730;
const FLOW2_TASK_REVEAL_FINAL_HOLD_MS = 1200;
const FLOW2_SPIN_TARGET_LABELS = {
    crown: 'Crown',
    shield: 'Shield',
    sword: 'Sword',
    gem: 'Gem',
    leaf: 'Leaf',
    hammer: 'Hammer',
    helm: 'Helmet'
};
const FLOW2_SPIN_MISSION_PRESETS = {
    0: {
        1: ['shield', 'hammer'],
        2: ['crown', 'sword', 'gem'],
        3: ['crown', 'shield', 'helm', 'leaf']
    }
};
const SCRIPTED_FLOW_CONFIGS = {
    2: {
        id: 2,
        label: 'Flow 2',
        refLabel: 'Royal Match',
        startCoins: 35000,
        startCrowns: 0,
        kingdomOnly: true,
        showModeTabs: false,
        defaultMode: 'kingdom',
        defaultScreen: 'home',
        castleMissions: FLOW2_CASTLE_MISSIONS,
        spinTargetLabels: FLOW2_SPIN_TARGET_LABELS,
        spinMissionPresets: FLOW2_SPIN_MISSION_PRESETS
    },
    3: {
        id: 3,
        label: 'Flow 3',
        refLabel: 'Clone of Flow 2',
        startCoins: 35000,
        startCrowns: 0,
        kingdomOnly: false,
        showModeTabs: true,
        defaultMode: 'casino',
        defaultScreen: 'home',
        castleMissions: FLOW2_CASTLE_MISSIONS,
        spinTargetLabels: FLOW2_SPIN_TARGET_LABELS,
        spinMissionPresets: FLOW2_SPIN_MISSION_PRESETS
    }
};

function getScriptedFlowKey(flowId = currentFlow) {
    if (flowId === 2) return 'flow2';
    if (flowId === 3) return 'flow3';
    return null;
}

function isScriptedFlowId(flowId = currentFlow) {
    return getScriptedFlowKey(flowId) !== null;
}

function getScriptedFlowConfig(flowId = currentFlow) {
    return SCRIPTED_FLOW_CONFIGS[flowId] || null;
}

function getCurrentFlowLabel(flowId = currentFlow) {
    return getScriptedFlowConfig(flowId)?.label || `Flow ${flowId}`;
}

function getActiveFlowConfig() {
    return getScriptedFlowConfig(currentFlow);
}

function isKingdomOnlyFlow() {
    return !!getActiveFlowConfig()?.kingdomOnly;
}

function shouldShowModeTabs() {
    const activeFlowConfig = getActiveFlowConfig();
    if (activeFlowConfig) return !!activeFlowConfig.showModeTabs;
    return true;
}

function canUseCasinoMode() {
    const activeFlowConfig = getActiveFlowConfig();
    if (activeFlowConfig) return !activeFlowConfig.kingdomOnly;
    return true;
}

function isFlow3Active() {
    return currentFlow === 3 && !!getFlow2State()?.active;
}

function shouldShowFlow3TutorialArrows() {
    return isFlow3Active() && isFlow2TutorialActive();
}

function shouldShowFlow3Region1NodeArrow(regionIdx, curRegion) {
    if (!isFlow3Active() || regionIdx !== 0 || state.currentRegionIdx !== 0) return false;
    if (state.mode !== 'kingdom' || state.screen !== 'home') return false;

    const flow2 = getFlow2State();
    if (!flow2 || flow2.taskPanelOpen || flow2.mustBuildBeforeNextNode) return false;
    if (flow2.step === 'flow2_all_areas_complete') return false;

    return !!curRegion && !isRegionCleared(curRegion);
}

function shouldShowFlow3TaskButtonArrow() {
    if (!isFlow3Active()) return false;
    if (state.mode !== 'kingdom' || state.screen !== 'home') return false;

    const flow2 = getFlow2State();
    const curRegion = getFlow2CurrentRegion();
    if (!flow2 || !curRegion) return false;
    if (flow2.taskPanelOpen || flow2.buildCinematicOpen || flow2.taskRevealActive) return false;
    if (!flow2.taskNotif) return false;
    if (!isRegionCleared(curRegion) || isFlow2CastleCompleted()) return false;

    return flow2.step === 'flow2_castle_mission_guided';
}

function isFlow3ClaimChestGuidedStep() {
    return currentFlow === 3 && !!getFlow2State()?.active && getFlow2State()?.step === 'flow2_claim_chest_guided';
}

function isFlow3PostBuildRevealStep() {
    return currentFlow === 3 && !!getFlow2State()?.active && getFlow2State()?.step === 'flow2_castle_mission2_unlocked';
}

function shouldBypassFlow3ChestGate() {
    return isFlow3ClaimChestGuidedStep();
}

function getAllowedScriptedFlowScreens() {
    if (!isFlow2Active()) return ['home', 'casino-slot', 'kingdom-slot', 'castle'];

    const allowedScreens = ['home', 'kingdom-slot'];
    if (canUseCasinoMode()) allowedScreens.push('casino-slot');
    return allowedScreens;
}

function getRegionHouseBlueprint(regionId) {
    return REGION_HOUSE_BLUEPRINTS[regionId] || REGION_HOUSE_BLUEPRINTS.home;
}

function createFlow2House(regionId) {
    const blueprint = getRegionHouseBlueprint(regionId);
    return {
        id: `${regionId}_house`,
        name: blueprint.name,
        stageVisuals: [...blueprint.stageVisuals]
    };
}

function createFlow2CastleMissions(regionId) {
    const houseTasks = getRegionHouseBlueprint(regionId).tasks || FLOW2_CASTLE_MISSIONS;
    return houseTasks.map((mission, idx) => ({
        ...mission,
        status: idx === 0 ? FLOW2_CASTLE_TASK_STATUS.ACTIVE : FLOW2_CASTLE_TASK_STATUS.LOCKED
    }));
}

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
            storySeen: false,
            castle,
            chests: createRegionChests(idx, region.nodes),
            nodeMissions: {},
            flow2House: createFlow2House(region.id),
            flow2CastleMissions: createFlow2CastleMissions(region.id),
            flow2SpinMissions: {}
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

function createScriptedFlowState() {
    return {
        active: false,
        step: null,
        tutorialComplete: false,
        taskPanelOpen: false,
        taskNotif: false,
        universalNotif: false,
        mustBuildBeforeNextNode: false,
        shownLevelIntros: {
            1: false,
            2: false
        },
        areaCompleteShown: false,
        areaCompleteRegionIdx: null,
        areaCompleteTravelRegionIdx: null,
        lastSpinHitTargetIds: [],
        taskModalAutoAdvanceScheduled: false,
        castleAutoBuildPending: false,
        castleAutoBuilding: false,
        buildCinematicOpen: false,
        buildCinematicMissionId: null,
        taskRevealActive: false,
        taskRevealPhase: null,
        taskRevealCompletedMissionId: null,
        taskRevealUnlockedMissionId: null,
        taskRevealPendingAreaComplete: false
    };
}

function createFlow2State() {
    return createScriptedFlowState();
}

// State Management
function getInitialState() {
    return {
        coins: 402685,
        crowns: 500,
        popupLocked: false,
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
        ],
        flow2: createScriptedFlowState(),
        flow3: createScriptedFlowState()
    };
}

let currentFlow = 1;
let state = getInitialState();
let popupHideTimer = null;
let flow2BuildCinematicTimer = null;
let flow2TaskRevealTimer = null;

function clearPendingPopupHide() {
    if (popupHideTimer === null) return;
    clearTimeout(popupHideTimer);
    popupHideTimer = null;
}

function clearPendingFlow2BuildCinematic() {
    if (flow2BuildCinematicTimer === null) return;
    clearTimeout(flow2BuildCinematicTimer);
    flow2BuildCinematicTimer = null;
}

function clearPendingFlow2TaskRevealCleanup() {
    if (flow2TaskRevealTimer === null) return;
    clearTimeout(flow2TaskRevealTimer);
    flow2TaskRevealTimer = null;
}

function clearPendingFlow2MissionPresentationTimers() {
    clearPendingFlow2BuildCinematic();
    clearPendingFlow2TaskRevealCleanup();
}

function isFlow2Active() {
    return isScriptedFlowId() && !!getFlow2State()?.active;
}

function getFlow2State() {
    const stateKey = getScriptedFlowKey();
    if (!stateKey) return null;
    if (!state[stateKey]) state[stateKey] = createScriptedFlowState();
    return state[stateKey];
}

function isFlow2TutorialActive() {
    const scriptedState = getFlow2State();
    return isFlow2Active() && !!scriptedState && !scriptedState.tutorialComplete;
}

function setFlow2Step(step) {
    const scriptedState = getFlow2State();
    if (!isFlow2Active() || !scriptedState) return;
    scriptedState.step = step;
}

function resetFlow2MissionPresentationState(scriptedState) {
    if (!scriptedState) return;
    scriptedState.castleAutoBuildPending = false;
    scriptedState.castleAutoBuilding = false;
    scriptedState.buildCinematicOpen = false;
    scriptedState.buildCinematicMissionId = null;
    scriptedState.taskRevealActive = false;
    scriptedState.taskRevealPhase = null;
    scriptedState.taskRevealCompletedMissionId = null;
    scriptedState.taskRevealUnlockedMissionId = null;
    scriptedState.taskRevealPendingAreaComplete = false;
}

function getFlow2CurrentRegion() {
    return state.regions[state.currentRegionIdx];
}

function getRegionStoryPopupConfig(regionId) {
    return REGION_STORY_POPUPS[regionId] || REGION_STORY_POPUPS.home;
}

function escapeSvgText(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function getRegionStoryImageSrc(region) {
    const config = getRegionStoryPopupConfig(region?.id);
    if (config.imageUrl) {
        return config.imageUrl;
    }
    const safeTitle = escapeSvgText(config.title);
    const safeBurst = escapeSvgText(config.burstText);
    const safeSpeech = escapeSvgText(config.speech);
    const safeHero = escapeSvgText(config.heroIcon);
    const safeBuild = escapeSvgText(config.buildIcon);
    const safeSupport = escapeSvgText(config.supportIcon);
    const regionLabel = escapeSvgText((region?.name || 'Region').replace(/^[^\s]+\s/, ''));
    const { skyTop, skyBottom, ground, accent, panelBorder } = config.palette;
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" fill="none">
            <defs>
                <linearGradient id="sky" x1="480" y1="0" x2="480" y2="540" gradientUnits="userSpaceOnUse">
                    <stop stop-color="${skyTop}"/>
                    <stop offset="1" stop-color="${skyBottom}"/>
                </linearGradient>
                <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="6" cy="6" r="3" fill="rgba(255,255,255,0.18)"/>
                    <circle cx="20" cy="18" r="2.5" fill="rgba(255,255,255,0.14)"/>
                </pattern>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="rgba(15,23,42,0.35)"/>
                </filter>
            </defs>
            <rect width="960" height="540" rx="44" fill="url(#sky)"/>
            <rect width="960" height="540" rx="44" fill="url(#dots)" opacity="0.5"/>
            <path d="M0 420C107 371 198 371 286 409C380 450 470 453 563 411C645 373 731 361 818 391C875 411 922 424 960 426V540H0V420Z" fill="${ground}" opacity="0.92"/>
            <circle cx="786" cy="122" r="66" fill="${accent}" opacity="0.26"/>
            <circle cx="786" cy="122" r="40" fill="${accent}" opacity="0.4"/>
            <rect x="42" y="38" width="876" height="464" rx="36" stroke="${panelBorder}" stroke-width="6" opacity="0.95"/>
            <rect x="70" y="72" width="230" height="72" rx="18" fill="rgba(15,23,42,0.68)" stroke="${panelBorder}" stroke-width="3"/>
            <text x="94" y="118" fill="#fff7ed" font-size="34" font-family="Trebuchet MS, Arial, sans-serif" font-weight="900">${safeTitle}</text>
            <text x="715" y="112" fill="#fff7ed" font-size="42" font-family="Impact, Arial Black, sans-serif" font-weight="900" transform="rotate(-8 715 112)">${safeBurst}</text>
            <g filter="url(#shadow)">
                <rect x="150" y="182" width="300" height="126" rx="28" fill="white" stroke="#0f172a" stroke-width="8"/>
                <path d="M258 308L286 348L320 308" fill="white" stroke="#0f172a" stroke-width="8" stroke-linejoin="round"/>
            </g>
            <text x="178" y="240" fill="#0f172a" font-size="26" font-family="Trebuchet MS, Arial, sans-serif" font-weight="900">${safeSpeech}</text>
            <text x="118" y="420" font-size="132">${safeHero}</text>
            <text x="592" y="392" font-size="156">${safeBuild}</text>
            <text x="774" y="418" font-size="86">${safeSupport}</text>
            <rect x="520" y="430" width="290" height="58" rx="18" fill="rgba(15,23,42,0.7)" stroke="${panelBorder}" stroke-width="3"/>
            <text x="548" y="468" fill="#fff7ed" font-size="28" font-family="Trebuchet MS, Arial, sans-serif" font-weight="900">${regionLabel}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function resetPopupChrome() {
    els.popup.classList.remove('region-story-popup');
    els.popup.style.borderColor = '';
    els.popup.style.boxShadow = '';
}

function showRegionStoryPopup(regionIdx = state.currentRegionIdx) {
    const region = state.regions[regionIdx];
    if (!region) return;

    const config = getRegionStoryPopupConfig(region.id);
    const imageSrc = getRegionStoryImageSrc(region);
    clearPendingPopupHide();
    state.popupLocked = true;
    resetPopupChrome();
    els.popup.classList.add('region-story-popup');
    els.popup.innerHTML = `
        <div class="region-story-popup-shell">
            <div class="region-story-kicker">New Area Unlocked</div>
            <div class="region-story-title">${config.title}</div>
            <div class="region-story-image-frame">
                <img class="region-story-image" src="${imageSrc}" alt="${config.title} comic story panel" />
            </div>
            <div class="region-story-caption">${config.caption}</div>
            <button class="btn region-story-btn" onclick="handleRegionStoryPopupContinue()">${config.ctaLabel || 'Continue'}</button>
        </div>
    `;
    els.popup.style.borderColor = config.palette.panelBorder;
    els.popup.style.boxShadow = `0 24px 64px rgba(0,0,0,0.76), 0 0 28px ${config.palette.accent}55`;
    els.overlay.classList.remove('hidden');
    els.popup.classList.remove('hidden');
    void els.popup.offsetWidth;
    els.popup.classList.add('show');
}

function canShowRegionStoryPopup(regionIdx = state.currentRegionIdx) {
    const region = state.regions[regionIdx];
    if (!region || region.storySeen) return false;
    if (state.mode !== 'kingdom' || state.screen !== 'home') return false;
    if (isFlow2Active()) {
        const scriptedState = getFlow2State();
        if (scriptedState?.taskPanelOpen || scriptedState?.buildCinematicOpen || scriptedState?.taskRevealActive) return false;
    }
    return true;
}

function maybeShowRegionStoryPopup(regionIdx = state.currentRegionIdx) {
    if (!canShowRegionStoryPopup(regionIdx)) return false;
    const region = state.regions[regionIdx];
    if (!region) return false;
    region.storySeen = true;
    showRegionStoryPopup(regionIdx);
    return true;
}

function handleRegionStoryPopupContinue() {
    closePopup(true);
}

function getFlow2SymbolLabel(symbol) {
    const labels = getScriptedFlowConfig()?.spinTargetLabels || FLOW2_SPIN_TARGET_LABELS;
    return labels[symbol] || symbol;
}

function getFlow2SpinTargetCount(region, nodeNum) {
    if (!region) return 0;

    const safeNode = Math.max(1, Math.min(nodeNum, region.nodes));
    if (safeNode === 1) return 2;
    if (safeNode === region.nodes) return 4;
    return 3;
}

function getFlow2SpinTargetSymbols(regionIdx, nodeNum) {
    const region = state.regions[regionIdx];
    if (!region) return [];

    const safeNode = Math.max(1, Math.min(nodeNum, region.nodes));
    const spinMissionPresets = getScriptedFlowConfig()?.spinMissionPresets || FLOW2_SPIN_MISSION_PRESETS;
    const presetTargets = spinMissionPresets?.[regionIdx]?.[safeNode];
    if (Array.isArray(presetTargets) && presetTargets.length > 0) {
        return [...new Set(presetTargets)];
    }

    const targetCount = getFlow2SpinTargetCount(region, safeNode);
    const baseOffset = (((regionIdx + 1) * 2) + safeNode) % KINGDOM_SLOT_SYMBOLS.length;
    const rotatedPool = [
        ...KINGDOM_SLOT_SYMBOLS.slice(baseOffset),
        ...KINGDOM_SLOT_SYMBOLS.slice(0, baseOffset)
    ];

    return rotatedPool.slice(0, targetCount);
}

function createFlow2SpinMission(regionIdx, nodeNum) {
    const region = state.regions[regionIdx];
    if (!region) return null;

    const safeNode = Math.max(1, Math.min(nodeNum, region.nodes));
    const targets = getFlow2SpinTargetSymbols(regionIdx, safeNode).map((symbol, idx) => ({
        id: `f2r${regionIdx + 1}n${safeNode}_${symbol}_${idx + 1}`,
        symbol,
        label: getFlow2SymbolLabel(symbol),
        hit: false,
        hitOrder: null
    }));

    return {
        id: `flow2_spin_r${regionIdx + 1}_n${safeNode}`,
        nodeNum: safeNode,
        spinCount: 0,
        completed: false,
        targets
    };
}

function ensureFlow2SpinMission(regionIdx, nodeNum) {
    const region = state.regions[regionIdx];
    if (!region) return null;

    const safeNode = Math.max(1, Math.min(nodeNum, region.nodes));
    if (!region.flow2SpinMissions || typeof region.flow2SpinMissions !== 'object') {
        region.flow2SpinMissions = {};
    }

    const missionKey = String(safeNode);
    if (!region.flow2SpinMissions[missionKey]) {
        region.flow2SpinMissions[missionKey] = createFlow2SpinMission(regionIdx, safeNode);
    }

    const mission = region.flow2SpinMissions[missionKey];
    const hitCount = mission.targets.filter((target) => target.hit).length;
    mission.completed = mission.targets.length > 0 && hitCount >= mission.targets.length;
    return mission;
}

function getFlow2SpinMissionStats(regionIdx, nodeNum) {
    const mission = ensureFlow2SpinMission(regionIdx, nodeNum);
    if (!mission) {
        return {
            mission: null,
            hitCount: 0,
            total: 0
        };
    }

    return {
        mission,
        hitCount: mission.targets.filter((target) => target.hit).length,
        total: mission.targets.length
    };
}

function applyFlow2SpinMissionResult(regionIdx, nodeNum, symbolGrid) {
    const mission = ensureFlow2SpinMission(regionIdx, nodeNum);
    if (!mission) {
        return {
            mission: null,
            newlyHitTargets: [],
            hitCount: 0,
            total: 0,
            completed: false
        };
    }

    const visibleSymbols = new Set(
        (Array.isArray(symbolGrid) ? symbolGrid.flat() : []).filter(Boolean)
    );
    const newlyHitTargets = [];

    mission.spinCount = Math.max(0, Number(mission.spinCount) || 0) + 1;
    mission.targets.forEach((target) => {
        if (target.hit || !visibleSymbols.has(target.symbol)) return;
        target.hit = true;
        target.hitOrder = mission.spinCount;
        newlyHitTargets.push(target);
    });

    const hitCount = mission.targets.filter((target) => target.hit).length;
    mission.completed = mission.targets.length > 0 && hitCount >= mission.targets.length;

    return {
        mission,
        newlyHitTargets,
        hitCount,
        total: mission.targets.length,
        completed: mission.completed
    };
}

function getFlow2MissionGoalText(regionIdx, nodeNum) {
    const mission = ensureFlow2SpinMission(regionIdx, nodeNum);
    if (!mission || mission.targets.length === 0) {
        return 'Clear the current node.';
    }

    const targetText = mission.targets
        .map((target) => `${KINGDOM_SLOT_SYMBOL_MAP[target.symbol] || '❔'} ${target.label}`)
        .join(' · ');
    return `Spin and collect: ${targetText}`;
}

function getFlow2CurrentLevelGoal(nodeNum) {
    return getFlow2MissionGoalText(state.currentRegionIdx, nodeNum);
}

function getFlow2CurrentHouse() {
    const curRegion = getFlow2CurrentRegion();
    if (!curRegion) return null;
    if (!curRegion.flow2House) {
        curRegion.flow2House = createFlow2House(curRegion.id);
    }
    return curRegion.flow2House;
}

function getFlow2CurrentHouseStageVisual() {
    const house = getFlow2CurrentHouse();
    const stageVisuals = house?.stageVisuals || ['🪵', '🏚️', '🏠'];
    return stageVisuals[Math.min(getFlow2DoneMissionCount(), stageVisuals.length - 1)];
}

function getFlow2TaskPanelVisibleMissions() {
    const flow2 = getFlow2State();
    const missions = getFlow2CastleMissions();
    if (!flow2) return missions;

    if (flow2.taskRevealActive) {
        if (flow2.taskRevealPhase === 'enter' && flow2.taskRevealUnlockedMissionId) {
            return missions.filter((mission) => mission.id === flow2.taskRevealUnlockedMissionId);
        }

        if (flow2.taskRevealCompletedMissionId) {
            return missions.filter((mission) => mission.id === flow2.taskRevealCompletedMissionId);
        }

        if (flow2.taskRevealUnlockedMissionId) {
            return missions.filter((mission) => mission.id === flow2.taskRevealUnlockedMissionId);
        }

        return [];
    }

    return missions.filter((mission) => mission.status === FLOW2_CASTLE_TASK_STATUS.ACTIVE);
}

function getFlow2BuildCinematicMission() {
    const flow2 = getFlow2State();
    if (!flow2?.buildCinematicMissionId) return null;
    return getFlow2CastleMissions().find((mission) => mission.id === flow2.buildCinematicMissionId) || null;
}

function getFlow2LevelLabel(nodeNum) {
    return `Level ${nodeNum}`;
}

function getFlow2CastleMissions() {
    const curRegion = getFlow2CurrentRegion();
    if (!curRegion) return [];
    if (!Array.isArray(curRegion.flow2CastleMissions)) {
        curRegion.flow2CastleMissions = createFlow2CastleMissions(curRegion.id);
    }
    return curRegion.flow2CastleMissions;
}

function getFlow2ActiveMission() {
    return getFlow2CastleMissions().find((mission) => mission.status === FLOW2_CASTLE_TASK_STATUS.ACTIVE) || null;
}

function getFlow2DoneMissionCount() {
    return getFlow2CastleMissions().filter((mission) => mission.status === FLOW2_CASTLE_TASK_STATUS.DONE).length;
}

function isFlow2CastleCompleted() {
    const missions = getFlow2CastleMissions();
    return missions.length > 0 && missions.every((mission) => mission.status === FLOW2_CASTLE_TASK_STATUS.DONE);
}

function getFlow2CastleProgressText() {
    const missions = getFlow2CastleMissions();
    return `${getFlow2DoneMissionCount()}/${missions.length} tasks`;
}

function hasFlow2CastleNotif() {
    if (!isFlow2Active()) return false;
    const activeMission = getFlow2ActiveMission();
    return !!activeMission && state.crowns >= activeMission.cost;
}

function getFirstClaimableChestIdx(region) {
    if (!region?.chests) return null;
    const idx = region.chests.findIndex((_, chestIdx) => getChestStatus(region, chestIdx) === 'claimable');
    return idx >= 0 ? idx : null;
}

function showRichPopup({
    title,
    goalText = '',
    bodyLines = [],
    ctaLabel = 'Continue',
    onClick = 'closePopup(true)',
    lock = false,
    showBoosters = false
}) {
    clearPendingPopupHide();
    state.popupLocked = !!lock;
    resetPopupChrome();

    const bodyHtml = bodyLines.map((line) => `<p class="flow2-popup-body">${line}</p>`).join('');
    const goalHtml = goalText
        ? `
            <div class="flow2-popup-goal-label">Goal</div>
            <div class="flow2-popup-goal-text">${goalText}</div>
        `
        : '';
    const boostersHtml = showBoosters
        ? `
            <div class="flow2-popup-boosters" aria-hidden="true">
                <span>🔨</span>
                <span>🛡️</span>
                <span>👑</span>
            </div>
        `
        : '';

    els.popup.innerHTML = `
        <div class="flow2-popup-shell">
            <div class="flow2-popup-title-badge">${title}</div>
            ${goalHtml}
            ${boostersHtml}
            <div class="flow2-popup-copy">${bodyHtml}</div>
            <button class="btn flow2-popup-btn" onclick="${onClick}">${ctaLabel}</button>
        </div>
    `;
    els.popup.style.borderColor = 'rgba(251, 191, 36, 0.8)';
    els.popup.style.boxShadow = '0 22px 60px rgba(0,0,0,0.75), 0 0 30px rgba(251, 191, 36, 0.22)';
    els.overlay.classList.remove('hidden');
    els.popup.classList.remove('hidden');
    void els.popup.offsetWidth;
    els.popup.classList.add('show');
}

function showFlow2LevelIntroPopup(nodeNum) {
    if (!isFlow2Active()) return;
    setFlow2Step(nodeNum === 1 ? 'flow2_level1_intro' : 'flow2_level2_intro');
    showRichPopup({
        title: getFlow2LevelLabel(nodeNum),
        goalText: getFlow2CurrentLevelGoal(nodeNum),
        ctaLabel: 'Play',
        onClick: `handleFlow2LevelIntroPlay(${nodeNum})`,
        lock: true,
        showBoosters: true
    });
}

function showFlow2NodeClearPopup(bodyLines) {
    showRichPopup({
        title: 'Well Done!',
        bodyLines,
        ctaLabel: 'Continue',
        onClick: 'handleFlow2NodeClearContinue()',
        lock: true
    });
}

function showFlow2AreaCompletePopup() {
    const flow2 = getFlow2State();
    const regionIdx = Number.isInteger(flow2?.areaCompleteRegionIdx) ? flow2.areaCompleteRegionIdx : state.currentRegionIdx;
    const completedRegion = state.regions[regionIdx];
    const houseName = completedRegion?.flow2House?.name || getRegionHouseBlueprint(completedRegion?.id)?.name || 'House';
    const regionName = completedRegion?.name?.replace(/^[^\s]+\s/, '') || 'this area';
    showRichPopup({
        title: 'Area Complete',
        bodyLines: [`${houseName} is complete.`, `You finished the ${regionName} area.`],
        ctaLabel: 'Continue',
        onClick: 'handleFlow2AreaCompleteContinue()',
        lock: true
    });
}

function showFlow2AllAreasCompletePopup() {
    showRichPopup({
        title: `${getCurrentFlowLabel()} Complete`,
        bodyLines: [
            'You finished every house build in this scripted flow.',
            'Return to the flow selection screen to start another run.'
        ],
        ctaLabel: 'Back to Flows',
        onClick: 'handleFlow2AllAreasCompleteContinue()',
        lock: true
    });
}

function handleFlow2LevelIntroPlay(nodeNum) {
    if (!isFlow2Active()) return;
    const flow2 = getFlow2State();
    flow2.shownLevelIntros[nodeNum] = true;
    flow2.lastSpinHitTargetIds = [];
    state.popupLocked = false;
    closePopup(true);
    state.mode = 'kingdom';
    state.screen = 'kingdom-slot';
    flow2.taskPanelOpen = false;
    flow2.step = nodeNum === 1 ? 'flow2_node1_spin' : 'flow2_node2_spin';
    renderTopBar();
    renderScreen();
}

function handleFlow2NodeClearContinue() {
    if (!isFlow2Active()) return;
    const flow2 = getFlow2State();
    flow2.lastSpinHitTargetIds = [];
    state.popupLocked = false;
    closePopup(true);
    state.mode = 'kingdom';
    state.screen = 'home';
    const curRegion = getFlow2CurrentRegion();

    if (isFlow3Active() && flow2.step === 'flow2_node1_cleared' && !flow2.tutorialComplete) {
        flow2.taskNotif = false;
        flow2.taskPanelOpen = true;
        flow2.taskModalAutoAdvanceScheduled = false;
        flow2.mustBuildBeforeNextNode = true;
        setFlow2Step('flow2_claim_chest_guided');
    } else if (isFlow3Active() && isRegionCleared(curRegion) && !isFlow2CastleCompleted()) {
        guideFlow2ToHouseCompletion();
    } else if (getFirstClaimableChestIdx(curRegion) !== null) {
        setFlow2Step('flow2_area_map_chest_ready');
    } else if (isRegionCleared(curRegion) && !isFlow2CastleCompleted()) {
        guideFlow2ToHouseCompletion();
    }
    renderTopBar();
    renderScreen();
}

function handleFlow2AreaCompleteContinue() {
    if (!isFlow2Active()) return;
    state.popupLocked = false;
    closePopup(true);

    const flow2 = getFlow2State();
    const completedRegionIdx = Number.isInteger(flow2.areaCompleteRegionIdx) ? flow2.areaCompleteRegionIdx : state.currentRegionIdx;
    const nextRegionIdx = Number.isInteger(flow2.areaCompleteTravelRegionIdx) ? flow2.areaCompleteTravelRegionIdx : (completedRegionIdx + 1);
    if (nextRegionIdx < state.regions.length) {
        state.regions[nextRegionIdx].unlocked = true;
        state.regions[nextRegionIdx].castle.unlocked = true;
        flow2.universalNotif = true;
    }

    flow2.taskPanelOpen = false;
    flow2.taskNotif = false;
    flow2.mustBuildBeforeNextNode = false;
    flow2.areaCompleteShown = false;
    flow2.areaCompleteRegionIdx = null;
    flow2.areaCompleteTravelRegionIdx = null;
    flow2.step = 'flow2_area_map_ready';

    if (nextRegionIdx < state.regions.length) {
        travelToRegion(nextRegionIdx);
        showToast('Next area unlocked.');
        return;
    }

    setFlow2Step('flow2_all_areas_complete');
    renderTopBar();
    renderScreen();
    showFlow2AllAreasCompletePopup();
}

function handleFlow2AllAreasCompleteContinue() {
    if (!isFlow2Active()) return;
    state.popupLocked = false;
    closePopup(true);
    goBackToFlowSelection();
}

function openFlow2TaskPanel() {
    if (!isFlow2Active()) return;
    if (getFlow2State()?.buildCinematicOpen) return;
    const curRegion = getFlow2CurrentRegion();
    if (isFlow2TutorialActive() && getFirstClaimableChestIdx(curRegion) !== null && !shouldBypassFlow3ChestGate()) {
        showToast('Claim your chest reward first.');
        return;
    }
    const flow2 = getFlow2State();
    flow2.taskNotif = false;
    flow2.taskModalAutoAdvanceScheduled = false;
    state.universalOpen = false;
    state.mode = 'kingdom';
    state.screen = 'home';
    flow2.taskPanelOpen = true;
    renderTopBar();
    renderScreen();
}

function closeFlow2TaskPanel() {
    if (!isFlow2Active()) return;
    if (getFlow2State()?.castleAutoBuilding || getFlow2State()?.taskRevealActive || getFlow2State()?.buildCinematicOpen) return;
    if (isFlow3ClaimChestGuidedStep()) return;
    const flow2 = getFlow2State();
    if (flow2.step === 'flow2_castle_mission2_unlocked') {
        setFlow2Step('flow2_node2_ready');
    }
    flow2.taskPanelOpen = false;
    flow2.taskModalAutoAdvanceScheduled = false;
    closePanels(true);
    renderScreen();
}

function finishFlow2TaskReveal() {
    clearPendingFlow2TaskRevealCleanup();
    if (!isFlow2Active()) return;
    const flow2 = getFlow2State();
    if (!flow2) return;

    const shouldCompleteArea = !!flow2.taskRevealPendingAreaComplete;
    const shouldKeepTaskPanelOpen = !!flow2.taskRevealUnlockedMissionId && !shouldCompleteArea;

    flow2.taskRevealActive = false;
    flow2.taskRevealPhase = null;
    flow2.taskRevealCompletedMissionId = null;
    flow2.taskRevealUnlockedMissionId = null;
    flow2.taskRevealPendingAreaComplete = false;
    flow2.taskPanelOpen = shouldKeepTaskPanelOpen;
    flow2.taskNotif = false;

    renderTopBar();
    renderScreen();

    if (shouldCompleteArea) {
        maybeCompleteFlow2Area();
    }
}

function advanceFlow2TaskReveal() {
    if (!isFlow2Active()) return;
    const flow2 = getFlow2State();
    if (!flow2?.taskRevealActive) return;

    if (flow2.taskRevealPhase === 'exit' && flow2.taskRevealUnlockedMissionId) {
        flow2.taskRevealPhase = 'enter';
        renderScreen();
        scheduleFlow2TaskRevealCleanup(FLOW2_TASK_REVEAL_ENTER_MS);
        return;
    }

    finishFlow2TaskReveal();
}

function scheduleFlow2TaskRevealCleanup(delay = FLOW2_TASK_REVEAL_ENTER_MS) {
    clearPendingFlow2TaskRevealCleanup();
    flow2TaskRevealTimer = setTimeout(() => {
        flow2TaskRevealTimer = null;
        advanceFlow2TaskReveal();
    }, delay);
}

function startFlow2BuildCinematic(activeMission) {
    if (!isFlow2Active() || !activeMission) return false;
    const flow2 = getFlow2State();
    if (!flow2) return false;

    clearPendingFlow2MissionPresentationTimers();
    resetFlow2MissionPresentationState(flow2);
    state.universalOpen = false;
    state.mode = 'kingdom';
    state.screen = 'home';
    flow2.taskNotif = false;
    flow2.taskPanelOpen = false;
    flow2.castleAutoBuilding = true;
    flow2.buildCinematicOpen = true;
    flow2.buildCinematicMissionId = activeMission.id;
    state.buildingRegionIdx = state.currentRegionIdx;
    renderTopBar();
    renderScreen();

    flow2BuildCinematicTimer = setTimeout(() => {
        flow2BuildCinematicTimer = null;
        completeFlow2BuildCinematic();
    }, FLOW2_BUILD_CINEMATIC_MS);
    return true;
}

function completeFlow2BuildCinematic() {
    clearPendingFlow2BuildCinematic();
    if (!isFlow2Active()) return false;
    const flow2 = getFlow2State();
    if (!flow2?.buildCinematicOpen) return false;

    flow2.buildCinematicOpen = false;
    flow2.buildCinematicMissionId = null;
    return performFlow2CastleMissionBuild(false);
}

function recoverFlow2CastleAutoBuildStart(activeMission, showInsufficientPopup = false) {
    if (!isFlow2Active()) return false;
    const flow2 = getFlow2State();
    if (!flow2) return false;

    clearPendingFlow2MissionPresentationTimers();
    resetFlow2MissionPresentationState(flow2);
    if (activeMission) {
        flow2.taskPanelOpen = true;
        flow2.taskNotif = false;
    }
    state.mode = 'kingdom';
    state.screen = 'home';
    renderTopBar();
    renderScreen();

    if (showInsufficientPopup && activeMission) {
        showPopup('🚫 NOT ENOUGH CROWNS', `Need ${activeMission.cost} crown${activeMission.cost > 1 ? 's' : ''} to ${activeMission.title.toLowerCase()}.`);
    } else {
        showToast(activeMission ? 'Build could not start. Try again.' : 'No active castle mission.');
    }
    return false;
}

function startFlow2CastleAutoBuild() {
    return true;
}

function scheduleFlow2CastleAutoBuildStart(attempt = 0) {
    return;
}

function openFlow2ActiveMission() {
    if (!isFlow2Active()) return;
    const curRegion = getFlow2CurrentRegion();
    if (isFlow2TutorialActive() && getFirstClaimableChestIdx(curRegion) !== null && !shouldBypassFlow3ChestGate()) {
        showToast('Claim your chest reward first.');
        return;
    }
    const activeMission = getFlow2ActiveMission();
    if (!activeMission) {
        showToast('House is already complete.');
        return;
    }

    const flow2 = getFlow2State();
    state.universalOpen = false;
    state.mode = 'kingdom';
    state.screen = 'home';
    flow2.taskNotif = false;
    flow2.taskPanelOpen = true;
    flow2.taskModalAutoAdvanceScheduled = false;
    flow2.castleAutoBuildPending = false;
    flow2.castleAutoBuilding = false;
    state.buildingRegionIdx = state.currentRegionIdx;
    renderTopBar();
    renderScreen();
}

function startFlow2ActiveMissionBuild() {
    if (!isFlow2Active()) return false;
    const flow2 = getFlow2State();
    if (flow2?.buildCinematicOpen || flow2?.taskRevealActive || flow2?.castleAutoBuilding) return false;
    const activeMission = getFlow2ActiveMission();
    if (!activeMission) {
        showToast('House is already complete.');
        return false;
    }

    if (state.crowns < activeMission.cost) {
        showPopup('🚫 NOT ENOUGH CROWNS', `Need ${activeMission.cost} crown${activeMission.cost > 1 ? 's' : ''} to ${activeMission.title.toLowerCase()}.`);
        return false;
    }

    flow2.taskModalAutoAdvanceScheduled = false;
    return startFlow2BuildCinematic(activeMission);
}

function maybeCompleteFlow2Area() {
    if (!isFlow2Active()) return false;
    const flow2 = getFlow2State();
    const completedRegionIdx = state.currentRegionIdx;
    if (!isFlow2CastleCompleted()) return false;
    if (flow2.areaCompleteShown && flow2.areaCompleteRegionIdx === completedRegionIdx) return false;

    flow2.areaCompleteShown = true;
    flow2.areaCompleteRegionIdx = completedRegionIdx;
    flow2.areaCompleteTravelRegionIdx = completedRegionIdx < (state.regions.length - 1)
        ? completedRegionIdx + 1
        : null;
    setFlow2Step('area_complete');
    showFlow2AreaCompletePopup();
    return true;
}

function guideFlow2ToHouseCompletion() {
    if (!isFlow2Active() || isFlow2CastleCompleted()) return false;

    const flow2 = getFlow2State();
    const activeMission = getFlow2ActiveMission();
    if (!activeMission) return false;

    flow2.taskNotif = true;
    flow2.taskPanelOpen = false;
    flow2.taskModalAutoAdvanceScheduled = false;
    flow2.mustBuildBeforeNextNode = false;
    setFlow2Step('flow2_castle_mission_guided');
    return true;
}

function performFlow2CastleMissionBuild(showInsufficientPopup = true) {
    if (!isFlow2Active()) return;
    const flow2 = getFlow2State();
    const useFlow3GuidedCinematic = isFlow3ClaimChestGuidedStep();
    const activeMission = getFlow2ActiveMission();
    if (!activeMission) {
        showToast('House is already complete.');
        return false;
    }

    if (state.crowns < activeMission.cost) {
        if (showInsufficientPopup) {
            showPopup('🚫 NOT ENOUGH CROWNS', `Need ${activeMission.cost} crown${activeMission.cost > 1 ? 's' : ''} to ${activeMission.title.toLowerCase()}.`);
        }
        return false;
    }

    const completedMission = {
        id: activeMission.id,
        title: activeMission.title,
        visual: activeMission.visual
    };
    state.crowns -= activeMission.cost;
    activeMission.status = FLOW2_CASTLE_TASK_STATUS.DONE;
    const missions = getFlow2CastleMissions();
    const nextMission = missions.find((mission) => mission.status === FLOW2_CASTLE_TASK_STATUS.LOCKED);
    if (nextMission) nextMission.status = FLOW2_CASTLE_TASK_STATUS.ACTIVE;
    const doneMissionCount = getFlow2DoneMissionCount();
    const unlockedFirstFollowupTask = doneMissionCount === 1 && !!nextMission;
    const areaShouldComplete = isFlow2CastleCompleted();

    flow2.mustBuildBeforeNextNode = false;
    flow2.taskNotif = false;
    flow2.taskPanelOpen = true;
    flow2.taskModalAutoAdvanceScheduled = false;
    resetFlow2MissionPresentationState(flow2);
    flow2.taskRevealActive = true;
    flow2.taskRevealPhase = 'exit';
    flow2.taskRevealCompletedMissionId = completedMission.id;
    flow2.taskRevealUnlockedMissionId = nextMission?.id || null;
    flow2.taskRevealPendingAreaComplete = areaShouldComplete;
    state.mode = 'kingdom';
    state.screen = 'home';

    if (useFlow3GuidedCinematic && unlockedFirstFollowupTask) {
        flow2.tutorialComplete = true;
        setFlow2Step('flow2_castle_mission2_unlocked');
    } else if (unlockedFirstFollowupTask) {
        flow2.tutorialComplete = true;
        setFlow2Step('flow2_castle_mission2_unlocked');
    } else if (areaShouldComplete) {
        setFlow2Step('flow2_castle_completed');
    } else {
        setFlow2Step('flow2_castle_mission_guided');
    }

    renderTopBar();
    renderScreen();
    spawnFloatingReward(`${completedMission.visual} Done`, window.innerWidth / 2, window.innerHeight / 2);
    showToast(`${completedMission.title} complete.`);
    scheduleFlow2TaskRevealCleanup(nextMission ? FLOW2_TASK_REVEAL_EXIT_MS : FLOW2_TASK_REVEAL_FINAL_HOLD_MS);
    return true;
}

function buildFlow2CastleMission() {
    return performFlow2CastleMissionBuild(true);
}

function maybeRunFlow3ClaimChestGuidedTaskAdvance() {
    if (!isFlow3ClaimChestGuidedStep()) return;
}

function maybeRunFlow2CastleAutoBuild() {
    return;
}

function onFlow2NodeClick(nodeNum) {
    if (!isFlow2Active()) return;
    const flow2 = getFlow2State();
    const curRegion = getFlow2CurrentRegion();
    if (!curRegion) return;
    const activeNode = getRegionCurrentNode(curRegion);
    if (nodeNum !== activeNode || isRegionCleared(curRegion)) return;

    if (isFlow2TutorialActive()) {
        if (flow2.mustBuildBeforeNextNode) {
            openFlow2TaskPanel();
            showToast('Finish the current house task first.');
            return;
        }

        const claimableChestIdx = getFirstClaimableChestIdx(curRegion);
        if (claimableChestIdx !== null && !shouldBypassFlow3ChestGate()) {
            showToast('Claim your chest reward first.');
            return;
        }
    }

    if (nodeNum === 1 && !flow2.shownLevelIntros[1]) {
        showFlow2LevelIntroPopup(1);
        return;
    }

    if (nodeNum === 2 && !flow2.shownLevelIntros[2]) {
        showFlow2LevelIntroPopup(2);
        return;
    }

    switchScreen('kingdom-slot');
}

function renderFlow2TaskPanel() {
    if (!isFlow2Active() || !getFlow2State().taskPanelOpen) return '';

    const house = getFlow2CurrentHouse();
    const flow2 = getFlow2State();
    const isGuidedBuildStep = isFlow3ClaimChestGuidedStep();
    const isPostBuildReveal = !!flow2.taskRevealActive;
    const revealPhase = flow2.taskRevealPhase || 'exit';
    const showBuildArrow = shouldShowFlow3TutorialArrows() && flow2.mustBuildBeforeNextNode && !isPostBuildReveal;
    const visibleMissions = getFlow2TaskPanelVisibleMissions();
    const modalSubcopy = isPostBuildReveal
        ? (flow2.taskRevealUnlockedMissionId
            ? (revealPhase === 'enter'
                ? 'Build complete. The next task is now ready.'
                : 'Build complete.')
            : 'Build complete. Wrapping up the final task for this house.')
        : (isGuidedBuildStep
            ? 'Spend your crown to start the first house build.'
            : 'Finish the active build to unlock the next scripted step.');
    const missionRows = visibleMissions.map((mission) => {
        const isActive = mission.status === FLOW2_CASTLE_TASK_STATUS.ACTIVE;
        const canAffordMission = state.crowns >= mission.cost;
        const isRevealDone = isPostBuildReveal && mission.id === flow2.taskRevealCompletedMissionId;
        const isRevealActive = isPostBuildReveal
            && revealPhase === 'enter'
            && mission.id === flow2.taskRevealUnlockedMissionId;
        const rowClass = `flow2-task-row ${mission.status}${isActive && isGuidedBuildStep ? ' guided-focus' : ''}${isRevealDone ? ' reveal-done' : ''}${isRevealActive ? ' reveal-active' : ''}`;
        const actionClass = `${isActive && showBuildArrow && canAffordMission ? ' flow2-target tutorial-arrow-target' : ''}${!canAffordMission ? ' disabled' : ''}`;
        const actionAttrs = canAffordMission
            ? 'onclick="startFlow2ActiveMissionBuild()"'
            : `disabled aria-disabled="true" title="Need ${Math.max(0, mission.cost - state.crowns)} more crown${Math.max(0, mission.cost - state.crowns) === 1 ? '' : 's'}"`;
        const action = isActive
            ? (isPostBuildReveal
                ? ''
                : `<button class="flow2-task-btn${actionClass}" ${actionAttrs}>Build</button>`)
            : '';
        const badge = mission.status === FLOW2_CASTLE_TASK_STATUS.DONE
            ? '<div class="flow2-task-badge done"><span class="flow2-task-badge-check" aria-hidden="true">✓</span><span>Done</span></div>'
            : `<div class="flow2-task-badge ${mission.status}">${mission.status === FLOW2_CASTLE_TASK_STATUS.ACTIVE ? `Cost · 👑 ${mission.cost}` : 'Locked'}</div>`;

        return `
            <div class="${rowClass}">
                <div class="flow2-task-row-main">
                    <div class="flow2-task-icon">${mission.visual}</div>
                    <div class="flow2-task-copy">
                        <div class="flow2-task-title">${mission.title}</div>
                        <div class="flow2-task-sub">${badge}</div>
                    </div>
                </div>
                ${action}
            </div>
        `;
    }).join('');
    const emptyState = !missionRows
        ? '<div class="flow2-task-empty">No active tasks to show right now.</div>'
        : '';
    const currentCrownsText = state.crowns.toLocaleString();

    return `
        <div class="flow2-task-modal${isGuidedBuildStep ? ' guided-build' : ''}${isPostBuildReveal ? ` post-build-reveal reveal-phase-${revealPhase}` : ''}">
            <div class="flow2-task-modal-head">
                <div class="flow2-task-modal-copy">
                    <div class="flow2-task-modal-kicker">House Tasks</div>
                    <div class="flow2-task-modal-title">${house?.name || `${getCurrentFlowLabel()} Build Tasks`}</div>
                    <div class="flow2-task-modal-sub">${modalSubcopy}</div>
                </div>
                ${(isGuidedBuildStep || isPostBuildReveal) ? '' : '<button class="flow2-task-modal-close" onclick="closeFlow2TaskPanel()" aria-label="Close task list">✕</button>'}
            </div>
            <aside class="flow2-task-panel">
                <div class="flow2-task-panel-head">
                    <div class="flow2-task-panel-title">House</div>
                    <div class="flow2-task-panel-meta">
                        <div class="flow2-task-panel-wallet" aria-label="Current crowns">👑 ${currentCrownsText}</div>
                        <div class="flow2-task-panel-progress">${getFlow2CastleProgressText()}</div>
                    </div>
                </div>
                <div class="flow2-task-panel-list">
                    ${missionRows || emptyState}
                </div>
            </aside>
        </div>
    `;
}

function renderFlow2TaskPanelOverlay() {
    const taskPanelHtml = renderFlow2TaskPanel();
    if (!taskPanelHtml) return;

    const wasVisible = els.universalPanel.classList.contains('flow2-task-panel-modal')
        && els.universalPanel.classList.contains('is-visible')
        && !els.universalPanel.classList.contains('hidden');

    els.universalPanel.className = `slide-panel flow2-task-panel-modal${wasVisible ? ' is-visible' : ''}`;
    els.universalPanel.innerHTML = taskPanelHtml;
    els.overlay.classList.remove('hidden');
    els.overlay.classList.remove('flow2-build-cinematic-overlay');
    els.overlay.classList.add('flow2-task-panel-overlay');
    els.universalPanel.classList.remove('hidden');

    if (wasVisible) {
        els.overlay.classList.add('is-visible');
        return;
    }

    els.overlay.classList.remove('is-visible');
    els.universalPanel.classList.remove('is-visible');
    requestAnimationFrame(() => {
        const flow2 = getFlow2State();
        if (!flow2?.taskPanelOpen) return;
        els.overlay.classList.add('is-visible');
        els.universalPanel.classList.add('is-visible');
    });
}

function renderFlow2BuildCinematicOverlay() {
    const flow2 = getFlow2State();
    const mission = getFlow2BuildCinematicMission();
    const house = getFlow2CurrentHouse();
    const curRegion = getFlow2CurrentRegion();
    if (!flow2?.buildCinematicOpen || !mission || !house || !curRegion) return;

    const stageArt = getFlow2CurrentHouseStageVisual();
    const wasVisible = els.universalPanel.classList.contains('is-visible')
        && !els.universalPanel.classList.contains('hidden');

    els.universalPanel.className = `slide-panel flow2-task-panel-modal flow2-build-cinematic-modal${wasVisible ? ' is-visible' : ''}`;
    els.universalPanel.innerHTML = `
        <div class="flow2-build-cinematic">
            <div class="flow2-build-cinematic-kicker">Construction Sequence</div>
            <div class="flow2-build-cinematic-title">${house.name}</div>
            <div class="flow2-build-cinematic-sub">${curRegion.name.replace(/^[^\s]+\s/, '')} crew is building the next house section.</div>
            <div class="flow2-build-cinematic-stage">
                <div class="flow2-build-cinematic-spark spark-a"></div>
                <div class="flow2-build-cinematic-spark spark-b"></div>
                <div class="flow2-build-cinematic-stage-art">${stageArt}</div>
                <div class="flow2-build-cinematic-task-badge">${mission.visual} ${mission.title}</div>
            </div>
            <div class="flow2-build-cinematic-progress">
                <span></span>
            </div>
        </div>
    `;
    els.overlay.classList.remove('hidden');
    els.overlay.classList.remove('flow2-build-cinematic-overlay');
    els.overlay.classList.add('flow2-task-panel-overlay');
    els.universalPanel.classList.remove('hidden');

    if (wasVisible) {
        els.overlay.classList.add('is-visible');
        return;
    }

    els.overlay.classList.remove('is-visible');
    els.universalPanel.classList.remove('is-visible');
    requestAnimationFrame(() => {
        const scriptedState = getFlow2State();
        if (!scriptedState?.buildCinematicOpen) return;
        els.overlay.classList.add('is-visible');
        els.universalPanel.classList.add('is-visible');
    });
}

function resetFlow2TaskPanelOverlayAnimation() {
    els.overlay.classList.remove('flow2-task-panel-overlay', 'flow2-build-cinematic-overlay', 'is-visible');
    els.universalPanel.classList.remove('is-visible');
}

function syncScriptedFlowOverlays() {
    if (!isFlow2Active()) return;
    const flow2 = getFlow2State();
    if (!flow2) return;

    if (flow2.buildCinematicOpen) {
        renderFlow2BuildCinematicOverlay();
    } else if (flow2.taskPanelOpen) {
        renderFlow2TaskPanelOverlay();
    } else if (!state.universalOpen) {
        resetFlow2TaskPanelOverlayAnimation();
        els.universalPanel.className = 'slide-panel hidden';
        els.universalPanel.innerHTML = '';
        if (!els.popup.classList.contains('show')) {
            els.overlay.classList.add('hidden');
        }
    }
}

function renderFlow2GoalPanel(curRegion) {
    const activeNode = getRegionCurrentNode(curRegion);
    const { mission, hitCount, total } = getFlow2SpinMissionStats(state.currentRegionIdx, activeNode);
    const justHitIds = new Set(getFlow2State().lastSpinHitTargetIds || []);
    const targetCards = mission?.targets?.map((target) => {
        const hitClass = target.hit ? 'hit' : 'pending';
        const justHitClass = justHitIds.has(target.id) ? ' just-hit' : '';
        const statusText = target.hit ? 'Collected' : 'Pending';

        return `
            <div class="flow2-target-card ${hitClass}${justHitClass}">
                <div class="flow2-target-icon">${KINGDOM_SLOT_SYMBOL_MAP[target.symbol] || '❔'}</div>
                <div class="flow2-target-copy">
                    <div class="flow2-target-title">${target.label}</div>
                    <div class="flow2-target-status">${statusText}</div>
                </div>
            </div>
        `;
    }).join('') || '';

    return `
        <div class="flow2-goal-card flow2-item-mission-card">
            <div class="flow2-goal-top">
                <div>
                    <div class="flow2-goal-label">${getFlow2LevelLabel(activeNode)} mission</div>
                    <div class="flow2-goal-text">Spin these items</div>
                </div>
                <div class="flow2-goal-progress">${hitCount}/${total}</div>
            </div>
            <div class="flow2-goal-subtext">${getFlow2CurrentLevelGoal(activeNode)}</div>
            <div class="flow2-target-grid">
                ${targetCards}
            </div>
        </div>
    `;
}

function renderFlow2KingdomHome(curRegion, theme) {
    const mapHTML = renderKingdomMapNodes(curRegion, state.currentRegionIdx, theme);

    return `
        <div class="screen active map-screen flow2-map-screen" style="background-color: ${theme.bg};">
            <div class="flow2-map-header">
                ${modeCenterTabsHtml()}
                <div class="map-region-nav flow2-map-nav">
                    <div class="region-title">${curRegion.name}</div>
                </div>
            </div>
            <div class="flow2-map-content">
                <div class="flow2-map-stage">
                    <div class="map-nodes">${mapHTML}</div>
                </div>
            </div>
        </div>
    `;
}

function renderFlow2KingdomSlot(curRegion) {
    const theme = KINGDOM_SLOT_THEMES[curRegion.id] || KINGDOM_SLOT_THEMES.home;
    const activeNode = getRegionCurrentNode(curRegion);
    const { hitCount, total } = getFlow2SpinMissionStats(state.currentRegionIdx, activeNode);
    const headerText = total > 0
        ? `${getFlow2LevelLabel(activeNode)} · ${hitCount}/${total} items`
        : getFlow2LevelLabel(activeNode);

    return `
        <div class="screen active slot-screen">
            <div class="slot-header" style="background: rgba(0,0,0,0.8);">
                <button class="back-btn" onclick="switchScreen('home')">◀ BACK</button>
                <div class="slot-region-tag" style="color: ${theme.accent};">${curRegion.name}</div>
                <div class="slot-header-content" style="color: ${theme.accent};">${headerText}</div>
            </div>
            <div class="slot-reels-container kingdom-slot-layout flow2-slot-layout">
                <div class="kingdom-slot-main">
                    <div class="kingdom-slot-machine" id="kingdom-slot-machine" style="--slot-accent: ${theme.reelBorder}; --slot-glow: ${theme.reelGlow};">
                        <div class="k-reel"></div>
                        <div class="k-reel"></div>
                        <div class="k-reel"></div>
                        <div class="k-reel"></div>
                        <div class="k-reel"></div>
                    </div>
                    <button id="kingdom-spin-btn" class="spin-btn" style="background: linear-gradient(to bottom, ${theme.accent}, ${theme.accent}aa); border-color: ${theme.accent}; box-shadow: 0 10px 0 ${theme.accent}55, 0 15px 20px rgba(0,0,0,0.6);" onclick="spinKingdomSlot()" ${state.kingdomSpinBusy ? 'disabled' : ''}>SPIN</button>
                </div>
                <aside class="kingdom-slot-side">
                    ${renderFlow2GoalPanel(curRegion)}
                </aside>
            </div>
        </div>
    `;
}

function renderFlow2CastleScreen(curRegion) {
    const house = getFlow2CurrentHouse();
    const flow2 = getFlow2State();
    const isGuidedCinematic = isFlow3ClaimChestGuidedStep();
    const activeMission = getFlow2ActiveMission();
    const canBuild = !!activeMission && state.crowns >= activeMission.cost;
    const missionTitle = activeMission ? activeMission.title : 'House completed';
    const missionCost = activeMission ? activeMission.cost : 0;
    const missionVisual = activeMission ? activeMission.visual : getFlow2CurrentHouseStageVisual();
    const stageArt = getFlow2CurrentHouseStageVisual();
    const houseName = house?.name || `${curRegion.name.replace(/^[^\s]+\s/, '')} House`;
    const buildProgress = flow2?.castleAutoBuilding
        ? `
            <div class="flow2-castle-build-progress">
                <div class="flow2-castle-build-label">Construction in progress</div>
                <div class="flow2-castle-build-bar"><span></span></div>
            </div>
        `
        : '';
    const autoBuildNote = !activeMission
        ? '<div class="flow2-castle-auto-note complete">All house tasks are complete.</div>'
        : (flow2?.castleAutoBuilding
            ? '<div class="flow2-castle-auto-note building">Building sequence is running. Please wait...</div>'
            : (canBuild
                ? '<div class="flow2-castle-auto-note ready">Build starts automatically when you enter the house.</div>'
                : `<div class="flow2-castle-hint">Need ${Math.max(0, missionCost - state.crowns)} more crown${Math.max(0, missionCost - state.crowns) === 1 ? '' : 's'} from nodes and chests.</div>`));

    return `
        <div class="screen active castle-bg flow2-castle-screen${isGuidedCinematic ? ' cinematic' : ''}">
            <div class="flow2-castle-shell">
                <div class="flow2-castle-head">
                    ${isGuidedCinematic ? '<div class="flow2-castle-head-spacer"></div>' : '<button class="castle-ui-btn" onclick="switchScreen(\'home\')" aria-label="Back to map">◀ Back</button>'}
                    <div class="flow2-castle-head-copy">
                        <div class="flow2-castle-head-title">${houseName}</div>
                        <div class="flow2-castle-head-sub">${getFlow2CastleProgressText()}</div>
                    </div>
                </div>
                <div class="flow2-castle-stage ${isFlow2CastleCompleted() ? 'complete' : ''}${flow2?.castleAutoBuilding ? ' building' : ''}">
                    <div class="flow2-castle-stage-art">${stageArt}</div>
                    <div class="flow2-castle-stage-note">${curRegion.name.replace(/^[^\s]+\s/, '')} House</div>
                    ${buildProgress}
                </div>
                <div class="flow2-castle-mission-card">
                    <div class="flow2-castle-mission-kicker">Current build task</div>
                    <div class="flow2-castle-mission-title">${missionVisual} ${missionTitle}</div>
                    <div class="flow2-castle-mission-cost">Cost · 👑 ${missionCost}</div>
                    ${autoBuildNote}
                </div>
            </div>
        </div>
    `;
}

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
    const tutorialActive = isFlow2TutorialActive();
    const showRegion1NodeArrow = shouldShowFlow3Region1NodeArrow(regionIdx, curRegion);
    const claimableChestIdx = tutorialActive ? getFirstClaimableChestIdx(curRegion) : null;
    const highlightBuild = tutorialActive && getFlow2State().mustBuildBeforeNextNode;
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
            onclick = isFlow2Active() ? `onFlow2NodeClick(${i})` : "switchScreen('kingdom-slot')";
        }

        let nodeStyle = '';
        if (isBoss && status === 'current') {
            nodeStyle = `--node-accent: ${theme.bossBorder}; --node-halo: rgba(248,113,113,0.72); border-color: ${theme.bossBorder}; box-shadow: 0 0 42px rgba(239,68,68,0.88), inset 0 0 24px rgba(255,255,255,0.08); background: radial-gradient(circle at 35% 28%, rgba(255,255,255,0.22), rgba(248,113,113,0.42) 34%, rgba(127,29,29,0.98) 100%);`;
        } else if (isBoss) {
            nodeStyle = `--node-accent: ${theme.bossBorder}; --node-halo: rgba(248,113,113,0.52); border-color: ${theme.bossBorder}; box-shadow: 0 0 25px rgba(239,68,68,0.7);`;
        } else if (status === 'unlocked') {
            nodeStyle = `--node-accent: ${theme.border}; --node-halo: ${theme.glow}; border-color: ${theme.border}; box-shadow: 0 0 20px ${theme.glow}; background: ${theme.border}22;`;
        } else if (status === 'current') {
            nodeStyle = `--node-accent: ${theme.border}; --node-halo: ${theme.glow}; border-color: ${theme.border}; box-shadow: 0 0 0 4px rgba(255,255,255,0.08), 0 0 42px ${theme.glow}, inset 0 0 24px rgba(255,255,255,0.08); background: radial-gradient(circle at 35% 28%, rgba(255,255,255,0.3), ${theme.border}8f 34%, ${theme.border}2d 100%); color: #04131d;`;
        }

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
            const flow2TargetClass = isFlow2Active() && claimableChestIdx === chestIdx ? ' flow2-target' : '';
            const flow3ArrowClass = shouldShowFlow3TutorialArrows() && claimableChestIdx === chestIdx ? ' tutorial-arrow-target' : '';
            chestHtml = `
                <button type="button" class="reward-chest ${chestStatus}${flow2TargetClass}${flow3ArrowClass}" title="${chestTooltip}" aria-label="${chestTooltip}" ${chestAction}>${chestIcon}</button>
            `;
        }

        const isTutorialNodeTarget = isFlow2Active() && i === activeNode && (!tutorialActive || (claimableChestIdx === null && !highlightBuild));
        const flow2NodeTargetClass = isTutorialNodeTarget ? ' flow2-target' : '';
        const shouldShowNodeArrow = isTutorialNodeTarget && (shouldShowFlow3TutorialArrows() || showRegion1NodeArrow);
        const flow3NodeArrowClass = shouldShowNodeArrow ? ' tutorial-arrow-target' : '';

        if (nodesInRow === 0) mapHTML += '<div class="node-row">';
        mapHTML += `
            <div class="node-wrapper${flow3NodeArrowClass}">
                <div class="level-node ${status} ${extraClass}${flow2NodeTargetClass} tooltip" data-tip="${tooltip}" style="${nodeStyle}" ${onclick ? 'onclick="' + onclick + '"' : ''}>${innerText}${pathLine}</div>
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
    } else if (isFlow2Active()) {
        if (state.screen === 'kingdom-slot' || getFlow2State()?.buildCinematicOpen) {
            els.topBarRight.innerHTML = '';
            return;
        }
        const flow2 = getFlow2State();
        const universalDot = flow2.universalNotif ? '<span class="btn-notify-dot" aria-hidden="true"></span>' : '';
        const taskDot = flow2.taskNotif ? '<span class="btn-notify-dot" aria-hidden="true"></span>' : '';
        const taskButtonClass = `btn btn-with-dot${shouldShowFlow3TaskButtonArrow() ? ' flow2-target tutorial-arrow-target topbar-task-arrow-target' : ''}`;
        els.topBarRight.innerHTML = `
            <button class="btn btn-with-dot" id="btn-flow2-universal" style="background: linear-gradient(to bottom, #8b5cf6, #5b21b6); border-color: #a78bfa;">🌍 Universal${universalDot}</button>
            <button class="${taskButtonClass}" id="btn-flow2-task" style="background: linear-gradient(to bottom, #2563eb, #1d4ed8); border-color: #60a5fa;">📝 Tasks${taskDot}</button>
        `;
        document.getElementById('btn-flow2-universal').addEventListener('click', toggleUniversalPanel);
        document.getElementById('btn-flow2-task').addEventListener('click', openFlow2TaskPanel);
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
    if (!shouldShowModeTabs()) return '';
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
            if (isFlow2Active()) {
                html = renderFlow2KingdomHome(curRegion, theme);
            } else {
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
        if (isFlow2Active()) {
            html = renderFlow2KingdomSlot(curRegion);
        } else {
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

                            <button id="kingdom-spin-btn" class="spin-btn" style="background: linear-gradient(to bottom, ${theme.accent}, ${theme.accent}aa); border-color: ${theme.accent}; box-shadow: 0 10px 0 ${theme.accent}55, 0 15px 20px rgba(0,0,0,0.6);" onclick="spinKingdomSlot()" ${regionCleared ? 'disabled' : ''} ${state.kingdomSpinBusy ? 'disabled' : ''}>${regionCleared ? 'CLEARED' : 'SPIN'}</button>
                        </div>

                        <aside class="kingdom-slot-side">
                            ${missionBoardHTML}
                        </aside>
                    </div>
                </div>
            `;
        }
    } else if (state.screen === 'castle') {
        if (isFlow2Active()) {
            state.screen = 'home';
            const curRegion = state.regions[state.currentRegionIdx];
            const theme = KINGDOM_MAP_THEMES[curRegion.id] || KINGDOM_MAP_THEMES.home;
            html = renderFlow2KingdomHome(curRegion, theme);
        } else {
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

    syncScriptedFlowOverlays();
    maybeRunFlow3ClaimChestGuidedTaskAdvance();
    maybeRunFlow2CastleAutoBuild();
}

function updateTabs() {
    // No static tabs anymore - tabs are injected inline per screen
    // Nothing to update here, active state is set at render time
}

// --- ACTIONS & INTERACTIONS ---

function switchMode(newMode) {
    if (isFlow2Active() && isKingdomOnlyFlow() && newMode !== 'kingdom') {
        showToast(`${getCurrentFlowLabel()} stays in Kingdom mode.`);
        return;
    }
    if (state.mode === newMode && state.screen === 'home') return;

    if (isFlow2Active()) {
        const scriptedState = getFlow2State();
        if (scriptedState) {
            scriptedState.taskPanelOpen = false;
            scriptedState.taskModalAutoAdvanceScheduled = false;
            resetFlow2MissionPresentationState(scriptedState);
            clearPendingFlow2MissionPresentationTimers();
            if (newMode !== 'kingdom') {
                scriptedState.lastSpinHitTargetIds = [];
            }
        }
    }

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
        maybeShowRegionStoryPopup();
    }, 130);
}

function switchScreen(newScreen) {
    if (isFlow2Active() && newScreen === 'castle') {
        openFlow2ActiveMission();
        return;
    }
    if (isFlow2Active() && !getAllowedScriptedFlowScreens().includes(newScreen)) {
        showToast(`This screen is not available in ${getCurrentFlowLabel()}.`);
        return;
    }
    if (isFlow2Active() && newScreen !== 'kingdom-slot') {
        getFlow2State().lastSpinHitTargetIds = [];
    }
    if (isFlow2Active() && newScreen !== 'home') {
        getFlow2State().taskModalAutoAdvanceScheduled = false;
        resetFlow2MissionPresentationState(getFlow2State());
        clearPendingFlow2MissionPresentationTimers();
    }
    const goingBack = (newScreen === 'home');

    // Out: zoom out (going deeper) or zoom in (going back)
    els.mainContent.style.transition = 'opacity 0.1s ease, transform 0.1s ease';
    els.mainContent.style.opacity = '0';
    els.mainContent.style.transform = goingBack ? 'scale(1.06)' : 'scale(0.94)';

    setTimeout(() => {
        if (newScreen === 'castle') {
            state.buildingRegionIdx = isFlow2Active() ? state.currentRegionIdx : getDefaultBuildingRegionIdx();
        }
        state.screen = newScreen;
        closePanels();
        renderTopBar();
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
    els.universalPanel.className = 'slide-panel';
    if (isFlow2Active()) {
        getFlow2State().universalNotif = false;
        renderTopBar();
    }

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
    if (isFlow2Active()) {
        const flow2 = getFlow2State();
        flow2.taskPanelOpen = false;
        flow2.mustBuildBeforeNextNode = false;
        flow2.areaCompleteShown = false;
        flow2.areaCompleteRegionIdx = null;
        flow2.areaCompleteTravelRegionIdx = null;
        flow2.lastSpinHitTargetIds = [];
        flow2.taskModalAutoAdvanceScheduled = false;
        resetFlow2MissionPresentationState(flow2);
        clearPendingFlow2MissionPresentationTimers();
        flow2.step = 'flow2_area_map_ready';
    }
    state.currentRegionIdx = idx;
    state.buildingRegionIdx = idx;
    state.mode = 'kingdom';
    state.screen = 'home';
    closePanels();
    renderTopBar();
    renderScreen();
    maybeShowRegionStoryPopup(idx);
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

function closePanels(force = false) {
    if (state.popupLocked && !force) return;
    if (isFlow3ClaimChestGuidedStep() && getFlow2State()?.taskPanelOpen && !force) return;
    if (isFlow2Active() && (getFlow2State()?.castleAutoBuilding || getFlow2State()?.taskRevealActive || getFlow2State()?.buildCinematicOpen) && !force) return;
    if (isFlow2Active()) {
        const flow2 = getFlow2State();
        if (flow2?.taskPanelOpen) {
            if (flow2.step === 'flow2_castle_mission2_unlocked') {
                setFlow2Step('flow2_node2_ready');
            }
            flow2.taskPanelOpen = false;
            flow2.taskModalAutoAdvanceScheduled = false;
        }
    }
    state.universalOpen = false;
    resetFlow2TaskPanelOverlayAnimation();
    els.overlay.classList.add('hidden');
    els.universalPanel.className = 'slide-panel hidden';
    els.universalPanel.innerHTML = '';
    closePopup(force);
}

els.overlay.addEventListener('click', () => {
    if (isFlow2Active() && getFlow2State()?.buildCinematicOpen) return;
    if (isFlow2Active() && getFlow2State()?.taskPanelOpen) {
        if (isFlow3ClaimChestGuidedStep()) return;
        closeFlow2TaskPanel();
        return;
    }
    closePanels();
});

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

    if (isFlow2Active()) {
        const flow2 = getFlow2State();
        if (isFlow2TutorialActive()) {
            flow2.taskPanelOpen = true;
            flow2.taskModalAutoAdvanceScheduled = false;
            flow2.mustBuildBeforeNextNode = true;
            setFlow2Step('flow2_claim_chest_guided');
        } else {
            flow2.taskPanelOpen = false;
            flow2.taskModalAutoAdvanceScheduled = false;
            flow2.mustBuildBeforeNextNode = false;
            setFlow2Step('flow2_chest_claimed_optional');
        }
    }

    renderTopBar();
    renderScreen();

    spawnFloatingReward(`🪙 +${chest.reward.coins.toLocaleString()}`, window.innerWidth / 2 - 70, window.innerHeight / 2);
    setTimeout(() => spawnFloatingReward(`👑 +${chest.reward.crowns}`, window.innerWidth / 2 + 70, window.innerHeight / 2 + 20), 120);
    showToast(`🎁 Chest opened: +${chest.reward.coins.toLocaleString()} coins, +${chest.reward.crowns} crown`);
}

function showPopup(title, msg, onContinueStr = "closePopup()", isBoss = false) {
    clearPendingPopupHide();
    state.popupLocked = false;
    resetPopupChrome();
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

function closePopup(force = false) {
    if (state.popupLocked && !force) return;
    clearPendingPopupHide();
    state.popupLocked = false;
    els.popup.classList.remove('show');
    els.overlay.classList.add('hidden');
    // Add hidden back after transition ends
    popupHideTimer = setTimeout(() => {
        resetPopupChrome();
        els.popup.classList.add('hidden');
        popupHideTimer = null;
    }, 350);
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

    if (isFlow2Active()) {
        let nodeMissionCompleted = false;
        state.kingdomSlotEngine.spin().then((symbols) => {
            const { wonPower, wonCoins } = evaluateKingdomSpinSymbols(symbols);
            const activeNode = getRegionCurrentNode(curRegion);
            const isBoss = (activeNode === curRegion.nodes);
            const missionResult = applyFlow2SpinMissionResult(state.currentRegionIdx, activeNode, symbols);
            const newlyHitTargets = missionResult.newlyHitTargets || [];
            nodeMissionCompleted = !!missionResult.completed;
            getFlow2State().lastSpinHitTargetIds = newlyHitTargets.map((target) => target.id);

            state.coins += wonCoins;
            spawnFloatingReward(`🪙 +${wonCoins}`, window.innerWidth / 2 - 50, window.innerHeight / 2);
            setTimeout(() => spawnFloatingReward(`⚔️ +${wonPower}`, window.innerWidth / 2 + 50, window.innerHeight / 2), 180);

            renderTopBar();
            renderScreen();

            if (newlyHitTargets.length > 0) {
                const hitLabels = newlyHitTargets.map((target) => target.label).join(', ');
                showToast(`Mission hit: ${hitLabels}`);
                newlyHitTargets.forEach((target, idx) => {
                    setTimeout(() => {
                        spawnFloatingReward(
                            `${KINGDOM_SLOT_SYMBOL_MAP[target.symbol] || '❔'} HIT`,
                            window.innerWidth / 2 + 30,
                            (window.innerHeight / 2) - (idx * 36)
                        );
                    }, 120 * idx);
                });
            }

            if (!nodeMissionCompleted) return;

            setTimeout(() => {
                curRegion.clearedNodes = Math.min(curRegion.nodes, curRegion.clearedNodes + 1);
                getFlow2State().lastSpinHitTargetIds = [];
                state.crowns += 1;
                renderTopBar();
                spawnFloatingReward('👑 +1', window.innerWidth / 2 + 70, window.innerHeight / 2 - 10);
                const rewardLine = 'You earned +1 crown.';

                if (isBoss) {
                    if (maybeCompleteFlow2Area()) return;
                    showFlow2NodeClearPopup(['Boss cleared.', rewardLine, 'Finish the house to complete the area.']);
                    return;
                }

                if (activeNode === 1) {
                    setFlow2Step('flow2_node1_cleared');
                }
                const nodeClearBody = (currentFlow === 3 && activeNode === 1)
                    ? ['Node cleared.', rewardLine, 'Your first house build is ready.']
                    : ['Node cleared.', rewardLine, 'Your chest reward is ready.'];
                showFlow2NodeClearPopup(nodeClearBody);
            }, 850);
        }).catch((err) => {
            console.error('kingdom slot spin error', err);
            showToast('Spin failed');
        }).finally(() => {
            state.kingdomSpinBusy = false;
            const btn = document.getElementById('kingdom-spin-btn');
            if (btn && state.screen === 'kingdom-slot' && !isRegionCleared(state.regions[state.currentRegionIdx]) && !nodeMissionCompleted) {
                btn.disabled = false;
            }
        });
        return;
    }

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

function startGame(flowId) {
    currentFlow = flowId;
    clearPendingPopupHide();
    clearPendingFlow2MissionPresentationTimers();
    state = getInitialState();

    if (isScriptedFlowId(flowId)) {
        const scriptedConfig = getScriptedFlowConfig(flowId) || SCRIPTED_FLOW_CONFIGS[2];
        const stateKey = getScriptedFlowKey(flowId);

        state.coins = scriptedConfig.startCoins;
        state.crowns = scriptedConfig.startCrowns;
        state.mode = scriptedConfig.defaultMode || 'kingdom';
        state.screen = scriptedConfig.defaultScreen || 'home';
        state.currentRegionIdx = 0;
        state.buildingRegionIdx = 0;
        if (stateKey) {
            state.flow2 = createScriptedFlowState();
            state.flow3 = createScriptedFlowState();
            state[stateKey] = createScriptedFlowState();
            state[stateKey].active = true;
            state[stateKey].step = 'flow2_area_map_ready';
        }
    }

    document.getElementById('current-flow-text').textContent = getCurrentFlowLabel(flowId);
    
    document.getElementById('flow-selection-screen').classList.add('hidden');
    document.getElementById('flow-indicator').classList.remove('hidden');
    document.getElementById('game-container').classList.remove('hidden');

    updateTabs();
    renderTopBar();
    renderScreen();
    maybeShowRegionStoryPopup();
}

function goBackToFlowSelection() {
    currentFlow = 1;
    clearPendingPopupHide();
    clearPendingFlow2MissionPresentationTimers();
    state.popupLocked = false;
    state.universalOpen = false;
    if (state.flow2) {
        state.flow2.taskPanelOpen = false;
        state.flow2.taskModalAutoAdvanceScheduled = false;
        resetFlow2MissionPresentationState(state.flow2);
    }
    if (state.flow3) {
        state.flow3.taskPanelOpen = false;
        state.flow3.taskModalAutoAdvanceScheduled = false;
        resetFlow2MissionPresentationState(state.flow3);
    }
    resetFlow2TaskPanelOverlayAnimation();
    els.overlay.classList.add('hidden');
    els.universalPanel.className = 'slide-panel hidden';
    els.universalPanel.innerHTML = '';
    els.popup.classList.remove('show');
    els.popup.classList.add('hidden');
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('flow-indicator').classList.add('hidden');
    document.getElementById('flow-selection-screen').classList.remove('hidden');
}
