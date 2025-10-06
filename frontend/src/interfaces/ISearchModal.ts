export interface ISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFriendsModal?: () => void;
  onOpenVideoModal?: () => void;
  onOpenStatsModal?: () => void;
}

export interface ISearchResult {
  id: string;
  title: string;
  description: string;
  category: 'friends' | 'video' | 'stats';
  icon: React.ComponentType<any>;
  action: () => void;
  requireAuth?: boolean;
}
