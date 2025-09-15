import { memo, useState } from 'react';
import SearchModal from '../common/search-modal';
import FriendsModal from '../common/friends-modal';
import LoginModal from '../common/login-modal';
import ChatModal from '../common/chat-modal';
import { useMessageNotifications } from '../../hooks/use-message-notification';
import type { AppState, AppAction } from '../../hooks/use-app-state';
import type { IUser } from '../../interfaces/IUser';

interface ModalsContainerProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  handleCloseSearchModal: () => void;
  handleOpenFriendsModal: () => void;
  handleCloseFriendsModal: () => void;
  handleLogin: (user: IUser, token: string) => Promise<void>;
}

const ModalsContainer = memo(function ModalsContainer({
  state,
  dispatch,
  handleCloseSearchModal,
  handleOpenFriendsModal,
  handleCloseFriendsModal,
  handleLogin
}: ModalsContainerProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWithUser, setChatWithUser] = useState<IUser | null>(null);

  const handleOpenChat = (user: IUser) => {
    setChatWithUser(user);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setChatWithUser(null);
  };

  const { ToastContainer } = useMessageNotifications({ 
    onOpenChat: handleOpenChat,
    currentUser: state.auth.currentUser 
  });
  return (
    <>
      <SearchModal
        isOpen={state.ui.showSearchModal}
        onClose={handleCloseSearchModal}
        onOpenFriendsModal={handleOpenFriendsModal}
      />

      <FriendsModal
        isOpen={state.ui.showFriendsModal}
        onClose={handleCloseFriendsModal}
        currentUser={state.auth.currentUser}
        onOpenChat={handleOpenChat}
      />

      <LoginModal
        isOpen={state.ui.showLoginModal}
        onClose={() => dispatch({ type: 'UPDATE_UI', payload: { showLoginModal: false } })}
        onLogin={handleLogin}
      />

      {chatOpen && chatWithUser && state.auth.currentUser && (
        <ChatModal
          isOpen={chatOpen}
          onClose={handleCloseChat}
          currentUser={state.auth.currentUser}
          chatUser={chatWithUser}
        />
      )}

      <ToastContainer />
    </>
  );
});

export default ModalsContainer;

