// ─────────────────────────────────────────────────────────────
// In your existing Signup.tsx, find the handleSubmit function
// and change the navigate("/") line to navigate("/onboarding")
//
// The change is just ONE LINE. Find this pattern in your file:
// ─────────────────────────────────────────────────────────────

import axios from "axios";

// BEFORE (what you have now):
//   navigate("/");
//   // or navigate("/home");
//   // or navigate("/profile");

// AFTER (replace it with this):
//   navigate("/onboarding");

// ─────────────────────────────────────────────────────────────
// Example of what your handleSubmit probably looks like.
// Only the navigate line changes — everything else stays the same.
// ─────────────────────────────────────────────────────────────

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await axios.post("https://connecto-2.onrender.com/api/auth/signup", {
      username: name,
      email,
      password,
    });

    // Save the token exactly as you do now
    localStorage.setItem("token", res.data.token);

    toast({
      title: "Account created!",
      description: "Let's set up your profile.",
    });

    // ← THIS IS THE ONLY CHANGE: send new users to onboarding
    navigate("/onboarding");
  } catch (err: any) {
    toast({
      variant: "destructive",
      title: "Signup failed",
      description: err.response?.data?.message || "Please try again.",
    });
  }
};
