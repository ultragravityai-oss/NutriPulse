import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import {
  formatDayNumber,
  formatDayOfWeek,
  getDaysAround,
  getTodayISO,
  shiftDate,
} from '../utils/dateUtils';

export const DaySelector: React.FC = () => {
  const { selectedDate, setSelectedDate, allDayLogs, profile } = useNutri();
  const scrollViewRef = useRef<ScrollView>(null);
  const today = getTodayISO();

  // Generate 15 days window around current selection
  const days = getDaysAround(selectedDate, 15);

  const handlePrevDay = () => {
    setSelectedDate(shiftDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(shiftDate(selectedDate, 1));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.chevronButton}
        onPress={handlePrevDay}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={18} color={Colors.dark.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((dateStr) => {
          const isSelected = dateStr === selectedDate;
          const isCurrentToday = dateStr === today;
          const log = allDayLogs[dateStr];
          const hasLoggedFood = log && log.foods.length > 0;
          
          // Calculate if calories are within target (±15%)
          let dotColor = Colors.dark.textMuted;
          if (hasLoggedFood) {
            const consumed = log.foods.reduce((sum, f) => sum + f.calories * f.servings, 0);
            const diff = Math.abs(consumed - profile.targetCalories);
            if (diff < profile.targetCalories * 0.15) {
              dotColor = '#10B981'; // On target (emerald)
            } else if (consumed > profile.targetCalories) {
              dotColor = '#EF4444'; // Over target (red)
            } else {
              dotColor = '#F59E0B'; // Under target (amber)
            }
          }

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayItem,
                isSelected && styles.dayItemSelected,
                isCurrentToday && !isSelected && styles.dayItemToday,
              ]}
              onPress={() => setSelectedDate(dateStr)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.weekdayText,
                  isSelected && styles.weekdayTextSelected,
                  isCurrentToday && !isSelected && styles.weekdayTextToday,
                ]}
              >
                {formatDayOfWeek(dateStr).toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.dayNumberText,
                  isSelected && styles.dayNumberTextSelected,
                  isCurrentToday && !isSelected && styles.dayNumberTextToday,
                ]}
              >
                {formatDayNumber(dateStr)}
              </Text>
              
              <View
                style={[
                  styles.indicatorDot,
                  { backgroundColor: hasLoggedFood ? dotColor : isSelected ? '#10B981' : 'transparent' },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.chevronButton}
        onPress={handleNextDay}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-forward" size={18} color={Colors.dark.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: Colors.dark.bg,
  },
  chevronButton: {
    width: 28,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 6,
    alignItems: 'center',
  },
  dayItem: {
    width: 46,
    height: 64,
    borderRadius: 14,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  dayItemSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#10B981',
    borderWidth: 1.5,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayItemToday: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  weekdayText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    marginBottom: 2,
  },
  weekdayTextSelected: {
    color: '#10B981',
    fontWeight: '800',
  },
  weekdayTextToday: {
    color: '#34D399',
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayNumberTextToday: {
    color: '#F8FAFC',
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
