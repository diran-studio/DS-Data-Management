
import React from 'react';
import { 
  Inbox, 
  Search, 
  Clock, 
  Settings, 
  Shield, 
  FileText, 
  Image as ImageIcon, 
  BookOpen, 
  CreditCard, 
  User, 
  Mail, 
  ScrollText, 
  Lock 
} from 'lucide-react';

export const BASE_FOLDERS = [
  { name: 'Inbox', icon: <Inbox size={18} /> },
  { name: 'Documents', icon: <FileText size={18} /> },
  { name: 'Media', icon: <ImageIcon size={18} /> },
  { name: 'Writing', icon: <BookOpen size={18} /> },
  { name: 'Finance', icon: <CreditCard size={18} /> },
  { name: 'Identity', icon: <User size={18} /> },
  { name: 'Correspondence', icon: <Mail size={18} /> },
  { name: 'Logs', icon: <ScrollText size={18} /> },
  { name: 'Vault', icon: <Lock size={18} />, special: 'Coming Soon' }
];

export const NAV_ITEMS = [
  { id: 'inbox', label: 'Inbox', icon: <Inbox size={20} /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock size={20} /> },
  { id: 'search', label: 'Search', icon: <Search size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export const QUESTIONS_BY_TYPE: Record<string, string[]> = {
  receipt: ["Total Amount?", "Store Name?", "Category?"],
  identity: ["Document ID?", "Expiration Date?", "Issuing Authority?"],
  essay: ["Topic?", "Key Arguments?", "Target Audience?"],
  correspondence: ["Sender/Recipient?", "Urgency Level?", "Next Steps?"],
  other: ["What is this?", "Why is it important?", "Follow-up required?"]
};
