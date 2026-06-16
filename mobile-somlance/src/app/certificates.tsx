import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getProfile, updateFreelancerProfile, uploadImage } from '@/api/users';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

interface CertificateItem {
  id?: string;
  name: string;
  issuingOrg: string;
  issueDate?: string;
  imageUrl?: string;
}

export default function CertificatesScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newDate, setNewDate] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadCertificates();
    }
  }, [user]);

  const loadCertificates = async () => {
    try {
      setFetching(true);
      const data = await getProfile(user!.id);
      setCertificates(data.freelancerProfile?.certificates || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load certificates');
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
    if (!newTitle.trim() || !newOrg.trim()) {
      Alert.alert('Required', 'Please enter a name and issuing organization');
      return;
    }
    
    let uploadedUrl = 'https://images.unsplash.com/photo-1589330694653-efa648338d64?w=800';
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

    const newItem: CertificateItem = {
      name: newTitle.trim(),
      issuingOrg: newOrg.trim(),
      issueDate: newDate.trim() || undefined,
      imageUrl: uploadedUrl,
    };
    setCertificates([...certificates, newItem]);
    
    // Reset form
    setNewTitle('');
    setNewOrg('');
    setNewDate('');
    setSelectedImage(null);
    setShowAddForm(false);
  };

  const handleRemoveItem = (index: number) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this certificate?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setCertificates(certificates.filter((_, i) => i !== index));
      }}
    ]);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateFreelancerProfile({
        certificates: certificates,
      });
      Alert.alert('Success', 'Certificates saved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save certificates');
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
        <Text style={styles.headerTitle}>My Certificates</Text>
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
              <Text style={styles.cardTitle}>Add Certificate</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Certificate Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. AWS Certified Developer"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Issuing Organization *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Amazon Web Services"
                  value={newOrg}
                  onChangeText={setNewOrg}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Issue Date (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newDate}
                  onChangeText={setNewDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Certificate Image *</Text>
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
                    <Text style={styles.imagePickerBtnText}>Select Certificate Photo</Text>
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

          <Text style={styles.sectionTitle}>Certificates ({certificates.length})</Text>
          {certificates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="ribbon-outline" size={48} color={Colors.neutral[300]} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No certificates added yet.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddForm(true)}>
                <Text style={styles.emptyBtnText}>Add Your First Certificate</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.portfolioGrid}>
              {certificates.map((item, idx) => (
                <View key={idx} style={styles.portfolioCard}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons name="image" size={32} color={Colors.neutral[300]} />
                    </View>
                  )}
                  <View style={styles.cardDetails}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.itemDesc} numberOfLines={1}>{item.issuingOrg}</Text>
                    {item.issueDate && (
                      <Text style={styles.itemLink} numberOfLines={1}>
                        <Ionicons name="calendar-outline" size={12} /> {new Date(item.issueDate).toLocaleDateString()}
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
            <Text style={styles.saveBtnText}>Save Certificates</Text>
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
