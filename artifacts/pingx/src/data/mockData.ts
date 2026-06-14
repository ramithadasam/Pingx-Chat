import { User, Contact, Message, Note, Thought, Settings } from '../types';

export const MOCK_USER: User = {
  id: 'me',
  name: 'Arjun Sharma',
  username: 'arjun.sharma_24',
  bio: 'Dream. Plan. Do. Repeat.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunSharma&backgroundColor=b6e3f4',
  status: 'online',
  phone: '+91 98765 43210',
  memberSince: 'May 12, 2024',
  friendsCount: 42,
};

export const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Arjun Sharma', phone: '+91 98765 43210', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunS&backgroundColor=b6e3f4', status: 'online', lastMessage: 'Hey! How are you?', lastMessageTime: '10:30 AM' },
  { id: '2', name: 'Priya Mehta', phone: '+91 87654 32109', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaM&backgroundColor=ffd5dc', status: 'online', lastMessage: "Let's catch up later 👋", lastMessageTime: 'Yesterday' },
  { id: '3', name: 'Rohit Verma', phone: '+91 76543 21098', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohitV&backgroundColor=c0aede', status: 'offline', lastMessage: 'Thanks for the notes!', lastMessageTime: 'Yesterday' },
  { id: '4', name: 'Ananya Singh', phone: '+91 65432 10987', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaS&backgroundColor=d1f4d1', status: 'online', lastMessage: 'Okay, noted 👍', lastMessageTime: '2 days ago' },
  { id: '5', name: 'Karan Malhotra', phone: '+91 54321 09876', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KaranM&backgroundColor=f9c784', status: 'offline', lastMessage: 'See you soon', lastMessageTime: '3 days ago' },
  { id: '6', name: 'Neha Kapoor', phone: '+91 43210 98765', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NehaK&backgroundColor=ffd5dc', status: 'online', lastMessage: 'Hey there!', lastMessageTime: '3 days ago' },
  { id: '7', name: 'Vivek Patel', phone: '+91 32109 87654', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VivekP&backgroundColor=b6e3f4', status: 'online', lastMessage: "Let's plan something", lastMessageTime: '4 days ago' },
  { id: '8', name: 'Ishita Rawat', phone: '+91 21098 76543', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IshitaR&backgroundColor=d1f4d1', status: 'offline', lastMessage: 'Good night 🌙', lastMessageTime: '5 days ago' },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', contactId: '1', text: 'Hey! How are you?', time: '10:30 AM', sent: false },
    { id: 'm2', contactId: '1', text: "Hey Arjun! I'm good, how about you?", time: '10:31 AM', sent: true },
    { id: 'm3', contactId: '1', text: "I'm doing great! 😄 Just working on some stuff.", time: '10:32 AM', sent: false },
    { id: 'm4', contactId: '1', text: 'Nicee! What are you working on?', time: '10:33 AM', sent: true },
    { id: 'm5', contactId: '1', text: 'Some notes for our project. Pretty interesting topic!', time: '10:34 AM', sent: false },
    { id: 'm6', contactId: '1', text: "That's awesome! Need any help?", time: '10:34 AM', sent: true },
    { id: 'm7', contactId: '1', text: 'Maybe later 😄 Thanks!', time: '10:35 AM', sent: false },
    { id: 'm8', contactId: '1', text: 'Sure thing! Let me know.', time: '10:35 AM', sent: true },
    { id: 'm9', contactId: '1', text: 'Will do! 👍', time: '10:36 AM', sent: false },
    { id: 'm10', contactId: '1', text: 'Take care!', time: '10:36 AM', sent: true },
  ],
  '2': [
    { id: 'm11', contactId: '2', text: "Let's catch up later 👋", time: 'Yesterday', sent: false },
    { id: 'm12', contactId: '2', text: 'Sure! When are you free?', time: 'Yesterday', sent: true },
  ],
};

export const MOCK_NOTES: Note[] = [
  { id: 'n1', content: 'Buy groceries tomorrow morning', color: 'green', createdAt: '2024-06-01' },
  { id: 'n2', content: 'Call mom on Sunday', color: 'purple', createdAt: '2024-06-02' },
  { id: 'n3', content: 'Finish the project report by Friday', color: 'pink', createdAt: '2024-06-03' },
];

export const MOCK_THOUGHTS: Thought[] = [
  { id: 't1', text: 'Always be kind. You never know what someone is going through.', createdAt: '2024-06-01' },
  { id: 't2', text: 'Focus on progress, not perfection.', createdAt: '2024-06-02' },
];

export const DEFAULT_SETTINGS: Settings = {
  showOfflineStatus: true,
  userStatus: 'online',
  endToEndEncryption: true,
  vanishMode: false,
  readReceipts: true,
  notificationsEnabled: true,
  messageNotifications: true,
  groupNotifications: true,
  mentions: true,
  friendRequests: true,
  newFriends: true,
  appUpdates: true,
  promotions: false,
  quietHours: false,
};
