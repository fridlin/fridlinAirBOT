# 🌤 FridlinAirBOT — Architecture

This document describes the architectural principles, responsibilities,  
and hard rules of the **FridlinAirBOT** system.

🎯 **Primary goals**:
- Predictability
- Debuggability
- UX safety
- Provider independence

The system favors **clear failures over silent degradation**.

---

## 🧠 1. Core Principles

- One responsibility per module
- No silent failures
- No hidden state
- UX must never break mid-flow
- Data sources are replaceable
- Business logic is provider-agnostic

---

## 🔄 2. High-Level Flow

User
↓
micro.js (orchestrator)
↓
Forecast Provider (API)
↓
Microgrid aggregation
↓
Interpolation (15 min)
↓
Analysis (trends / alerts)
↓
UI point selection
↓
UX rendering
↓
Warning / Alarm (optional)

yaml
Копировать код

Each step:
- validates input
- logs failures
- returns control explicitly

---

## 🧩 3. Responsibility Separation

### 3.1 🧭 Orchestrator — `micro.js`

**Responsibilities**
- Owns user flow
- Owns UX decisions
- Handles hard failures
- Decides when to reset to `/start`
- Combines all layers

**Rules**
- Any `null` / invalid result → **hard fail**
- No data fetching
- No provider-specific logic

---

### 3.2 ☁️ Forecast API Layer — `weatherForecast.js`

**Responsibilities**
- Fetch forecast data
- Convert provider response to canonical format
- Validate contract
- Log provider / network / contract errors

**Rules**
- No UX logic
- No microgrid logic
- No interpolation
- Returns `null` on failure

**Canonical forecast format**
```js
{
  ts: Number,
  temperature: Number | null,
  feelsLike: Number | null,
  windSpeed: Number | null,
  windGusts: Number | null,
  humidity: Number | null,
  cloudCover: Number | null,
  precipitation: Number | null,
  precipitationType: String | null
}
3.3 🕰 Historical Weather — weatherHistory.js
Responsibilities

Fetch historical weather

Convert to canonical format

Validate contract

Log failures loudly

Rules

No UX logic

Optional data source

Failure must NOT break main forecast

Canonical historical format

js
Копировать код
{
  ts: Number,
  feelsLike: Number | null,
  windSpeed: Number | null,
  humidity: Number | null,
  cloudCover: Number | null
}
3.4 ⚙️ Provider Configuration
Files:

forecastProvider.js

weatherProvider.js

Responsibilities

Single source of truth for provider selection

Declare provider capabilities

Decouple code from APIs

Rules

Provider choice is configuration, not logic

Changing provider must NOT affect micro.js

🌐 4. Micro Forecast Logic
4.1 🧮 Microgrid Aggregation — microGridAggregator.js
Responsibilities

Aggregate forecast across microgrid

Average values by timestamp

Rules

No API calls

No interpolation

No feels-like calculation

Assumes aligned timestamps

Logs assumptions explicitly

4.2 🔢 Interpolation — interpolateForecast.js
Responsibilities

Convert hourly → 15-minute forecast

Calculate feels-like values

Rules

No API calls

No UX logic

Defensive handling of invalid points

May skip inconsistent data

4.3 ⏱ Time Window Enforcement
Internal resolution: 15 minutes

Forecast window limited by HOURS_AHEAD

UI never receives extra data

Filtering happens before analysis

📊 5. Analysis & Semantics
5.1 📈 Forecast Analysis — analyzeForecastWindow.js
Responsibilities

Detect trends relative to “now”

Detect sharp changes

Compute alert semantics

Rules

Pure function

No UX or API knowledge

5.2 🕯 Yesterday Comparison
Data fetched via API (not session)

Informational only (not warning)

Same thresholds as warnings

Cloud cover is meaningful

Time shown explicitly (HH:MM)

🚨 6. Warning / Alarm System
6.1 Semantic Separation
Warning → human comfort

Alarm → real meteorological danger

Comfort can never escalate directly into danger.

6.2 Responsibility Separation
checkWarnings.js
Detects facts

Decides semantic types

No text, no UX

formatWarning.js
Translates semantics to text

i18n only

warningAlarm.js
Visual presentation only

Equivalent to CSS layer

6.3 Reason Types
Every reason.type MUST exist in:

code

i18n

documentation

🎨 7. UI Architecture
7.1 Text Layout
All rendering via textLayout.js

No manual \n

UI layer knows presentation only

7.2 UI Forecast Points
Internal data: 15-minute resolution

UI data: fixed number of points

Base point: nearest ≤ +15 min from now

Step: configurable (default 30 min)

🧯 8. Error Handling & Fault Isolation
8.1 Layered Error Handling
Services

Log errors

Return null

Never handle UX

Logic / Math

Defensive validation

Log inconsistencies

May skip bad data

Orchestrator

Treats any invalid result as fatal

Logs error

Resets UX to /start

8.2 Mandatory Logging
Silent failures are forbidden.

Required prefixes:

[FORECAST][PROVIDER][FAIL]

[FORECAST][CONTRACT][FAIL]

[HISTORY][CONTRACT][FAIL]

[MICRO][GRID][FAIL]

[MICRO][INTERPOLATE][FAIL]

[MICRO][UI_POINTS][FAIL]

8.3 Hard Fail Rule
Any critical failure:

must be logged

must stop the pipeline

must reset user flow

Partial UI rendering is not allowed.

8.4 Assumptions & Trust Boundaries
Microgrid aggregation

Assumes aligned timestamps

Logs assumptions

Interpolation

Allows partial skips

Never throws

Final validation always happens in micro.js.

🌍 9. i18n Rules
All user text lives in i18n JSON

All keys must exist in all languages

Logic never embeds raw text

🧪 10. Quality Gates
Missing i18n key → build failure

Unknown warning reason → build failure

Architecture violation → ship must fail

🔁 11. Evolution Rules
Architecture may evolve

Rules may be extended, not silently broken

Deviations must be documented

🟢 Status
Architecture is stable and evolving.