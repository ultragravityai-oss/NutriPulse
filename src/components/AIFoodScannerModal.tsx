import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { AIAnalysisResult, FoodItem, MealCategory } from '../types';
import { analyzeFoodWithAI } from '../services/aiService';
import { PRESET_MEAL_IMAGES } from '../constants/foodDatabase';
import { useNutri } from '../context/NutriContext';

interface AIFoodScannerModalProps {
  visible: boolean;
  initialCategory?: MealCategory;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const AIFoodScannerModal: React.FC<AIFoodScannerModalProps> = ({
  visible,
  initialCategory = 'lunch',
  onClose,
}) => {
  const { addFoodToMeal, profile } = useNutri();

  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>(initialCategory);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (customText?: string, customImg?: string) => {
    const textToAnalyze = customText || prompt;
    if (!textToAnalyze.trim()) {
      setErrorMsg('Please describe what you ate or select a meal');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setResult(null);

    try {
      const aiData = await analyzeFoodWithAI(textToAnalyze, selectedCategory, profile.apiKey);
      setResult(aiData);
      setServingMultiplier(1);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to analyze food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_MEAL_IMAGES[0]) => {
    setSelectedImage(preset.image);
    setPrompt(preset.title);
    setSelectedCategory(preset.category);
    handleAnalyze(preset.title, preset.image);
  };

  const handleLogFood = () => {
    if (!result) return;

    const foodItem: FoodItem = {
      id: `ai_${Date.now()}`,
      name: result.foodName,
      calories: Math.round(result.estimatedCalories),
      proteinG: Math.round(result.proteinG),
      carbsG: Math.round(result.carbsG),
      fatG: Math.round(result.fatG),
      fiberG: Math.round(result.fiberG),
      servingSize: result.servingSize,
      servingUnit: result.servingUnit,
      category: 'AI Scanned',
      icon: '✨',
      imageUrl: selectedImage || undefined,
    };

    addFoodToMeal(
      selectedCategory,
      foodItem,
      servingMultiplier,
      result.description,
      true // AI generated
    );

    handleClose();
  };

  const handleClose = () => {
    setPrompt('');
    setSelectedImage(null);
    setResult(null);
    setLoading(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.titleRow}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={16} color="#A78BFA" />
              </View>
              <View>
                <Text style={styles.sheetTitle}>AI Calorie Scanner</Text>
                <Text style={styles.sheetSubtitle}>Snap photo or type natural meal description</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={22} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Meal Category Picker */}
            <View style={styles.categoryPicker}>
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    selectedCategory === cat && styles.catChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      selectedCategory === cat && styles.catChipTextActive,
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input Box */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Ionicons name="create-outline" size={16} color="#A78BFA" />
                <Text style={styles.inputHeaderTitle}>Describe your food or ingredients</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 2 slices of avocado sourdough toast with 2 poached eggs and iced oat milk latte..."
                placeholderTextColor={Colors.dark.textMuted}
                multiline
                numberOfLines={3}
                value={prompt}
                onChangeText={(t) => {
                  setPrompt(t);
                  if (errorMsg) setErrorMsg(null);
                }}
              />

              <TouchableOpacity
                style={[
                  styles.analyzeActionBtn,
                  (!prompt.trim() || loading) && styles.analyzeActionBtnDisabled,
                ]}
                onPress={() => handleAnalyze()}
                disabled={!prompt.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    <Text style={styles.analyzeActionText}>Analyze with AI</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {errorMsg && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Preset Photo Scans Carousel */}
            <View style={styles.presetsSection}>
              <Text style={styles.presetsTitle}>Or Tap a Preset Meal Photo to Test AI</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                {PRESET_MEAL_IMAGES.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetCard}
                    onPress={() => handlePresetSelect(preset)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: preset.image }} style={styles.presetImage} />
                    <View style={styles.presetInfo}>
                      <Text style={styles.presetCardTitle} numberOfLines={2}>
                        {preset.title}
                      </Text>
                      <Text style={styles.presetKcal}>{preset.calories} kcal</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AI Result Card */}
            {result && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.resultTitleRow}>
                      <Text style={styles.resultFoodName}>{result.foodName}</Text>
                      <View style={styles.healthBadge}>
                        <Text style={styles.healthBadgeText}>Grade {result.healthRating}</Text>
                      </View>
                    </View>
                    <Text style={styles.resultDesc}>{result.description}</Text>
                  </View>
                </View>

                {/* Macro summary pills */}
                <View style={styles.macroPillRow}>
                  <View style={[styles.macroPill, { borderColor: '#10B981' }]}>
                    <Text style={styles.macroPillKcal}>
                      {Math.round(result.estimatedCalories * servingMultiplier)}
                    </Text>
                    <Text style={styles.macroPillLabel}>Calories</Text>
                  </View>

                  <View style={[styles.macroPill, { borderColor: MACRO_COLORS.protein.primary }]}>
                    <Text style={[styles.macroPillValue, { color: MACRO_COLORS.protein.primary }]}>
                      {Math.round(result.proteinG * servingMultiplier)}g
                    </Text>
                    <Text style={styles.macroPillLabel}>Protein</Text>
                  </View>

                  <View style={[styles.macroPill, { borderColor: MACRO_COLORS.carbs.primary }]}>
                    <Text style={[styles.macroPillValue, { color: MACRO_COLORS.carbs.primary }]}>
                      {Math.round(result.carbsG * servingMultiplier)}g
                    </Text>
                    <Text style={styles.macroPillLabel}>Carbs</Text>
                  </View>

                  <View style={[styles.macroPill, { borderColor: MACRO_COLORS.fat.primary }]}>
                    <Text style={[styles.macroPillValue, { color: MACRO_COLORS.fat.primary }]}>
                      {Math.round(result.fatG * servingMultiplier)}g
                    </Text>
                    <Text style={styles.macroPillLabel}>Fat</Text>
                  </View>
                </View>

                {/* Portion Stepper */}
                <View style={styles.portionRow}>
                  <Text style={styles.portionLabel}>Portion Size Multiplier:</Text>
                  <View style={styles.portionButtons}>
                    {[0.5, 1, 1.5, 2].map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.multiplierBtn,
                          servingMultiplier === m && styles.multiplierBtnActive,
                        ]}
                        onPress={() => setServingMultiplier(m)}
                      >
                        <Text
                          style={[
                            styles.multiplierBtnText,
                            servingMultiplier === m && styles.multiplierBtnTextActive,
                          ]}
                        >
                          {m}x
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Ingredients Detected */}
                {result.ingredients && result.ingredients.length > 0 && (
                  <View style={styles.ingredientsBox}>
                    <Text style={styles.ingredientsTitle}>Detected Ingredients Breakdown</Text>
                    {result.ingredients.map((ing, i) => (
                      <View key={i} style={styles.ingRow}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.ingName}>{ing.name} ({ing.portion})</Text>
                        <Text style={styles.ingKcal}>~{ing.calories} kcal</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* AI Insights */}
                {result.insights && result.insights.length > 0 && (
                  <View style={styles.insightsBox}>
                    <View style={styles.insightsHeader}>
                      <Ionicons name="bulb-outline" size={14} color="#A78BFA" />
                      <Text style={styles.insightsTitle}>AI Nutritional Insights</Text>
                    </View>
                    {result.insights.map((ins, i) => (
                      <Text key={i} style={styles.insightText}>• {ins}</Text>
                    ))}
                  </View>
                )}

                {/* Confirm Add Button */}
                <TouchableOpacity
                  style={styles.confirmLogBtn}
                  onPress={handleLogFood}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.confirmLogText}>
                    Log to {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ({Math.round(result.estimatedCalories * servingMultiplier)} kcal)
                  </Text>
                </TouchableOpacity>
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
  modalSheet: {
    height: '92%',
    backgroundColor: Colors.dark.modalBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 1,
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
    padding: 16,
    paddingBottom: 40,
  },
  categoryPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  catChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  catChipActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderColor: '#A78BFA',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  catChipTextActive: {
    color: '#A78BFA',
  },
  inputCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inputHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  textInput: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    color: Colors.dark.textPrimary,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  analyzeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
    gap: 8,
  },
  analyzeActionBtnDisabled: {
    opacity: 0.5,
  },
  analyzeActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  presetsSection: {
    marginBottom: 16,
  },
  presetsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 10,
  },
  presetScroll: {
    gap: 12,
  },
  presetCard: {
    width: 140,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  presetImage: {
    width: '100%',
    height: 90,
  },
  presetInfo: {
    padding: 8,
  },
  presetCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
    lineHeight: 14,
  },
  presetKcal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    marginTop: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultFoodName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
    flex: 1,
  },
  healthBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  healthBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  resultDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  macroPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  macroPill: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  macroPillKcal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  macroPillValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  macroPillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    marginTop: 1,
  },
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  portionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  portionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  multiplierBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.dark.inputBg,
  },
  multiplierBtnActive: {
    backgroundColor: '#7C3AED',
  },
  multiplierBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  multiplierBtnTextActive: {
    color: '#FFFFFF',
  },
  ingredientsBox: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  ingName: {
    fontSize: 12,
    color: Colors.dark.textPrimary,
    flex: 1,
  },
  ingKcal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  insightsBox: {
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  insightsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A78BFA',
  },
  insightText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
  confirmLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  confirmLogText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
