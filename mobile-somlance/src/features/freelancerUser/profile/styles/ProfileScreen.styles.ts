import { StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  content: {
    padding: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
  },
  editBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
  },
  editBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[800],
  },
});
