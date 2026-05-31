# Masters Golf App — Blueprint Document
> Use this document as context when building the Masters PWA in Claude Code.

---

## 1. Project Overview

**App name:** Masters  
**Type:** Progressive Web App (PWA) — works offline, installable on iPhone via Safari  
**Language:** English (all UI text)  
**Units:** Metric (meters)  
**Platform:** Mobile-first, optimized for iPhone  
**Hosting:** GitHub Pages (free)

---

## 2. Design System

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--green-primary` | `#0F6E56` | Headers, buttons, active nav, accents |
| `--green-dark` | `#085041` | Hover states, dark headers |
| `--gold` | `#BA7517` | Scores, highlights, winner badge |
| `--cream` | `#F7F3EE` | App background |
| `--white` | `#FFFFFF` | Cards, inputs |
| `--border` | `#E0DDD7` | Card borders, dividers |
| `--text-primary` | `#1A1A1A` | Main text |
| `--text-secondary` | `#9A9690` | Metadata, labels |
| `--score-over` | `#FCEBEB` / `#A32D2D` | Over par (bg/text) |
| `--score-under` | `#E1F5EE` / `#085041` | Under par (bg/text) |
| `--score-even` | `#F7F3EE` / `#1A1A1A` | Even par (bg/text) |

### Tee color reference (used in UI)
| Tee | Color code |
|-----|-----------|
| Black | `#1A1A1A` |
| White | `#FFFFFF` (with border) |
| Yellow | `#F5C518` |
| Blue | `#1565C0` |
| Red | `#C62828` |
| Orange | `#E65100` |

### Typography
- **Headings / Logo / Course names:** Playfair Display (serif) — weights 400, 700
- **Body / Numbers / Labels:** Inter (sans-serif) — weights 300, 400, 500, 600
- Import via Google Fonts

### Components
- **Cards:** white bg, `0.5px solid #E0DDD7` border, `border-radius: 12px`, padding `12px 14px`
- **Buttons (primary):** `#0F6E56` bg, white text, `border-radius: 10px`, padding `12px`
- **Bottom nav:** white bg, `border-top: 0.5px solid #E0DDD7`, height `52px`, 4 tabs
- **Score badge:** colored pill showing E / +1 / -2 etc.
- **− / score / + input:** round buttons 28px, large center number 24px bold

### Score Badge Logic
| Score vs Par | Display | Background | Text color |
|---|---|---|---|
| Eagle or better | -2 / -3 | `#E1F5EE` | `#085041` |
| Birdie | -1 | `#E1F5EE` | `#085041` |
| Par | E | `#F7F3EE` | `#1A1A1A` |
| Bogey | +1 | `#FCEBEB` | `#A32D2D` |
| Double bogey+ | +2 / +3 | `#FCEBEB` | `#A32D2D` |

---

## 3. Navigation Structure

Bottom tab bar with 4 tabs:

| Tab | Icon (Tabler) | Screen |
|-----|--------------|--------|
| Home | `ti-home` | Home screen |
| History | `ti-clock` | Round history list |
| Players | `ti-users` | Player profiles |
| Live | `ti-circle-dot` | Active round / setup |

---

## 4. Screen Specifications

### 4.1 Home Tab
- Masters logo centered at top (green header)
- "Belgian Golf" subtitle in small caps
- **"+ Start New Round"** CTA button
- **Last round card:** course name, date, format, score summary
- **Your handicap card:** current HCP index of first/main player

### 4.2 History Tab
- List of past rounds, newest first
- Each row shows:
  - Course name (Playfair Display)
  - Format badge (color-coded pill)
  - Date + number of holes
  - Player avatars (colored initials circles)
  - Winner line with trophy emoji
- Tap row → opens full scorecard view (read-only)

### 4.3 Players Tab
- Header with "+ Add" button
- List of saved player profiles
- Each row: avatar circle (colored initials), name, "HCP index · updated [date]", current HCP value right-aligned in green
- Tap player → player detail view with handicap history log
- "+ Add player" dashed card at bottom of list

#### Player Profile Data Model
```json
{
  "id": "uuid",
  "name": "Arthur",
  "avatarColor": "#0F6E56",
  "currentHandicap": 12.4,
  "handicapHistory": [
    { "date": "2026-05-28", "value": 12.4 },
    { "date": "2026-04-10", "value": 13.1 }
  ],
  "active": true
}
```

### 4.4 Live Round Tab
Two states:
- **No active round:** shows setup flow (see Section 5)
- **Active round:** shows hole-by-hole scorecard (see Section 6)

---

## 5. New Round Setup Flow

Step-by-step, one screen per step. Each step shows a summary bar at the top showing previously selected choices.

### Step 1 — Select Golf Club
- Scrollable list of Belgian golf clubs
- Single select with radio indicator
- Summary bar: empty on first step

### Step 2 — Select Course Type
- Options specific to chosen club (e.g. President's Nine / Championship Course / Compact Course)
- Also select number of holes: 9 holes or 18 holes (play twice)
- Summary bar shows: club name

### Step 3 — Select Tee Color
- Show available tee colors for chosen course as colored chips
- Player selects which tees they are playing from
- Summary bar shows: club · course · holes

### Step 4 — Select Format
- Grid of format chips (2 columns):
  - Strokeplay — Lowest strokes
  - Stableford — Points system
  - Matchplay — Hole by hole
  - Scramble — Best shot
  - Best Ball — Best score
- Summary bar shows: club · course · tee · holes

### Step 5 — Select Players
- List of all saved player profiles with checkboxes
- Max 4 players selectable
- Summary bar shows: club · course · tee · holes · format

### Step 6 (conditional) — Assign Teams
- Only appears for team formats: Matchplay, Scramble, Best Ball
- Assign players into Team A / Team B
- Summary bar shows: all previous selections

### Final — Start Round button
- Confirms setup and launches Live Round screen at Hole 1

---

## 6. Live Round Screen

### Header (green)
- Course name (small, top left)
- Format (small, top right)
- "Hole X of Y" (large, centered, Playfair Display)
- Info bar below: **Par · Meters · SI** (3 columns, based on selected tee)

### Body — Player cards
- One card per active player
- Card contains:
  - Player name (Playfair Display, bold)
  - HCP index (small, secondary)
  - Score vs par badge (top right: E / +1 / -1 etc.)
  - − / score / + row (large number in center)
- Score defaults to par value when opening a new hole
- Score badge updates live as user taps +/−

### Footer
- Dot progress indicator: one dot per hole (9 or 18), done = green filled, current = gold pill, remaining = gray
- **← Prev** and **Next →** buttons
- On last hole: **Next →** becomes **Finish Round**

### Finish Round
- Shows summary of all scores per player per hole
- Calculates and displays winner based on format (see Section 8)
- "Save Round" button → saves to history, returns to Home

---

## 7. Course Data (Hardcoded)

### Important: 9-hole courses played twice (18 holes)

When a player chooses to play 9 holes twice (18-hole round on a 9-hole course):
- Holes 1–9: use the SI values from the first-round column
- Holes 10–18 (same physical holes): use the SI values from the second-round column
- The SI for the second pass is always higher (harder handicap allocation)
- Meters and par remain identical for both passes

---

### Damme Golf & Country Club

#### President's Nine — Full Scorecard Data

**Par:** 36 (9 holes) / 72 (18 holes played twice)

| Hole | Par | Black | White | Yellow | Blue | Red | Orange | SI (1st 9) | SI (2nd 9) |
|------|-----|-------|-------|--------|------|-----|--------|------------|------------|
| 1 | 4 | 339 | 328 | 317 | 277 | 270 | 270 | 9 | 10 |
| 2 | 4 | 377 | 355 | 349 | 318 | 277 | 234 | 3 | 4 |
| 3 | 3 | 230 | 205 | 177 | 173 | 162 | 115 | 7 | 8 |
| 4 | 5 | 500 | 500 | 457 | 411 | 406 | 364 | 11 | 12 |
| 5 | 4 | 412 | 368 | 362 | 324 | 301 | 247 | 5 | 6 |
| 6 | 5 | 548 | 523 | 495 | 454 | 423 | 358 | 1 | 2 |
| 7 | 4 | 321 | 321 | 280 | 271 | 234 | 231 | 15 | 16 |
| 8 | 3 | 146 | 146 | 123 | 99 | 70 | 67 | 13 | 14 |
| 9 | 4 | 331 | 331 | 305 | 273 | 251 | 230 | 17 | 18 |
| **OUT** | **36** | **3204** | **3077** | **2865** | **2600** | **2394** | **2116** | — | — |

**Course Rating & Slope:**

| Tee | Gender | Course Rating | Slope |
|-----|--------|--------------|-------|
| Black | Men | 74.2 | 124 |
| White | Men | 72.8 | 122 |
| Yellow | Men | 70.2 | 119 |
| Blue | Men | 67.5 | 114 |
| Blue | Ladies | 73.2 | 127 |
| Red | Ladies | 70.1 | 119 |
| Orange | Men | 62.7 | 103 |
| Orange | Ladies | 66.7 | 110 |

#### JSON Data Structure for President's Nine

```json
{
  "id": "damme",
  "name": "Damme Golf & Country Club",
  "region": "West-Vlaanderen",
  "courses": [
    {
      "id": "presidents-nine",
      "name": "President's Nine",
      "holes": 9,
      "par": 36,
      "tees": ["black", "white", "yellow", "blue", "red", "orange"],
      "courseRating": {
        "black":  { "men": 74.2 },
        "white":  { "men": 72.8 },
        "yellow": { "men": 70.2 },
        "blue":   { "men": 67.5, "ladies": 73.2 },
        "red":    { "ladies": 70.1 },
        "orange": { "men": 62.7, "ladies": 66.7 }
      },
      "slope": {
        "black":  { "men": 124 },
        "white":  { "men": 122 },
        "yellow": { "men": 119 },
        "blue":   { "men": 114, "ladies": 127 },
        "red":    { "ladies": 119 },
        "orange": { "men": 103, "ladies": 110 }
      },
      "holeData": [
        { "hole": 1, "par": 4, "meters": { "black": 339, "white": 328, "yellow": 317, "blue": 277, "red": 270, "orange": 270 }, "si": { "first9": 9,  "second9": 10 } },
        { "hole": 2, "par": 4, "meters": { "black": 377, "white": 355, "yellow": 349, "blue": 318, "red": 277, "orange": 234 }, "si": { "first9": 3,  "second9": 4  } },
        { "hole": 3, "par": 3, "meters": { "black": 230, "white": 205, "yellow": 177, "blue": 173, "red": 162, "orange": 115 }, "si": { "first9": 7,  "second9": 8  } },
        { "hole": 4, "par": 5, "meters": { "black": 500, "white": 500, "yellow": 457, "blue": 411, "red": 406, "orange": 364 }, "si": { "first9": 11, "second9": 12 } },
        { "hole": 5, "par": 4, "meters": { "black": 412, "white": 368, "yellow": 362, "blue": 324, "red": 301, "orange": 247 }, "si": { "first9": 5,  "second9": 6  } },
        { "hole": 6, "par": 5, "meters": { "black": 548, "white": 523, "yellow": 495, "blue": 454, "red": 423, "orange": 358 }, "si": { "first9": 1,  "second9": 2  } },
        { "hole": 7, "par": 4, "meters": { "black": 321, "white": 321, "yellow": 280, "blue": 271, "red": 234, "orange": 231 }, "si": { "first9": 15, "second9": 16 } },
        { "hole": 8, "par": 3, "meters": { "black": 146, "white": 146, "yellow": 123, "blue": 99,  "red": 70,  "orange": 67  }, "si": { "first9": 13, "second9": 14 } },
        { "hole": 9, "par": 4, "meters": { "black": 331, "white": 331, "yellow": 305, "blue": 273, "red": 251, "orange": 230 }, "si": { "first9": 17, "second9": 18 } }
      ]
    }
  ]
}
```

> Championship Course and Compact Course data to be added later.

---

## 8. Scoring Logic per Format

### Strokeplay
- Track gross strokes per player per hole
- Total = sum of all strokes
- Net = gross − course handicap
- **Winner:** lowest net score (or gross if no handicap used)

### Stableford
Points per hole based on net score vs par:
| Net score vs par | Points |
|---|---|
| 3 or more over | 0 |
| Double bogey | 0 |
| Bogey | 1 |
| Par | 2 |
| Birdie | 3 |
| Eagle | 4 |
| Albatross | 5 |
- **Winner:** highest total points

### Matchplay (Classic — "X up" standing)
- Compare scores per hole between two players/teams
- Hole result: Win (W) / Loss (L) / Halved (H)
- Standing shown as: "Arthur 2 up" / "All square" / "Mike 1 up"
- Standing updates after each hole in the header
- Match ends early if someone cannot be caught: e.g. "Arthur wins 3&2" (3 up with 2 to play)

### Scramble
- Team format (2 teams)
- All players hit, best shot chosen, everyone plays from there
- One team score per hole
- **Winner:** team with lowest total strokes

### Best Ball (Four Ball)
- Team format
- Each player plays their own ball
- Best individual score on the team counts per hole
- **Winner:** team with best combined score

---

## 9. Data Storage

All data stored locally using `localStorage` (PWA, no backend needed).

### Keys
| Key | Contents |
|-----|----------|
| `masters_players` | Array of player profile objects |
| `masters_rounds` | Array of completed round objects |
| `masters_active_round` | Current in-progress round (if any) |

### Round data model
```json
{
  "id": "uuid",
  "date": "2026-05-28T14:30:00",
  "clubId": "damme",
  "courseId": "presidents-nine",
  "tee": "yellow",
  "totalHoles": 9,
  "playedTwice": false,
  "format": "strokeplay",
  "players": ["player-uuid-1", "player-uuid-2"],
  "teams": null,
  "scores": {
    "player-uuid-1": [4, 5, 3, 5, 4, 6, 4, 3, 4],
    "player-uuid-2": [4, 4, 3, 5, 5, 5, 4, 2, 4]
  },
  "winner": "player-uuid-2",
  "completed": true
}
```

When `playedTwice: true`, scores array has 18 entries (holes 1–9 twice). The SI for holes 10–18 uses `second9` values from the hole data.

---

## 10. PWA Requirements

### manifest.json
```json
{
  "name": "Masters",
  "short_name": "Masters",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F6E56",
  "theme_color": "#0F6E56",
  "icons": [
    { "src": "logo.png", "sizes": "192x192", "type": "image/png" },
    { "src": "logo.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker
- Cache all app assets on install
- Serve from cache when offline
- Cache strategy: Cache First for static assets

### iOS Safari install
- Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- Add `<link rel="apple-touch-icon" href="logo.png">`

---

## 11. File Structure (suggested)

```
masters/
├── index.html
├── manifest.json
├── sw.js                    (service worker)
├── logo.png                 (Masters logo — provided)
├── css/
│   └── styles.css
├── js/
│   ├── app.js               (main app logic, routing)
│   ├── data/
│   │   └── courses.js       (hardcoded course data)
│   ├── storage.js           (localStorage helpers)
│   ├── scoring.js           (format scoring logic)
│   └── ui/
│       ├── home.js
│       ├── history.js
│       ├── players.js
│       └── liveRound.js
```

---

## 12. Build Phases

| Phase | What to build | Priority |
|-------|--------------|----------|
| 1 | New round setup flow + Live hole-by-hole scorecard | MVP — start here |
| 2 | Save round + History tab (list + detail view) | Core |
| 3 | Players tab — profiles + handicap history | Core |
| 4 | Winner calculation per format | Core |
| 5 | PWA setup — manifest, service worker, offline | Before deploying |
| 6 | GitHub Pages deployment | Deploy |
| 7 | Statistics screen, share scorecard, more courses | Later |

---

## 13. Logo

Logo file: `Logo_GolfApp_Masters.png`
- Style: Augusta-inspired, Belgium silhouette in gold, dark green background
- Use as app icon, splash screen, and Home tab header
- Background color matches `--green-primary` (#0F6E56)
