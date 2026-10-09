import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/context/SocketContext";
import {
  apiGetConversations,
  apiCreateConversation,
  apiGetMessages,
  apiSearchUsers,
  getCurrentUser,
} from "@/lib/api";
import {
  Search,
  Send,
  UserPlus,
  Check,
  CheckCheck,
  Circle,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Direct Chat · BIT Hostel Portal" },
      {
        name: "description",
        content: "Real-time 1-on-1 direct messaging for BIT Hostel students and wardens.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const currentUser = getCurrentUser() || {};
  const currentUserId = currentUser.id || currentUser.regNo;
  const { socket, onlineUsers, isConnected } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Search & New Chat state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Typing state
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Parse URL search params if target user parameter is passed e.g. /chat?target=S002
  const searchParams = useSearch({ strict: false });
  const initialTarget = searchParams?.target;

  // 1. Fetch Conversations on Mount
  useEffect(() => {
    async function loadConversations() {
      setLoadingConversations(true);
      try {
        const data = await apiGetConversations();
        setConversations(data || []);

        if (initialTarget) {
          handleSelectUser(initialTarget);
        } else if (data && data.length > 0) {
          setActiveConversation(data[0]);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoadingConversations(false);
      }
    }
    loadConversations();
  }, [initialTarget]);

  // 2. Load Messages when Active Conversation changes
  useEffect(() => {
    if (!activeConversation?._id) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const history = await apiGetMessages(activeConversation._id);
        setMessages(history || []);

        // Join socket room
        if (socket) {
          socket.emit("join_conversation", activeConversation._id);
          socket.emit("mark_as_read", { conversationId: activeConversation._id });
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();

    return () => {
      if (socket && activeConversation?._id) {
        socket.emit("leave_conversation", activeConversation._id);
      }
    };
  }, [activeConversation?._id, socket]);

  // 3. Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 4. Socket Listeners for Real-Time Updates
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (incomingMsg) => {
      if (incomingMsg.conversationId === activeConversation?._id) {
        setMessages((prev) => [...prev, incomingMsg]);
        socket.emit("mark_as_read", { conversationId: activeConversation._id });
      }
    };

    const handleUserTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConversation?._id && userId !== currentUserId) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConversation?._id && userId !== currentUserId) {
        setIsTyping(false);
      }
    };

    const handleConversationUpdated = ({ conversationId, lastMessage, lastMessageSender, updatedAt }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage, lastMessageSender, updatedAt }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };

    const handleMessagesRead = ({ conversationId }) => {
      if (conversationId === activeConversation?._id) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true }))
        );
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("conversation_updated", handleConversationUpdated);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, activeConversation?._id, currentUserId]);

  // Search User Handler
  useEffect(() => {
    if (!showUserSearch) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await apiSearchUsers(searchQuery);
        setSearchResults(results || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showUserSearch]);

  const handleSelectUser = async (targetId) => {
    try {
      const conv = await apiCreateConversation(targetId);
      if (conv && !conv.error) {
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          if (exists) return prev;
          return [conv, ...prev];
        });
        setActiveConversation(conv);
        setShowUserSearch(false);
      } else {
        toast.error(conv.error || "Failed to start conversation.");
      }
    } catch (err) {
      toast.error("Failed to open chat with user.");
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessageText.trim() || !activeConversation?._id) return;

    const recipientId = activeConversation.recipient?.id || activeConversation.recipient?.regNo;
    const messageText = newMessageText.trim();

    // Optimistic payload
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      conversationId: activeConversation._id,
      senderId: currentUserId,
      receiverId: recipientId,
      text: messageText,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessageText("");

    // Emit stop typing
    if (socket) {
      socket.emit("stop_typing", { conversationId: activeConversation._id, receiverId: recipientId });
    }

    if (socket && isConnected) {
      socket.emit(
        "send_message",
        {
          conversationId: activeConversation._id,
          receiverId: recipientId,
          text: messageText,
        },
        (res) => {
          if (res?.error) {
            toast.error("Failed to send message: " + res.error);
          }
        }
      );
    } else {
      toast.warning("Socket disconnected. Reconnecting...");
    }
  };

  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);
    if (!socket || !activeConversation?._id) return;

    const recipientId = activeConversation.recipient?.id || activeConversation.recipient?.regNo;
    socket.emit("typing", { conversationId: activeConversation._id, receiverId: recipientId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId: activeConversation._id, receiverId: recipientId });
    }, 1500);
  };

  const recipient = activeConversation?.recipient || {};
  const recipientId = recipient.id || recipient.regNo;
  const isRecipientOnline = onlineUsers.includes(recipientId);

  return (
    <AppShell title="Direct Chat" breadcrumb={["Chat"]}>
      <div className="flex h-[calc(100vh-12rem)] min-h-[500px] overflow-hidden rounded-2xl border bg-card shadow-soft">
        {/* LEFT SIDEBAR: Conversations List */}
        <div
          className={cn(
            "w-full border-r md:w-80 lg:w-96 flex flex-col bg-muted/20",
            activeConversation ? "hidden md:flex" : "flex"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                <h2 className="font-bold text-base">Messages</h2>
              </div>
              <Button
                size="sm"
                variant={showUserSearch ? "secondary" : "default"}
                className="gap-1.5 rounded-xl text-xs"
                onClick={() => {
                  setShowUserSearch(!showUserSearch);
                  setSearchQuery("");
                }}
              >
                {showUserSearch ? <ArrowLeft className="size-3.5" /> : <UserPlus className="size-3.5" />}
                {showUserSearch ? "Back" : "New Chat"}
              </Button>
            </div>

            {/* Socket connection indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
              <span className={cn("size-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
              <span>{isConnected ? "Real-time Connected" : "Connecting..."}</span>
            </div>

            {/* Search Input */}
            {showUserSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search student, warden or reg no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Sidebar Content */}
          <ScrollArea className="flex-1 px-2 py-2">
            {showUserSearch ? (
              // Search Results for New Chat
              <div className="space-y-1">
                <p className="px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase py-1">
                  Available Contacts
                </p>
                {isSearching ? (
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">Searching users...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id || user.regNo}
                      onClick={() => handleSelectUser(user.id || user.regNo)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition-colors text-left"
                    >
                      <div className="relative shrink-0">
                        <img src={user.avatar} alt="" className="size-10 rounded-full object-cover border" />
                        {onlineUsers.includes(user.id || user.regNo) && (
                          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.dept || user.department || user.role} {user.regNo ? `· ${user.regNo}` : ""}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">No users found.</p>
                )}
              </div>
            ) : (
              // Conversation List
              <div className="space-y-1">
                {loadingConversations ? (
                  <p className="p-4 text-xs text-muted-foreground text-center">Loading chats...</p>
                ) : conversations.length > 0 ? (
                  conversations.map((conv) => {
                    const rec = conv.recipient || {};
                    const recId = rec.id || rec.regNo;
                    const isOnline = onlineUsers.includes(recId);
                    const isActive = activeConversation?._id === conv._id;

                    return (
                      <button
                        key={conv._id}
                        onClick={() => setActiveConversation(conv)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left relative",
                          isActive
                            ? "bg-primary/10 text-foreground font-medium"
                            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={rec.avatar || "https://i.pravatar.cc/160?img=1"}
                            alt=""
                            className="size-11 rounded-full object-cover border"
                          />
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-semibold truncate text-foreground">{rec.name || "User"}</p>
                            {conv.updatedAt && (
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs truncate text-muted-foreground mt-0.5">
                            {conv.lastMessageSender === currentUserId ? "You: " : ""}
                            {conv.lastMessage || "Click to start chatting"}
                          </p>
                        </div>

                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="rounded-full text-[10px] px-1.5 py-0.5 min-w-[18px] text-center">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                    <p>No conversations yet.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowUserSearch(true)}
                      className="rounded-xl text-xs"
                    >
                      Start a chat
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* RIGHT PANEL: Chat Window */}
        <div
          className={cn(
            "flex-1 flex flex-col h-full bg-card",
            !activeConversation ? "hidden md:flex items-center justify-center" : "flex"
          )}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden size-8"
                    onClick={() => setActiveConversation(null)}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div className="relative shrink-0">
                    <img
                      src={recipient.avatar || "https://i.pravatar.cc/160?img=1"}
                      alt=""
                      className="size-10 rounded-full object-cover border"
                    />
                    {isRecipientOnline && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-snug">{recipient.name || "Chat Partner"}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{recipient.dept || recipient.department || recipient.role}</span>
                      <span>·</span>
                      <span className={cn("font-medium", isRecipientOnline ? "text-emerald-500" : "text-muted-foreground")}>
                        {isRecipientOnline ? "Online" : "Offline"}
                      </span>
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs font-mono rounded-lg">
                  {recipient.regNo || recipient.id}
                </Badge>
              </div>

              {/* Chat Messages Body */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-48 text-xs text-muted-foreground">
                    Loading message history...
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === currentUserId;

                      return (
                        <div
                          key={msg._id || msg.createdAt}
                          className={cn("flex flex-col max-w-[80%] md:max-w-[70%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
                        >
                          <div
                            className={cn(
                              "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-xs"
                                : "bg-muted text-foreground rounded-bl-xs"
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-muted-foreground">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isMe && (
                              <span>
                                {msg.isRead ? (
                                  <CheckCheck className="size-3 text-primary" />
                                ) : (
                                  <Check className="size-3 text-muted-foreground" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing status indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground italic px-2 py-1"
                        >
                          <span className="flex gap-1">
                            <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                            <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                            <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                          </span>
                          <span>{recipient.name || "User"} is typing...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                    <Sparkles className="size-8 text-primary/40 mb-2" />
                    <p className="text-sm font-semibold">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Say hello to {recipient.name || "your chat partner"}!
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t bg-card flex items-center gap-2">
                <Input
                  placeholder={`Message ${recipient.name || "user"}...`}
                  value={newMessageText}
                  onChange={handleInputChange}
                  className="flex-1 rounded-xl text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessageText.trim()}
                  className="rounded-xl shrink-0"
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center p-8 text-muted-foreground max-w-sm">
              <MessageSquare className="size-12 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-bold text-lg text-foreground">BIT Direct Chat</h3>
              <p className="text-xs mt-1">
                Select a conversation from the sidebar or click "New Chat" to search and message roommates, wardens, or classmates.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
