import { memo } from 'react';
import SearchModal from '../common/search-modal';
import FriendsModal from '../common/friends-modal';
import LoginModal from '../common/login-modal';
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
      />

      <LoginModal
        isOpen={state.ui.showLoginModal}
        onClose={() => dispatch({ type: 'UPDATE_UI', payload: { showLoginModal: false } })}
        onLogin={handleLogin}
      />
    </>
  );
});

export default ModalsContainer;

