# Warning / Alarm Reasons

This document defines **all allowed `reason.type` values** used by the warning system.

This is a **semantic contract**, not a UX description.

Each reason:
- MUST be produced by `checkWarnings.js`
- MUST be translated in all i18n files
- MUST be kept in sync with code automatically

---

## Alarm (Meteorological Danger)

These reasons represent **real danger** and may directly trigger `alarm`.

- storm_now  
  Dangerous storm conditions are happening right now.

- storm_future  
  Dangerous storm conditions are expected in the near future.

---

## Warning (Human Comfort)

These reasons represent **noticeable but non-dangerous conditions**.

### Temperature

- feelslike_noticeable  
  Feels-like temperature differs significantly from actual air temperature.

---

### Wind

- wind_noticeable  
  Wind is noticeable and clearly felt.

- wind_future  
  Wind conditions will become noticeable in the near future.

---

### Humidity

- humidity_low  
  Very low humidity that may cause dryness or discomfort.

- humidity_high  
  Very high humidity that may feel uncomfortable.

- humidity_future  
  Humidity level will change noticeably in the near future.

---

### Precipitation

- rain_now  
  Precipitation is occurring right now.

- rain_future  
  Precipitation is expected in the near future.

---

## Rules

- No `reason.type` may exist outside this list
- No undocumented reason types are allowed
- Comfort reasons must not directly trigger `alarm`
- Changes require updating:
  - this file
  - i18n files
  - automated checks

---

## Status

This list is **authoritative**.

All automated tests rely on it.
