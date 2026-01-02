export interface ISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFriendsModal?: (tab: 'friends' | 'requests' | 'add') => void;
  onOpenVideoModal?: () => void;
}

export interface ISearchResult {
  id: string;
  title: string;
  description: string;
  category: 'friends' | 'video';
  icon: React.ComponentType<any>;
  action: () => void;
  requireAuth?: boolean;
}
