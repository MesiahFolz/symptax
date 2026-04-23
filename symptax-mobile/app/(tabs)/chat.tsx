import { useState, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const KEYWORD_RESPONSES: Record<string, string> = {
  "hello": "Hello! I am your SympTax Health Assistant. How can I help you today?",
  "hi": "Hi there! Feel free to ask me any health-related questions.",
  "headache": "For headaches, ensure you're hydrated. You can check 'Biogesic' in the Medicine Library. If it persists, consult a doctor.",
  "fever": "A fever often indicates your body is fighting an infection. Rest, stay hydrated, and monitor your temperature.",
  "cough": "If you have a cough with phlegm, 'Solmux' might help. For dry coughs, stay hydrated and rest your throat.",
  "stomach": "Stomach pain can be caused by many factors. Antacids like 'Gaviscon' help with acidity. For cramps, 'Buscopan' is often used.",
  "cold": "Colds are viral. Rest and Vitamin C can help. For a runny nose, check 'Neozep' in our library.",
  "help": "I can give you info on common symptoms and OTC medicines. Try asking about 'headache', 'fever', or 'medication'.",
  "thanks": "You're welcome! Stay healthy!",
  "thank you": "Happy to help! Let me know if you need anything else.",
};

export default function ChatScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your SympTax AI assistant. I can help you with medication info and common health questions. What's on your mind?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const getBotResponse = (text: string) => {
    const lower = text.toLowerCase();
    for (const key in KEYWORD_RESPONSES) {
      if (lower.includes(key)) return KEYWORD_RESPONSES[key];
    }
    return "I'm not sure about that. Try checking our Medicine Library or consulting a medical professional for specific advice.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(currentInput),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, botMsg]);
      setTyping(false);
    }, 1000);
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, typing]);

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.botInfo}>
            <View style={s.botAvatar}>
              <Ionicons name="pulse" size={20} color="#fff" />
            </View>
            <View>
              <Text style={s.botName}>Health Assistant</Text>
              <View style={s.statusRow}>
                <View style={s.statusDot} />
                <Text style={s.statusText}>AI Placeholder Active</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={s.chatArea}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m: Message) => (
            <View
              key={m.id}
              style={[
                s.msgWrapper,
                m.sender === "user" ? s.userWrapper : s.botWrapper,
              ]}
            >
              <View
                style={[
                  s.bubble,
                  m.sender === "user" ? s.userBubble : s.botBubble,
                ]}
              >
                <Text
                  style={[
                    s.msgText,
                    m.sender === "user" ? s.userText : s.botText,
                  ]}
                >
                  {m.text}
                </Text>
              </View>
              <Text style={s.timeText}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
          {typing && (
            <View style={s.botWrapper}>
              <View style={[s.bubble, s.botBubble, { width: 60 }]}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder="Type your health question..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || typing}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    botInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
    botAvatar: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: colors.accent,
      justifyContent: "center",
      alignItems: "center",
    },
    botName: { fontSize: 16, fontWeight: "800", color: colors.text },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981" },
    statusText: { fontSize: 10, color: colors.textMuted, fontWeight: "700" },
    chatArea: { flex: 1 },
    msgWrapper: { marginBottom: 20, maxWidth: "80%" },
    userWrapper: { alignSelf: "flex-end" },
    botWrapper: { alignSelf: "flex-start" },
    bubble: { borderRadius: 20, padding: 14 },
    userBubble: {
      backgroundColor: colors.accent,
      borderBottomRightRadius: 4,
    },
    botBubble: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    msgText: { fontSize: 14, lineHeight: 20 },
    userText: { color: "#fff", fontWeight: "500" },
    botText: { color: colors.text },
    timeText: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 4,
      marginHorizontal: 4,
    },
    inputContainer: {
      flexDirection: "row",
      padding: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxHeight: 100,
      color: colors.text,
      fontSize: 14,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      justifyContent: "center",
      alignItems: "center",
    },
    sendBtnDisabled: { opacity: 0.5 },
  });
}
