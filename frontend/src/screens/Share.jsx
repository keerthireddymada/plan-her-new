import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Send, Gift, MessageCircle, UserPlus } from "lucide-react";

const Share = () => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [message, setMessage] = useState("");

  const contacts = [
    { id: 1, name: "Alex", relationship: "Partner", avatar: "💙" },
    { id: 2, name: "Mom", relationship: "Family", avatar: "💝" },
    { id: 3, name: "Emma", relationship: "Best Friend", avatar: "🌸" },
    { id: 4, name: "Sarah", relationship: "Sister", avatar: "🦋" },
  ];

  const supportSuggestions = [
    {
      icon: Gift,
      title: "Thoughtful Gestures",
      suggestions: [
        "Bring favorite tea",
        "Small surprise gift",
        "Favorite snacks",
      ],
    },
    {
      icon: MessageCircle,
      title: "Communication",
      suggestions: [
        "Send encouraging texts",
        "Check in gently",
        "Listen without fixing",
      ],
    },
    {
      icon: Heart,
      title: "Quality Time",
      suggestions: [
        "Movie night in",
        "Gentle walk together",
        "Cozy conversation",
      ],
    },
  ];

  const predefinedMessages = [
    "I'm on day 3 of my period and feeling a bit low energy today. Some extra patience would be appreciated! 💕",
    "PMS week ahead - might need some extra cuddles and understanding. Thanks for being amazing! 🌸",
    "Feeling really good and energetic this week! Perfect time for that activity we planned. ✨",
    "Having some tough symptoms today. A gentle check-in text would mean the world to me. 💙",
  ];

  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20 px-6 pt-12 bg-black-950 min-h-screen"
    >
      {/* Top Navigation */}

      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Share & Support
        </motion.h1>
        <p className="text-black-400">
          Keep your loved ones informed and get the support you need
        </p>
      </div>

      {/* Current Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-lavender-600 rounded-2xl p-6 mb-6 text-white shadow-glow"
      >
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <p className="text-lavender-100 mb-3">
          Follicular Phase • Day 14 • High Energy
        </p>
        <div className="bg-black-900 rounded-xl p-3">
          <p className="text-sm text-lavender-200">
            Share this phase with your support network to help them understand
            how to best support you right now.
          </p>
        </div>
      </motion.div>

      {/* Select Contacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-black-900 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Support Network</h3>
          <button className="flex items-center text-lavender-400 font-medium hover:text-lavender-300 transition-colors">
            <UserPlus size={18} className="mr-1" />
            Add
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {contacts.map((contact) => (
            <motion.button
              key={contact.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleContact(contact.id)}
              className={`p-4 rounded-xl transition-all ${
                selectedContacts.includes(contact.id)
                  ? "bg-lavender-600 text-white"
                  : "bg-black-800 text-black-400"
              }`}
            >
              <div className="text-2xl mb-2">{contact.avatar}</div>
              <p className="font-semibold text-sm">{contact.name}</p>
              <p className="text-xs opacity-80">{contact.relationship}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Quick Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-black-900 rounded-2xl p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Quick Messages
        </h3>
        <div className="space-y-3">
          {predefinedMessages.map((msg, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMessage(msg)}
              className="w-full text-left p-4 rounded-xl bg-black-800 hover:bg-black-700 transition-all"
            >
              <p className="text-sm text-black-200">{msg}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Custom Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-black-900 rounded-2xl p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Custom Message
        </h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a personalized message to your support network..."
          className="w-full h-24 p-3 bg-black-800 text-white placeholder-black-400 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-lavender-500"
        />
      </motion.div>

      {/* Support Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-black-900 rounded-2xl p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Support Suggestions
        </h3>
        <div className="space-y-4">
          {supportSuggestions.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-black-800 rounded-xl p-4"
              >
                <div className="flex items-center mb-3">
                  <Icon className="text-lavender-400 mr-3" size={20} />
                  <h4 className="font-semibold text-white">{category.title}</h4>
                </div>
                <div className="space-y-2">
                  {category.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-2 h-2 bg-lavender-400 rounded-full mr-3" />
                      <span className="text-sm text-black-200">
                        {suggestion}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Send Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.98 }}
        disabled={selectedContacts.length === 0 || !message}
        className={`w-full rounded-2xl p-4 font-semibold flex items-center justify-center transition-all ${
          selectedContacts.length > 0 && message
            ? "bg-lavender-600 text-white shadow-glow"
            : "bg-black-800 text-black-500 cursor-not-allowed"
        }`}
      >
        <Send size={20} className="mr-2" />
        Send to {selectedContacts.length} contact
        {selectedContacts.length !== 1 ? "s" : ""}
      </motion.button>
    </motion.div>
  );
};

export default Share;
