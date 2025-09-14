import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MiniPomodoroTimer from '../components/common/mini-pomodoro-timer';
import MiniMusicPlayer from '../components/common/mini-music-player';
import ToolBar from '../components/common/tool-bar';
import SearchBar from '../components/common/search-bar';
import UserProfileDisplay from '../components/common/user-profile-display';
import AudioVisual from '../components/pomodoro/audio-visual';
import BackgroundRenderer from '../components/home/background-renderer';
import LoadingScreen from '../components/home/loading-screen';
import MainContent from '../components/home/main-content';
import ModalsContainer from '../components/home/modals-container';
import { useAppState } from '../hooks/use-app-state';
import { useAuthentication } from '../hooks/use-authentication';
import { useTaskManagement } from '../hooks/use-task-management';
import { useTimerLogic } from '../hooks/use-timer-logic';
import { useBackground } from '../hooks/use-background';
import { useMusic } from '../hooks/use-music';
import { useAudioEffect } from '../hooks/use-audio-effect';
import { useFriendNotifications } from '../hooks/use-friend-notifications';
import { useToast } from '../components/common/toast';
import { AuthTrigger } from '../utils/auth-trigger';
import type { IBackground } from '../interfaces/IBackground';
import '../app.css';

export default function Home() {
  const { state, dispatch } = useAppState();
  
  const { 
    backgrounds, 
    activeBackground, 
    loading: backgroundsLoading,
    changeBackground,
    onMediaReady,
    loadRemainingBackgrounds
  } = useBackground();

  const {
    musics,
    currentMusic,
    playerState,
    loading: musicLoading,
    playMusic,
    togglePlayPause,
    nextMusic,
    previousMusic,
    toggleMute,
    seekTo,
    setVolume
  } = useMusic();

  const {
    audioEffects,
    playEffect,
    stopEffect,
    setEffectVolume,
    toggleEffectMute,
    stopAllEffects,
    getMasterVolume,
    setMasterVolume,
    toggleMasterMute
  } = useAudioEffect();

  const { handleLogin, handleLogout, handleShowLogin } = useAuthentication(dispatch, state.auth.authToken);

  const {
    handleTaskSelect,
    handleTaskComplete,
    handleTaskAdd,
    handleTaskDelete,
    handleTaskEdit,
    handleTaskAssign,
    handleSessionComplete
  } = useTaskManagement(dispatch, state.auth.currentUser, state.tasks, state.selectedTask);

  const {
    sessionDurations,
    sessionLabels,
    toggleTimer,
    resetTimer,
    closeMiniTimer
  } = useTimerLogic(dispatch, state.pomodoro, handleSessionComplete);

  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer
  } = useToast();

  useFriendNotifications(state.auth.currentUser, {
    onFriendRequestSent: (data) => {
      showSuccess('Friend Request Sent', data.message);
    },
    onFriendRequestReceived: (data) => {
      showInfo('Friend Request Received', data.message);
    },
    onFriendRequestAccepted: (data) => {
      showSuccess('Friend Request Accepted', data.message);
    },
    onFriendRequestRejected: (data) => {
      showWarning('Friend Request Rejected', data.message);
    },
    onFriendRemoved: (data) => {
      showError('Friend Removed', data.message);
    }
  });

  useEffect(() => {
    if (!backgroundsLoading && !musicLoading && !state.ui.initialLoadComplete) {
      dispatch({ type: 'INIT_COMPLETE' });
      loadRemainingBackgrounds();
    }
  }, [backgroundsLoading, musicLoading, state.ui.initialLoadComplete, loadRemainingBackgrounds, dispatch]);


  useEffect(() => {
    if (state.ui.initialLoadComplete && !state.ui.showContent) {
      setTimeout(() => {
        dispatch({ type: 'MEDIA_READY' });
      }, 500);
    }
  }, [state.ui.initialLoadComplete, state.ui.showContent, dispatch]);

  useEffect(() => {
    AuthTrigger.setConfig({
      currentUser: state.auth.currentUser,
      onShowLogin: handleShowLogin
    });
  }, [state.auth.currentUser, handleShowLogin]);

  const handleOpenSearchModal = useCallback(() => {
    dispatch({ type: 'UPDATE_UI', payload: { showSearchModal: true } });
  }, [dispatch]);

  const handleCloseSearchModal = useCallback(() => {
    dispatch({ type: 'UPDATE_UI', payload: { showSearchModal: false } });
  }, [dispatch]);

  const handleOpenFriendsModal = useCallback(() => {
    dispatch({ type: 'UPDATE_UI', payload: { showFriendsModal: true } });
  }, [dispatch]);

  const handleCloseFriendsModal = useCallback(() => {
    dispatch({ type: 'UPDATE_UI', payload: { showFriendsModal: false } });
  }, [dispatch]);

  const handleBackgroundChange = useCallback((background: IBackground) => {
    changeBackground(background);
    dispatch({ type: 'UPDATE_UI', payload: { 
      showBackgroundSelector: false,
      backgroundLoaded: false,
      backgroundVisible: false,
      showContent: false
    } });
  }, [changeBackground, dispatch]);

  const isLoading = backgroundsLoading || musicLoading || !state.ui.showContent || !state.ui.initialLoadComplete || Boolean(state.auth.currentUser && state.tasksLoading);

  return (
    <div className="home-page min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <BackgroundRenderer
          activeBackground={activeBackground}
          backgroundsLoading={backgroundsLoading}
          backgroundVisible={state.ui.backgroundVisible}
          backgroundLoaded={state.ui.backgroundLoaded}
          dispatch={dispatch}
          onMediaReady={onMediaReady}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: state.ui.backgroundVisible ? 1 : 0 }}
          transition={{ duration: 1.0, delay: 0.8, ease: "easeInOut" }}
        />
      </div>

      <AudioVisual 
        currentMusic={currentMusic}
        playerState={playerState}
      />

      <LoadingScreen isLoading={isLoading} />

      <AnimatePresence>
        {state.ui.showContent && (
          <>
            <ToolBar
              showBackgroundSelector={state.ui.showBackgroundSelector}
              setShowBackgroundSelector={(show) => dispatch({ type: 'UPDATE_UI', payload: { showBackgroundSelector: show } })}
              showMusicPlayer={state.ui.showMusicPlayer}
              setShowMusicPlayer={(show) => dispatch({ type: 'UPDATE_UI', payload: { showMusicPlayer: show } })}
              showAudioEffects={state.ui.showAudioEffects}
              setShowAudioEffects={(show) => dispatch({ type: 'UPDATE_UI', payload: { showAudioEffects: show } })}
              isMinimalMode={state.ui.isMinimalMode}
              setIsMinimalMode={(minimal) => dispatch({ type: 'UPDATE_UI', payload: { isMinimalMode: minimal } })}
              pomodoroMinimized={state.ui.pomodoroMinimized}
              setPomodoroMinimized={(minimized) => dispatch({ type: 'UPDATE_UI', payload: { pomodoroMinimized: minimized } })}
              tasksMinimized={state.ui.tasksMinimized}
              setTasksMinimized={(minimized) => dispatch({ type: 'UPDATE_UI', payload: { tasksMinimized: minimized } })}
              backgrounds={backgrounds}
              activeBackground={activeBackground}
              onBackgroundChange={handleBackgroundChange}
              musics={musics}
              currentMusic={currentMusic}
              onPlayMusic={playMusic}
              audioEffects={audioEffects}
              onPlayEffect={playEffect}
              onStopEffect={stopEffect}
              onSetEffectVolume={setEffectVolume}
              onToggleEffectMute={toggleEffectMute}
              onStopAllEffects={stopAllEffects}
              getMasterVolume={getMasterVolume}
              onSetMasterVolume={setMasterVolume}
              onToggleMasterMute={toggleMasterMute}
              currentUser={state.auth.currentUser}
              onShowLogin={handleShowLogin}
              onLogout={handleLogout}
            />

            <SearchBar onOpenModal={handleOpenSearchModal} />

            {state.auth.currentUser && (
              <UserProfileDisplay 
                user={state.auth.currentUser} 
                onLogout={handleLogout} 
              />
            )}

            <MiniMusicPlayer 
              setShowMusicPlayer={(show) => dispatch({ type: 'UPDATE_UI', payload: { showMusicPlayer: show } })}
              currentMusic={currentMusic}
              playerState={playerState}
              onTogglePlayPause={togglePlayPause}
              onSeekTo={seekTo}
              onSetVolume={setVolume}
              onToggleMute={toggleMute}
              onPreviousMusic={previousMusic}
              onNextMusic={nextMusic}
            />

            <MainContent
              state={state}
              dispatch={dispatch}
              sessionDurations={sessionDurations}
              sessionLabels={sessionLabels}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              handleSessionComplete={handleSessionComplete}
              handleTaskSelect={handleTaskSelect}
              handleTaskComplete={handleTaskComplete}
              handleTaskAdd={handleTaskAdd}
              handleTaskDelete={handleTaskDelete}
              handleTaskEdit={handleTaskEdit}
              handleTaskAssign={handleTaskAssign}
            />

            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="relative z-10 pb-12"
            >
              <div className="max-w-6xl mx-auto px-4">
              </div>
            </motion.section>

            {state.ui.pomodoroMinimized && (
              <MiniPomodoroTimer
                currentSession={state.pomodoro.currentSession}
                timeLeft={state.pomodoro.timeLeft}
                isRunning={state.pomodoro.isTimerRunning}
                onToggleTimer={toggleTimer}
                onResetTimer={resetTimer}
                onClose={closeMiniTimer}
                sessionLabels={sessionLabels}
              />
            )}
          </>
        )}
      </AnimatePresence>

      <ModalsContainer
        state={state}
        dispatch={dispatch}
        handleCloseSearchModal={handleCloseSearchModal}
        handleOpenFriendsModal={handleOpenFriendsModal}
        handleCloseFriendsModal={handleCloseFriendsModal}
        handleLogin={handleLogin}
      />
      
      <ToastContainer />
    </div>
  );
}