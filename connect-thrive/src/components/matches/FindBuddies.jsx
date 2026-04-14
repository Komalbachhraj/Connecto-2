import React, { useState, useMemo } from "react";
import MatchCard from "./MatchCard";
import { rankMatches } from "../../utils/matchingAlgorithm";
import styles from "./FindBuddies.module.css";

const ALL_COMMUNITIES = [
  "All",
  "Startup",
  "Travel",
  "Wellness",
  "DSA",
  "Gym",
  "Coding",
  "Music",
];

const HOW_STEPS = [
  {
    title: "Interest Overlap",
    desc: "Shared hobbies, sports & food preferences boost score",
  },
  {
    title: "Community Overlap",
    desc: "More shared communities = higher match score",
  },
  {
    title: "Activity Level",
    desc: "Active members get prioritised in results",
  },
  { title: "Campus Proximity", desc: "Same year & dept gives a score boost" },
  { title: "Connect & Chat", desc: "Send a request to start your journey" },
];

/**
 * @param {object}   myProfile  - Current user's profile (from onboarding)
 * @param {object[]} students   - All other students from your database
 */
export default function FindBuddies({ myProfile = {}, students = [] }) {
  const [activeFilter, setActiveFilter] = useState("All");

  // Rank all students against myProfile using the algorithm
  const ranked = useMemo(
    () => rankMatches(myProfile, students),
    [myProfile, students],
  );

  // Apply community filter
  const visible = useMemo(() => {
    if (activeFilter === "All") return ranked;
    return ranked.filter((s) => (s.communities ?? []).includes(activeFilter));
  }, [ranked, activeFilter]);

  const topFour = ranked.slice(0, 4);

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        {/* ── Header ── */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>
              Your <span className={styles.accent}>Perfect Matches</span> ✦
            </h1>
            <p className={styles.pageSubtitle}>
              Found {ranked.length} students across your communities
            </p>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{ranked.length}</span>
              <span className={styles.statLbl}>Students</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{visible.length}</span>
              <span className={styles.statLbl}>Showing</span>
            </div>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className={styles.filters}>
          {ALL_COMMUNITIES.map((c) => (
            <button
              key={c}
              className={`${styles.filterBtn} ${activeFilter === c ? styles.filterActive : ""}`}
              onClick={() => setActiveFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── Match grid ── */}
        {visible.length === 0 ? (
          <p className={styles.empty}>
            No matches for this community yet. Try a different filter.
          </p>
        ) : (
          <div className={styles.grid}>
            {visible.map((match, i) => (
              <MatchCard
                key={match.id ?? match.name}
                match={match}
                colorIndex={i}
                onConnect={(m) =>
                  console.log("Connect request sent to:", m.name)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        {/* Top matches today */}
        <div className={styles.sideCard}>
          <p className={styles.sideTitle}>⚡ Top Matches Today</p>
          {topFour.map((m, i) => {
            const initials = m.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const colors = ["#00e5ff", "#a78bfa", "#39d353", "#ff9800"];
            const bgs = [
              "rgba(0,229,255,0.18)",
              "rgba(167,139,250,0.18)",
              "rgba(57,211,83,0.18)",
              "rgba(255,152,0,0.18)",
            ];
            return (
              <div key={m.name} className={styles.topRow}>
                <div
                  className={styles.miniAvatar}
                  style={{ background: bgs[i], color: colors[i] }}
                >
                  {initials}
                </div>
                <div className={styles.miniInfo}>
                  <p className={styles.miniName}>{m.name}</p>
                  <p className={styles.miniSub}>
                    {(m.communities ?? []).slice(0, 2).join(" · ")}
                  </p>
                </div>
                <span className={styles.miniPct} style={{ color: colors[i] }}>
                  {m.score}%
                </span>
              </div>
            );
          })}
        </div>

        {/* How matching works */}
        <div className={styles.sideCard}>
          <p className={styles.sideTitle}>How Matching Works</p>
          {HOW_STEPS.map(({ title, desc }, i) => (
            <div key={title} className={styles.howStep}>
              <div className={styles.howNum}>{i + 1}</div>
              <div>
                <p className={styles.howTitle}>{title}</p>
                <p className={styles.howDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* You're not alone */}
        <div className={`${styles.sideCard} ${styles.aloneCard}`}>
          <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>
            💙
          </span>
          <p className={styles.aloneTitle}>You're not alone</p>
          <p className={styles.aloneDesc}>
            Campus life can be overwhelming. Connecto helps you find your people
            — one connection at a time.
          </p>
        </div>
      </aside>
    </div>
  );
}
