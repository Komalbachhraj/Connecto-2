import React from "react";
import ChipSelector from "./ChipSelector";
import {
  YEAR_OPTIONS,
  DEPT_OPTIONS,
  GENDER_OPTIONS,
} from "../../utils/onboardingConfig";
import styles from "./OnboardingSteps.module.css";

// ── Step 1: Basics ────────────────────────────────────────────
export function BasicsStep({ profile, setField }) {
  return (
    <div className={styles.stepBody}>
      <div className={styles.twoCol}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Academic Year</label>
          <select
            className={styles.select}
            value={profile.year}
            onChange={(e) => setField("year", e.target.value)}
          >
            <option value="">Select year…</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Department</label>
          <select
            className={styles.select}
            value={profile.dept}
            onChange={(e) => setField("dept", e.target.value)}
          >
            <option value="">Select dept…</option>
            {DEPT_OPTIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>I identify as</label>
        <div className={styles.genderGrid}>
          {GENDER_OPTIONS.map(({ icon, label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setField("gender", value)}
              className={[
                styles.genderCard,
                profile.gender === value ? styles.genderSelected : "",
              ].join(" ")}
            >
              <span className={styles.genderIcon}>{icon}</span>
              <span className={styles.genderLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Personality ───────────────────────────────────────
export function PersonalityStep({ profile, setField, toggleArrayField, stepConfig }) {
  return (
    <div className={styles.stepBody}>
      <label className={styles.label} style={{ marginBottom: 10 }}>
        I'm more of a…
      </label>
      <div className={styles.vibeGrid}>
        {stepConfig.vibes.map(({ icon, label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setField("personality", value)}
            className={[
              styles.genderCard,
              profile.personality === value ? styles.genderSelected : "",
            ].join(" ")}
          >
            <span className={styles.genderIcon}>{icon}</span>
            <span className={styles.genderLabel}>{label}</span>
          </button>
        ))}
      </div>

      <label className={styles.label} style={{ marginBottom: 8, marginTop: "1.2rem" }}>
        Typical weekend for me…
      </label>
      <p className={styles.selectNote}>✦ Pick up to {stepConfig.max}</p>
      <ChipSelector
        options={stepConfig.weekendOptions}
        selected={profile.weekendPref}
        onToggle={(v) => toggleArrayField("weekendPref", v, stepConfig.max)}
        accentClass="accentPurple"
      />
    </div>
  );
}

// ── Step 6: Food + Hobbies ────────────────────────────────────
export function FoodHobbiesStep({ profile, toggleArrayField, stepConfig }) {
  return (
    <div className={styles.stepBody}>
      <label className={styles.label} style={{ marginBottom: 8 }}>
        Food preferences
      </label>
      <p className={styles.selectNote}>✦ Pick your food vibes</p>
      <ChipSelector
        options={stepConfig.foodOptions}
        selected={profile.food}
        onToggle={(v) => toggleArrayField("food", v)}
        accentClass="accentPink"
      />

      <label className={styles.label} style={{ marginBottom: 8, marginTop: "1.2rem" }}>
        Hobbies & passions
      </label>
      <p className={styles.selectNote}>✦ Select up to {stepConfig.maxHobbies}</p>
      <ChipSelector
        options={stepConfig.hobbyOptions}
        selected={profile.hobbies}
        onToggle={(v) => toggleArrayField("hobbies", v, stepConfig.maxHobbies)}
        accentClass="accentCyan"
      />
    </div>
  );
}

// ── Step 7: Summary ───────────────────────────────────────────
const GENDER_LABELS = { M: "Male", F: "Female", NB: "Non-binary", X: "Private" };
const PERSONALITY_LABELS = { E: "Extrovert 🦋", I: "Introvert 🌙", A: "Ambivert ⚡" };

export function SummaryStep({ profile, onFinish }) {
  const sections = [
    {
      title: "About",
      values: [profile.year, profile.dept, GENDER_LABELS[profile.gender]].filter(Boolean),
      color: "var(--cyan)",
    },
    {
      title: "Personality",
      values: [PERSONALITY_LABELS[profile.personality], ...profile.weekendPref.slice(0, 2)].filter(Boolean),
      color: "var(--purple)",
    },
    { title: "Fields",  values: profile.fieldPref,  color: "var(--cyan)"   },
    { title: "Travel",  values: profile.placePref,  color: "var(--green)"  },
    { title: "Sports",  values: profile.sports,     color: "var(--orange)" },
    { title: "Food",    values: profile.food,        color: "var(--pink)"  },
    { title: "Hobbies", values: profile.hobbies,    color: "var(--cyan)"   },
  ].filter((s) => s.values.length > 0);

  return (
    <div className={styles.stepBody}>
      <div className={styles.summaryGrid}>
        {sections.map(({ title, values, color }) => (
          <div key={title} className={styles.summaryCard}>
            <p className={styles.summaryCardTitle}>{title}</p>
            <div className={styles.summaryTags}>
              {values.map((v) => (
                <span
                  key={v}
                  className={styles.summaryTag}
                  style={{ color, borderColor: `${color}30`, background: `${color}15` }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className={styles.finishBtn} onClick={onFinish}>
        ✦ Find My Match →
      </button>
    </div>
  );
}