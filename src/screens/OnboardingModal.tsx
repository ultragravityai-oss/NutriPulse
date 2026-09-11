import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { ActivityLevel, DietType, GoalType } from '../types';
import { calculateTargets, GOAL_LABELS } from '../utils/bmrCalculator';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onClose }) => {
  const { profile, updateProfile } = useNutri();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goalType, setGoalType] = useState<GoalType>(profile.goalType || 'lose_weight');
  const [goalRate, setGoalRate] = useState<number>(profile.goalRateKgPerWeek || 0.5);
  const [currentWeight, setCurrentWeight] = useState(String(profile.currentWeightKg || 78));
  const [targetWeight, setTargetWeight] = useState(String(profile.targetWeightKg || 72));
  const [heightCm, setHeightCm] = useState(String(profile.heightCm || 178));
  const [age, setAge] = useState(String(profile.age || 26));
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(profile.gender || 'male');
  const [activity, setActivity] = useState<ActivityLevel>(profile.activityLevel || 'moderately_active');
  const [dietType, setDietType] = useState<DietType>(profile.dietType || 'high_protein');

  // Preview live targets
  const targets = calculateTargets(
    parseFloat(currentWeight) || 75,
    Number(heightCm) || 175,
    Number(age) || 25,
    gender,
    activity,
    goalType,
    goalRate,
    dietType
  );

  const handleFinish = async () => {
    await updateProfile({
      goalType,
      goalRateKgPerWeek: goalRate,
      currentWeightKg: parseFloat(currentWeight) || 75,
      targetWeightKg: parseFloat(targetWeight) || 70,
      heightCm: Number(heightCm) || 175,
      age: Number(age) || 25,
      gender,
      activityLevel: activity,
      dietType,
      isOnboarded: true,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Step 1: Goal Selection */}
            {step === 1 && (
              <View>
                <Text style={styles.stepTitle}>What is your primary goal?</Text>
                <Text style={styles.stepSubtitle}>
                  We'll calibrate your calorie budget & macro distribution
                </Text>

                <View style={styles.optionsList}>
                  {(['lose_weight', 'gain_weight', 'maintain_weight'] as GoalType[]).map((g) => {
                    const info = GOAL_LABELS[g];
                    const isSelected = goalType === g;

                    return (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.goalOptionCard,
                          isSelected && { borderColor: info.color, backgroundColor: `${info.color}15` },
                        ]}
                        onPress={() => setGoalType(g)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.goalIcon, { backgroundColor: `${info.color}25` }]}>
                          <Ionicons name={info.icon as any} size={24} color={info.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.goalOptionTitle, isSelected && { color: info.color }]}>
                            {info.title}
                          </Text>
                          <Text style={styles.goalOptionSub}>{info.subtitle}</Text>
                        </View>
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={isSelected ? info.color : Colors.dark.textMuted}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {goalType !== 'maintain_weight' && (
                  <View style={styles.rateBox}>
                    <Text style={styles.rateTitle}>Pace: How fast do you want to progress?</Text>
                    <View style={styles.rateRow}>
                      {[0.25, 0.5, 0.75, 1.0].map((r) => (
                        <TouchableOpacity
                          key={r}
                          style={[styles.rateChip, goalRate === r && styles.rateChipActive]}
                          onPress={() => setGoalRate(r)}
                        >
                          <Text style={[styles.rateChipText, goalRate === r && styles.rateChipTextActive]}>
                            {r} kg / wk
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
                  <Text style={styles.nextBtnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Body Stats */}
            {step === 2 && (
              <View>
                <Text style={styles.stepTitle}>Tell us about your body</Text>
                <Text style={styles.stepSubtitle}>
                  Used for the Mifflin-St Jeor metabolic equation
                </Text>

                <View style={styles.inputGrid}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Current Weight (kg)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      value={currentWeight}
                      onChangeText={setCurrentWeight}
                    />
                  </View>

                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Target Weight (kg)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      value={targetWeight}
                      onChangeText={setTargetWeight}
                    />
                  </View>
                </View>

                <View style={styles.inputGrid}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Height (cm)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={heightCm}
                      onChangeText={setHeightCm}
                    />
                  </View>

                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                    />
                  </View>
                </View>

                {/* Biological sex */}
                <Text style={styles.inputLabel}>Biological Sex</Text>
                <View style={styles.genderRow}>
                  {(['male', 'female'] as const).map((gen) => (
                    <TouchableOpacity
                      key={gen}
                      style={[styles.genderChip, gender === gen && styles.genderChipActive]}
                      onPress={() => setGender(gen)}
                    >
                      <Ionicons
                        name={gen === 'male' ? 'male' : 'female'}
                        size={16}
                        color={gender === gen ? '#10B981' : Colors.dark.textMuted}
                      />
                      <Text style={[styles.genderChipText, gender === gen && styles.genderChipTextActive]}>
                        {gen === 'male' ? 'Male' : 'Female'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.navRow}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nextBtnFlex} onPress={() => setStep(3)}>
                    <Text style={styles.nextBtnText}>Calculate Plan</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 3: Plan Review & Finish */}
            {step === 3 && (
              <View>
                <Text style={styles.stepTitle}>Your Personalized Nutrition Plan 🎉</Text>
                <Text style={styles.stepSubtitle}>
                  Tailored specifically to help you {goalType === 'gain_weight' ? 'gain muscle & size' : goalType === 'lose_weight' ? 'shed body fat' : 'maintain your shape'}
                </Text>

                {/* Plan Card */}
                <View style={styles.resultCard}>
                  <Text style={styles.resultKcalLabel}>DAILY CALORIE BUDGET</Text>
                  <Text style={styles.resultKcalNumber}>{targets.targetCalories} kcal</Text>
                  <Text style={styles.resultTdeeSub}>
                    BMR: {targets.bmr} kcal • Maintenance TDEE: {targets.tdee} kcal
                  </Text>

                  <View style={styles.macroPillsRow}>
                    <View style={[styles.resMacroPill, { borderColor: MACRO_COLORS.protein.primary }]}>
                      <Text style={[styles.resMacroGrams, { color: MACRO_COLORS.protein.primary }]}>
                        {targets.targetProteinG}g
                      </Text>
                      <Text style={styles.resMacroName}>Protein</Text>
                    </View>

                    <View style={[styles.resMacroPill, { borderColor: MACRO_COLORS.carbs.primary }]}>
                      <Text style={[styles.resMacroGrams, { color: MACRO_COLORS.carbs.primary }]}>
                        {targets.targetCarbsG}g
                      </Text>
                      <Text style={styles.resMacroName}>Carbs</Text>
                    </View>

                    <View style={[styles.resMacroPill, { borderColor: MACRO_COLORS.fat.primary }]}>
                      <Text style={[styles.resMacroGrams, { color: MACRO_COLORS.fat.primary }]}>
                        {targets.targetFatG}g
                      </Text>
                      <Text style={styles.resMacroName}>Fat</Text>
                    </View>
                  </View>
                </View>

                {/* Diet Preset */}
                <Text style={styles.inputLabel}>Macro Distribution Preset</Text>
                <View style={styles.dietPresetRow}>
                  {[
                    { id: 'high_protein' as DietType, name: 'High Protein (35P/40C/25F)' },
                    { id: 'balanced' as DietType, name: 'Balanced (25P/50C/25F)' },
                    { id: 'keto' as DietType, name: 'Keto / Low Carb (25P/5C/70F)' },
                  ].map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.dietChip, dietType === d.id && styles.dietChipActive]}
                      onPress={() => setDietType(d.id)}
                    >
                      <Text style={[styles.dietChipText, dietType === d.id && styles.dietChipTextActive]}>
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.navRow}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.finishBtnText}>Start Tracking</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '92%',
    backgroundColor: Colors.dark.modalBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepDotActive: {
    backgroundColor: '#10B981',
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.dark.textPrimary,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
    marginBottom: 16,
  },
  goalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.dark.cardBorder,
    gap: 14,
  },
  goalIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  goalOptionSub: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  rateBox: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  rateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  rateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rateChip: {
    flex: 1,
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rateChipActive: {
    backgroundColor: '#10B981',
  },
  rateChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  rateChipTextActive: {
    color: '#FFFFFF',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 10,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    color: Colors.dark.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  genderChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  genderChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  genderChipTextActive: {
    color: '#10B981',
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  nextBtnFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  resultCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    marginBottom: 18,
  },
  resultKcalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  resultKcalNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  resultTdeeSub: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginBottom: 14,
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  resMacroPill: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  resMacroGrams: {
    fontSize: 15,
    fontWeight: '900',
  },
  resMacroName: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  dietPresetRow: {
    gap: 8,
    marginBottom: 20,
  },
  dietChip: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  dietChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  dietChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  dietChipTextActive: {
    color: '#10B981',
  },
  finishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  finishBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
