import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { formatFriendlyDate, getPastNDays, getTodayISO } from '../utils/dateUtils';
import { WeightLogModal } from '../components/WeightLogModal';

export const HistoryScreen: React.FC<{ onNavigateToToday: () => void }> = ({
  onNavigateToToday,
}) => {
  const {
    allDayLogs,
    profile,
    weightHistory,
    selectedDate,
    setSelectedDate,
    seedDemoHistory,
    getDayLogForDate,
    getDailySummaryForDate,
  } = useNutri();

  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const pastDays = getPastNDays(timeRange);

  const handleSelectHistoricalDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setExpandedDate(dateStr === expandedDate ? null : dateStr);
  };

  const handleJumpToDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    onNavigateToToday();
  };

  // Calculate high-level stats
  const loggedDays = pastDays.map((d) => getDailySummaryForDate(d)).filter((s) => s.consumedCalories > 0);
  const avgDeficit = loggedDays.length
    ? Math.round(
        loggedDays.reduce((sum, s) => sum + (profile.targetCalories - s.consumedCalories), 0) /
          loggedDays.length
      )
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Past Records & Analytics</Text>
          <Text style={styles.subtitle}>Track your long-term calorie adherence & trends</Text>
        </View>

        <TouchableOpacity
          style={styles.reseedBtn}
          onPress={() => {
            seedDemoHistory();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Time range toggle */}
        <View style={styles.rangeToggle}>
          {[7, 14, 30].map((days) => (
            <TouchableOpacity
              key={days}
              style={[styles.rangeBtn, timeRange === days && styles.rangeBtnActive]}
              onPress={() => setTimeRange(days as any)}
            >
              <Text style={[styles.rangeBtnText, timeRange === days && styles.rangeBtnTextActive]}>
                Past {days} Days
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Scorecards */}
        <View style={styles.scorecardsRow}>
          <View style={styles.scorecard}>
            <Ionicons name="flame" size={18} color="#10B981" />
            <Text style={styles.scorecardVal}>
              {loggedDays.length ? Math.round(loggedDays.reduce((sum, s) => sum + s.consumedCalories, 0) / loggedDays.length) : 0}
            </Text>
            <Text style={styles.scorecardLabel}>Avg kcal / Day</Text>
          </View>

          <View style={styles.scorecard}>
            <Ionicons
              name={profile.goalType === 'gain_weight' ? 'trending-up' : 'trending-down'}
              size={18}
              color={profile.goalType === 'gain_weight' ? '#4ECDC4' : '#FF6B6B'}
            />
            <Text style={styles.scorecardVal}>
              {profile.goalType === 'gain_weight' ? `+${Math.abs(avgDeficit)}` : `${avgDeficit}`}
            </Text>
            <Text style={styles.scorecardLabel}>
              {profile.goalType === 'gain_weight' ? 'Avg Surplus' : 'Avg Deficit'}
            </Text>
          </View>

          <View style={styles.scorecard}>
            <Ionicons name="fitness" size={18} color="#6366F1" />
            <Text style={styles.scorecardVal}>
              {loggedDays.length ? Math.round(loggedDays.reduce((sum, s) => sum + s.consumedProtein, 0) / loggedDays.length) : 0}g
            </Text>
            <Text style={styles.scorecardLabel}>Avg Protein</Text>
          </View>
        </View>

        {/* Analytics Charts Component */}
        <AnalyticsChart
          pastDays={pastDays}
          dayLogs={allDayLogs}
          profile={profile}
          weights={weightHistory}
          selectedDate={selectedDate}
          onSelectDate={handleSelectHistoricalDate}
        />

        {/* Day-by-Day Detailed Log Browser */}
        <View style={styles.historyLogsSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.historySectionTitle}>Historical Daily Logs</Text>
            <Text style={styles.historySectionSub}>Tap any day to view meals</Text>
          </View>

          <View style={styles.historyList}>
            {pastDays.map((dateStr) => {
              const daySummary = getDailySummaryForDate(dateStr);
              const dayLog = getDayLogForDate(dateStr);
              const isExpanded = expandedDate === dateStr;
              const hasMeals = dayLog.foods.length > 0;
              const isCurrentSelected = dateStr === selectedDate;

              return (
                <View
                  key={dateStr}
                  style={[
                    styles.dayRecordCard,
                    isCurrentSelected && styles.dayRecordCardActive,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.dayRecordHeader}
                    onPress={() => handleSelectHistoricalDate(dateStr)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dayDateCol}>
                      <Text style={styles.dayDateText}>{formatFriendlyDate(dateStr)}</Text>
                      <Text style={styles.dayIsoText}>{dateStr}</Text>
                    </View>

                    <View style={styles.dayMetricsCol}>
                      <Text style={styles.dayKcalTotal}>
                        {daySummary.consumedCalories}
                        <Text style={styles.dayKcalLabel}> / {profile.targetCalories} kcal</Text>
                      </Text>
                      <Text style={styles.dayMacroSub}>
                        P: {daySummary.consumedProtein}g • C: {daySummary.consumedCarbs}g • F: {daySummary.consumedFat}g
                      </Text>
                    </View>

                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={Colors.dark.textMuted}
                    />
                  </TouchableOpacity>

                  {/* Expanded Food Details */}
                  {isExpanded && (
                    <View style={styles.expandedBody}>
                      {!hasMeals ? (
                        <Text style={styles.noDataText}>No food recorded for this date.</Text>
                      ) : (
                        <View style={styles.foodListExpanded}>
                          {dayLog.foods.map((food) => (
                            <View key={food.logId} style={styles.foodItemRow}>
                              <Text style={styles.foodEmoji}>{food.icon || '🍽️'}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.foodItemName}>{food.name}</Text>
                                <Text style={styles.foodItemServing}>
                                  {food.servings} × {food.servingSize} {food.servingUnit} ({food.mealCategory})
                                </Text>
                              </View>
                              <Text style={styles.foodItemCalories}>
                                {Math.round(food.calories * food.servings)} kcal
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.openDayBtn}
                        onPress={() => handleJumpToDay(dateStr)}
                      >
                        <Ionicons name="create-outline" size={14} color="#10B981" />
                        <Text style={styles.openDayBtnText}>Edit / Open in Diary</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  reseedBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  rangeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  rangeBtnActive: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  rangeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  rangeBtnTextActive: {
    color: '#10B981',
  },
  scorecardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  scorecard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  scorecardVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark.textPrimary,
    marginTop: 6,
  },
  scorecardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  historyLogsSection: {
    marginTop: 18,
  },
  sectionTitleRow: {
    marginBottom: 12,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  historySectionSub: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  historyList: {
    gap: 10,
  },
  dayRecordCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    overflow: 'hidden',
  },
  dayRecordCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  dayRecordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  dayDateCol: {
    flex: 1,
  },
  dayDateText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  dayIsoText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 1,
  },
  dayMetricsCol: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  dayKcalTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dayKcalLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.dark.textMuted,
  },
  dayMacroSub: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  expandedBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  noDataText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  foodListExpanded: {
    paddingVertical: 8,
    gap: 8,
  },
  foodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  foodEmoji: {
    fontSize: 18,
  },
  foodItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  foodItemServing: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
  foodItemCalories: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  openDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 8,
    gap: 6,
  },
  openDayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
});
