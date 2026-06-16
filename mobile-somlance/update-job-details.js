const fs = require('fs');
const path = 'c:/Users/home/Documents/somlance/mobile-somlance/src/app/job-details.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('useDarkColors')) {
  content = content.replace("import { useAuthStore } from '@/store/authStore';", "import { useAuthStore } from '@/store/authStore';\nimport { useDarkColors } from '@/store/themeStore';");
  content = content.replace("const { user } = useAuthStore();", "const { user } = useAuthStore();\n  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();");
  
  content = content.replace(/style=\{styles\.container\}/g, "style={[styles.container, { backgroundColor: bg }]}");
  content = content.replace(/style=\{styles\.content\}/g, "style={[styles.content, { backgroundColor: bg }]}");
  content = content.replace(/style=\{styles\.card\}/g, "style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}");
  content = content.replace(/style=\{styles\.cardHeader\}/g, "style={[styles.cardHeader, { color: textPrimary }]}");
  content = content.replace(/style=\{styles\.jobName\}/g, "style={[styles.jobName, { color: Colors.white }]}");
  content = content.replace(/style=\{styles\.companyName\}/g, "style={[styles.companyName, { color: Colors.white }]}");
  content = content.replace(/style=\{styles\.statLabel\}/g, "style={[styles.statLabel, { color: textSecondary }]}");
  content = content.replace(/style=\{styles\.statValue\}/g, "style={[styles.statValue, { color: textPrimary }]}");
  content = content.replace(/style=\{styles\.clientName\}/g, "style={[styles.clientName, { color: textPrimary }]}");
  content = content.replace(/style=\{styles\.clientMeta\}/g, "style={[styles.clientMeta, { color: textSecondary }]}");
  content = content.replace(/style=\{styles\.descText\}/g, "style={[styles.descText, { color: textSecondary }]}");
  content = content.replace(/style=\{styles\.sectionTitle\}/g, "style={[styles.sectionTitle, { color: textPrimary }]}");
  content = content.replace(/style=\{styles\.milestoneCard\}/g, "style={[styles.milestoneCard, { backgroundColor: cardBg, borderColor: border }]}");
  content = content.replace(/style=\{\[styles\.milestoneCard, isSelected && styles\.milestoneSelected\]\}/g, "style={[styles.milestoneCard, { backgroundColor: cardBg, borderColor: border }, isSelected && styles.milestoneSelected]}");
  content = content.replace(/style=\{styles\.milestoneTitle\}/g, "style={[styles.milestoneTitle, { color: textPrimary }]}");
  content = content.replace(/style=\{\[styles\.milestoneTitle, isSelected && styles\.milestoneTitleSelected\]\}/g, "style={[styles.milestoneTitle, { color: textPrimary }, isSelected && styles.milestoneTitleSelected]}");
  content = content.replace(/style=\{styles\.milestonePrice\}/g, "style={[styles.milestonePrice, { color: textSecondary }]}");
  content = content.replace(/style=\{styles\.progressPercent\}/g, "style={[styles.progressPercent, { color: textPrimary }]}");
  content = content.replace(/style=\{styles\.progressTrack\}/g, "style={[styles.progressTrack, { backgroundColor: isDark ? '#334155' : Colors.neutral[100] }]}");
  content = content.replace(/color=\{Colors\.neutral\[900\]\}/g, "color={textPrimary}");
  content = content.replace(/color=\{Colors\.neutral\[600\]\}/g, "color={textSecondary}");
  content = content.replace(/color=\{Colors\.neutral\[500\]\}/g, "color={textMuted}");

  fs.writeFileSync(path, content, 'utf8');
  console.log('Updated job-details.tsx');
}
