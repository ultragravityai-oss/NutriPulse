import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useNutri } from '../context/NutriContext';
import { formatFriendlyDate } from '../utils/dateUtils';

interface WeightLogModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WeightLogModal: React.FC<WeightLogModalProps> = ({ visible, onClose }) => {
  const { profile, selectedDate, logDailyWeight, dayLog } = useNutri();
  const [weightInput, setWeightInput] = useState(
    dayLog.weightKg ? String(dayLog.weightKg) : String(profile.currentWeightKg)
  );
  const [notes, setNotes] = useState('');

  const currentNum = Number(weightInput) || profile.currentWeightKg;
  const targetNum = profile.targetWeightKg;
  const remainingDelta = Math.abs(currentNum - targetNum).toFixed(1);

  const handleSave = () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 20 && val < 300) {
      logDailyWeight(val, notes.trim() || undefined);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Log Weight Check-in</Text>
              <Text style={styles.subtitle}>{formatFriendlyDate(selectedDate)}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Goal Progress Banner */}
          <View style={styles.goalBanner}>
            <Ionicons
              name={profile.goalType === 'gain_weight' ? 'trending-up' : 'trending-down'}
              size={20}
              color="#10B981"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.goalBannerTitle}>
                Goal: {profile.goalType === 'gain_weight' ? 'Gain Weight to ' : 'Reach '}
                {targetNum} kg
              </Text>
              <Text style={styles.goalBannerSub}>
                {remainingDelta} kg to reach your target weight!
              </Text>
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.weightInput}
              keyboardType="decimal-pad"
              value={weightInput}
              onChangeText={setWeightInput}
              autoFocus
            />
            <Text style={styles.unitText}>kg</Text>
          </View>

          {/* Steppers */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setWeightInput((prev) => (Math.max(20, (parseFloat(prev) || 70) - 0.1)).toFixed(1))}
            >
              <Text style={styles.stepBtnText}>-0.1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setWeightInput((prev) => (Math.max(20, (parseFloat(prev) || 70) - 0.5)).toFixed(1))}
            >
              <Text style={styles.stepBtnText}>-0.5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setWeightInput((prev) => ((parseFloat(prev) || 70) + 0.1).toFixed(1))}
            >
              <Text style={styles.stepBtnText}>+0.1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setWeightInput((prev) => ((parseFloat(prev) || 70) + 0.5).toFixed(1))}
            >
              <Text style={styles.stepBtnText}>+0.5</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <TextInput
            style={styles.notesInput}
            placeholder="Notes (e.g. Morning fasting, post workout...)"
            placeholderTextColor={Colors.dark.textMuted}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Weight Entry</Text>
          </TouchableOpacity>
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
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.dark.modalBg,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 16,
  },
  goalBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
  },
  goalBannerSub: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 12,
  },
  weightInput: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.dark.textPrimary,
    textAlign: 'center',
    minWidth: 140,
  },
  unitText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    marginLeft: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  notesInput: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    color: Colors.dark.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
