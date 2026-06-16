const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'mobile-somlance', 'src');
const featuresDir = path.join(srcDir, 'features', 'freelancerUser');
const appDir = path.join(srcDir, 'app', '(freelancer-tabs)');

// Features to create
const features = ['home', 'jobs', 'messages', 'profile'];

// Create the app tabs
if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

features.forEach(feature => {
  const filePath = path.join(appDir, feature === 'home' ? 'index.tsx' : `${feature}.tsx`);
  const componentName = feature.charAt(0).toUpperCase() + feature.slice(1);
  const content = `import ${componentName}Screen from '@/features/freelancerUser/${feature}/screens/${componentName}Screen';
export default ${componentName}Screen;
`;
  fs.writeFileSync(filePath, content);
});

// Create the feature folders
features.forEach(feature => {
  const componentName = feature.charAt(0).toUpperCase() + feature.slice(1);
  const featurePath = path.join(featuresDir, feature);
  
  const dirs = ['components', 'hooks', 'styles', 'screens'];
  dirs.forEach(dir => {
    fs.mkdirSync(path.join(featurePath, dir), { recursive: true });
  });

  // Create Screen
  const screenContent = `import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { styles } from '../styles/${componentName}Screen.styles';

export default function ${componentName}Screen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Freelancer ${componentName}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
`;
  fs.writeFileSync(path.join(featurePath, 'screens', `${componentName}Screen.tsx`), screenContent);

  // Create Styles
  const stylesContent = `import { StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
});
`;
  fs.writeFileSync(path.join(featurePath, 'styles', `${componentName}Screen.styles.ts`), stylesContent);
});

console.log("Freelancer structure created successfully!");
