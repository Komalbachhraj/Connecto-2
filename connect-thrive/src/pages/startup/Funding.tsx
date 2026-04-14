import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, ExternalLink, IndianRupee, Calendar, Award, Filter, Building2,
} from "lucide-react";

interface Opportunity {
  id: number;
  title: string;
  organization: string;
  type: "Grant" | "Competition" | "Incubation" | "Scheme";
  amount: string;
  deadline: string;
  eligibility: string;
  applyLink: string;
  description: string;
  tags: string[];
}

const opportunities: Opportunity[] = [
  { id: 1, title: "Startup India Seed Fund", organization: "Govt. of India", type: "Scheme", amount: "₹20-50 Lakhs", deadline: "Rolling", eligibility: "DPIIT registered startups < 2 years", applyLink: "#", description: "Financial assistance for proof of concept, prototype development, product trials, and market entry.", tags: ["Government", "Seed Stage"] },
  { id: 2, title: "Atal Innovation Mission", organization: "NITI Aayog", type: "Incubation", amount: "₹10 Cr (for incubators)", deadline: "March 2025", eligibility: "Students, startups, innovators", applyLink: "#", description: "Supports establishing Atal Incubation Centres and provides mentoring and funding support.", tags: ["Government", "Innovation"] },
  { id: 3, title: "MSME Champion Scheme", organization: "Ministry of MSME", type: "Scheme", amount: "₹1-5 Lakhs", deadline: "Rolling", eligibility: "MSMEs and aspiring entrepreneurs", applyLink: "#", description: "Credit guarantee, technology support, and market access for micro, small & medium enterprises.", tags: ["Government", "MSME"] },
  { id: 4, title: "Smart India Hackathon", organization: "MoE, Govt. of India", type: "Competition", amount: "₹1-5 Lakhs per team", deadline: "August 2025", eligibility: "College students (B.Tech/MCA/etc)", applyLink: "#", description: "India's biggest hackathon. Build solutions for government problem statements and win prizes.", tags: ["Competition", "Students"] },
  { id: 5, title: "Y Combinator Startup School", organization: "Y Combinator", type: "Incubation", amount: "$125K (if selected for YC)", deadline: "Rolling", eligibility: "Global founders, any stage", applyLink: "#", description: "Free 8-week online course with resources, community, and a chance to apply for YC batch.", tags: ["Global", "Accelerator"] },
  { id: 6, title: "Nasscom 10,000 Startups", organization: "NASSCOM", type: "Incubation", amount: "Mentorship + Resources", deadline: "Rolling", eligibility: "Tech startups in India", applyLink: "#", description: "India's largest tech startup initiative. Get access to mentors, investors, and corporate partners.", tags: ["Tech", "Ecosystem"] },
  { id: 7, title: "Sequoia Spark Fellowship", organization: "Sequoia Capital India", type: "Grant", amount: "₹20 Lakhs + Mentorship", deadline: "April 2025", eligibility: "Women founders, early-stage", applyLink: "#", description: "Fellowship program for women entrepreneurs with equity-free grants and mentorship.", tags: ["Women Founders", "VC"] },
  { id: 8, title: "e-Summit IIT Delhi Startup Expo", organization: "IIT Delhi", type: "Competition", amount: "₹3 Lakhs + Incubation", deadline: "January 2025", eligibility: "College startups", applyLink: "#", description: "Pitch your startup at India's top tech fest. Winners get incubation support and funding.", tags: ["College", "Pitch Competition"] },
];

const types = ["All", "Grant", "Competition", "Incubation", "Scheme"];

const Funding = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = opportunities.filter((o) => {
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.organization.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "All" && o.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-startup/10 text-startup mb-4">
              <IndianRupee className="w-4 h-4" />
              <span className="text-sm font-medium">Funding & Opportunities</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-3">Grants, Competitions & More</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover funding opportunities, startup schemes, competitions, and incubation programs to kickstart your journey.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div className="glass-card p-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Filter className="w-4 h-4 text-muted-foreground mt-1" />
              {types.map((t) => (
                <Badge key={t} variant={typeFilter === t ? "default" : "outline"} className="cursor-pointer" onClick={() => setTypeFilter(t)}>{t}</Badge>
              ))}
            </div>
          </motion.div>

          {/* Listings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((opp, index) => (
              <motion.div
                key={opp.id}
                className="glass-card p-6 hover:border-startup/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`text-xs ${
                    opp.type === "Grant" ? "bg-green-500/20 text-green-400 border-0" :
                    opp.type === "Competition" ? "bg-blue-500/20 text-blue-400 border-0" :
                    opp.type === "Incubation" ? "bg-purple-500/20 text-purple-400 border-0" :
                    "bg-startup/20 text-startup border-0"
                  }`}>{opp.type}</Badge>
                  <span className="text-sm font-semibold text-startup flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />{opp.amount}
                  </span>
                </div>

                <h3 className="text-lg font-display font-semibold mb-1">{opp.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                  <Building2 className="w-3 h-3" />{opp.organization}
                </p>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{opp.description}</p>

                <div className="space-y-2 mb-4 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-startup" />
                    <span className="font-medium text-foreground">Deadline:</span> {opp.deadline}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-4 h-4 text-startup" />
                    <span className="font-medium text-foreground">Eligibility:</span> {opp.eligibility}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {opp.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>

                <Button className="w-full btn-glow" asChild>
                  <a href={opp.applyLink} target="_blank" rel="noopener noreferrer">
                    Apply Now <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Funding;
