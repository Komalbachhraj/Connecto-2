const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Aapka promise-based pool
const verifyToken=require("../middlewares/authmiddleware.js");
const authMiddleware = require("../middlewares/authmiddleware");
// 1. Post Idea Route
router.post("/post-idea", verifyToken, async (req, res) => {
  try {
    const { title, problem, solution, skills, category, stage } = req.body;
    
    // Ab 'author' frontend se lene ki zarurat nahi hai, 
    // wo verifyToken se 'req.user.id' mein mil jayega.
    const userId = req.user.id; 

    // SQL query mein 'author' ki jagah 'user_id' use hoga
    const sql = `
      INSERT INTO startup_ideas 
      (title, problem, solution, skills, category, stage, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      title,
      problem,
      solution,
      JSON.stringify(skills), // Skills ko stringify karke store karna sahi hai
      category,
      stage,
      userId,
    ]);

    res.status(201).json({ 
      message: "Idea saved!", 
      id: result.insertId 
    });
  } catch (err) {
    console.error("Error in post-idea:", err);
    res.status(500).json({ error: "Failed to save idea" });
  }
});

// 2. Get Ideas Route
router.get("/ideas", async (req, res) => {
  try {
    const sql = "SELECT * FROM startup_ideas ORDER BY created_at DESC";

    // Promise-based query
    const [results] = await db.query(sql);

    res.json(results);
  } catch (err) {
    console.error("Error in get-ideas:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// Get single idea by ID
// Get single idea by ID
// Note: verifyToken ko use karein, lekin isme error handling aisi ho ki 
// agar token na bhi ho toh idea dikh jaye (lekin isLiked false rahe)
router.get('/idea/:id', verifyToken,async (req, res) => {
    try {
        // Token check karne ke liye manually handle kar sakte hain ya 
        // ek optionalAuth middleware bana sakte hain. 
        // Filhaal hum manually token extract kar lete hain headers se:
        const authHeader = req.headers.authorization;
        let userId = req.user ? req.user.id : null; // Agar verifyToken ne set kiya hai toh use karo


        const [rows] = await db.query("SELECT * FROM startup_ideas WHERE id = ?", [req.params.id]);
        const ideaId = req.params.id;

        if (rows.length === 0) {
            return res.status(404).json({ message: "Idea not found" });
        }

        let isLiked = false;
        const idea = rows[0];
        
        // Check if liked only if userId exists
        if (userId) {
            const [likeCheck] = await db.query(
                "SELECT * FROM idea_likes WHERE user_id = ? AND idea_id = ?",
                [userId, ideaId]
            );
            if (likeCheck.length > 0) isLiked = true;
        }

        idea.skills = typeof idea.skills === 'string' ? JSON.parse(idea.skills) : idea.skills;
        
        res.json({ ...idea, isLiked });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// api/startup/idea/:id/like
router.post('/idea/:id/like',authMiddleware, async (req, res) => {
    const ideaId = req.params.id;
    const userId = req.user.id; 

    try {
        // Check karo kya pehle se like exists karta hai
        const [existing] = await db.query('SELECT * FROM idea_likes WHERE user_id = ? AND idea_id = ?', [userId, ideaId]);

        if (existing.length > 0) {
            // Un-like: Delete record and decrement count
            await db.query('DELETE FROM idea_likes WHERE user_id = ? AND idea_id = ?', [userId, ideaId]);
            await db.query('UPDATE startup_ideas SET likes_count = likes_count - 1 WHERE id = ?', [ideaId]);
            return res.json({ liked: false });
        } else {
            // Like: Insert record and increment count
            await db.query('INSERT INTO idea_likes (user_id, idea_id) VALUES (?, ?)', [userId, ideaId]);
            await db.query('UPDATE startup_ideas SET likes_count = likes_count + 1 WHERE id = ?', [ideaId]);
            return res.json({ liked: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});