import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { formatDateToISO, getTodayISO, parseISODate } from '../utils/dateUtils';

interface CalendarDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CalendarDatePickerModal: React.FC<CalendarDatePickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { selectedDate, setSelectedDate, allDayLogs, profile } = useNutri();
  const [currentMonthDate, setCurrentMonthDate] = useState(() => parseISODate(selectedDate));

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar grid days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const todayStr = getTodayISO();

  const handleSelectDay = (day: number) => {
    const d = new Date(year, month, day);
    setSelectedDate(formatDateToISO(d));
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.calendarCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.monthTitle}>{monthName}</Text>
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={16} color={Colors.dark.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={16} color={Colors.dark.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={18} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, idx) => (
              <Text key={idx} style={styles.weekdayText}>
                {w}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {days.map((day, idx) => {
              if (day === null) {
                return <View key={`empty_${idx}`} style={styles.dayCell} />;
              }

              const checkDateStr = formatDateToISO(new Date(year, month, day));
              const isSelected = checkDateStr === selectedDate;
              const isToday = checkDateStr === todayStr;
              const log = allDayLogs[checkDateStr];
              const hasData = log && (log.foods.length > 0 || log.waterIntakeMl > 0);

              return (
                <TouchableOpacity
                  key={`day_${day}`}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => handleSelectDay(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {day}
                  </Text>
                  {hasData && (
                    <View
                      style={[
                        styles.dot,
                        isSelected ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#10B981' },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom quick actions */}
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => {
                setSelectedDate(todayStr);
                onClose();
              }}
            >
              <Ionicons name="today-outline" size={14} color="#10B981" />
              <Text style={styles.todayBtnText}>Go to Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.dark.modalBg,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    width: 36,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 12,
  },
  dayCellSelected: {
    backgroundColor: '#10B981',
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#10B981',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayTextToday: {
    color: '#10B981',
    fontWeight: '800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  bottomRow: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
    alignItems: 'center',
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
});
