const fs = require('fs');

const screens = [
  'c:/Users/home/Documents/somlance/mobile-somlance/src/features/profile/screens/SettingsScreen.tsx',
  'c:/Users/home/Documents/somlance/mobile-somlance/src/features/profile/screens/TermsScreen.tsx',
  'c:/Users/home/Documents/somlance/mobile-somlance/src/features/profile/screens/PrivacyScreen.tsx',
  'c:/Users/home/Documents/somlance/mobile-somlance/src/features/profile/screens/ChangePasswordScreen.tsx',
  'c:/Users/home/Documents/somlance/mobile-somlance/src/features/profile/screens/EditProfileScreen.tsx',
];

for (const path of screens) {
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, 'utf8');

  if (!content.includes('useDarkColors')) {
    // Inject import
    content = content.replace("import { Colors", "import { useDarkColors } from '@/store/themeStore';\nimport { Colors");
    
    // Inject hook
    const functionRegex = /export default function [a-zA-Z]+\(\) \{/g;
    content = content.replace(functionRegex, match => `${match}\n  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();`);

    // Basic replacements
    content = content.replace(/style=\{s\.c\}/g, "style={[s.c, { backgroundColor: bg }]}");
    content = content.replace(/style=\{s\.container\}/g, "style={[s.container, { backgroundColor: bg }]}");
    content = content.replace(/style=\{s\.nav\}/g, "style={[s.nav, { borderBottomColor: border }]}");
    content = content.replace(/style=\{s\.header\}/g, "style={[s.header, { borderBottomColor: border }]}");
    content = content.replace(/style=\{s\.back\}/g, "style={[s.back, { backgroundColor: cardBg }]}");
    content = content.replace(/style=\{s\.backBtn\}/g, "style={[s.backBtn, { backgroundColor: cardBg }]}");
    
    // Content texts
    content = content.replace(/style=\{s\.navTitle\}/g, "style={[s.navTitle, { color: textPrimary }]}");
    content = content.replace(/style=\{s\.title\}/g, "style={[s.title, { color: textPrimary }]}");
    content = content.replace(/style=\{s\.sectionTitle\}/g, "style={[s.sectionTitle, { color: textPrimary }]}");
    content = content.replace(/style=\{s\.label\}/g, "style={[s.label, { color: textSecondary }]}");
    content = content.replace(/style=\{s\.desc\}/g, "style={[s.desc, { color: textMuted }]}");
    content = content.replace(/style=\{s\.st\}/g, "style={[s.st, { color: textPrimary }]}");
    
    // Items
    content = content.replace(/style=\{s\.item\}/g, "style={[s.item, { borderBottomColor: border }]}");
    content = content.replace(/style=\{s\.itemT\}/g, "style={[s.itemT, { color: textPrimary }]}");
    
    // Texts direct replacements
    content = content.replace(/color=\{Colors\.neutral\[900\]\}/g, "color={textPrimary}");
    content = content.replace(/color=\{Colors\.neutral\[600\]\}/g, "color={textSecondary}");
    content = content.replace(/color=\{Colors\.neutral\[500\]\}/g, "color={textMuted}");

    fs.writeFileSync(path, content, 'utf8');
    console.log('Updated ' + path);
  }
}
