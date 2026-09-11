import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { formatFriendlyDate, getTodayISO } from '../utils/dateUtils';

interface HeaderProps {
  onOpenCalendar?: () => void;
  onOpenProfile?: () => void;
  onOpenAICoach?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCalendar,
  onOpenProfile,
  onOpenAICoach,
}) => {
  const { streak, selectedDate, setSelectedDate, profile } = useNutri();
  const isToday = selectedDate === getTodayISO();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="flash" size={18} color="#10B981" />
        </View>
        <View>
          <Text style={styles.title}>NutriPulse</Text>
          <Text style={styles.subtitle}>
            {formatFriendlyDate(selectedDate)}
            {!isToday && (
              <Text
                style={styles.jumpToday}
                onPress={() => setSelectedDate(getTodayISO())}
              >
                {'  '}• Jump to Today
              </Text>
            )}
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Streak pill */}
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={16} color="#F59E0B" />
          <Text style={styles.streakText}>{streak}d</Text>
        </View>

        {/* AI Quick Button */}
        {onOpenAICoach && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenAICoach}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={18} color="#A78BFA" />
          </TouchableOpacity>
        )}

        {/* Calendar Picker Button */}
        {onOpenCalendar && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenCalendar}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.dark.textPrimary} />
          </TouchableOpacity>
        )}

        {/* Profile Avatar Button */}
        {onOpenProfile && (
          <TouchableOpacity
            style={[styles.avatarButton, { borderColor: profile.goalType === 'gain_weight' ? '#4ECDC4' : profile.goalType === 'lose_weight' ? '#FF6B6B' : '#6C5CE7' }]}
            onPress={onOpenProfile}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={16} color="#F8FAFC" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    backgroundColor: Colors.dark.bg,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  jumpToday: {
    color: '#10B981',
    fontWeight: '700',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 3,
  },
  streakText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
