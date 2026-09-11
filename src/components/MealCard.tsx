import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { LoggedFoodItem, MealCategory } from '../types';
import { useNutri } from '../context/NutriContext';

interface MealCardProps {
  category: MealCategory;
  onAddPress: (category: MealCategory) => void;
  onAIScanPress: (category: MealCategory) => void;
}

const MEAL_INFO: Record<MealCategory, { title: string; icon: string; defaultKcal: number }> = {
  breakfast: { title: 'Breakfast', icon: 'sunny-outline', defaultKcal: 550 },
  lunch: { title: 'Lunch', icon: 'restaurant-outline', defaultKcal: 750 },
  dinner: { title: 'Dinner', icon: 'moon-outline', defaultKcal: 650 },
  snacks: { title: 'Snacks & Supplements', icon: 'nutrition-outline', defaultKcal: 250 },
};

export const MealCard: React.FC<MealCardProps> = ({
  category,
  onAddPress,
  onAIScanPress,
}) => {
  const { summary, removeFoodItem, updateFoodItemServings } = useNutri();
  const [isExpanded, setIsExpanded] = useState(true);

  const mealData = summary.mealBreakdown[category] || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    items: [],
  };

  const info = MEAL_INFO[category];

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name={info.icon as any} size={18} color="#10B981" />
          </View>
          <View>
            <Text style={styles.mealTitle}>{info.title}</Text>
            <Text style={styles.macroSubtitle}>
              P: {mealData.protein}g • C: {mealData.carbs}g • F: {mealData.fat}g
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.caloriesTotal}>{mealData.calories}</Text>
          <Text style={styles.caloriesLabel}>kcal</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.dark.textMuted}
            style={{ marginLeft: 6 }}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.cardBody}>
          {mealData.items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No food logged yet for {info.title.toLowerCase()}</Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {mealData.items.map((item) => {
                const totalKcal = Math.round(item.calories * item.servings);
                const totalP = Math.round(item.proteinG * item.servings);
                const totalC = Math.round(item.carbsG * item.servings);
                const totalF = Math.round(item.fatG * item.servings);

                return (
                  <View key={item.logId} style={styles.foodRow}>
                    <View style={styles.foodLeft}>
                      <Text style={styles.foodEmoji}>{item.icon || '🍽️'}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={styles.foodNameRow}>
                          <Text style={styles.foodName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {item.aiGenerated && (
                            <View style={styles.aiPill}>
                              <Ionicons name="sparkles" size={10} color="#A78BFA" />
                              <Text style={styles.aiPillText}>AI</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.servingText}>
                          {item.servings} × {item.servingSize} {item.servingUnit}
                          {item.notes ? ` • ${item.notes}` : ''}
                        </Text>
                        <Text style={styles.itemMacroText}>
                          <Text style={{ color: MACRO_COLORS.protein.primary }}>{totalP}g P</Text>
                          {' • '}
                          <Text style={{ color: MACRO_COLORS.carbs.primary }}>{totalC}g C</Text>
                          {' • '}
                          <Text style={{ color: MACRO_COLORS.fat.primary }}>{totalF}g F</Text>
                        </Text>
                      </View>
                    </View>

                    <View style={styles.foodRight}>
                      <Text style={styles.foodCalories}>{totalKcal} kcal</Text>
                      <View style={styles.itemActions}>
                        {/* Minus / Plus servings */}
                        <TouchableOpacity
                          style={styles.servingsBtn}
                          onPress={() => {
                            if (item.servings > 0.5) {
                              updateFoodItemServings(item.logId, item.servings - 0.5);
                            } else {
                              removeFoodItem(item.logId);
                            }
                          }}
                        >
                          <Ionicons name="remove" size={12} color={Colors.dark.textMuted} />
                        </TouchableOpacity>

                        <Text style={styles.servingsCountText}>{item.servings}x</Text>

                        <TouchableOpacity
                          style={styles.servingsBtn}
                          onPress={() => updateFoodItemServings(item.logId, item.servings + 0.5)}
                        >
                          <Ionicons name="add" size={12} color={Colors.dark.textPrimary} />
                        </TouchableOpacity>

                        {/* Delete button */}
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => removeFoodItem(item.logId)}
                        >
                          <Ionicons name="trash-outline" size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => onAddPress(category)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={16} color="#10B981" />
              <Text style={styles.addBtnText}>Log Food</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiScanBtn}
              onPress={() => onAIScanPress(category)}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={14} color="#A78BFA" />
              <Text style={styles.aiScanBtnText}>AI Snap & Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  macroSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.dark.textMuted,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  caloriesTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  caloriesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginLeft: 3,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  emptyState: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontStyle: 'italic',
  },
  itemsList: {
    paddingVertical: 8,
    gap: 10,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  foodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  foodEmoji: {
    fontSize: 22,
  },
  foodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  foodName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
    flexShrink: 1,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    gap: 2,
  },
  aiPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A78BFA',
  },
  servingText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  itemMacroText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  foodRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  foodCalories: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  servingsBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    minWidth: 18,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: 9,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  aiScanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    borderRadius: 12,
    paddingVertical: 9,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  aiScanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A78BFA',
  },
});
