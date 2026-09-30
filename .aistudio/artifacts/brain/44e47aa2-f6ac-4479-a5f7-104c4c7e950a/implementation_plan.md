# Implementation Plan: "6 Degrees of Separation" Mode

Add a dedicated **"6 Degrees of Separation"** challenge mode where players must connect two disparate Wikipedia articles in **6 clicks or fewer**. If the player uses 6 hops without reaching the target, the connection is severed and triggers a "Game Over" screen.

---

## 1. Architecture & State Management

### A. Game Types (`src/types/game.ts`)
- Update `HuntMode` to include `'SIX_DEGREES'`:
  ```ts
  export type HuntMode = 'DAILY' | 'RANDOM' | 'CUSTOM' | 'SIX_DEGREES';
  ```
- Update `GameState` to include `'GAME_OVER'`:
  ```ts
  export type GameState = 'LOBBY' | 'RACING' | 'VICTORY' | 'GIVE_UP' | 'GAME_OVER';
  ```
- Add optional `isSixDegreesExceeded?: boolean` to run records.

### B. Curated 6-Degree Matchups (`src/services/sixDegreesHunts.ts`)
- Create curated pairs contrasting culture, science, food, music, and history with verified small-world paths (typically 3–5 hops away):
  - *Snoop Dogg* ➔ *Quantum mechanics*
  - *Croissant* ➔ *Black hole*
  - *Minecraft* ➔ *Renaissance*
  - *Barbie* ➔ *Apollo 11*
  - *The Beatles* ➔ *Plate tectonics*
  - *Sushi* ➔ *The Internet*
  - *Ancient Egypt* ➔ *Artificial intelligence*
  - *Espresso* ➔ *International Space Station*
- Include random shuffle functionality to get new 6-degree pairs on demand.

---

## 2. UI Components & Game Experience

### A. Lobby Mode Selection (`src/components/Lobby.tsx`)
- Add the **"6 Degrees Challenge"** card to the mode selector:
  - Icon: `Link2` / `Network` / `GitCommit`
  - Highlighting: 6-Click Hard Limit & Sudden Death rules
  - Matchup preview with a "Shuffle Pair" button to pick fresh contrasts.

### B. Pinned Header HUD (`src/components/HeaderHUD.tsx`)
- When in `SIX_DEGREES` mode, render a **6-Node Degree Meter**:
  - A visual chain of 6 link nodes: `(1) — (2) — (3) — (4) — (5) — (6)`
  - Active hops filled with blue/emerald nodes.
  - Warning colors: Turns amber at 5/6 hops, and pulsing red on the final 6th hop (`"FINAL DEGREE!"`).
  - Badge showing `"X hops remaining"`.

### C. Game Over & Loss Handling (`src/App.tsx` & `src/components/GameOverModal.tsx`)
- **Loss Condition**: When in `SIX_DEGREES` mode:
  - If a player clicks a link reaching click #6 (or clicks undo which adds a penalty) and the new article is *not* the target, the run halts immediately with `GAME_OVER`.
  - Play a distinct connection-severed audio cue via `soundManager`.
- **Game Over Modal (`GameOverModal.tsx`)**:
  - Title: **"Connection Severed!"**
  - Subtitle: *"You ran out of degrees before reaching the target."*
  - Displays the 6-step path taken so far.
  - Quick action buttons:
    - **"Retry Same Pair"**: Try to find a smarter, shorter route.
    - **"New 6-Degree Pair"**: Load a fresh 6-degree challenge.
    - **"Home / Lobby"**: Return to main menu.

### D. Victory Integration (`src/components/VictoryModal.tsx`)
- For wins in `SIX_DEGREES` mode:
  - Displays a special **"6 Degrees Solved!"** badge.
  - Shows remaining hops left in the budget (e.g. *"Connected in 4 of 6 degrees!"*).

---

## 3. Verification & Testing
1. **Lobby Launch**: Start a "6 Degrees" race from the lobby.
2. **HUD Node Tracking**: Verify the 6-dot meter lights up on hops 1 through 6.
3. **Loss Test**: Reach 6 clicks on non-target articles; verify the "Connection Severed!" modal appears with the path taken and retry button.
4. **Win Test**: Reach the target in $\le 6$ clicks; verify victory modal displays degree metrics.
5. **Undo Penalty Check**: Verify that undo counts toward the 6-click budget in 6-Degrees mode.
6. **Compile & Lint**: Build and lint the applet with zero errors.
