const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authmiddleware");

// Get Profile Data
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // req.user.id aapke authMiddleware se aayega
    const [rows] = await db.query(
      "SELECT username, email, hometown,bio FROM users WHERE id = ?",
      [req.user.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
   return res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile Data
router.put("/profile/update", authMiddleware, async (req, res) => {
  const { name, phone, hometown, bio } = req.body;
  try {
    // Note: Agar aap username update kar rahe hain toh column name 'username' use karein
    await db.query(
      "UPDATE users SET username = ?, phone = ?, hometown = ?, bio = ? WHERE id = ?",
      [name, phone, hometown, bio, req.user.id],
    );
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});
router.get("/matches", authMiddleware, async (req, res) => {
  try {
    // Step 1: Get current user's community IDs
    const [myCommRows] = await db.query(
      "SELECT community_id FROM user_communities WHERE user_id = ?",
      [req.user.id]
    );
    const myCommunityIds = myCommRows.map((r) => r.community_id);

    if (myCommunityIds.length === 0) {
      return res.json([]); // No communities joined yet
    }

    // Step 2: Find other users who share at least 1 community
    // Count shared communities and calculate match score
    const [matches] = await db.query(
      `SELECT
          u.id,
          u.username AS name,
          u.email,
          u.hometown,
          COUNT(uc.community_id)                        AS sharedCount,
          ROUND(COUNT(uc.community_id) / ? * 100)       AS score,
          GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ',') AS sharedCommunityNames,
          GROUP_CONCAT(c.slug ORDER BY c.name SEPARATOR ',') AS sharedCommunitySlugs
       FROM users u
       INNER JOIN user_communities uc
          ON u.id = uc.user_id AND uc.community_id IN (?)
       INNER JOIN communities c
          ON c.id = uc.community_id
       WHERE u.id != ?
       GROUP BY u.id, u.username, u.email, u.hometown
       ORDER BY sharedCount DESC, u.username ASC
       LIMIT 20`,
      [myCommunityIds.length, myCommunityIds, req.user.id]
    );

    // Step 3: For each match, also get ALL their communities (not just shared)
    const enriched = await Promise.all(
      matches.map(async (match) => {
        const [allComms] = await db.query(
          `SELECT c.name, c.slug, c.icon
           FROM communities c
           INNER JOIN user_communities uc ON c.id = uc.community_id
           WHERE uc.user_id = ?`,
          [match.id]
        );
        return {
          id: match.id,
          name: match.name,
          email: match.email,
          hometown: match.hometown,
          score: Math.min(match.score, 100), // cap at 100%
          shared: match.sharedCommunityNames
            ? match.sharedCommunityNames.split(",")
            : [],
          communities: allComms.map((c) => c.name),
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Get All Buddies (Excluding current user)
router.get("/all-buddies", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, username, hometown, avatar_url, bio, course, year, travelMode, interests, online 
       FROM users 
       WHERE id != ?`,
      [req.user.id],
    );

    const formattedRows = rows.map((user) => ({
      id: user.id,
      name: user.username,
      hometown: user.hometown || "Unknown",
      // Agar avatar_url hai toh wo use karo, nahi toh naam ka pehla letter
      avatar: user.avatar_url
        ? user.avatar_url
        : user.username.charAt(0).toUpperCase(),
      course: user.course,
      year: user.year,
      interests:
        typeof user.interests === "string"
          ? JSON.parse(user.interests)
          : user.interests || [],
      travelMode: user.travelMode,
      online: Boolean(user.online),
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch buddies" });
  }
});
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // 1️⃣ Get user info
    const [users] = await db.query(
      `SELECT 
        id,
        username,
        email,
        hometown,
        bio,
        course,
        year,
        interests
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    // 2️⃣ Get communities joined
    const [communities] = await db.query(
      `
      SELECT 
        c.id,
        c.name,
        c.slug
      FROM user_communities uc
      JOIN communities c
        ON uc.community_id = c.id
      WHERE uc.user_id = ?
      `,
      [userId],
    );

    res.json({
      ...user,
      communities,
      interests:
        typeof user.interests === "string"
          ? JSON.parse(user.interests)
          : user.interests || [],
    });
  } catch (err) {
    console.error("Profile fetch error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});
module.exports = router;
