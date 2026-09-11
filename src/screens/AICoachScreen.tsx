import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { AIChatMessage } from '../types';
import { getNutritionCoachResponse } from '../services/aiService';
import { AIFoodScannerModal } from '../components/AIFoodScannerModal';

const QUICK_PROMPTS = [
  'What snack can I eat with my remaining calories?',
  'Suggest a 500 kcal high-protein dinner',
  'How do I break a fat loss plateau?',
  'Am I hitting enough protein today?',
];

export const AICoachScreen: React.FC = () => {
  const { profile, summary } = useNutri();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Hello ${profile.name}! 👋 I'm your NutriPulse AI Coach.\n\nToday your budget is **${summary.targetCalories} kcal** for your **${profile.goalType === 'lose_weight' ? 'Fat Loss' : profile.goalType === 'gain_weight' ? 'Muscle Gain' : 'Maintenance'}** goal. You have **${summary.remainingCalories} kcal** and **${summary.targetProtein - summary.consumedProtein}g protein** remaining.\n\nHow can I help you optimize your nutrition today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiScannerVisible, setAiScannerVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const coachReply = await getNutritionCoachResponse(
        text,
        updated,
        profile,
        summary
      );

      const assistantMsg: AIChatMessage = {
        id: `reply_${Date.now()}`,
        sender: 'assistant',
        text: coachReply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const errorMsg: AIChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I ran into an issue connecting. Please try asking again!',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={18} color="#A78BFA" />
          </View>
          <View>
            <Text style={styles.title}>AI Nutrition Coach</Text>
            <Text style={styles.subtitle}>Smart meal suggestions & personalized advice</Text>
          </View>
        </View>

        {/* Scan shortcut */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => setAiScannerVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.scanBtnText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Main Chat Scroll */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Banner */}
          <TouchableOpacity
            style={styles.bannerCard}
            onPress={() => setAiScannerVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="scan-circle" size={32} color="#A78BFA" />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>AI Food & Photo Vision Scanner</Text>
              <Text style={styles.bannerDesc}>
                Snap meal photos to automatically compute calories & macros with 95% accuracy.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A78BFA" />
          </TouchableOpacity>

          {/* Quick suggestions */}
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
              {QUICK_PROMPTS.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.promptChip}
                  onPress={() => handleSendMessage(prompt)}
                  disabled={loading}
                >
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubbleContainer,
                  isUser ? styles.msgUserAlign : styles.msgAssistantAlign,
                ]}
              >
                {!isUser && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="sparkles" size={14} color="#A78BFA" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.messageTextUser : styles.messageTextAssistant,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#A78BFA" />
              <Text style={styles.loadingText}>AI Nutrition Coach is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask AI coach for recipes, macro tips..."
            placeholderTextColor={Colors.dark.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={300}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || loading) && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <AIFoodScannerModal
        visible={aiScannerVisible}
        onClose={() => setAiScannerVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    gap: 12,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  bannerDesc: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  quickPromptsContainer: {
    marginBottom: 16,
  },
  quickPromptsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptsScroll: {
    gap: 8,
  },
  promptChip: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  msgUserAlign: {
    justifyContent: 'flex-end',
  },
  msgAssistantAlign: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleUser: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  messageTextUser: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  messageTextAssistant: {
    color: Colors.dark.textPrimary,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.dark.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.dark.textPrimary,
    fontSize: 13,
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
