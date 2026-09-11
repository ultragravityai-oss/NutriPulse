import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, MACRO_COLORS } from '../constants/theme';
import { FoodItem, MealCategory } from '../types';
import { FOOD_CATEGORIES, FOOD_DATABASE } from '../constants/foodDatabase';
import { useNutri } from '../context/NutriContext';

interface QuickAddModalProps {
  visible: boolean;
  category: MealCategory;
  onClose: () => void;
  onOpenAIScan: (cat: MealCategory) => void;
}

type ModalTab = 'search' | 'quick_cal' | 'custom_food';

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  category,
  onClose,
  onOpenAIScan,
}) => {
  const { addFoodToMeal } = useNutri();

  const [activeTab, setActiveTab] = useState<ModalTab>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedMealCat, setSelectedMealCat] = useState<MealCategory>(category);

  // Quick Cal state
  const [quickCalories, setQuickCalories] = useState('');
  const [quickProtein, setQuickProtein] = useState('');
  const [quickCarbs, setQuickCarbs] = useState('');
  const [quickFat, setQuickFat] = useState('');
  const [quickName, setQuickName] = useState('');

  // Custom Food state
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customP, setCustomP] = useState('');
  const [customC, setCustomC] = useState('');
  const [customF, setCustomF] = useState('');
  const [customServingSize, setCustomServingSize] = useState('100');
  const [customServingUnit, setCustomServingUnit] = useState('g');

  // Filtered food list
  const filteredFoods = useMemo(() => {
    return FOOD_DATABASE.filter((item) => {
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;

      return matchQuery && matchCat;
    });
  }, [searchQuery, selectedCategoryFilter]);

  const handleSelectFood = (food: FoodItem, servings: number = 1) => {
    addFoodToMeal(selectedMealCat, food, servings);
    onClose();
  };

  const handleLogQuickCalories = () => {
    const kcal = Number(quickCalories);
    if (!kcal || kcal <= 0) return;

    const p = Number(quickProtein) || 0;
    const c = Number(quickCarbs) || 0;
    const f = Number(quickFat) || 0;

    const quickItem: FoodItem = {
      id: `quick_${Date.now()}`,
      name: quickName.trim() || 'Quick Calorie Entry',
      calories: kcal,
      proteinG: p,
      carbsG: c,
      fatG: f,
      servingSize: 1,
      servingUnit: 'serving',
      category: 'Quick Add',
      icon: '⚡',
    };

    addFoodToMeal(selectedMealCat, quickItem, 1);
    // Reset
    setQuickCalories('');
    setQuickProtein('');
    setQuickCarbs('');
    setQuickFat('');
    setQuickName('');
    onClose();
  };

  const handleLogCustomFood = () => {
    const kcal = Number(customKcal);
    if (!customName.trim() || !kcal) return;

    const customItem: FoodItem = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      calories: kcal,
      proteinG: Number(customP) || 0,
      carbsG: Number(customC) || 0,
      fatG: Number(customF) || 0,
      servingSize: Number(customServingSize) || 100,
      servingUnit: customServingUnit.trim() || 'g',
      category: 'Custom',
      icon: '🥗',
      isCustom: true,
    };

    addFoodToMeal(selectedMealCat, customItem, 1);
    setCustomName('');
    setCustomKcal('');
    setCustomP('');
    setCustomC('');
    setCustomF('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Log Food</Text>
              <Text style={styles.modalSubtitle}>
                Adding to {selectedMealCat.charAt(0).toUpperCase() + selectedMealCat.slice(1)}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* AI Banner shortcut */}
          <TouchableOpacity
            style={styles.aiBanner}
            onPress={() => {
              onClose();
              onOpenAIScan(selectedMealCat);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.aiBannerLeft}>
              <Ionicons name="sparkles" size={18} color="#A78BFA" />
              <View>
                <Text style={styles.aiBannerTitle}>Use AI Food Scanner</Text>
                <Text style={styles.aiBannerDesc}>Snap meal photo or type natural description</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A78BFA" />
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'search' && styles.tabActive]}
              onPress={() => setActiveTab('search')}
            >
              <Ionicons
                name="search-outline"
                size={14}
                color={activeTab === 'search' ? '#10B981' : Colors.dark.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
                Database
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'quick_cal' && styles.tabActive]}
              onPress={() => setActiveTab('quick_cal')}
            >
              <Ionicons
                name="flash-outline"
                size={14}
                color={activeTab === 'quick_cal' ? '#10B981' : Colors.dark.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'quick_cal' && styles.tabTextActive]}>
                Quick Cal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'custom_food' && styles.tabActive]}
              onPress={() => setActiveTab('custom_food')}
            >
              <Ionicons
                name="add-outline"
                size={14}
                color={activeTab === 'custom_food' ? '#10B981' : Colors.dark.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'custom_food' && styles.tabTextActive]}>
                Custom Food
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: Database Search */}
          {activeTab === 'search' && (
            <View style={styles.tabContent}>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={Colors.dark.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search 150+ foods (e.g. chicken, oats, salmon, poke)..."
                  placeholderTextColor={Colors.dark.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={Colors.dark.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Filter Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryFilters}
              >
                {FOOD_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      selectedCategoryFilter === cat && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedCategoryFilter(cat)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategoryFilter === cat && styles.filterChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Food List */}
              <FlatList
                data={filteredFoods}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.foodItemCard}
                    onPress={() => handleSelectFood(item, 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.foodEmoji}>{item.icon || '🍽️'}</Text>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodBrand}>
                        {item.servingSize} {item.servingUnit}
                        {item.brand ? ` • ${item.brand}` : ''}
                      </Text>
                      <Text style={styles.foodMacros}>
                        <Text style={{ color: MACRO_COLORS.protein.primary }}>{item.proteinG}g P</Text>
                        {'  '}
                        <Text style={{ color: MACRO_COLORS.carbs.primary }}>{item.carbsG}g C</Text>
                        {'  '}
                        <Text style={{ color: MACRO_COLORS.fat.primary }}>{item.fatG}g F</Text>
                      </Text>
                    </View>

                    <View style={styles.foodKcalCol}>
                      <Text style={styles.itemKcal}>{item.calories}</Text>
                      <Text style={styles.itemKcalUnit}>kcal</Text>
                      <View style={styles.addPlusIcon}>
                        <Ionicons name="add" size={14} color="#10B981" />
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Tab 2: Quick Calorie Entry */}
          {activeTab === 'quick_cal' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <Text style={styles.formLabel}>Meal / Item Name (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Afternoon Latte & Snack"
                placeholderTextColor={Colors.dark.textMuted}
                value={quickName}
                onChangeText={setQuickName}
              />

              <Text style={styles.formLabel}>Total Calories (kcal) *</Text>
              <TextInput
                style={[styles.formInput, styles.bigInput]}
                placeholder="350"
                placeholderTextColor={Colors.dark.textMuted}
                keyboardType="numeric"
                value={quickCalories}
                onChangeText={setQuickCalories}
              />

              <Text style={styles.formLabel}>Macros (Optional)</Text>
              <View style={styles.macroInputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.macroSubLabel, { color: MACRO_COLORS.protein.primary }]}>Protein (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="25"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="numeric"
                    value={quickProtein}
                    onChangeText={setQuickProtein}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.macroSubLabel, { color: MACRO_COLORS.carbs.primary }]}>Carbs (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="30"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="numeric"
                    value={quickCarbs}
                    onChangeText={setQuickCarbs}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.macroSubLabel, { color: MACRO_COLORS.fat.primary }]}>Fat (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="10"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="numeric"
                    value={quickFat}
                    onChangeText={setQuickFat}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, !quickCalories && styles.submitBtnDisabled]}
                onPress={handleLogQuickCalories}
                disabled={!quickCalories}
              >
                <Text style={styles.submitBtnText}>Add Calories</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Tab 3: Custom Food */}
          {activeTab === 'custom_food' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <Text style={styles.formLabel}>Food Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Homemade High-Protein Lasagna"
                placeholderTextColor={Colors.dark.textMuted}
                value={customName}
                onChangeText={setCustomName}
              />

              <View style={styles.macroInputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Serving Size</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="1"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="numeric"
                    value={customServingSize}
                    onChangeText={setCustomServingSize}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Unit (g, slice, bowl)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="slice"
                    placeholderTextColor={Colors.dark.textMuted}
                    value={customServingUnit}
                    onChangeText={setCustomServingUnit}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Calories (kcal) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="420"
                placeholderTextColor={Colors.dark.textMuted}
                keyboardType="numeric"
                value={customKcal}
                onChangeText={setCustomKcal}
              />

              <View style={styles.macroInputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.macroSubLabel, { color: MACRO_COLORS.protein.primary }]}>Protein (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="30"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="numeric"
                    value={customP}
                    onChangeText={setCustomP}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.macroSubLabel, { color: MACRO_COLORS.carbs.primary }]}>Carbs (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="40"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="numeric"
                    value={customC}
                    onChangeText={setCustomC}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.macroSubLabel, { color: MACRO_COLORS.fat.primary }]}>Fat (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="14"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="numeric"
                    value={customF}
                    onChangeText={setCustomF}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, (!customName || !customKcal) && styles.submitBtnDisabled]}
                onPress={handleLogCustomFood}
                disabled={!customName || !customKcal}
              >
                <Text style={styles.submitBtnText}>Create & Log Food</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '90%',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
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
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A78BFA',
  },
  aiBannerDesc: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  tabActive: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  tabTextActive: {
    color: '#10B981',
  },
  tabContent: {
    flex: 1,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBg,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.textPrimary,
    fontSize: 13,
  },
  categoryFilters: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardElevated,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  filterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  filterChipTextActive: {
    color: '#10B981',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 8,
  },
  foodItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    gap: 12,
  },
  foodEmoji: {
    fontSize: 24,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  foodBrand: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 1,
  },
  foodMacros: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  foodKcalCol: {
    alignItems: 'flex-end',
  },
  itemKcal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  itemKcalUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  addPlusIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    color: Colors.dark.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  bigInput: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  macroInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  macroSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
