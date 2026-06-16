import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getProfile, updateFreelancerProfile, uploadImage } from '@/api/users';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

interface PortfolioItem {
  id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
}

export default function PortfolioScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLink, setNewLink] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPortfolio();
    }
  }, [user]);

  const loadPortfolio = async () => {
    try {
      setFetching(true);
      const data = await getProfile(user!.id);
      setPortfolios(data.freelancerProfile?.portfolios || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load portfolio items');
    } finally {
      setFetching(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please grant library permissions to upload portfolio photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAddItem = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for your portfolio item');
      return;
    }
    
    let uploadedUrl = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800';
    if (selectedImage) {
      try {
        setUploadingImage(true);
        uploadedUrl = await uploadImage(selectedImage);
      } catch (err) {
        Alert.alert('Upload Failed', 'Failed to upload the image.');
        setUploadingImage(false);
        return;
      }
    }
    setUploadingImage(false);

    const newItem: PortfolioItem = {
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      link: newLink.trim() || undefined,
      imageUrl: uploadedUrl,
    };
    setPortfolios([...portfolios, newItem]);
    
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewLink('');
    setSelectedImage(null);
    setShowAddForm(false);
  };

  const handleRemoveItem = (index: number) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this portfolio item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setPortfolios(portfolios.filter((_, i) => i !== index));
      }}
    ]);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateFreelancerProfile({
        portfolios: portfolios,
      });
      Alert.alert('Success', 'Portfolio saved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Portfolio</Text>
        <TouchableOpacity style={styles.headerAddBtn} onPress={() => setShowAddForm(!showAddForm)}>
          <Ionicons name={showAddForm ? 'close' : 'add'} size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
      </View>

      {fetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          {showAddForm && (
            <View style={styles.addCard}>
              <Text style={styles.cardTitle}>Add Portfolio Item</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Project Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Kulmis Logo Redesign"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your role and what you achieved"
                  value={newDesc}
                  onChangeText={setNewDesc}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Project Link (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. https://behance.net/my-project"
                  value={newLink}
                  onChangeText={setNewLink}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Project Image *</Text>
                {selectedImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
                    <TouchableOpacity style={styles.changeImageBtn} onPress={handlePickImage}>
                      <Ionicons name="camera-reverse" size={16} color={Colors.white} />
                      <Text style={styles.changeImageText}>Change Image</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
                    <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary[600]} />
                    <Text style={styles.imagePickerBtnText}>Select Project Photo</Text>
                    <Text style={styles.imagePickerSubtext}>Supports JPG, PNG (Max 5MB)</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.submitAddBtn} onPress={handleAddItem} disabled={uploadingImage}>
                {uploadingImage ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitAddText}>Add to List</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Portfolio Items ({portfolios.length})</Text>
          {portfolios.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color={Colors.neutral[300]} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No items added to your portfolio yet.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddForm(true)}>
                <Text style={styles.emptyBtnText}>Add Your First Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.portfolioGrid}>
              {portfolios.map((item, idx) => (
                <View key={idx} style={styles.portfolioCard}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons name="image" size={32} color={Colors.neutral[300]} />
                    </View>
                  )}
                  <View style={styles.cardDetails}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.description && <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>}
                    {item.link && (
                      <Text style={styles.itemLink} numberOfLines={1}>
                        <Ionicons name="link" size={12} /> {item.link}
                      </Text>
                    )}
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveItem(idx)}>
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Portfolio Changes</Text>
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
  headerAddBtn: {
    padding: Spacing.xs,
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
  addCard: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
  },
  textArea: {
    minHeight: 60,
  },
  imagePickerBtn: {
    height: 120,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary[200],
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
    marginTop: Spacing.xs,
  },
  imagePickerSubtext: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  selectedImageContainer: {
    height: 160,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageBtn: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  changeImageText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },
  submitAddBtn: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitAddText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: FontSize.md,
  },
  portfolioGrid: {
    gap: Spacing.md,
  },
  portfolioCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.neutral[150],
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: 100,
    height: 120,
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: 100,
    height: 120,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    lineHeight: 16,
    marginBottom: 4,
  },
  itemLink: {
    fontSize: FontSize.xs,
    color: Colors.primary[600],
    fontWeight: '500',
    marginBottom: 6,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  removeBtnText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    color: Colors.neutral[500],
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyBtn: {
    borderWidth: 1,
    borderColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  emptyBtnText: {
    color: Colors.primary[600],
    fontWeight: 'bold',
    fontSize: FontSize.sm,
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
