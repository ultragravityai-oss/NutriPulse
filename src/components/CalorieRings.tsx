import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { useNutri } from '../context/NutriContext';

const { width } = Dimensions.get('window');

export const CalorieRings: React.FC = () => {
  const { summary, profile } = useNutri();

  const caloriePct = Math.min(100, Math.round((summary.consumedCalories / (summary.targetCalories || 1)) * 100));
  const proteinPct = Math.min(100, Math.round((summary.consumedProtein / (summary.targetProtein || 1)) * 100));
  const carbsPct = Math.min(100, Math.round((summary.consumedCarbs / (summary.targetCarbs || 1)) * 100));
  const fatPct = Math.min(100, Math.round((summary.consumedFat / (summary.targetFat || 1)) * 100));

  const isOver = summary.remainingCalories < 0;

  return (
    <View style={styles.cardContainer}>
      {/* Top Banner: Goal Status */}
      <View style={styles.topRow}>
        <View style={styles.goalTag}>
          <Ionicons
            name={profile.goalType === 'gain_weight' ? 'barbell' : profile.goalType === 'lose_weight' ? 'flame' : 'shield-checkmark'}
            size={13}
            color={profile.goalType === 'gain_weight' ? '#4ECDC4' : profile.goalType === 'lose_weight' ? '#FF6B6B' : '#818CF8'}
          />
          <Text style={styles.goalTagText}>
            {profile.goalType === 'lose_weight'
              ? `CUT • Target ${profile.targetCalories} kcal`
              : profile.goalType === 'gain_weight'
              ? `BULK • Target ${profile.targetCalories} kcal`
              : `MAINTAIN • Target ${profile.targetCalories} kcal`}
          </Text>
        </View>

        <Text style={styles.netKcalText}>
          Net: <Text style={{ color: '#F8FAFC', fontWeight: '800' }}>{summary.netCalories}</Text> kcal
        </Text>
      </View>

      {/* Hero Calorie Section */}
      <View style={styles.heroSection}>
        <View style={styles.mainCalorieCol}>
          <Text style={styles.calorieNumber}>
            {Math.abs(summary.remainingCalories)}
          </Text>
          <Text style={[styles.calorieLabel, isOver && styles.calorieLabelOver]}>
            {isOver ? 'KCAL OVER TARGET' : 'KCAL REMAINING'}
          </Text>

          {/* Main Progress Bar */}
          <View style={styles.mainProgressBarBg}>
            <View
              style={[
                styles.mainProgressBarFill,
                {
                  width: `${Math.min(100, caloriePct)}%`,
                  backgroundColor: isOver ? '#EF4444' : '#10B981',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Equation Breakdown Row */}
      <View style={styles.equationRow}>
        <View style={styles.equationItem}>
          <Text style={styles.equationValue}>{summary.targetCalories}</Text>
          <Text style={styles.equationLabel}>Base Goal</Text>
        </View>
        <Text style={styles.equationOperator}>-</Text>
        <View style={styles.equationItem}>
          <Text style={[styles.equationValue, { color: '#F8FAFC' }]}>{summary.consumedCalories}</Text>
          <Text style={styles.equationLabel}>Food</Text>
        </View>
        <Text style={styles.equationOperator}>+</Text>
        <View style={styles.equationItem}>
          <Text style={[styles.equationValue, { color: '#EF4444' }]}>{summary.burnedCalories}</Text>
          <Text style={styles.equationLabel}>Exercise</Text>
        </View>
        <Text style={styles.equationOperator}>=</Text>
        <View style={styles.equationItem}>
          <Text style={[styles.equationValue, { color: isOver ? '#EF4444' : '#10B981' }]}>
            {summary.remainingCalories}
          </Text>
          <Text style={styles.equationLabel}>Remaining</Text>
        </View>
      </View>

      {/* 3 Macro Gauges */}
      <View style={styles.macrosContainer}>
        {/* Protein */}
        <View style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.protein.primary }]} />
            <Text style={styles.macroTitle}>Protein</Text>
            <Text style={styles.macroPct}>{proteinPct}%</Text>
          </View>
          <Text style={styles.macroGrams}>
            <Text style={styles.macroGramsConsumed}>{summary.consumedProtein}</Text>
            <Text style={styles.macroGramsTarget}> / {summary.targetProtein}g</Text>
          </Text>
          <View style={styles.macroBarBg}>
            <View
              style={[
                styles.macroBarFill,
                { width: `${proteinPct}%`, backgroundColor: MACRO_COLORS.protein.primary },
              ]}
            />
          </View>
        </View>

        {/* Carbs */}
        <View style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.carbs.primary }]} />
            <Text style={styles.macroTitle}>Carbs</Text>
            <Text style={styles.macroPct}>{carbsPct}%</Text>
          </View>
          <Text style={styles.macroGrams}>
            <Text style={styles.macroGramsConsumed}>{summary.consumedCarbs}</Text>
            <Text style={styles.macroGramsTarget}> / {summary.targetCarbs}g</Text>
          </Text>
          <View style={styles.macroBarBg}>
            <View
              style={[
                styles.macroBarFill,
                { width: `${carbsPct}%`, backgroundColor: MACRO_COLORS.carbs.primary },
              ]}
            />
          </View>
        </View>

        {/* Fat */}
        <View style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.fat.primary }]} />
            <Text style={styles.macroTitle}>Fat</Text>
            <Text style={styles.macroPct}>{fatPct}%</Text>
          </View>
          <Text style={styles.macroGrams}>
            <Text style={styles.macroGramsConsumed}>{summary.consumedFat}</Text>
            <Text style={styles.macroGramsTarget}> / {summary.targetFat}g</Text>
          </Text>
          <View style={styles.macroBarBg}>
            <View
              style={[
                styles.macroBarFill,
                { width: `${fatPct}%`, backgroundColor: MACRO_COLORS.fat.primary },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 14,
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  goalTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    letterSpacing: 0.2,
  },
  netKcalText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  mainCalorieCol: {
    alignItems: 'center',
    width: '100%',
  },
  calorieNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  calorieLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1.2,
    marginTop: 2,
    marginBottom: 12,
  },
  calorieLabelOver: {
    color: '#EF4444',
  },
  mainProgressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  mainProgressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  equationItem: {
    alignItems: 'center',
  },
  equationValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
  },
  equationLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  equationOperator: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    flex: 1,
    marginLeft: 4,
  },
  macroPct: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  macroGrams: {
    fontSize: 12,
    marginBottom: 6,
  },
  macroGramsConsumed: {
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  macroGramsTarget: {
    fontWeight: '600',
    color: Colors.dark.textMuted,
    fontSize: 10,
  },
  macroBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
