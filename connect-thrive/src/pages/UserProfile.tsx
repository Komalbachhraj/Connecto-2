import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { MapPin, Mail } from "lucide-react";

const API = "https://connecto-2.onrender.com/api/users";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/profile/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}

          <div className="glass-card p-8 mb-8 text-center">
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white">
              {user.username?.charAt(0)}
            </div>

            <h1 className="text-3xl font-bold mt-4">{user.username}</h1>

            <div className="flex justify-center gap-4 text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {user.hometown}
              </span>
            </div>

            <p className="mt-4 text-muted-foreground">
              {user.bio || "No bio available"}
            </p>

            {/* Message Button */}

            <Button
              className="mt-4 btn-glow"
              onClick={() => navigate(`/messages/${user.id}`)}
            >
              Message
            </Button>
          </div>

          {/* Communities */}

          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Communities Joined</h2>

            <div className="flex flex-wrap gap-3">
              {user.communities.map((c: any) => (
                <div
                  key={c.id}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Interests</h2>

            <div className="flex flex-wrap gap-2">
              {user.interests.map((i: string) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default UserProfile;
