"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { Send, MessageSquare, Loader2, Bell } from "lucide-react";

export default function SupportChatPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const messagesEndRef = useRef(null);

  // 🔥 Listen for user authentication and messages
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        setUser(loggedUser);
        const chatQuery = query(
          collection(db, "chats"),
          orderBy("timestamp", "asc")
        );

        onSnapshot(chatQuery, (snapshot) => {
          const allMessages = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((msg) => msg.userId === loggedUser.uid);

          setMessages(allMessages);
          setLoading(false);

          // 🔔 Notify user for new admin message
          const latestMsg = allMessages[allMessages.length - 1];
          if (latestMsg && latestMsg.sender === "admin") {
            setNotification("💬 New message from support!");
            setTimeout(() => setNotification(""), 4000);
          }
        });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Send Message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageToSend = newMessage.trim();
    setNewMessage(""); // Clear input instantly

    try {
      await addDoc(collection(db, "chats"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        message: messageToSend,
        sender: "user",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }

    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-green-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">Chat Support</h1>
          </div>

          {notification && (
            <div className="flex items-center text-green-600 text-sm bg-green-50 px-3 py-1 rounded-lg animate-bounce">
              <Bell className="w-4 h-4 mr-1" /> {notification}
            </div>
          )}
        </div>

        {/* Chat Box */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 h-[60vh] p-3 border rounded-lg bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center py-10 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-10">
              No messages yet. Start a conversation 👋
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p>{msg.message}</p>
                  {msg.timestamp?.toDate && (
                    <span className="block text-[10px] opacity-70 mt-1 text-right">
                      {msg.timestamp.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Field */}
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
