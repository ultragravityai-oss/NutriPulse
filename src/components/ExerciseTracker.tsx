import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';

export const ExerciseTracker: React.FC = () => {
  const { dayLog, summary, addExerciseLog, removeExerciseLog } = useNutri();
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('30');
  const [burnedKcal, setBurnedKcal] = useState('250');
  const [category, setCategory] = useState<'cardio' | 'strength' | 'walk' | 'sports'>('strength');

  const handleSave = () => {
    if (!exerciseName.trim()) return;
    addExerciseLog({
      name: exerciseName.trim(),
      durationMinutes: Number(duration) || 30,
      caloriesBurned: Number(burnedKcal) || 200,
      category,
    });
    setExerciseName('');
    setModalVisible(false);
  };

  const handleQuickPreset = (name: string, cat: 'cardio' | 'strength' | 'walk' | 'sports', min: number, kcal: number) => {
    setExerciseName(name);
    setCategory(cat);
    setDuration(String(min));
    setBurnedKcal(String(kcal));
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={18} color="#EF4444" />
          </View>
          <View>
            <Text style={styles.title}>Exercise & Activity</Text>
            <Text style={styles.subtitle}>
              {dayLog.exercises.length} activities logged today
            </Text>
          </View>
        </View>

        <View style={styles.counterRight}>
          <Text style={styles.burnedAmount}>+{summary.burnedCalories}</Text>
          <Text style={styles.burnedLabel}> kcal</Text>
        </View>
      </View>

      {/* Exercise list */}
      {dayLog.exercises.length > 0 && (
        <View style={styles.list}>
          {dayLog.exercises.map((ex) => (
            <View key={ex.id} style={styles.exRow}>
              <View style={styles.exLeft}>
                <Ionicons
                  name={ex.category === 'cardio' ? 'bicycle-outline' : ex.category === 'strength' ? 'barbell-outline' : 'walk-outline'}
                  size={16}
                  color="#EF4444"
                />
                <View>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exDetails}>{ex.durationMinutes} mins • {ex.category}</Text>
                </View>
              </View>
              <View style={styles.exRight}>
                <Text style={styles.exKcal}>-{ex.caloriesBurned} kcal</Text>
                <TouchableOpacity onPress={() => removeExerciseLog(ex.id)}>
                  <Ionicons name="close-circle-outline" size={16} color={Colors.dark.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add Exercise Button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={16} color="#EF4444" />
        <Text style={styles.addBtnText}>Log Workout / Steps</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Exercise / Workout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <Text style={styles.sectionLabel}>Quick Presets</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickPreset('Strength Training', 'strength', 45, 300)}
              >
                <Text style={styles.presetText}>🏋️ Gym 45m (300 kcal)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickPreset('Running 5K', 'cardio', 30, 320)}
              >
                <Text style={styles.presetText}>🏃 5k Run (320 kcal)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickPreset('Brisk 10K Steps', 'walk', 60, 280)}
              >
                <Text style={styles.presetText}>🚶 10k Walk (280 kcal)</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. HIIT Workout, Cycling, Yoga"
              placeholderTextColor={Colors.dark.textMuted}
              value={exerciseName}
              onChangeText={setExerciseName}
            />

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Duration (mins)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Calories Burned (kcal)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={burnedKcal}
                  onChangeText={setBurnedKcal}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, !exerciseName.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!exerciseName.trim()}
            >
              <Text style={styles.saveBtnText}>Save Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.dark.textMuted,
    marginTop: 1,
  },
  counterRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  burnedAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EF4444',
  },
  burnedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  list: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 8,
    gap: 8,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  exLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  exDetails: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  exRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exKcal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    paddingVertical: 9,
    marginTop: 10,
    gap: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.dark.modalBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    color: Colors.dark.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
