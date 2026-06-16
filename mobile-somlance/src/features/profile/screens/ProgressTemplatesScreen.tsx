import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { useDarkColors } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getTemplates, createTemplate, deleteTemplate, suggestSteps, ProgressTemplate } from '@/api/progress';

export default function ProgressTemplatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  
  const [templates, setTemplates] = useState<ProgressTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSteps, setNewSteps] = useState<{name: string}[]>([{name: ''}]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.log('Failed to fetch templates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this template?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteTemplate(id);
          fetchTemplates();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete template');
        }
      }}
    ]);
  };

  const handleSuggest = async () => {
    if (!newCategory) {
      Alert.alert('Error', 'Please enter a category to get suggestions');
      return;
    }
    try {
      setIsSuggesting(true);
      const suggestions = await suggestSteps(newCategory);
      if (suggestions && suggestions.length > 0) {
        setNewSteps(suggestions.map(s => ({ name: s })));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to get suggestions');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSave = async () => {
    if (!newName || newSteps.some(s => !s.name.trim())) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateTemplate(editingId, { name: newName, category: newCategory, steps: newSteps });
      } else {
        await createTemplate({ name: newName, category: newCategory, steps: newSteps });
      }
      setModalVisible(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      Alert.alert('Error', 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (template: ProgressTemplate) => {
    setEditingId(template.id);
    setNewName(template.name);
    setNewCategory(template.category || '');
    setNewSteps(template.steps.length > 0 ? template.steps.map(s => ({ name: s.name })) : [{ name: '' }]);
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewName('');
    setNewCategory('');
    setNewSteps([{name: ''}]);
  };

  const updateStep = (text: string, index: number) => {
    const updated = [...newSteps];
    updated[index].name = text;
    setNewSteps(updated);
  };

  const addStep = () => setNewSteps([...newSteps, {name: ''}]);
  
  const removeStep = (index: number) => {
    const updated = [...newSteps];
    updated.splice(index, 1);
    setNewSteps(updated);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      <View style={[s.nav, { borderBottomColor: border, backgroundColor: bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: iconBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Progress Templates</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={s.addButton}>
          <Ionicons name="add" size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={Colors.primary[600]} /></View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={[s.card, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={s.cardHeader}>
                <View>
                  <Text style={[s.cardTitle, { color: textPrimary }]}>{item.name}</Text>
                  {item.category && <Text style={[s.cardCat, { color: textSecondary }]}>{item.category}</Text>}
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Ionicons name="pencil-outline" size={20} color={Colors.primary[600]} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={s.stepsList}>
                {item.steps.map((step, idx) => (
                  <View key={idx} style={s.stepItem}>
                    <View style={[s.stepNum, { backgroundColor: isDark ? '#334155' : Colors.neutral[100] }]}>
                      <Text style={[s.stepNumTxt, { color: textPrimary }]}>{idx + 1}</Text>
                    </View>
                    <Text style={[s.stepName, { color: textSecondary }]}>{step.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={s.center}>
              <Ionicons name="layers-outline" size={64} color={textMuted} />
              <Text style={[s.emptyTitle, { color: textPrimary }]}>No Templates Yet</Text>
              <Text style={[s.emptyDesc, { color: textSecondary }]}>Create reusable steps to use when accepting projects.</Text>
            </View>
          }
        />
      )}

      {/* Create Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[s.modalContainer, { backgroundColor: bg }]}>
          <View style={[s.modalHeader, { borderBottomColor: border }]}>
            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
              <Text style={{ color: textSecondary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[s.navTitle, { color: textPrimary }]}>{editingId ? 'Edit Template' : 'New Template'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator size="small" /> : <Text style={{ color: Colors.primary[600], fontSize: 16, fontWeight: '600' }}>Save</Text>}
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={newSteps}
            contentContainerStyle={{ padding: 16 }}
            ListHeaderComponent={
              <View style={{ marginBottom: 24 }}>
                <Input label="Template Name" placeholder="e.g. Standard Web Development" value={newName} onChangeText={setNewName} style={{ marginBottom: 16 }} />
                <Input label="Category (optional)" placeholder="e.g. Web Development" value={newCategory} onChangeText={setNewCategory} />
                <Button 
                  title={isSuggesting ? "Generating..." : "✨ AI Suggest Steps"} 
                  onPress={handleSuggest} 
                  variant="outline" 
                  style={{ marginTop: 12 }} 
                  disabled={isSuggesting}
                />
                <Text style={[s.sectionTitle, { color: textPrimary, marginTop: 24 }]}>Steps</Text>
              </View>
            }
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View style={s.stepInputRow}>
                <View style={[s.stepNum, { backgroundColor: isDark ? '#334155' : Colors.neutral[100] }]}>
                  <Text style={[s.stepNumTxt, { color: textPrimary }]}>{index + 1}</Text>
                </View>
                <TextInput
                  style={[s.stepInput, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50], color: textPrimary, borderColor: border }]}
                  value={item.name}
                  onChangeText={(t) => updateStep(t, index)}
                  placeholder="Step description"
                  placeholderTextColor={textMuted}
                />
                {newSteps.length > 1 && (
                  <TouchableOpacity onPress={() => removeStep(index)} style={{ padding: 8 }}>
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListFooterComponent={
              <Button title="Add Step" onPress={addStep} variant="outline" style={{ marginTop: 12, marginBottom: 40 }} />
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600' },
  addButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardCat: { fontSize: 14, marginTop: 4 },
  stepsList: { gap: 12 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNumTxt: { fontSize: 12, fontWeight: '700' },
  stepName: { fontSize: 15, flex: 1 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyDesc: { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  stepInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  stepInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, fontSize: 15 },
});
