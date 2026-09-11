import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { MealCategory } from '../types';
import { Header } from '../components/Header';
import { DaySelector } from '../components/DaySelector';
import { CalorieRings } from '../components/CalorieRings';
import { MealCard } from '../components/MealCard';
import { WaterTracker } from '../components/WaterTracker';
import { ExerciseTracker } from '../components/ExerciseTracker';
import { QuickAddModal } from '../components/QuickAddModal';
import { AIFoodScannerModal } from '../components/AIFoodScannerModal';
import { CalendarDatePickerModal } from '../components/CalendarDatePickerModal';
import { WeightLogModal } from '../components/WeightLogModal';

interface TodayScreenProps {
  onNavigateToProfile?: () => void;
  onNavigateToAICoach?: () => void;
  onNavigateToHistory?: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  onNavigateToProfile,
  onNavigateToAICoach,
  onNavigateToHistory,
}) => {
  const { summary, dayLog } = useNutri();

  // Modals state
  const [quickAddModalVisible, setQuickAddModalVisible] = useState(false);
  const [selectedMealCategory, setSelectedMealCategory] = useState<MealCategory>('lunch');
  const [aiScannerVisible, setAiScannerVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);

  const handleOpenAddFood = (category: MealCategory) => {
    setSelectedMealCategory(category);
    setQuickAddModalVisible(true);
  };

  const handleOpenAIScanner = (category: MealCategory) => {
    setSelectedMealCategory(category);
    setAiScannerVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      {/* App Header */}
      <Header
        onOpenCalendar={() => setCalendarModalVisible(true)}
        onOpenProfile={onNavigateToProfile}
        onOpenAICoach={onNavigateToAICoach}
      />

      {/* Day Ribbon Selector */}
      <DaySelector />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Calorie & Macro Rings */}
        <CalorieRings />

        {/* Quick Check-in banner (Weight / Past records shortcut) */}
        <View style={styles.quickBar}>
          <TouchableOpacity
            style={styles.quickBarItem}
            onPress={() => setWeightModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="scale-outline" size={16} color="#10B981" />
            <Text style={styles.quickBarText}>
              {dayLog.weightKg ? `Weight: ${dayLog.weightKg} kg` : '+ Log Weight'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBarItem}
            onPress={onNavigateToHistory}
            activeOpacity={0.7}
          >
            <Ionicons name="stats-chart-outline" size={16} color="#6366F1" />
            <Text style={styles.quickBarText}>Past Records & Trends</Text>
          </TouchableOpacity>
        </View>

        {/* Meals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Meals</Text>
          <Text style={styles.sectionSubtitle}>
            {dayLog.foods.length} items logged
          </Text>
        </View>

        <MealCard
          category="breakfast"
          onAddPress={handleOpenAddFood}
          onAIScanPress={handleOpenAIScanner}
        />

        <MealCard
          category="lunch"
          onAddPress={handleOpenAddFood}
          onAIScanPress={handleOpenAIScanner}
        />

        <MealCard
          category="dinner"
          onAddPress={handleOpenAddFood}
          onAIScanPress={handleOpenAIScanner}
        />

        <MealCard
          category="snacks"
          onAddPress={handleOpenAddFood}
          onAIScanPress={handleOpenAIScanner}
        />

        {/* Hydration Tracker */}
        <WaterTracker />

        {/* Exercise / Activity Tracker */}
        <ExerciseTracker />
      </ScrollView>

      {/* Floating AI Scan Quick Action Button */}
      <TouchableOpacity
        style={styles.floatingFab}
        onPress={() => {
          setSelectedMealCategory('lunch');
          setAiScannerVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>AI Log</Text>
      </TouchableOpacity>

      {/* Modals */}
      <QuickAddModal
        visible={quickAddModalVisible}
        category={selectedMealCategory}
        onClose={() => setQuickAddModalVisible(false)}
        onOpenAIScan={(cat) => {
          setSelectedMealCategory(cat);
          setAiScannerVisible(true);
        }}
      />

      <AIFoodScannerModal
        visible={aiScannerVisible}
        initialCategory={selectedMealCategory}
        onClose={() => setAiScannerVisible(false)}
      />

      <CalendarDatePickerModal
        visible={calendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
      />

      <WeightLogModal
        visible={weightModalVisible}
        onClose={() => setWeightModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  quickBar: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  quickBarItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 14,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  quickBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.textMuted,
  },
  floatingFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
