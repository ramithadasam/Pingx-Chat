import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Contact, Message, Note, Thought, Settings } from '../types';
import { MOCK_USER, MOCK_CONTACTS, MOCK_MESSAGES, MOCK_NOTES, MOCK_THOUGHTS, DEFAULT_SETTINGS } from '../data/mockData';

interface AppState {
  user: User;
  contacts: Contact[];
  messages: Record<string, Message[]>;
  notes: Note[];
  thoughts: Thought[];
  settings: Settings;
  
  updateUser: (updates: Partial<User>) => void;
  addContact: (contact: Contact) => void;
  removeContact: (id: string) => void;
  sendMessage: (contactId: string, text: string) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addThought: (text: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('pingx_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('pingx_contacts');
    return saved ? JSON.parse(saved) : MOCK_CONTACTS;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('pingx_messages');
    return saved ? JSON.parse(saved) : MOCK_MESSAGES;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('pingx_notes');
    return saved ? JSON.parse(saved) : MOCK_NOTES;
  });

  const [thoughts, setThoughts] = useState<Thought[]>(() => {
    const saved = localStorage.getItem('pingx_thoughts');
    return saved ? JSON.parse(saved) : MOCK_THOUGHTS;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('pingx_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => { localStorage.setItem('pingx_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('pingx_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('pingx_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('pingx_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('pingx_thoughts', JSON.stringify(thoughts)); }, [thoughts]);
  useEffect(() => { localStorage.setItem('pingx_settings', JSON.stringify(settings)); }, [settings]);

  const updateUser = (updates: Partial<User>) => setUser(prev => ({ ...prev, ...updates }));
  const addContact = (contact: Contact) => setContacts(prev => [...prev, contact]);
  const removeContact = (id: string) => setContacts(prev => prev.filter(c => c.id !== id));
  
  const sendMessage = (contactId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      contactId,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true
    };
    
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage]
    }));
    
    // Update contact last message
    setContacts(prev => prev.map(c => 
      c.id === contactId 
        ? { ...c, lastMessage: text, lastMessageTime: newMessage.time }
        : c
    ));
  };

  const addNote = (note: Note) => setNotes(prev => [...prev, note]);
  const updateNote = (id: string, updates: Partial<Note>) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));
  
  const addThought = (text: string) => {
    const newThought: Thought = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString()
    };
    setThoughts(prev => [newThought, ...prev]);
  };

  const updateSettings = (updates: Partial<Settings>) => setSettings(prev => ({ ...prev, ...updates }));

  return (
    <AppContext.Provider value={{
      user, contacts, messages, notes, thoughts, settings,
      updateUser, addContact, removeContact, sendMessage, addNote, updateNote, deleteNote, addThought, updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
