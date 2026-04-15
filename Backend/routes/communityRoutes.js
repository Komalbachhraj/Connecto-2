const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../middlewares/authmiddleware");

// 1. JOIN Community (Ab ID use ho rahi hai)
router.post("/:id/join", authenticateToken, async (req, res) => {
  // Params se 'id' lo aur use Number mein convert karo
  const communityId = parseInt(req.params.id);
  const userId = req.user.id;

  // Agar ID number nahi hai toh error bhej do
  if (isNaN(communityId)) {
    return res.status(400).json({ message: "Invalid Community ID" });
  }

  try {
    // Check karo ki ye ID database mein exist karti bhi hai ya nahi
    const [communities] = await db.query(
      "SELECT id FROM communities WHERE id = ?",
      [communityId],
    );

    if (communities.length === 0) {
        console.log("Community NOT FOUND in DB");
        console.log(communityId);
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if already joined
    const [existing] = await db.query(
      "SELECT * FROM community_members WHERE user_id = ? AND community_id = ?",
      [userId, communityId],
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Already a member" });
    }

    // Insert member
    await db.query(
      "INSERT INTO community_members (user_id, community_id) VALUES (?, ?)",
      [userId, communityId],
    );

    res.json({ message: "Joined successfully 🎉" });
  } catch (err) {
    console.error("JOIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. LEAVE Community
router.delete("/:id/leave", authenticateToken, async (req, res) => {
  const communityId = parseInt(req.params.id);
  const userId = req.user.id;

  if (isNaN(communityId)) {
    return res.status(400).json({ message: "Invalid Community ID" });
  }

  try {
    await db.query(
      "DELETE FROM community_members WHERE user_id = ? AND community_id = ?",
      [userId, communityId],
    );

    res.json({ message: "Left community" });
  } catch (err) {
    console.error("LEAVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. GET My Joined Communities
router.get("/my-communities", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT community_id FROM community_members WHERE user_id = ?`,
      [req.user.id],
    );

    // Sirf IDs ki array bhejo taaki frontend pe .includes() lag sake
    const joinedIds = rows.map((row) => row.community_id);
    res.json({ communities: joinedIds });
  } catch (err) {
    console.error("FETCH STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/my-communities/details", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
        SELECT 
          c.id,
          c.name,
          c.slug
        FROM community_members cm
        JOIN communities c 
          ON cm.community_id = c.id
        WHERE cm.user_id = ?
        `,
      [userId],
    );

    res.json(rows);
  } catch (err) {
    console.error("FETCH COMMUNITY DETAILS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});
router.get("/:id/members-count", async (req, res) => {
  try {
    const communityId = Number(req.params.id);

    console.log("Fetching members count for:", communityId);
   const [rows]=  await db.query(
      `SELECT community_id FROM community_members WHERE community_id = ?`,
      [communityId],
    );
    const count=rows.length;

    res.status(200).json({
      communityId,
      membersCount: count,
    });
  } catch (error) {
    console.error("Members count error:", error);
    res.status(500).json({
      message: "Failed to fetch members count",
    });
  }
});

module.exports = router;
