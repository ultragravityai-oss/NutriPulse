import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NutriProvider, useNutri } from './src/context/NutriContext';
import { TodayScreen } from './src/screens/TodayScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AICoachScreen } from './src/screens/AICoachScreen';
import { GoalsProfileScreen } from './src/screens/GoalsProfileScreen';
import { OnboardingModal } from './src/screens/OnboardingModal';
import { Colors } from './src/constants/theme';

type TabName = 'today' | 'history' | 'ai_coach' | 'goals';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabName>('today');
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const { profile } = useNutri();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Screen container */}
      <View style={styles.screenContainer}>
        {activeTab === 'today' && (
          <TodayScreen
            onNavigateToProfile={() => setActiveTab('goals')}
            onNavigateToAICoach={() => setActiveTab('ai_coach')}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}
        {activeTab === 'history' && (
          <HistoryScreen onNavigateToToday={() => setActiveTab('today')} />
        )}
        {activeTab === 'ai_coach' && <AICoachScreen />}
        {activeTab === 'goals' && <GoalsProfileScreen />}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('today')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'today' ? 'today' : 'today-outline'}
            size={22}
            color={activeTab === 'today' ? '#10B981' : Colors.dark.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'today' && styles.tabLabelActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'history' ? 'stats-chart' : 'stats-chart-outline'}
            size={22}
            color={activeTab === 'history' ? '#10B981' : Colors.dark.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'history' && styles.tabLabelActive,
            ]}
          >
            Past Records
          </Text>
        </TouchableOpacity>

        {/* AI Center Tab with Glow */}
        <TouchableOpacity
          style={styles.aiTabCenter}
          onPress={() => setActiveTab('ai_coach')}
          activeOpacity={0.8}
        >
          <View style={[styles.aiGlowCircle, activeTab === 'ai_coach' && styles.aiGlowCircleActive]}>
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: '#A78BFA', fontWeight: '800' },
            ]}
          >
            AI Coach
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('goals')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={
              activeTab === 'goals'
                ? profile.goalType === 'gain_weight'
                  ? 'barbell'
                  : 'flame'
                : 'flame-outline'
            }
            size={22}
            color={activeTab === 'goals' ? '#10B981' : Colors.dark.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'goals' && styles.tabLabelActive,
            ]}
          >
            Goals & Plan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Goal onboarding modal if triggered */}
      <OnboardingModal
        visible={onboardingVisible}
        onClose={() => setOnboardingVisible(false)}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NutriProvider>
      <MainApp />
    </NutriProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0B0F19',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  tabLabelActive: {
    color: '#10B981',
    fontWeight: '800',
  },
  aiTabCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 3,
    marginTop: -10,
  },
  aiGlowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  aiGlowCircleActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },
});
