import React, { useState } from "react";
import styles from "./MatchCard.module.css";

const AVATAR_COLORS = [
  { bg: "rgba(0,229,255,0.18)",   color: "#00e5ff" },
  { bg: "rgba(167,139,250,0.18)", color: "#a78bfa" },
  { bg: "rgba(57,211,83,0.18)",   color: "#39d353" },
  { bg: "rgba(255,152,0,0.18)",   color: "#ff9800" },
  { bg: "rgba(244,114,182,0.18)", color: "#f472b6" },
  { bg: "rgba(251,191,36,0.18)",  color: "#fbbf24" },
];

function badgeClass(score) {
  if (score >= 95) return styles.badge100;
  if (score >= 80) return styles.badgeHigh;
  if (score >= 70) return styles.badgeMid;
  return styles.badgeLow;
}

function barColor(score) {
  if (score >= 95) return "#00e5ff";
  if (score >= 80) return "#39d353";
  if (score >= 70) return "#fbbf24";
  return "#a78bfa";
}

/**
 * @param {object}   match          - Student object with score, why, tags etc.
 * @param {number}   colorIndex     - Index into AVATAR_COLORS
 * @param {function} onConnect      - Called when Connect is pressed
 */
export default function MatchCard({ match, colorIndex = 0, onConnect }) {
  const [sent, setSent] = useState(false);
  const ac = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  function handleConnect() {
    if (sent) return;
    setSent(true);
    onConnect?.(match);
  }

  const initials = match.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`${styles.card} ${match.score >= 95 ? styles.topMatch : ""}`}>
      {/* Badge */}
      <span className={`${styles.badge} ${badgeClass(match.score)}`}>
        {match.score}% match
      </span>

      {/* Avatar */}
      <div
        className={styles.avatar}
        style={{ background: ac.bg, color: ac.color }}
      >
        {initials}
      </div>

      <p className={styles.name}>{match.name}</p>
      <p className={styles.meta}>{match.year} · {match.dept}</p>

      {/* Score bar */}
      <div className={styles.scoreRow}>
        <span className={styles.scoreLabel}>Match Score</span>
        <div className={styles.scoreBarBg}>
          <div
            className={styles.scoreBar}
            style={{ width: `${match.score}%`, background: barColor(match.score) }}
          />
        </div>
        <span className={styles.scorePct} style={{ color: barColor(match.score) }}>
          {match.score}%
        </span>
      </div>

      {/* Why */}
      <p className={styles.why}>{match.why}</p>

      {/* Community tags */}
      <div className={styles.tags}>
        {(match.communities ?? []).map((c) => (
          <span key={c} className={`${styles.tag} ${styles.tagCyan}`}>{c}</span>
        ))}
      </div>

      {/* Interest tags */}
      <div className={styles.tags} style={{ marginBottom: 12 }}>
        {(match.tags ?? []).map(({ label, accent }) => (
          <span key={label} className={`${styles.tag} ${styles[accent] ?? styles.tagCyan}`}>
            {label}
          </span>
        ))}
      </div>

      <button
        className={`${styles.connectBtn} ${sent ? styles.sent : ""}`}
        onClick={handleConnect}
      >
        {sent ? "✓ Request Sent" : "+ Connect"}
      </button>
    </div>
  );
}