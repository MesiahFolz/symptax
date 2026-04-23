import { useState, useRef, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@/lib/theme";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "bot",
      content: "👋 Hi! I'm the SympTax Health Bot. Ask me about symptoms, medicines, or general health questions. I cannot diagnose, but I can help you understand your health better.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = await getToken();
      const res = await apiRequest("/api/chat", {
        method: "POST",
        token: token || undefined,
        body: JSON.stringify({ message: userMsg.content, history }),
      });
      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.response || "I couldn't process that. Please try again.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "bot", content: "Connection error. Please check your internet." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, messages]);

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.botAvatar}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View>
            <Text style={s.headerTitle}>SympTax Health Bot</Text>
            <Text style={s.headerSub}>Powered by Gemini AI · Clinical use only</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[s.bubble, item.role === "user" ? s.userBubble : s.botBubble]}>
              {item.role === "bot" && (
                <View style={s.botIcon}>
                  <Ionicons name="sparkles" size={10} color={colors.accent} />
                </View>
              )}
              <View style={[s.bubbleContent, item.role === "user" ? s.userBubbleContent : s.botBubbleContent]}>
                <Text style={[s.bubbleText, item.role === "user" ? s.userText : s.botText]}>
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            loading ? (
              <View style={s.typingRow}>
                <View style={s.botIcon}>
                  <Ionicons name="sparkles" size={10} color={colors.accent} />
                </View>
                <View style={s.typingBubble}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={s.typingText}>Analyzing...</Text>
                </View>
              </View>
            ) : null
          }
        />

        <Text style={s.disclaimer}>⚕️ Not a medical diagnosis. Consult your doctor.</Text>

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Ask about symptoms, medicines..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    flex: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    botAvatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
    headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
    msgList: { padding: 16, gap: 12 },
    bubble: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
    userBubble: { justifyContent: "flex-end" },
    botBubble: { justifyContent: "flex-start" },
    botIcon: { width: 24, height: 24, borderRadius: 8, backgroundColor: colors.accentLight, justifyContent: "center", alignItems: "center", marginBottom: 2 },
    bubbleContent: { maxWidth: "80%", borderRadius: 18, padding: 12 },
    userBubbleContent: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
    botBubbleContent: { backgroundColor: colors.card, borderBottomLeftRadius: 4, shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    userText: { color: "#fff", fontWeight: "600" },
    botText: { color: colors.text },
    typingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    typingBubble: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.card, borderRadius: 14, padding: 12, shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    typingText: { fontSize: 13, color: colors.accent, fontWeight: "600" },
    disclaimer: { fontSize: 10, color: colors.textMuted, textAlign: "center", paddingVertical: 6, fontWeight: "600" },
    inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
    input: { flex: 1, minHeight: 44, maxHeight: 100, backgroundColor: colors.inputBg, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: colors.text },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center", shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
    sendBtnDisabled: { opacity: 0.4 },
  });
}
