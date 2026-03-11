# Kingdom Mode Flow

```mermaid
flowchart TB
    Start([Player enters Kingdom mode])
    Home[Home Screen / Kingdom Map]
    UniversalBtn[Tap Universal button]
    BuildingBtn[Tap Building button]
    NodeTap[Tap current or cleared node]

    Start --> Home
    Home --> UniversalBtn
    Home --> BuildingBtn
    Home --> NodeTap

    subgraph U[Universal Panel]
        UOpen[Open panel with horizontal scroll]
        UClick{Region clicked}
        UUnlocked[Region unlocked]
        ULocked[Region locked]
        UHint[Show unlock hint popup]
    end

    UniversalBtn --> UOpen
    UOpen --> UClick
    UClick -->|Unlocked| UUnlocked
    UUnlocked --> Travel["travelToRegion(idx)"]
    UClick -->|Locked| ULocked
    ULocked --> UHint
    UHint --> UOpen
    Travel --> Home

    subgraph S[Kingdom Slot]
        SEnter[Enter Kingdom Slot]
        Spin[Press SPIN]
        Eval[Apply spin result: +coins +power]
        MissionTrack[Update current node mission progress]
        MissionDone{All node missions completed?}
        PartialDone{Any mission completed?}
        MissionClaim[Optional: claim mission reward]
        KeepNode[Stay on current node]
        NodeClear["Clear node: +1 crown<br>Auto-claim remaining completed mission rewards"]
        ChestUnlock[Unlock chest between cleared node and next node]
        ChestClaim[Claim chest: +coins +crown]
        BossCheck{Boss node and region cleared?}
        RegionUnlock[Unlock next region + next castle]
        PostPopup[Show clear popup]
    end

    NodeTap --> SEnter --> Spin --> Eval --> MissionTrack --> MissionDone
    MissionDone -->|No| PartialDone
    PartialDone -->|Yes| MissionClaim --> KeepNode --> SEnter
    PartialDone -->|No| KeepNode
    MissionDone -->|Yes| NodeClear --> ChestUnlock --> ChestClaim --> BossCheck
    BossCheck -->|Yes| RegionUnlock --> PostPopup --> Home
    BossCheck -->|No| PostPopup --> Home

    subgraph B[Building Screen]
        BEnter[Open Building]
        ArrowTap[Tap prev/next castle arrow]
        CastleCheck{Target castle unlocked?}
        CastleHint["Show castle unlock hint<br>Defeat previous region boss"]
        CastleView[Show castle + 4 build slots]
        UpgradeTap[Tap upgrade slot]
        CrownCheck{Enough crowns?}
        CrownFail[Show not enough crowns]
        UpgradeOK[Upgrade slot level]
        CompleteCheck{Castle completed?}
        ClaimState[Top bonus card becomes claimable]
        ClaimTap[Tap claim bonus]
        ClaimDone["Award completion bonus<br>Set completionClaimed=true"]
    end

    BuildingBtn --> BEnter
    BEnter --> ArrowTap
    ArrowTap --> CastleCheck
    CastleCheck -->|No| CastleHint
    CastleHint --> BEnter
    CastleCheck -->|Yes| CastleView
    CastleView --> UpgradeTap
    UpgradeTap --> CrownCheck
    CrownCheck -->|No| CrownFail
    CrownFail --> CastleView
    CrownCheck -->|Yes| UpgradeOK
    UpgradeOK --> CompleteCheck
    CompleteCheck -->|No| CastleView
    CompleteCheck -->|Yes and unclaimed| ClaimState
    ClaimState --> ClaimTap
    ClaimTap --> ClaimDone
    ClaimDone --> CastleView

    BEnter --> BackHome[Back to Home] --> Home
```

## Core Rules
- Region order: `Home -> Forest -> Desert -> Snow -> Volcano`.
- Region/castle unlock rule: clear boss of region `i` to unlock region `i+1` and castle `i+1`.
- Building bonus rule: completion bonus is manual claim (one-time per region castle).
- Reward chest rule: mỗi đường nối `node i -> node i+1` có một chest, unlock khi clear `node i`, claim 1 lần.
- Node clear rule (mission-only): clear node khi toàn bộ mission của node hiện tại ở trạng thái `completed` hoặc `claimed`.
- Mission reward carry rule: mission đã `completed` nhưng chưa claim sẽ auto-claim khi node clear.
- Node mission count rule (demo): `Home=1`, `Forest=2`, `Desert/Snow/Volcano=3` mission mỗi node.
- Node mission difficulty rule (demo): nhiệm vụ dễ, hoàn thành nhanh trong vài spin.
