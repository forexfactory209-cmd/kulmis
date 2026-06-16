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
  composeBtn: {
    padding: Spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
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
    paddingHorizontal: Spacing.lg,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatarWrap: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  chatTime: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
  },
  chatPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessageUnread: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
    fontWeight: FontWeight.bold,
    marginRight: Spacing.sm,
  },
  chatMessageRead: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    fontWeight: 'normal',
    marginRight: Spacing.sm,
  },
  unreadBadge: {
    backgroundColor: Colors.primary[600],
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
