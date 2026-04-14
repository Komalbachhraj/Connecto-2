const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authmiddleware");

// ==================== SKILLS ====================

// GET user skills
router.get("/skills", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT skills FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    const skills = rows[0].skills
      ? (typeof rows[0].skills === "string" ? JSON.parse(rows[0].skills) : rows[0].skills)
      : [];
    res.json({ skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE user skills
router.put("/skills", authMiddleware, async (req, res) => {
  const { skills } = req.body;
  if (!Array.isArray(skills)) return res.status(400).json({ message: "Skills must be an array" });
  try {
    await db.query(
      "UPDATE users SET skills = ? WHERE id = ?",
      [JSON.stringify(skills), req.user.id]
    );
    res.json({ message: "Skills updated successfully!", skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// ==================== HACKATHON ROOMS ====================

// GET all hackathon rooms (optionally filter by skill keyword)
router.get("/rooms", authMiddleware, async (req, res) => {
  const { skill } = req.query;
  try {
    let query = `
      SELECT 
        hr.*,
        u.username AS creator_name,
        (SELECT COUNT(*) FROM hackathon_members hm WHERE hm.room_id = hr.id AND hm.status = 'accepted') AS current_members,
        (SELECT COUNT(*) FROM hackathon_members hm WHERE hm.room_id = hr.id AND hm.status = 'pending' AND hm.user_id = ?) AS my_request_pending,
        (SELECT COUNT(*) FROM hackathon_members hm WHERE hm.room_id = hr.id AND hm.status = 'accepted' AND hm.user_id = ?) AS i_am_member
      FROM hackathon_rooms hr
      JOIN users u ON hr.creator_id = u.id
      WHERE hr.is_active = 1
    `;
    const params = [req.user.id, req.user.id];

    if (skill) {
      query += " AND hr.required_skills LIKE ?";
      params.push(`%${skill}%`);
    }

    query += " ORDER BY hr.created_at DESC";

    const [rooms] = await db.query(query, params);

    const enriched = rooms.map((room) => ({
      ...room,
      required_skills: room.required_skills
        ? (typeof room.required_skills === "string" ? JSON.parse(room.required_skills) : room.required_skills)
        : [],
      is_full: room.current_members >= room.team_size,
      is_creator: room.creator_id === req.user.id,
      has_requested: room.my_request_pending > 0,
      is_member: room.i_am_member > 0,
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE hackathon room
router.post("/rooms", authMiddleware, async (req, res) => {
  const { hackathon_name, description, required_skills, team_size, deadline } = req.body;
  if (!hackathon_name || !team_size) {
    return res.status(400).json({ message: "hackathon_name and team_size are required" });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO hackathon_rooms (hackathon_name, description, required_skills, team_size, deadline, creator_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        hackathon_name,
        description || "",
        JSON.stringify(required_skills || []),
        team_size,
        deadline || null,
        req.user.id,
      ]
    );
    // Auto-add creator as accepted member
    await db.query(
      "INSERT INTO hackathon_members (room_id, user_id, status) VALUES (?, ?, 'accepted')",
      [result.insertId, req.user.id]
    );
    res.json({ message: "Room created!", room_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create room" });
  }
});

// DELETE hackathon room (only creator)
router.delete("/rooms/:roomId", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT creator_id FROM hackathon_rooms WHERE id = ?",
      [roomId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Room not found" });
    if (rows[0].creator_id !== req.user.id)
      return res.status(403).json({ message: "Only creator can delete this room" });

    await db.query("DELETE FROM hackathon_members WHERE room_id = ?", [roomId]);
    await db.query("UPDATE hackathon_rooms SET is_active = 0 WHERE id = ?", [roomId]);
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete room" });
  }
});

// REQUEST to join a room
router.post("/rooms/:roomId/request", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  try {
    // Check if room exists and not full
    const [roomRows] = await db.query(
      `SELECT hr.team_size, hr.creator_id,
        (SELECT COUNT(*) FROM hackathon_members hm WHERE hm.room_id = hr.id AND hm.status = 'accepted') AS current_members
       FROM hackathon_rooms hr WHERE hr.id = ? AND hr.is_active = 1`,
      [roomId]
    );
    if (roomRows.length === 0) return res.status(404).json({ message: "Room not found" });
    const room = roomRows[0];
    if (room.current_members >= room.team_size)
      return res.status(400).json({ message: "Room is full" });
    if (room.creator_id === req.user.id)
      return res.status(400).json({ message: "You are the creator" });

    // Check duplicate request
    const [existing] = await db.query(
      "SELECT id FROM hackathon_members WHERE room_id = ? AND user_id = ?",
      [roomId, req.user.id]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Already requested or member" });

    await db.query(
      "INSERT INTO hackathon_members (room_id, user_id, status) VALUES (?, ?, 'pending')",
      [roomId, req.user.id]
    );
    res.json({ message: "Request sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send request" });
  }
});

// GET pending requests for a room (creator only)
router.get("/rooms/:roomId/requests", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  try {
    const [roomRows] = await db.query(
      "SELECT creator_id FROM hackathon_rooms WHERE id = ?",
      [roomId]
    );
    if (roomRows.length === 0) return res.status(404).json({ message: "Room not found" });
    if (roomRows[0].creator_id !== req.user.id)
      return res.status(403).json({ message: "Only creator can view requests" });

    const [requests] = await db.query(
      `SELECT hm.id, hm.user_id, u.username, u.skills, hm.created_at
       FROM hackathon_members hm
       JOIN users u ON hm.user_id = u.id
       WHERE hm.room_id = ? AND hm.status = 'pending'`,
      [roomId]
    );
    const enriched = requests.map((r) => ({
      ...r,
      skills: r.skills
        ? (typeof r.skills === "string" ? JSON.parse(r.skills) : r.skills)
        : [],
    }));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ACCEPT/REJECT a join request (creator only)
router.patch("/rooms/:roomId/requests/:memberId", authMiddleware, async (req, res) => {
  const { roomId, memberId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'

  if (!["accept", "reject"].includes(action))
    return res.status(400).json({ message: "action must be accept or reject" });

  try {
    const [roomRows] = await db.query(
      "SELECT creator_id, team_size FROM hackathon_rooms WHERE id = ?",
      [roomId]
    );
    if (roomRows.length === 0) return res.status(404).json({ message: "Room not found" });
    if (roomRows[0].creator_id !== req.user.id)
      return res.status(403).json({ message: "Only creator can manage requests" });

    if (action === "accept") {
      // Check if still has space
      const [[{ cnt }]] = await db.query(
        "SELECT COUNT(*) AS cnt FROM hackathon_members WHERE room_id = ? AND status = 'accepted'",
        [roomId]
      );
      if (cnt >= roomRows[0].team_size)
        return res.status(400).json({ message: "Team is already full" });

      await db.query(
        "UPDATE hackathon_members SET status = 'accepted' WHERE id = ? AND room_id = ?",
        [memberId, roomId]
      );
    } else {
      await db.query(
        "DELETE FROM hackathon_members WHERE id = ? AND room_id = ?",
        [memberId, roomId]
      );
    }
    res.json({ message: `Request ${action}ed successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET members of a room
router.get("/rooms/:roomId/members", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  try {
    const [members] = await db.query(
      `SELECT hm.user_id, u.username, u.skills, hm.status
       FROM hackathon_members hm
       JOIN users u ON hm.user_id = u.id
       WHERE hm.room_id = ? AND hm.status = 'accepted'`,
      [roomId]
    );
    const enriched = members.map((m) => ({
      ...m,
      skills: m.skills
        ? (typeof m.skills === "string" ? JSON.parse(m.skills) : m.skills)
        : [],
    }));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;