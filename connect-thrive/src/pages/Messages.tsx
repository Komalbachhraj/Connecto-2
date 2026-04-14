/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Loader2 } from "lucide-react";
import { useConnectionStore } from "@/stores/connectionStore";
import { useChatStore } from "@/stores/chatStore";
import { socket } from "@/socket";

const Messages = () => {
  const {
    buddies,
    connections,
    fetchConnections,
    fetchBuddies,
    respondToRequest,
  } = useConnectionStore();

  const {
    messages,
    fetchMessages,
    sendMessage,
    isLoading,
    addMessage,
    clearMessages,
  } = useChatStore();

  const [view, setView] = useState<"chats" | "requests">("chats");
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // ✅ FIX: Always Number
  const userString = localStorage.getItem("user");

  const currentUserId = userString ? Number(JSON.parse(userString).id) : null;
// console.log(currentUserId);
  /* ================= FETCH CONNECTIONS ================= */

  useEffect(() => {
    fetchBuddies();
    fetchConnections();
  }, []);

  /* ================= LOAD CHAT ================= */

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    } else {
      clearMessages();
    }
  }, [selectedChatId]);

  /* ================= SOCKET JOIN ================= */

  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("join_private", currentUserId);

    const handleNewMessage = (newMsg: any) => {
      const isRelevant =
        Number(newMsg.sender_id) === Number(selectedChatId) ||
        (Number(newMsg.sender_id) === Number(currentUserId) &&
          Number(newMsg.receiver_id) === Number(selectedChatId));

      if (isRelevant) {
        addMessage(newMsg);
      }
    };

    socket.on("receive_direct_message", handleNewMessage);

    return () => {
      socket.off("receive_direct_message", handleNewMessage);
    };
  }, [selectedChatId, currentUserId]);

  /* ================= AUTO SCROLL ================= */

const scrollRef = useRef<HTMLDivElement>(null);
const isFirstLoad = useRef(true);
const prevChatId = useRef<number | null>(null);
useEffect(() => {
  if (prevChatId.current !== selectedChatId) {
    isFirstLoad.current = true;
    prevChatId.current = selectedChatId;
  }
}, [selectedChatId]);
useEffect(() => {
  if (!scrollRef.current) return;

  if (isFirstLoad.current) {
    // Chat open → no animation
    scrollRef.current.scrollIntoView({
      behavior: "auto",
    });

    isFirstLoad.current = false;
  } else {
    // New message → smooth scroll
    scrollRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }
}, [messages]);

  /* ================= FILTER USERS ================= */

  const connectedBuddies = buddies.filter((b) =>
    connections.some((c) => c.buddyId === b.id && c.status === "accepted"),
  );

  const requestBuddies = buddies.filter((b) =>
    connections.some(
      (c) => c.buddyId === b.id && c.status === "pending" && c.isSender === 0,
    ),
  );

  const displayList = view === "chats" ? connectedBuddies : requestBuddies;

  const filteredList = displayList.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedBuddy = buddies.find((b) => b.id === selectedChatId);

  /* ================= SEND MESSAGE ================= */

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChatId) return;

    const success = await sendMessage(selectedChatId, newMessage);

    if (success) {
      socket.emit("send_direct_message", {
        senderId: currentUserId,
        receiverId: selectedChatId,
        text: newMessage,
      });

      setNewMessage("");
    }
  };

  /* ================= FORMAT TIME ================= */

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20 h-screen pb-6">
        <div className="container mx-auto px-4 h-full">
          <motion.div
            className="glass-card overflow-hidden border border-border/50 h-full flex flex-col md:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* ================= SIDEBAR ================= */}

            <div className="w-full md:w-80 border-r border-border/50 flex flex-col bg-muted/10">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {view === "chats" ? "Messages" : "Requests"}
                  </h2>

                  <Button
                    variant={view === "requests" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() =>
                      setView(view === "chats" ? "requests" : "chats")
                    }
                  >
                    {view === "chats"
                      ? `Requests (${requestBuddies.length})`
                      : "Back"}
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <Input
                    placeholder="Search..."
                    className="pl-9 bg-background/50 border-none ring-1 ring-border"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredList.map((buddy) => (
                  <div
                    key={buddy.id}
                    onClick={() => setSelectedChatId(buddy.id)}
                    className={`p-4 flex items-center gap-3 cursor-pointer border-l-4 ${
                      selectedChatId === buddy.id
                        ? "bg-primary/10 border-primary"
                        : "border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-primary border border-primary/20">
                      {buddy.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{buddy.name}</p>

                      <p className="text-xs text-muted-foreground truncate">
                        {buddy.hometown}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= CHAT WINDOW ================= */}

            <div className="flex-1 flex flex-col bg-background/50">
              {selectedBuddy ? (
                <>
                  {/* HEADER */}

                  <div className="p-4 border-b flex items-center font-bold">
                    {selectedBuddy.name}
                  </div>

                  {/* MESSAGES */}

                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {isLoading ? (
                      <Loader2 className="animate-spin mx-auto text-primary" />
                    ) : (
                      messages.map((m: any) => {
                        const isMe =
                          Number(m.sender_id || m.senderId) ===
                          Number(currentUserId);

                        return (
                          <div
                            key={m.id}
                            className={`flex ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs ${
                                isMe ? "text-right" : "text-left"
                              }`}
                            >
                              {/* Sender Label */}

                              <p className="text-xs text-muted-foreground mb-1">
                                {isMe ? "You" : selectedBuddy?.name}
                              </p>

                              {/* Message Bubble */}

                              <div
                                className={`p-3 rounded-xl ${
                                  isMe ? "bg-primary text-white" : "bg-muted"
                                }`}
                              >
                                <p>{m.message_text}</p>

                                <p className="text-[10px] opacity-70 mt-1">
                                  {formatTime(m.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    <div ref={scrollRef} />
                  </div>

                  {/* INPUT */}

                  <div className="p-4 border-t">
                    {view === "chats" ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />

                        <Button className="rounded-full" onClick={handleSend}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            await respondToRequest(
                              selectedBuddy.id,
                              "accepted",
                            );

                            setView("chats");
                            fetchConnections();
                          }}
                        >
                          Accept
                        </Button>

                        <Button
                          variant="outline"
                          onClick={async () => {
                            await respondToRequest(
                              selectedBuddy.id,
                              "rejected",
                            );

                            setSelectedChatId(null);
                          }}
                        >
                          Ignore
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a chat to start 💬
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
