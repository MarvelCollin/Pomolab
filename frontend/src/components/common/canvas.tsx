import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Brush, Square, Circle, Minus, Eraser, Palette, RotateCcw, Download, Maximize2, Minimize2, UserPlus, Send, Undo2, Eye } from 'lucide-react';
import { notificationService } from '../../services/notification-service';
import { socketService } from '../../services/socket-service';
import { FriendApi } from '../../apis/friend-api';
import type { IUser } from '../../interfaces/IUser';
import type { 
  ICanvasModal, 
  IDrawingTool, 
  IDrawingAction, 
  IUserCursor, 
  ICanvasSession 
} from '../../interfaces/ICanvas';

const drawingTools: IDrawingTool[] = [
  { id: 'brush', icon: Brush, name: 'Brush' },
  { id: 'line', icon: Minus, name: 'Line' },
  { id: 'rectangle', icon: Square, name: 'Rectangle' },
  { id: 'circle', icon: Circle, name: 'Circle' },
  { id: 'eraser', icon: Eraser, name: 'Eraser' },
];

const colors = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
];

const brushSizes = [2, 5, 10, 15, 20];

function ToolButton({ 
  tool, 
  isActive, 
  onClick 
}: { 
  tool: IDrawingTool; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  const IconComponent = tool.icon;
  
  return (
    <motion.button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[2.5rem] ${
        isActive 
          ? 'bg-blue-500/80 text-white shadow-lg scale-105' 
          : 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white hover:scale-105'
      }`}
      whileHover={{ scale: isActive ? 1.05 : 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={tool.name}
    >
      <IconComponent className="w-4 h-4" />
    </motion.button>
  );
}

function ColorPicker({ 
  selectedColor, 
  onColorChange,
  isCompact = false
}: { 
  selectedColor: string; 
  onColorChange: (color: string) => void; 
  isCompact?: boolean;
}) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#ffffff');

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-white/80">
        <Palette className="w-3 h-3" />
        <span className={`text-xs font-medium ${isCompact ? 'hidden' : ''}`}>Colors</span>
      </div>
      
      <div className={`grid gap-1 ${isCompact ? 'grid-cols-3' : 'grid-cols-5'}`}>
        {colors.slice(0, isCompact ? 6 : colors.length).map((color) => (
          <motion.button
            key={color}
            onClick={() => onColorChange(color)}
            className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg border-2 transition-all ${
              selectedColor === color ? 'border-white shadow-lg scale-110' : 'border-white/30 hover:border-white/60'
            }`}
            style={{ backgroundColor: color }}
            whileHover={{ scale: selectedColor === color ? 1.1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={color}
          />
        ))}
      </div>

      {!isCompact && (
        <div className="space-y-2">
          <motion.button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors text-sm flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-4 h-4" />
            Custom Color
          </motion.button>
          
          {showCustomPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-full h-10 rounded-lg border border-white/30 bg-transparent cursor-pointer"
              />
              <div className="text-white/50 text-xs text-center font-mono">
                {customColor.toUpperCase()}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function BrushSizePicker({ 
  selectedSize, 
  onSizeChange,
  isCompact = false
}: { 
  selectedSize: number; 
  onSizeChange: (size: number) => void; 
  isCompact?: boolean;
}) {
  const displaySizes = isCompact ? [2, 5, 10, 20] : brushSizes;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-white/80">
        <Brush className="w-3 h-3" />
        <span className={`text-xs font-medium ${isCompact ? 'hidden' : ''}`}>Size</span>
      </div>
      <div className="space-y-1">
        {displaySizes.map((size) => (
          <motion.button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`w-full ${isCompact ? 'h-8' : 'h-10'} rounded-lg border-2 flex items-center justify-center transition-all ${
              selectedSize === size 
                ? 'border-white bg-white/20 shadow-lg' 
                : 'border-white/30 hover:border-white/60 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={`Size: ${size}px`}
          >
            <div className="flex items-center gap-2">
              <div 
                className="rounded-full bg-white shadow-sm"
                style={{ 
                  width: Math.max(3, Math.min(size, isCompact ? 12 : 16)), 
                  height: Math.max(3, Math.min(size, isCompact ? 12 : 16))
                }}
              />
              <span className={`text-white/70 ${isCompact ? 'text-xs' : 'text-sm'}`}>{size}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function UserInvitePanel({ 
  currentUser, 
  onInviteUsers, 
  isVisible, 
  onClose,
  isFullscreen 
}: { 
  currentUser: IUser; 
  onInviteUsers: (users: IUser[]) => void; 
  isVisible: boolean; 
  onClose: () => void;
  isFullscreen?: boolean; 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [friends, setFriends] = useState<IUser[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadFriends();
    }
  }, [currentUser]);

  const loadFriends = async () => {
    try {
      const friendships = await FriendApi.getUserFriends(currentUser.id);
      const friendUsers = friendships
        .filter(friendship => friendship.status === 'accepted')
        .map(friendship => {
          return friendship.user_id === currentUser.id ? friendship.friend : friendship.user;
        })
        .filter(Boolean) as IUser[];
      setFriends(friendUsers);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await FriendApi.searchUsers(query);
      const filteredResults = results.filter(user => 
        user.id !== currentUser.id && 
        !selectedUsers.some(selected => selected.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  const handleUserSelect = (user: IUser) => {
    if (!selectedUsers.some(selected => selected.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleInvite = () => {
    if (selectedUsers.length > 0) {
      onInviteUsers(selectedUsers);
      setSelectedUsers([]);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`absolute ${isFullscreen ? 'top-20 right-8 w-80' : 'top-16 right-4 w-80'} bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 z-20 max-h-96 overflow-y-auto`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Invite to Canvas</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
          
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto bg-white/5 rounded-lg border border-white/10">
              {searchResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-3 py-2 text-left text-white/80 hover:bg-white/10 transition-colors"
                >
                  {user.username}
                </button>
              ))}
            </div>
          )}
        </div>

        {friends.length > 0 && (
          <div>
            <h4 className="text-white/60 text-sm mb-2">Friends</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {friends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => handleUserSelect(friend)}
                  disabled={selectedUsers.some(selected => selected.id === friend.id)}
                  className="w-full px-3 py-2 text-left text-white/80 hover:bg-white/10 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {friend.username}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div>
            <h4 className="text-white/60 text-sm mb-2">Selected ({selectedUsers.length})</h4>
            <div className="space-y-1">
              {selectedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between px-3 py-2 bg-white/10 rounded">
                  <span className="text-white/80">{user.username}</span>
                  <button
                    onClick={() => handleUserRemove(user.id)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleInvite}
          disabled={selectedUsers.length === 0}
          className="w-full px-4 py-2 bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4 inline mr-2" />
          Invite {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
        </button>
      </div>
    </motion.div>
  );
}

function DrawingCanvas({ 
  onDrawingStart, 
  onDrawingEnd, 
  isFullscreen,
  setIsFullscreen,
  currentUser,
  sessionId,
  canvasSession,
  drawingActions,
  setDrawingActions
}: { 
  onDrawingStart: () => void; 
  onDrawingEnd: () => void; 
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
  currentUser?: { id: number; username: string } | null;
  sessionId: string;
  canvasSession: ICanvasSession | null;
  drawingActions: IDrawingAction[];
  setDrawingActions: React.Dispatch<React.SetStateAction<IDrawingAction[]>>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState('brush');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentStroke, setCurrentStroke] = useState<{x: number, y: number}[]>([]);
  const [undoHistory, setUndoHistory] = useState<ImageData[]>([]);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [userCursors, setUserCursors] = useState<Map<number, IUserCursor>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, rect.width, rect.height);
        
        drawingActions.forEach(action => {
          applyDrawingAction(action);
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isFullscreen, drawingActions]);

  useEffect(() => {
    const unsubscribe = socketService.listenToCanvasNotifications((data: any) => {
      if (data.event === 'CanvasAction' && data.data && data.data.sessionId === sessionId) {
        const action = data.data.data as IDrawingAction;
        if (action.userId !== currentUser?.id) {
          if (action.type === 'canvas_state') {
            const stateActions = action as any;
            if (stateActions.actions && Array.isArray(stateActions.actions)) {
              setDrawingActions(stateActions.actions);
              stateActions.actions.forEach((historyAction: IDrawingAction) => {
                applyDrawingAction(historyAction);
              });
            }
          } else if (action.type === 'cursor_move') {
            const cursorUpdate: IUserCursor = {
              userId: action.userId,
              username: action.username || `User ${action.userId}`,
              x: action.startX,
              y: action.startY,
              timestamp: action.timestamp,
              lastUpdate: Date.now()
            };
            setUserCursors(prev => new Map(prev.set(action.userId, cursorUpdate)));
            
            setTimeout(() => {
              setUserCursors(prev => {
                const newMap = new Map(prev);
                const cursor = newMap.get(action.userId);
                if (cursor && cursor.timestamp === cursorUpdate.timestamp) {
                  newMap.delete(action.userId);
                }
                return newMap;
              });
            }, 3000);
          } else {
            applyDrawingAction(action);
            setDrawingActions(prev => [...prev, action]);
          }
        }
      }
    });

    return unsubscribe;
  }, [sessionId, currentUser?.id]);

  // Handle canvas resize when fullscreen changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setTimeout(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.15)';
        ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        
        drawingActions.forEach(action => {
          applyDrawingAction(action);
        });
      }
    }, 100);
  }, [isFullscreen]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    return {
      x: clientX,
      y: clientY
    };
  };

  const generateActionId = () => {
    return `${currentUser?.id}_${Date.now()}_${Math.random()}`;
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoHistory(prev => [...prev.slice(-9), imageData]); // Keep last 10 states
  };

  const undoLastAction = () => {
    if (undoHistory.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const lastState = undoHistory[undoHistory.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setUndoHistory(prev => prev.slice(0, -1));
    
    // Broadcast undo action
    if (currentUser && sessionId) {
      const action: IDrawingAction = {
        type: 'undo',
        tool: 'undo',
        startX: 0,
        startY: 0,
        color: '',
        size: 0,
        userId: currentUser.id,
        username: currentUser.username,
        timestamp: Date.now(),
        id: generateActionId()
      };
      broadcastAction(action);
    }
  };

  const broadcastAction = (action: IDrawingAction) => {
    if (currentUser && sessionId) {
      // Get all user IDs from session participants
      const targetUsers = canvasSession?.participants?.map(participant => participant.id) || [];
      
      socketService.sendCanvasAction({
        action: 'draw',
        sessionId: sessionId,
        userId: currentUser.id,
        targetUsers: targetUsers,
        data: action,
        timestamp: Date.now()
      });
    }
  };

  const applyDrawingAction = (action: IDrawingAction) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.save();
    
    ctx.globalCompositeOperation = action.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = action.color;
    ctx.lineWidth = action.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (action.type) {
      case 'stroke_start':
        ctx.beginPath();
        ctx.moveTo(action.startX, action.startY);
        if (action.endX !== undefined && action.endY !== undefined) {
          ctx.lineTo(action.endX, action.endY);
          ctx.stroke();
        }
        break;
      case 'stroke_continue':
        if (action.points && action.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          for (let i = 1; i < action.points.length; i++) {
            ctx.lineTo(action.points[i].x, action.points[i].y);
          }
          ctx.stroke();
        }
        break;
      case 'stroke_end':
        if (action.endX !== undefined && action.endY !== undefined) {
          ctx.lineTo(action.endX, action.endY);
          ctx.stroke();
        }
        break;
      case 'shape':
        ctx.beginPath();
        if (action.tool === 'line') {
          ctx.moveTo(action.startX, action.startY);
          ctx.lineTo(action.endX!, action.endY!);
          ctx.stroke();
        } else if (action.tool === 'rectangle') {
          ctx.strokeRect(
            action.startX, 
            action.startY, 
            action.endX! - action.startX, 
            action.endY! - action.startY
          );
        } else if (action.tool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(action.endX! - action.startX, 2) + Math.pow(action.endY! - action.startY, 2)
          );
          ctx.arc(action.startX, action.startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
      case 'clear':
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(240, 240, 240, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      case 'cursor_move':
        if (action.userId !== currentUser?.id) {
          updateUserCursor(action);
        }
        break;
      case 'undo':
        break;
    }
    
    ctx.restore();
  };

  // Update user cursor position
  const updateUserCursor = (action: IDrawingAction) => {
    const cursor: IUserCursor = {
      userId: action.userId,
      username: action.username || `User ${action.userId}`,
      x: action.startX,
      y: action.startY,
      timestamp: action.timestamp,
      lastUpdate: Date.now()
    };
    
    setUserCursors(prev => new Map(prev.set(action.userId, cursor)));
    
    // Clean up old cursors (remove after 5 seconds of inactivity)
    setTimeout(() => {
      setUserCursors(prev => {
        const updated = new Map(prev);
        const cursor = updated.get(action.userId);
        if (cursor && Date.now() - cursor.lastUpdate > 5000) {
          updated.delete(action.userId);
        }
        return updated;
      });
    }, 5000);
  };

  // Render user cursors overlay
  const renderCursors = () => {
    return Array.from(userCursors.entries()).map(([userId, cursor]) => {
      if (cursor.userId === currentUser?.id) return null;
      
      return (
        <div
          key={userId}
          className="absolute pointer-events-none z-10 flex items-center"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          <div className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded shadow-lg whitespace-nowrap">
            {cursor.username}
          </div>
        </div>
      );
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !currentUser) return;

    const { x, y } = getCanvasCoordinates(e);

    saveCanvasState();

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentStroke([{ x, y }]);
    onDrawingStart();

    if (activeTool === 'brush' || activeTool === 'eraser') {
      ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);

      const action: IDrawingAction = {
        type: 'stroke_start',
        tool: activeTool,
        startX: x,
        startY: y,
        color: selectedColor,
        size: brushSize,
        userId: currentUser.id,
        username: currentUser.username,
        timestamp: Date.now(),
        id: generateActionId()
      };
      broadcastAction(action);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentUser) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    if (activeTool === 'brush' || activeTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      
      const newStroke = [...currentStroke, { x, y }];
      setCurrentStroke(newStroke);

      const recentPoints = newStroke.slice(-3);
      const action: IDrawingAction = {
        type: 'stroke_continue',
        tool: activeTool,
        startX: x,
        startY: y,
        points: recentPoints,
        color: selectedColor,
        size: brushSize,
        userId: currentUser.id,
        username: currentUser.username,
        timestamp: Date.now(),
        id: generateActionId()
      };
      broadcastAction(action);
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentUser) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    
    if (activeTool === 'brush' || activeTool === 'eraser') {
      const action: IDrawingAction = {
        type: 'stroke_end',
        tool: activeTool,
        startX: startPos.x,
        startY: startPos.y,
        endX: x,
        endY: y,
        points: currentStroke,
        color: selectedColor,
        size: brushSize,
        userId: currentUser.id,
        username: currentUser.username,
        timestamp: Date.now(),
        id: generateActionId()
      };
      broadcastAction(action);
    } else if (activeTool === 'line' || activeTool === 'rectangle' || activeTool === 'circle') {
      const action: IDrawingAction = {
        type: 'shape',
        tool: activeTool,
        startX: startPos.x,
        startY: startPos.y,
        endX: x,
        endY: y,
        color: selectedColor,
        size: brushSize,
        userId: currentUser.id,
        username: currentUser.username,
        timestamp: Date.now(),
        id: generateActionId()
      };
      broadcastAction(action);
    }

    setIsDrawing(false);
    setCurrentStroke([]);
    
    if (activeTool === 'brush' || activeTool === 'eraser') {
      ctx.beginPath();
    }
  };

  // Handle mouse movement for cursor tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentUser) return;

    const { x, y } = getCanvasCoordinates(e);
    
    const cursorAction: IDrawingAction = {
      type: 'cursor_move',
      tool: 'cursor',
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      color: selectedColor,
      size: brushSize,
      userId: currentUser.id,
      username: currentUser.username,
      timestamp: Date.now(),
      id: generateActionId()
    };
    
    if (!isDrawing) {
      broadcastAction(cursorAction);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !currentUser) return;
    
    saveCanvasState();
    
    const action: IDrawingAction = {
      type: 'clear',
      tool: 'clear',
      startX: 0,
      startY: 0,
      color: '',
      size: 0,
      userId: currentUser.id,
      username: currentUser.username,
      timestamp: Date.now(),
      id: generateActionId()
    };
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(240, 240, 240, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setDrawingActions([]);
    
    broadcastAction(action);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `canvas_${sessionId}_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900/50 to-gray-800/50">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
            {drawingTools.map((tool) => (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={activeTool === tool.id}
                onClick={() => setActiveTool(tool.id)}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
            <motion.button
              onClick={undoLastAction}
              disabled={undoHistory.length === 0}
              className="p-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 rounded-lg text-white/60 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={clearCanvas}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Clear Canvas"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={downloadCanvas}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowInvitePanel(!showInvitePanel)}
            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Invite Users"
          >
            <UserPlus className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1 flex min-h-0">
        {isFullscreen && (
          <div className="flex-shrink-0 w-64 border-r border-white/10 bg-black/10 backdrop-blur-sm transition-all duration-300">
            <div className="p-3 space-y-4 h-full overflow-y-auto">
              <ColorPicker
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
                isCompact={false}
              />
              <BrushSizePicker
                selectedSize={brushSize}
                onSizeChange={setBrushSize}
                isCompact={false}
              />
            </div>
          </div>
        )}
        
        <div className="flex-1 relative bg-gradient-to-br from-white/5 to-white/10">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)'
            }}
            onMouseDown={startDrawing}
            onMouseMove={(e) => {
              draw(e);
              handleMouseMove(e);
            }}
            onMouseUp={stopDrawing}
            onMouseLeave={() => {
              if (isDrawing) {
                setIsDrawing(false);
                setCurrentStroke([]);
                if (canvasRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  if (ctx && (activeTool === 'brush' || activeTool === 'eraser')) {
                    ctx.beginPath();
                  }
                }
              }
            }}
          />
          {renderCursors()}
          
          {showInvitePanel && currentUser && (
            <UserInvitePanel
              currentUser={currentUser as IUser}
              onInviteUsers={(users) => {
                users.forEach(user => {
                  console.log('Inviting user to canvas:', user);
                });
                setShowInvitePanel(false);
              }}
              isVisible={showInvitePanel}
              onClose={() => setShowInvitePanel(false)}
              isFullscreen={isFullscreen}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CanvasModal({
  isOpen,
  onClose,
  currentUser,
  pendingSession,
  onSessionJoined
}: ICanvasModal) {
  const constraintsRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [canvasSession, setCanvasSession] = useState<ICanvasSession | null>(null);
  const [participants, setParticipants] = useState<IUser[]>([]);
  const [drawingActions, setDrawingActions] = useState<IDrawingAction[]>([]);

  useEffect(() => {
    if (isOpen && currentUser) {
      let sessionId: string;
      let sessionName: string;
      
      if (pendingSession) {
        sessionId = pendingSession.sessionId;
        sessionName = pendingSession.sessionName || 'Shared Canvas';
        
        const joinedSession: ICanvasSession = {
          id: sessionId,
          name: sessionName,
          participants: [currentUser as IUser],
          createdBy: 0,
          createdAt: new Date().toISOString()
        };
        setCanvasSession(joinedSession);
        setParticipants([currentUser as IUser]);
        
        if (onSessionJoined) {
          onSessionJoined();
        }
      } else {
        sessionId = `session_${currentUser.id}_${Date.now()}`;
        sessionName = `${currentUser.username}'s Canvas`;
        
        const newSession: ICanvasSession = {
          id: sessionId,
          name: sessionName,
          participants: [currentUser as IUser],
          createdBy: currentUser.id,
          createdAt: new Date().toISOString()
        };
        setCanvasSession(newSession);
        setParticipants([currentUser as IUser]);
      }

      notificationService.setCanvasJoinCallback((sessionId: string, sessionName?: string) => {
        joinCanvasSession(sessionId, sessionName);
      });

      const unsubscribe = notificationService.subscribeToUserCanvasNotifications(
        currentUser.id,
        (notification) => {
          handleCanvasNotification(notification);
        }
      );

      return unsubscribe;
    }
  }, [isOpen, currentUser, pendingSession]);

  const handleCanvasNotification = (notification: any) => {
    switch (notification.type) {
      case 'canvas_joined':
        if (notification.to_user && !participants.some(p => p.id === notification.to_user.id)) {
          setParticipants(prev => [...prev, notification.to_user]);
          notificationService.showToast('success', 'User Joined', `${notification.to_user.username} joined the canvas`);
          
          // Send current canvas state to the new participant
          if (canvasSession && currentUser) {
            socketService.sendCanvasAction({
              action: 'sync_state',
              sessionId: canvasSession.id,
              userId: currentUser.id,
              targetUserId: notification.to_user.id,
              data: {
                type: 'canvas_state',
                actions: drawingActions,
                userId: currentUser.id,
                username: currentUser.username,
                timestamp: Date.now(),
                id: `sync_${Date.now()}`
              },
              timestamp: Date.now()
            });
          }
        }
        break;
      case 'canvas_left':
        if (notification.from_user) {
          setParticipants(prev => prev.filter(p => p.id !== notification.from_user.id));
          notificationService.showToast('info', 'User Left', `${notification.from_user.username} left the canvas`);
        }
        break;
      case 'canvas_ended':
        notificationService.showToast('warning', 'Canvas Ended', 'The canvas session has ended');
        onClose();
        break;
    }
  };

  const joinCanvasSession = (sessionId: string, sessionName?: string) => {
    if (currentUser) {
      const joinedSession: ICanvasSession = {
        id: sessionId,
        name: sessionName || 'Shared Canvas',
        participants: [currentUser as IUser],
        createdBy: 0,
        createdAt: new Date().toISOString()
      };
      setCanvasSession(joinedSession);
      setParticipants([currentUser as IUser]);
    }
  };

  const handleInviteUsers = async (users: IUser[]) => {
    if (currentUser && canvasSession) {
      try {
        await notificationService.sendCanvasInvite(
          canvasSession.id,
          canvasSession.name,
          currentUser as IUser,
          users
        );
        notificationService.showToast('success', 'Invitations Sent', `Invited ${users.length} user${users.length !== 1 ? 's' : ''} to the canvas`);
      } catch (error) {
        console.error('Failed to send canvas invitations:', error);
        notificationService.showToast('error', 'Invitation Failed', 'Failed to send canvas invitations');
      }
    }
  };

  const handleDrawingStart = () => {
    setIsDraggingDisabled(true);
  };

  const handleDrawingEnd = () => {
    setIsDraggingDisabled(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    if (currentUser && canvasSession && participants.length > 1) {
      const otherParticipants = participants.filter(p => p.id !== currentUser.id);
      notificationService.sendCanvasEnd(canvasSession.id, otherParticipants);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={constraintsRef}
      className={`fixed pointer-events-none z-50 ${isFullscreen ? 'inset-0' : 'inset-0'}`}
    >
      <motion.div
        drag={!isDraggingDisabled && !isFullscreen}
        dragConstraints={isFullscreen ? false : constraintsRef}
        dragElastic={0.05}
        whileDrag={!isFullscreen ? { scale: 1.01 } : {}}
        className={`${
          isFullscreen 
            ? 'fixed inset-4 cursor-default' 
            : 'absolute top-20 left-80 w-96 h-80 cursor-move'
        } bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden transition-all duration-300`}
        initial={{ opacity: 0, scale: 0.9, y: -30 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          ...(isFullscreen && { x: 0, y: 0 })
        }}
        exit={{ opacity: 0, scale: 0.9, y: -30 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          cursor: isFullscreen ? 'default' : (isDraggingDisabled ? 'crosshair' : 'move')
        }}
      >
        <div className="relative h-full flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          
          <div className="relative flex items-center justify-between p-4 border-b border-white/20 bg-white/5">
            <div className="flex items-center gap-3">
              {!isFullscreen && (
                <GripVertical className="w-5 h-5 text-white/60 cursor-move hover:text-white transition-colors" />
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                  <Brush className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium">
                    {canvasSession?.name || 'Drawing Canvas'}
                  </h3>
                  <p className="text-white/60 text-xs">
                    {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                onClick={() => setShowInvitePanel(!showInvitePanel)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Invite Users"
              >
                <UserPlus className="w-4 h-4 text-white/60 group-hover:text-white" />
              </motion.button>
              <motion.button
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-white/60 group-hover:text-white" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-white/60 group-hover:text-white" />
                )}
              </motion.button>
              <motion.button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-white/60 group-hover:text-white" />
              </motion.button>
            </div>
          </div>

          {currentUser && (
            <UserInvitePanel
              currentUser={currentUser as IUser}
              onInviteUsers={handleInviteUsers}
              isVisible={showInvitePanel}
              onClose={() => setShowInvitePanel(false)}
              isFullscreen={isFullscreen}
            />
          )}

          <div className="flex-1 overflow-hidden relative">
            {canvasSession && (
              <DrawingCanvas 
                onDrawingStart={handleDrawingStart}
                onDrawingEnd={handleDrawingEnd}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                currentUser={currentUser}
                sessionId={canvasSession.id}
                canvasSession={canvasSession}
                drawingActions={drawingActions}
                setDrawingActions={setDrawingActions}
              />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
