export interface Comment {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
}

export interface JoinRequest {
  id: number;
  user: string;
  avatar: string;
  skills: string[];
  message: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Idea {
  id: number;
  title: string;
  problem: string;
  solution: string;
  skills: string[];
  category: string;
  stage: string;
  author: string;
  authorAvatar: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  joinRequests: JoinRequest[];
  members: { name: string; avatar: string; role: string }[];
  createdAt: string;
}

const initialIdeas: Idea[] = [
  {
    id: 1,
    title: "Campus Food Delivery App",
    problem:
      "Students waste time going to canteen during breaks, missing classes or eating unhealthy.",
    solution:
      "A peer-to-peer delivery app where students heading to canteen can pick up orders for others.",
    skills: ["React Native", "Node.js", "UI/UX"],
    category: "EdTech",
    stage: "Idea",
    author: "Rahul Verma",
    authorAvatar: "R",
    likes: 34,
    liked: false,
    comments: [
      {
        id: 1,
        user: "Priya",
        avatar: "P",
        content: "Great idea! How will you handle payments?",
        time: "2 hours ago",
      },
      {
        id: 2,
        user: "Amit",
        avatar: "A",
        content: "I'd love to help with the backend!",
        time: "1 hour ago",
      },
    ],
    joinRequests: [],
    members: [{ name: "Rahul Verma", avatar: "R", role: "Founder" }],
    createdAt: "2 days ago",
  },
  {
    id: 2,
    title: "AI Study Buddy",
    problem:
      "Students struggle to find study partners with similar learning goals and schedules.",
    solution:
      "AI-powered matching system that pairs students based on courses, availability, and learning style.",
    skills: ["Python", "Machine Learning", "React"],
    category: "AI/ML",
    stage: "MVP",
    author: "Sneha Patel",
    authorAvatar: "S",
    likes: 56,
    liked: true,
    comments: [
      {
        id: 1,
        user: "Vikram",
        avatar: "V",
        content: "This is exactly what we need!",
        time: "5 hours ago",
      },
    ],
    joinRequests: [
      {
        id: 1,
        user: "Karan Singh",
        avatar: "K",
        skills: ["Python", "ML"],
        message: "I have experience in recommendation systems!",
        status: "pending",
      },
    ],
    members: [
      { name: "Sneha Patel", avatar: "S", role: "Founder" },
      { name: "Ankit Roy", avatar: "A", role: "Developer" },
    ],
    createdAt: "1 week ago",
  },
  {
    id: 3,
    title: "Campus Event Manager",
    problem:
      "College events are poorly organized with no central platform for discovery and registration.",
    solution:
      "Unified event platform with ticketing, RSVPs, reminders, and social features.",
    skills: ["Flutter", "Firebase", "Design"],
    category: "SaaS",
    stage: "Prototype",
    author: "Neha Gupta",
    authorAvatar: "N",
    likes: 28,
    liked: false,
    comments: [],
    joinRequests: [],
    members: [{ name: "Neha Gupta", avatar: "N", role: "Founder" }],
    createdAt: "3 days ago",
  },
  {
    id: 4,
    title: "Green Campus Initiative",
    problem:
      "Colleges generate massive waste with no tracking or accountability system.",
    solution:
      "IoT-based waste monitoring + gamified recycling rewards for students.",
    skills: ["IoT", "React", "Data Analytics"],
    category: "CleanTech",
    stage: "Idea",
    author: "Arjun Mehta",
    authorAvatar: "A",
    likes: 19,
    liked: false,
    comments: [
      {
        id: 1,
        user: "Riya",
        avatar: "R",
        content: "Love the gamification angle!",
        time: "1 day ago",
      },
    ],
    joinRequests: [],
    members: [{ name: "Arjun Mehta", avatar: "A", role: "Founder" }],
    createdAt: "5 days ago",
  },
];

type Listener = () => void;
let ideas = [...initialIdeas];
let listeners: Listener[] = [];

function notify() {
  listeners.forEach((l) => l());
}

export const ideaStore = {
  getIdeas: () => ideas,
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  addIdea: (
    idea: Omit<
      Idea,
      | "id"
      | "likes"
      | "liked"
      | "comments"
      | "joinRequests"
      | "members"
      | "createdAt"
    >,
  ) => {
    ideas = [
      {
        ...idea,
        id: Date.now(),
        likes: 0,
        liked: false,
        comments: [],
        joinRequests: [],
        members: [
          { name: idea.author, avatar: idea.authorAvatar, role: "Founder" },
        ],
        createdAt: "Just now",
      },
      ...ideas,
    ];
    notify();
  },
  toggleLike: (id: number) => {
    ideas = ideas.map((i) =>
      i.id === id
        ? { ...i, liked: !i.liked, likes: i.liked ? i.likes - 1 : i.likes + 1 }
        : i,
    );
    notify();
  },
  addComment: (ideaId: number, content: string) => {
    ideas = ideas.map((i) =>
      i.id === ideaId
        ? {
            ...i,
            comments: [
              ...i.comments,
              {
                id: Date.now(),
                user: "You",
                avatar: "Y",
                content,
                time: "Just now",
              },
            ],
          }
        : i,
    );
    notify();
  },
  sendJoinRequest: (ideaId: number, skills: string[], message: string) => {
    ideas = ideas.map((i) =>
      i.id === ideaId
        ? {
            ...i,
            joinRequests: [
              ...i.joinRequests,
              {
                id: Date.now(),
                user: "You",
                avatar: "Y",
                skills,
                message,
                status: "pending" as const,
              },
            ],
          }
        : i,
    );
    notify();
  },
  handleJoinRequest: (
    ideaId: number,
    requestId: number,
    action: "accepted" | "rejected",
  ) => {
    ideas = ideas.map((i) => {
      if (i.id !== ideaId) return i;
      const updatedRequests = i.joinRequests.map((r) =>
        r.id === requestId ? { ...r, status: action } : r,
      );
      const accepted = updatedRequests.find(
        (r) => r.id === requestId && r.status === "accepted",
      );
      const newMembers = accepted
        ? [
            ...i.members,
            { name: accepted.user, avatar: accepted.avatar, role: "Member" },
          ]
        : i.members;
      return { ...i, joinRequests: updatedRequests, members: newMembers };
    });
    notify();
  },
};
