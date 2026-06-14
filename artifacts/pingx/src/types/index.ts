export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  status: 'online' | 'offline';
  phone: string;
  memberSince: string;
  friendsCount: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: 'online' | 'offline';
  lastMessage: string;
  lastMessageTime: string;
}

export interface Message {
  id: string;
  contactId: string;
  text: string;
  time: string;
  sent: boolean;
}

export interface Note {
  id: string;
  content: string;
  color: 'green' | 'purple' | 'pink';
  createdAt: string;
}

export interface Thought {
  id: string;
  text: string;
  createdAt: string;
}

export interface Settings {
  showOfflineStatus: boolean;
  userStatus: 'online' | 'offline';
  endToEndEncryption: boolean;
  vanishMode: boolean;
  readReceipts: boolean;
  notificationsEnabled: boolean;
  messageNotifications: boolean;
  groupNotifications: boolean;
  mentions: boolean;
  friendRequests: boolean;
  newFriends: boolean;
  appUpdates: boolean;
  promotions: boolean;
  quietHours: boolean;
}
