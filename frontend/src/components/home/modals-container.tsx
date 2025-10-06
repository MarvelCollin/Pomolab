import { memo, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SearchModal from '../common/search-modal';
import FriendsModal from '../common/friends-modal';
import LoginModal from '../common/login-modal';
import ChatModal from '../common/chat-modal';
import VideoModal from '../common/video-modal';
import StatsModal from '../common/stats-modal';
import { useUnifiedNotifications } from '../../hooks/use-unified-notifications';
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
  const [videoOpen, setVideoOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [joinMeetingData, setJoinMeetingData] = useState<{meetingId: string; token: string} | null>(null);

  const handleOpenChat = useCallback((user: IUser) => {
    setChatWithUser(user);
    setChatOpen(true);
    handleCloseFriendsModal();
  }, [handleCloseFriendsModal]);

  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
    setChatWithUser(null);
  }, []);

  const handleOpenVideoModal = useCallback(() => {
    setVideoOpen(true);
  }, []);

  const handleCloseVideoModal = useCallback(() => {
    setVideoOpen(false);
    setJoinMeetingData(null);
  }, []);

  const handleOpenStatsModal = useCallback(() => {
    setStatsOpen(true);
  }, []);

  const handleCloseStatsModal = useCallback(() => {
    setStatsOpen(false);
  }, []);

  const handleJoinVideoCall = useCallback((meetingId: string, token: string) => {
    setJoinMeetingData({ meetingId, token });
    setVideoOpen(true);
  }, []);

  useUnifiedNotifications({ 
    onOpenChat: handleOpenChat,
    onJoinVideoCall: handleJoinVideoCall,
    currentUser: state.auth.currentUser 
  });

  return (
    <>
      <SearchModal
        isOpen={state.ui.showSearchModal}
        onClose={handleCloseSearchModal}
        onOpenFriendsModal={handleOpenFriendsModal}
        onOpenVideoModal={handleOpenVideoModal}
        onOpenStatsModal={handleOpenStatsModal}
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

      <VideoModal
        isOpen={videoOpen}
        onClose={handleCloseVideoModal}
        currentUser={state.auth.currentUser}
        joinMeetingData={joinMeetingData}
      />

      <StatsModal
        isOpen={statsOpen}
        onClose={handleCloseStatsModal}
        currentUser={state.auth.currentUser}
      />

      <AnimatePresence>
        {chatOpen && chatWithUser && state.auth.currentUser && (
          <ChatModal
            key={`chat-${chatWithUser.id}`}
            isOpen={chatOpen}
            onClose={handleCloseChat}
            currentUser={state.auth.currentUser}
            chatUser={chatWithUser}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default ModalsContainer;

