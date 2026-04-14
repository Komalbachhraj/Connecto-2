import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Star, Briefcase, GraduationCap, ArrowRight, Users,
} from "lucide-react";

interface Mentor {
  id: number;
  name: string;
  avatar: string;
  role: string;
  company: string;
  batch: string;
  expertise: string[];
  rating: number;
  sessions: number;
  bio: string;
  available: boolean;
}

const mentors: Mentor[] = [
  { id: 1, name: "Dr. Ananya Sharma", avatar: "A", role: "CTO", company: "TechNova", batch: "2015", expertise: ["AI/ML", "System Design", "Leadership"], rating: 4.9, sessions: 45, bio: "15+ years in tech. Passionate about mentoring next-gen founders.", available: true },
  { id: 2, name: "Rajesh Iyer", avatar: "R", role: "Founder & CEO", company: "EduStack", batch: "2012", expertise: ["EdTech", "Fundraising", "Growth"], rating: 4.8, sessions: 32, bio: "Built EduStack from 0 to $10M ARR. Love helping students validate ideas.", available: true },
  { id: 3, name: "Priya Menon", avatar: "P", role: "Product Lead", company: "Google", batch: "2016", expertise: ["Product Management", "UX", "Strategy"], rating: 4.7, sessions: 28, bio: "Ex-startup founder, now leading products at Google. Happy to guide on PM careers.", available: false },
  { id: 4, name: "Vikram Desai", avatar: "V", role: "VC Partner", company: "Sequoia Capital", batch: "2010", expertise: ["Fundraising", "Business Model", "Pitching"], rating: 4.9, sessions: 56, bio: "Invested in 30+ startups. Can help you refine your pitch and strategy.", available: true },
  { id: 5, name: "Kavita Nair", avatar: "K", role: "Engineering Manager", company: "Microsoft", batch: "2014", expertise: ["Backend", "Cloud", "Career Growth"], rating: 4.6, sessions: 19, bio: "10 years at Microsoft. Mentoring on tech careers and system architecture.", available: true },
  { id: 6, name: "Suresh Reddy", avatar: "S", role: "Co-Founder", company: "FinGrow", batch: "2018", expertise: ["FinTech", "Blockchain", "Startups"], rating: 4.8, sessions: 22, bio: "Building in FinTech space. Can guide on crypto, payments, and compliance.", available: false },
];

const MentorConnect = () => {
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("All");

  const allExpertise = ["All", ...Array.from(new Set(mentors.flatMap((m) => m.expertise)))];

  const filtered = mentors.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase()))) return false;
    if (expertiseFilter !== "All" && !m.expertise.includes(expertiseFilter)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-startup/10 text-startup mb-4">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-medium">Mentor Connect</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-3">Connect with Alumni Mentors</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get guidance from experienced alumni who've been in your shoes. Book sessions, ask questions, and grow.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div className="glass-card p-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search mentors by name or expertise..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {allExpertise.map((e) => (
                <Badge key={e} variant={expertiseFilter === e ? "default" : "outline"} className="cursor-pointer" onClick={() => setExpertiseFilter(e)}>{e}</Badge>
              ))}
            </div>
          </motion.div>

          {/* Mentor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                className="glass-card p-6 hover:border-startup/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl">{mentor.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold">{mentor.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />{mentor.role} at {mentor.company}
                    </p>
                    <p className="text-xs text-muted-foreground">Batch of {mentor.batch}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${mentor.available ? "bg-green-500" : "bg-muted-foreground"}`} />
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{mentor.bio}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.expertise.map((e) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />{mentor.rating}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{mentor.sessions} sessions</span>
                  </div>
                  <Link to={`/startup/mentor/${mentor.id}`}>
                    <Button variant="ghost" size="sm" className="text-startup hover:text-startup">
                      View <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MentorConnect;
