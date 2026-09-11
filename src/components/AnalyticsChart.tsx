import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { DayLog, UserProfile, WeightEntry } from '../types';
import { formatDayOfWeek, parseISODate } from '../utils/dateUtils';

interface AnalyticsChartProps {
  pastDays: string[];
  dayLogs: Record<string, DayLog>;
  profile: UserProfile;
  weights: WeightEntry[];
  onSelectDate?: (dateStr: string) => void;
  selectedDate?: string;
}

const { width } = Dimensions.get('window');

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  pastDays,
  dayLogs,
  profile,
  weights,
  onSelectDate,
  selectedDate,
}) => {
  const targetKcal = profile.targetCalories;

  // Calculate day calories for the past days
  const chartData = pastDays.map((dateStr) => {
    const log = dayLogs[dateStr];
    const totalKcal = log
      ? log.foods.reduce((sum, f) => sum + f.calories * f.servings, 0)
      : 0;
    const protein = log
      ? log.foods.reduce((sum, f) => sum + f.proteinG * f.servings, 0)
      : 0;
    const carbs = log
      ? log.foods.reduce((sum, f) => sum + f.carbsG * f.servings, 0)
      : 0;
    const fat = log
      ? log.foods.reduce((sum, f) => sum + f.fatG * f.servings, 0)
      : 0;
    const burned = log
      ? log.exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0)
      : 0;

    return {
      dateStr,
      dayLabel: formatDayOfWeek(dateStr),
      totalKcal,
      protein,
      carbs,
      fat,
      burned,
    };
  });

  const maxKcal = Math.max(targetKcal * 1.25, ...chartData.map((d) => d.totalKcal), 2500);

  // Averages
  const loggedDaysWithFood = chartData.filter((d) => d.totalKcal > 0);
  const avgKcal = loggedDaysWithFood.length
    ? Math.round(loggedDaysWithFood.reduce((sum, d) => sum + d.totalKcal, 0) / loggedDaysWithFood.length)
    : 0;

  const avgProtein = loggedDaysWithFood.length
    ? Math.round(loggedDaysWithFood.reduce((sum, d) => sum + d.protein, 0) / loggedDaysWithFood.length)
    : 0;

  const avgCarbs = loggedDaysWithFood.length
    ? Math.round(loggedDaysWithFood.reduce((sum, d) => sum + d.carbs, 0) / loggedDaysWithFood.length)
    : 0;

  const avgFat = loggedDaysWithFood.length
    ? Math.round(loggedDaysWithFood.reduce((sum, d) => sum + d.fat, 0) / loggedDaysWithFood.length)
    : 0;

  return (
    <View style={styles.container}>
      {/* 7-Day Calorie Bar Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Calorie Intake History</Text>
            <Text style={styles.cardSubtitle}>
              Target: <Text style={{ color: '#10B981', fontWeight: '700' }}>{targetKcal} kcal</Text>
            </Text>
          </View>
          <View style={styles.avgBadge}>
            <Text style={styles.avgBadgeLabel}>7D Average</Text>
            <Text style={styles.avgBadgeValue}>{avgKcal} kcal</Text>
          </View>
        </View>

        {/* Chart Bars */}
        <View style={styles.chartContainer}>
          {/* Target Reference Line */}
          <View
            style={[
              styles.targetLine,
              { bottom: `${Math.min(95, (targetKcal / maxKcal) * 100)}%` },
            ]}
          >
            <View style={styles.targetDashedLine} />
            <Text style={styles.targetLineLabel}>{targetKcal}</Text>
          </View>

          {/* Individual Bars */}
          <View style={styles.barsRow}>
            {chartData.map((item) => {
              const heightPct = Math.min(100, Math.max(4, (item.totalKcal / maxKcal) * 100));
              const isSelected = item.dateStr === selectedDate;
              const isOver = item.totalKcal > targetKcal + 100;
              const isOnTarget = Math.abs(item.totalKcal - targetKcal) <= targetKcal * 0.15;

              let barColor = '#10B981';
              if (isOver) barColor = '#EF4444';
              else if (!isOnTarget && item.totalKcal > 0) barColor = '#F59E0B';

              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={styles.barColumn}
                  onPress={() => onSelectDate && onSelectDate(item.dateStr)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.barValueText}>
                    {item.totalKcal > 0 ? item.totalKcal : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: barColor,
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: '#FFFFFF',
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barDayLabel,
                      isSelected && styles.barDayLabelSelected,
                    ]}
                  >
                    {item.dayLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>On Target (±15%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Under Budget</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Over Budget</Text>
          </View>
        </View>
      </View>

      {/* Average Daily Macro Balance */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Average Macro Distribution</Text>
        <Text style={styles.cardSubtitle}>Based on your past logged meals</Text>

        <View style={styles.macroAvgRow}>
          <View style={[styles.macroAvgBox, { borderColor: MACRO_COLORS.protein.primary }]}>
            <Ionicons name="barbell" size={16} color={MACRO_COLORS.protein.primary} />
            <Text style={styles.macroAvgVal}>{avgProtein}g</Text>
            <Text style={styles.macroAvgName}>Protein</Text>
            <Text style={styles.macroAvgGoal}>Goal: {profile.targetProteinG}g</Text>
          </View>

          <View style={[styles.macroAvgBox, { borderColor: MACRO_COLORS.carbs.primary }]}>
            <Ionicons name="flash" size={16} color={MACRO_COLORS.carbs.primary} />
            <Text style={styles.macroAvgVal}>{avgCarbs}g</Text>
            <Text style={styles.macroAvgName}>Carbs</Text>
            <Text style={styles.macroAvgGoal}>Goal: {profile.targetCarbsG}g</Text>
          </View>

          <View style={[styles.macroAvgBox, { borderColor: MACRO_COLORS.fat.primary }]}>
            <Ionicons name="water" size={16} color={MACRO_COLORS.fat.primary} />
            <Text style={styles.macroAvgVal}>{avgFat}g</Text>
            <Text style={styles.macroAvgName}>Fat</Text>
            <Text style={styles.macroAvgGoal}>Goal: {profile.targetFatG}g</Text>
          </View>
        </View>
      </View>

      {/* Weight Progression Card */}
      {weights.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Weight Trend Progression</Text>
              <Text style={styles.cardSubtitle}>
                Current: <Text style={{ color: '#F8FAFC', fontWeight: '800' }}>{weights[0]?.weightKg || profile.currentWeightKg} kg</Text> • Goal: {profile.targetWeightKg} kg
              </Text>
            </View>
            <View style={styles.goalDeltaPill}>
              <Text style={styles.goalDeltaText}>
                {profile.goalType === 'gain_weight' ? '+' : '-'}
                {Math.abs((weights[0]?.weightKg || profile.currentWeightKg) - profile.targetWeightKg).toFixed(1)} kg left
              </Text>
            </View>
          </View>

          {/* Weight Log timeline */}
          <View style={styles.weightTimeline}>
            {weights.slice(0, 5).map((w, i) => (
              <View key={w.id} style={styles.weightRow}>
                <View style={styles.weightRowLeft}>
                  <View style={styles.weightDot} />
                  <Text style={styles.weightDate}>{w.dateString}</Text>
                  {w.notes && <Text style={styles.weightNotes}>• {w.notes}</Text>}
                </View>
                <Text style={styles.weightKgText}>{w.weightKg} kg</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  avgBadge: {
    alignItems: 'flex-end',
  },
  avgBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  avgBadgeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  chartContainer: {
    height: 170,
    position: 'relative',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  targetDashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderStyle: 'dashed',
  },
  targetLineLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    marginLeft: 4,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingTop: 20,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValueText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 22,
    height: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barDayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    marginTop: 6,
  },
  barDayLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    fontWeight: '600',
  },
  macroAvgRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  macroAvgBox: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  macroAvgVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark.textPrimary,
    marginTop: 6,
  },
  macroAvgName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  macroAvgGoal: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  goalDeltaPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  goalDeltaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  weightTimeline: {
    gap: 8,
    marginTop: 6,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  weightRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  weightDate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  weightNotes: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  weightKgText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
});
