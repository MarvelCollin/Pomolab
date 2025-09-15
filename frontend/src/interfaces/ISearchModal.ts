export interface ISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFriendsModal?: () => void;
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
