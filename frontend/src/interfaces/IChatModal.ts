import type { IUser } from './IUser';
import type { IMessage } from './IMessage';

export interface IChatModal {
  isOpen: boolean;
  onClose: () => void;
  currentUser: IUser | null;
  chatUser: IUser;
  onSendMessage?: (message: string) => void;
}

export interface IChatMessage extends IMessage {
  fromUser?: IUser;
  toUser?: IUser;
  isOwn?: boolean;
  isTemporary?: boolean;
}
