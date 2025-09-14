export interface ISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFriendsModal?: () => void;
}

export interface ISearchResult {
  id: string;
  title: string;
  description: string;
  category: 'friends';
  icon: React.ComponentType<any>;
  action: () => void;
}
