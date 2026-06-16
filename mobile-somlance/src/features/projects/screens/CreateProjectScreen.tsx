import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, BorderRadius } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getFreelancers } from '@/api/users';
import * as DocumentPicker from 'expo-document-picker';

const CATS = ['Design', 'Development', 'Marketing', 'Writing', 'Video', 'Music', 'Business'];

export default function CreateProjectScreen() {
  const router = useRouter();
  const { freelancerId, name } = useLocalSearchParams<{ freelancerId: string, name: string }>();
  const insets = useSafeAreaInsets();
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [budget, setBudget] = useState('');
  
  const [cat, setCat] = useState('');
  const [showCats, setShowCats] = useState(false);
  
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(freelancerId || '');
  const [selectedFreelancerName, setSelectedFreelancerName] = useState(name || '');
  const [showFreelancers, setShowFreelancers] = useState(false);
  const [freelancersList, setFreelancersList] = useState<any[]>([]);
  const [loadingFreelancers, setLoadingFreelancers] = useState(false);
  
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [pickingDocument, setPickingDocument] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!freelancerId && cat) {
      fetchFreelancersForCat(cat);
    }
  }, [cat]);

  const fetchFreelancersForCat = async (category: string) => {
    try {
      setLoadingFreelancers(true);
      const res = await getFreelancers({ skill: category, limit: 20 });
      setFreelancersList(res.freelancers || []);
      // Reset selected freelancer when category changes
      setSelectedFreelancerId('');
      setSelectedFreelancerName('');
    } catch (e) {
      console.log('Error fetching freelancers for category', e);
    } finally {
      setLoadingFreelancers(false);
    }
  };

  const handlePickDocument = async () => {
    if (pickingDocument) return;
    try {
      setPickingDocument(true);
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets?.length > 0) {
        setDocumentUri(result.assets[0].uri);
        setDocumentName(result.assets[0].name);
      }
    } catch (err) {
      console.log('Document picker error', err);
    } finally {
      setPickingDocument(false);
    }
  };

  const handleCreate = () => {
    if (!title || !desc || !budget || !cat) { 
      Alert.alert('Error', 'Fill in all required fields'); 
      return; 
    }
    router.push({
      pathname: '/secure-payment',
      params: {
        title,
        description: desc,
        budget,
        category: cat,
        freelancerId: selectedFreelancerId,
        attachmentUri: documentUri || '',
      }
    });
  };

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} /></TouchableOpacity>
        <Text style={s.navTitle}>{name ? `Hire ${name}` : 'Create Project'}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {freelancerId && name ? (
          <View style={s.hireInfo}>
            <Ionicons name="information-circle" size={20} color={Colors.primary[600]} />
            <Text style={s.hireText}>You are creating a direct contract for <Text style={{fontWeight: '700'}}>{name}</Text>.</Text>
          </View>
        ) : null}
        
        <Input label="Project Title *" placeholder="e.g. Design a modern website" leftIcon="briefcase-outline" value={title} onChangeText={setTitle} />
        
        <Text style={s.label}>Category *</Text>
        <TouchableOpacity style={s.catSel} onPress={() => setShowCats(!showCats)} activeOpacity={0.7}>
          <Text style={cat ? s.catVal : s.catPh}>{cat || 'Select a category'}</Text>
          <Ionicons name={showCats ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.neutral[400]} />
        </TouchableOpacity>
        {showCats && <View style={s.catList}>{CATS.map(c => (
          <TouchableOpacity key={c} style={[s.catItem, cat === c && s.catItemA]} onPress={() => { setCat(c); setShowCats(false); }}>
            <Text style={[s.catItemT, cat === c && s.catItemTA]}>{c}</Text>
          </TouchableOpacity>
        ))}</View>}

        {!freelancerId && cat ? (
          <>
            <Text style={s.label}>Assign Freelancer (Optional)</Text>
            <TouchableOpacity style={s.catSel} onPress={() => setShowFreelancers(!showFreelancers)} activeOpacity={0.7} disabled={loadingFreelancers}>
              {loadingFreelancers ? (
                <ActivityIndicator size="small" color={Colors.primary[600]} />
              ) : (
                <Text style={selectedFreelancerName ? s.catVal : s.catPh}>
                  {selectedFreelancerName || 'Select a freelancer'}
                </Text>
              )}
              <Ionicons name={showFreelancers ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
            {showFreelancers && freelancersList.length > 0 && (
              <View style={s.catList}>
                {freelancersList.map(f => (
                  <TouchableOpacity key={f.id} style={[s.catItem, selectedFreelancerId === f.id && s.catItemA]} onPress={() => { setSelectedFreelancerId(f.id); setSelectedFreelancerName(`${f.firstName} ${f.lastName}`); setShowFreelancers(false); }}>
                    <Text style={[s.catItemT, selectedFreelancerId === f.id && s.catItemTA]}>{f.firstName} {f.lastName} • ${f.freelancerProfile?.hourlyRate || 0}/hr</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {showFreelancers && freelancersList.length === 0 && !loadingFreelancers && (
              <View style={s.catList}>
                <Text style={[s.catItemT, { padding: 16, color: Colors.neutral[500] }]}>No freelancers found for this category.</Text>
              </View>
            )}
          </>
        ) : null}

        <Input 
          label="Project Description & Deliverables *" 
          placeholder="Describe exactly what you need delivered, step by step..." 
          leftIcon="document-text-outline" 
          value={desc} 
          onChangeText={setDesc} 
          multiline 
          numberOfLines={6} 
          style={{ height: 140, textAlignVertical: 'top', paddingTop: 12, paddingBottom: 12 }} 
        />
        
        <View style={s.warningBox}>
          <Ionicons name="warning" size={20} color="#DC2626" style={{ marginTop: 2 }} />
          <Text style={s.warningText}>
            <Text style={{ fontWeight: 'bold' }}>Important: </Text>
            Please double-check your description. This document will serve as the <Text style={{ fontWeight: 'bold' }}>source of truth</Text> for any disputes regarding deliverables. Be as specific as possible.
          </Text>
        </View>

        <Text style={s.label}>Attachments & Requirements</Text>
        <TouchableOpacity style={s.uploadBtn} onPress={handlePickDocument} disabled={pickingDocument}>
          <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary[600]} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.uploadTitle}>{documentName ? 'Document Selected' : 'Upload Requirements'}</Text>
            <Text style={s.uploadSub}>{documentName || 'PDF, DOCX, ZIP (Max 10MB)'}</Text>
          </View>
          {documentName && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
        </TouchableOpacity>

        <Input label="Agreed Budget ($) *" placeholder="e.g. 500" leftIcon="cash-outline" value={budget} onChangeText={setBudget} keyboardType="numeric" />
        
        <Button title="Continue to Payment" onPress={handleCreate} loading={loading} size="lg" style={{ marginTop: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  form: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
  hireInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary[50], padding: 12, borderRadius: 12, marginBottom: 20 },
  hireText: { fontSize: 14, color: Colors.primary[800], marginLeft: 8, flex: 1 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.neutral[700], marginBottom: 6, marginLeft: 4 },
  catSel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.neutral[50], borderWidth: 1, borderColor: Colors.neutral[200], borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 16 },
  catVal: { fontSize: 16, color: Colors.neutral[900] },
  catPh: { fontSize: 16, color: Colors.neutral[400] },
  catList: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral[200], borderRadius: 12, marginTop: -12, marginBottom: 16, overflow: 'hidden' },
  catItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.neutral[50] },
  catItemA: { backgroundColor: Colors.primary[50] },
  catItemT: { fontSize: 15, color: Colors.neutral[700] },
  catItemTA: { color: Colors.primary[700], fontWeight: '600' },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 20,
    marginTop: -8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
    marginLeft: 8,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  uploadSub: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 2,
  },
});
