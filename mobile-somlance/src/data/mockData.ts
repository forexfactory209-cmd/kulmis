// Mock data for the Kulmis app to make it look fully populated

export const MOCK_FREELANCERS = [
  {
    id: '1', firstName: 'Ahmed', lastName: 'Ibrahim', 
    avatarUrl: 'https://i.pravatar.cc/300?u=ahmed',
    freelancerProfile: { title: 'UI/UX Designer', hourlyRate: 45, bio: 'I am a passionate UI/UX designer with 4+ years of experience building clean, user-friendly and modern digital products.', skills: [{ id: 's1', name: 'UI Design' }, { id: 's2', name: 'UX Research' }, { id: 's3', name: 'Figma' }] },
    avgRating: 4.9, totalReviews: 156, isVerified: true,
  },
  {
    id: '2', firstName: 'Khadijo', lastName: 'Osman', 
    avatarUrl: 'https://i.pravatar.cc/300?u=khadijo',
    freelancerProfile: { title: 'Full-Stack Developer', hourlyRate: 60, bio: 'Full-stack developer specializing in React, Node.js, and cloud architecture.', skills: [{ id: 's4', name: 'React' }, { id: 's5', name: 'Node.js' }, { id: 's6', name: 'AWS' }] },
    avgRating: 4.8, totalReviews: 98, isVerified: true,
  },
  {
    id: '3', firstName: 'Mustafa', lastName: 'Yusuf', avatarUrl: null,
    freelancerProfile: { title: 'Video Editor & Animator', hourlyRate: 35, bio: 'Professional video editor with expertise in Adobe Premiere, After Effects, and motion graphics.', skills: [{ id: 's7', name: 'Premiere' }, { id: 's8', name: 'After Effects' }, { id: 's9', name: 'Motion Graphics' }] },
    avgRating: 4.7, totalReviews: 72, isVerified: false,
  },
  {
    id: '4', firstName: 'Ayaan', lastName: 'Hassan', avatarUrl: null,
    freelancerProfile: { title: 'Content Writer & SEO', hourlyRate: 30, bio: 'Creative content writer with deep SEO knowledge. Published in 20+ online publications.', skills: [{ id: 's10', name: 'Copywriting' }, { id: 's11', name: 'SEO' }, { id: 's12', name: 'Blogging' }] },
    avgRating: 4.6, totalReviews: 45, isVerified: true,
  },
  {
    id: '5', firstName: 'Fadumo', lastName: 'Ali', avatarUrl: null,
    freelancerProfile: { title: 'Digital Marketing Expert', hourlyRate: 50, bio: 'Results-driven marketer specializing in social media, PPC, and growth strategies.', skills: [{ id: 's13', name: 'Facebook Ads' }, { id: 's14', name: 'Google Ads' }, { id: 's15', name: 'Analytics' }] },
    avgRating: 4.9, totalReviews: 112, isVerified: true,
  },
  {
    id: '6', firstName: 'Abdirahman', lastName: 'Mohamed', avatarUrl: null,
    freelancerProfile: { title: 'Mobile App Developer', hourlyRate: 55, bio: 'Expert in React Native and Flutter with 30+ published apps on both stores.', skills: [{ id: 's16', name: 'React Native' }, { id: 's17', name: 'Flutter' }, { id: 's18', name: 'Firebase' }] },
    avgRating: 4.8, totalReviews: 89, isVerified: true,
  },
];

export const MOCK_PROJECTS = [
  { id: 'p1', title: 'Design a modern website for my startup', description: 'Looking for a talented designer to create a sleek, modern website. Must be responsive and mobile-first.', budget: 500, status: 'OPEN', category: 'Design', client: { id: 'c1', firstName: 'Omar', lastName: 'Farah' }, _count: { proposals: 12 }, createdAt: '2024-05-10' },
  { id: 'p2', title: 'Build a React Native mobile app', description: 'Need a cross-platform mobile app for a food delivery service with real-time tracking.', budget: 2500, status: 'IN_PROGRESS', category: 'Development', client: { id: 'c2', firstName: 'Hamse', lastName: 'Ahmed' }, _count: { proposals: 8 }, createdAt: '2024-05-08' },
  { id: 'p3', title: 'SEO optimization for e-commerce site', description: 'Improve our search rankings and organic traffic. Site built on Shopify.', budget: 350, status: 'OPEN', category: 'Marketing', client: { id: 'c3', firstName: 'Yusuf', lastName: 'Abdi' }, _count: { proposals: 5 }, createdAt: '2024-05-12' },
  { id: 'p4', title: 'Create promotional video for product launch', description: '60-second animated explainer video for our new SaaS product. Script provided.', budget: 800, status: 'OPEN', category: 'Video', client: { id: 'c4', firstName: 'Asha', lastName: 'Nur' }, _count: { proposals: 15 }, createdAt: '2024-05-11' },
  { id: 'p5', title: 'Write blog content for tech company', description: '10 blog articles about cloud computing, each 1500+ words with SEO optimization.', budget: 600, status: 'COMPLETED', category: 'Writing', client: { id: 'c5', firstName: 'Mohamed', lastName: 'Sheikh' }, _count: { proposals: 20 }, createdAt: '2024-04-20' },
];

export const MOCK_CONVERSATIONS = [
  { id: 'cv1', name: 'Ahmed Ibrahim', lastMessage: 'Let me check the deliverables and get back to you', time: '2m ago', unread: 2, avatar: null },
  { id: 'cv2', name: 'Khadijo Osman', lastMessage: 'Sounds good, I will start working on it right away.', time: '1h ago', unread: 0, avatar: null },
  { id: 'cv3', name: 'Mustafa Yusuf', lastMessage: 'The project is almost done! Just final touches.', time: '3h ago', unread: 1, avatar: null },
  { id: 'cv4', name: 'Omar Farah', lastMessage: 'Can you share the latest mockups?', time: '5h ago', unread: 0, avatar: null },
  { id: 'cv5', name: 'Fadumo Ali', lastMessage: 'Invoice has been sent. Please check your email.', time: '1d ago', unread: 3, avatar: null },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'New Proposal Received', content: 'Ahmed Ibrahim submitted a proposal for your project "Design a modern website"', type: 'PROPOSAL', isRead: false, createdAt: '2024-05-14T10:30:00' },
  { id: 'n2', title: 'Payment Released', content: 'Your escrow payment of $500 has been released for "Logo Design" project', type: 'PAYMENT', isRead: false, createdAt: '2024-05-14T09:00:00' },
  { id: 'n3', title: 'New Message', content: 'Khadijo Osman sent you a message about the React Native app project', type: 'MESSAGE', isRead: true, createdAt: '2024-05-13T16:30:00' },
  { id: 'n4', title: 'Project Completed', content: 'Your project "Write blog content" has been marked as completed', type: 'PROJECT', isRead: true, createdAt: '2024-05-13T12:00:00' },
  { id: 'n5', title: 'New Review', content: 'Omar Farah left you a 5-star review on "Website Redesign"', type: 'REVIEW', isRead: true, createdAt: '2024-05-12T18:00:00' },
];

export const MOCK_REVIEWS = [
  { id: 'r1', rating: 5, comment: 'Excellent UI/UX designer! Delivered ahead of schedule with top-quality work.', reviewer: { firstName: 'Omar', lastName: 'Farah' }, project: { title: 'Website Redesign' }, createdAt: '2024-05-12' },
  { id: 'r2', rating: 5, comment: 'Very professional and communicative. Would hire again!', reviewer: { firstName: 'Halima', lastName: 'Warsame' }, project: { title: 'Mobile App Design' }, createdAt: '2024-05-08' },
  { id: 'r3', rating: 4, comment: 'Good work overall. Minor revisions needed but was responsive to feedback.', reviewer: { firstName: 'Asha', lastName: 'Nur' }, project: { title: 'Brand Identity' }, createdAt: '2024-04-25' },
  { id: 'r4', rating: 5, comment: 'Incredible attention to detail. The designs exceeded my expectations.', reviewer: { firstName: 'Yusuf', lastName: 'Abdi' }, project: { title: 'Dashboard UI' }, createdAt: '2024-04-18' },
];

export const CATEGORIES = [
  { id: '1', name: 'Design', icon: 'color-palette' as const, color: '#8B5CF6' },
  { id: '2', name: 'Video', icon: 'videocam' as const, color: '#EF4444' },
  { id: '3', name: 'Marketing', icon: 'megaphone' as const, color: '#F59E0B' },
  { id: '4', name: 'Writing', icon: 'document-text' as const, color: '#3B82F6' },
  { id: '5', name: 'Dev', icon: 'code-slash' as const, color: '#10B981' },
];

export const ALL_CATEGORIES = [
  { id: '1', name: 'Graphic Design', icon: 'color-palette', color: '#8B5CF6' },
  { id: '2', name: 'Web Development', icon: 'code-slash', color: '#10B981' },
  { id: '3', name: 'Mobile Development', icon: 'phone-portrait', color: '#3B82F6' },
  { id: '4', name: 'Video Editing', icon: 'videocam', color: '#EF4444' },
  { id: '5', name: 'Content Writing', icon: 'document-text', color: '#F59E0B' },
  { id: '6', name: 'Digital Marketing', icon: 'megaphone', color: '#EC4899' },
  { id: '7', name: 'UI/UX Design', icon: 'layers', color: '#6366F1' },
  { id: '8', name: 'SEO', icon: 'trending-up', color: '#14B8A6' },
  { id: '9', name: 'Data Entry', icon: 'grid', color: '#78716C' },
  { id: '10', name: 'Translation', icon: 'language', color: '#0EA5E9' },
  { id: '11', name: 'Accounting', icon: 'calculator', color: '#84CC16' },
  { id: '12', name: 'Music & Audio', icon: 'musical-notes', color: '#D946EF' },
  { id: '13', name: 'Photography', icon: 'camera', color: '#F97316' },
  { id: '14', name: 'Consulting', icon: 'chatbubbles', color: '#06B6D4' },
  { id: '15', name: 'Illustration', icon: 'brush', color: '#A855F7' },
  { id: '16', name: 'Blockchain', icon: 'link', color: '#64748B' },
];
