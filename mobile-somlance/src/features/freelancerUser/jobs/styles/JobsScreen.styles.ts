import { StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  filterBtn: {
    padding: Spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[50],
  },
  activeTab: {
    backgroundColor: Colors.primary[600],
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[600],
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  jobCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  jobHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyLogoWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  jobTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  companyName: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  detailItem: {
    flex: 1,
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
  },
});
