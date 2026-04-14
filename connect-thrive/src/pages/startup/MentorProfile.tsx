import { motion } from "framer-motion";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Briefcase,
  GraduationCap,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Send,
  Clock,
} from "lucide-react";

const mentorData: Record<
  number,
  {
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
    longBio: string;
    achievements: string[];
  }
> = {
  1: {
    name: "Dr. Ananya Sharma",
    avatar: "A",
    role: "CTO",
    company: "TechNova",
    batch: "2015",
    expertise: ["AI/ML", "System Design", "Leadership"],
    rating: 4.9,
    sessions: 45,
    bio: "15+ years in tech.",
    available: true,
    longBio:
      "Dr. Ananya Sharma is the CTO of TechNova, leading a team of 200+ engineers. She completed her PhD in Machine Learning from IIT Delhi and has published 20+ research papers. She's passionate about helping students navigate the tech industry and build impactful products.",
    achievements: [
      "Published 20+ AI research papers",
      "Led team from 10 to 200+ engineers",
      "Speaker at 15+ international conferences",
      "Angel investor in 5 startups",
    ],
  },
  2: {
    name: "Rajesh Iyer",
    avatar: "R",
    role: "Founder & CEO",
    company: "EduStack",
    batch: "2012",
    expertise: ["EdTech", "Fundraising", "Growth"],
    rating: 4.8,
    sessions: 32,
    bio: "Built EduStack from 0 to $10M ARR.",
    available: true,
    longBio:
      "Rajesh founded EduStack right after college and bootstrapped it to profitability before raising Series A from Sequoia. He believes every student has the potential to build something great and loves sharing his journey.",
    achievements: [
      "Raised $15M in funding",
      "EduStack serves 1M+ students",
      "Featured in Forbes 30 Under 30",
      "YC Alumni (W2018)",
    ],
  },
  3: {
    name: "Priya Menon",
    avatar: "P",
    role: "Product Lead",
    company: "Google",
    batch: "2016",
    expertise: ["Product Management", "UX", "Strategy"],
    rating: 4.7,
    sessions: 28,
    bio: "Ex-startup founder, now at Google.",
    available: false,
    longBio:
      "Priya started her career as a designer, founded a D2C startup, and pivoted to product management at Google. She leads Google Classroom's product strategy and mentors aspiring PMs.",
    achievements: [
      "Google Classroom product lead",
      "Ex-founder of StyleBox (acquired)",
      "Mentored 100+ aspiring PMs",
      "Google Spot Award winner x3",
    ],
  },
  4: {
    name: "Vikram Desai",
    avatar: "V",
    role: "VC Partner",
    company: "Sequoia Capital",
    batch: "2010",
    expertise: ["Fundraising", "Business Model", "Pitching"],
    rating: 4.9,
    sessions: 56,
    bio: "Invested in 30+ startups.",
    available: true,
    longBio:
      "Vikram joined Sequoia after a stint at McKinsey and has led investments in some of India's most promising startups. He's known for his detailed pitch feedback and genuine interest in student founders.",
    achievements: [
      "Led 30+ investments at Sequoia",
      "Board member of 8 startups",
      "McKinsey alumnus",
      "Published author on venture capital",
    ],
  },
};

const timeSlots = [
  "10:00 AM",
  "11:00 AM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const MentorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const mentor = mentorData[Number(id)];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"book" | "ask">("book");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingTopic, setBookingTopic] = useState("");
  const [question, setQuestion] = useState("");

  if (!mentor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Mentor not found</p>
          <Link to="/startup/mentors">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mentors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !bookingTopic.trim()) {
      toast({
        title: "Missing Info",
        description: "Please select date, time, and topic.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Session Booked! 📅",
      description: `Your session with ${mentor.name} is confirmed for ${selectedDate} at ${selectedTime}.`,
    });
    setSelectedDate("");
    setSelectedTime("");
    setBookingTopic("");
  };

  const handleAsk = () => {
    if (!question.trim()) return;
    toast({
      title: "Question Sent! ✉️",
      description: `${mentor.name} will respond soon.`,
    });
    setQuestion("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/startup/mentors"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mentors
          </Link>

          {/* Profile Header */}
          <motion.div
            className="glass-card p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-3xl">
                {mentor.avatar}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-display font-bold mb-1">
                  {mentor.name}
                </h1>
                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Briefcase className="w-4 h-4" />
                  {mentor.role} at {mentor.company}
                  <span className="text-xs">
                    • <GraduationCap className="w-3 h-3 inline" /> Batch{" "}
                    {mentor.batch}
                  </span>
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {mentor.rating}
                  </span>
                  <span>{mentor.sessions} sessions</span>
                  <span
                    className={`flex items-center gap-1 ${mentor.available ? "text-green-400" : "text-muted-foreground"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${mentor.available ? "bg-green-500" : "bg-muted-foreground"}`}
                    />
                    {mentor.available ? "Available" : "Busy"}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground">{mentor.longBio}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {mentor.expertise.map((e) => (
                <Badge key={e} variant="secondary">
                  {e}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            className="glass-card p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-display font-semibold mb-4">
              🏆 Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mentor.achievements.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-startup" />
                  {a}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Book / Ask Tabs */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "book" ? "default" : "outline"}
                onClick={() => setActiveTab("book")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Session
              </Button>
              <Button
                variant={activeTab === "ask" ? "default" : "outline"}
                onClick={() => setActiveTab("ask")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask Question
              </Button>
            </div>

            {activeTab === "book" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Select Date
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Select Time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((t) => (
                      <Badge
                        key={t}
                        variant={selectedTime === t ? "default" : "outline"}
                        className="cursor-pointer py-1.5 px-3"
                        onClick={() => setSelectedTime(t)}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Topic / Agenda
                  </label>
                  <Textarea
                    placeholder="What do you want to discuss?"
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleBook}
                  className="w-full btn-glow"
                  disabled={!mentor.available}
                >
                  {mentor.available
                    ? "Book Session"
                    : "Mentor Currently Unavailable"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Ask your question here. Be specific for better answers!"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleAsk} className="btn-glow">
                  <Send className="w-4 h-4 mr-2" />
                  Send Question
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MentorProfile;
