import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getProfile, updateFreelancerProfile } from '@/api/users';
import { useRouter } from 'expo-router';

export default function SkillsScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadSkills();
    }
  }, [user]);

  const loadSkills = async () => {
    try {
      setFetching(true);
      const data = await getProfile(user!.id);
      const currentSkills = data.freelancerProfile?.skills?.map((s: any) => s.name) || [];
      setSkills(currentSkills);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load skills');
    } finally {
      setFetching(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      Alert.alert('Already Added', 'You have already added this skill');
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateFreelancerProfile({
        skills: skills,
      });
      Alert.alert('Success', 'Skills updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update skills');
    } finally {
      setLoading(false);
    }
  };

  const PRESETS = [
    'UI Design', 'UX Research', 'Figma', 'React Native', 'TypeScript', 
    'Node.js', 'Graphic Design', 'Logo Design', 'Branding', 'SEO', 
    'Copywriting', 'Video Editing', 'Motion Graphics', 'Python', 'Webflow'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Skills</Text>
        <View style={{ width: 24 }} />
      </View>

      {fetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Add New Skill</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Photoshop"
              value={newSkill}
              onChangeText={setNewSkill}
              onSubmitEditing={handleAddSkill}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddSkill}>
              <Ionicons name="add" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Selected Skills</Text>
          {skills.length === 0 ? (
            <Text style={styles.emptyText}>No skills added yet. Add some below or search above!</Text>
          ) : (
            <View style={styles.skillsGrid}>
              {skills.map((skill) => (
                <View key={skill} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSkill(skill)} style={styles.removeIcon}>
                    <Ionicons name="close-circle" size={18} color={Colors.primary[700]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Popular Skills</Text>
          <View style={styles.presetsGrid}>
            {PRESETS.filter(p => !skills.includes(p)).map((preset) => (
              <TouchableOpacity
                key={preset}
                style={styles.presetBadge}
                onPress={() => setSkills([...skills, preset])}
              >
                <Text style={styles.presetText}>+ {preset}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Skills</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
  },
  addBtn: {
    backgroundColor: Colors.primary[600],
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  skillText: {
    fontSize: FontSize.sm,
    color: Colors.primary[900],
    fontWeight: FontWeight.semibold,
  },
  removeIcon: {
    marginLeft: Spacing.xs,
    padding: 2,
  },
  emptyText: {
    color: Colors.neutral[400],
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  presetBadge: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  presetText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[700],
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  saveBtn: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
