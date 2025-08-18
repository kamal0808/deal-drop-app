import { supabase } from '@/integrations/supabase/client';
import { type SearchResult, type SearchIntent } from './ai-service';

// Types for chat persistence
export interface ChatConversation {
  id: string;
  user_id?: string;
  session_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  type: 'user' | 'ai';
  content: string;
  search_results?: SearchResult[];
  search_intent?: SearchIntent;
  thinking_messages?: string[];
  created_at: string;
}

export interface StoredMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  searchResults?: SearchResult[];
  searchIntent?: SearchIntent;
  thinkingMessages?: string[];
}

// Generate a session ID for the browser session
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session ID from localStorage
export function getSessionId(): string {
  let sessionId = localStorage.getItem('localit_chat_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('localit_chat_session_id', sessionId);
  }
  return sessionId;
}

// Create a new conversation
export async function createConversation(sessionId: string, firstMessage?: string): Promise<string | null> {
  try {
    const title = firstMessage ? await generateTitle(firstMessage) : undefined;
    
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        session_id: sessionId,
        title: title
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

// Generate conversation title from first message
async function generateTitle(firstMessage: string): Promise<string> {
  try {
    const { data, error } = await (supabase as any).rpc('generate_conversation_title', {
      first_message: firstMessage
    });

    if (error) {
      console.error('Error generating title:', error);
      // Fallback to simple truncation
      return firstMessage.length > 50 ? firstMessage.substring(0, 47) + '...' : firstMessage;
    }

    return data || firstMessage;
  } catch (error) {
    console.error('Error generating title:', error);
    return firstMessage.length > 50 ? firstMessage.substring(0, 47) + '...' : firstMessage;
  }
}

// Get the current conversation for a session
export async function getCurrentConversation(sessionId: string): Promise<ChatConversation | null> {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}

// Save a message to the database
export async function saveMessage(
  conversationId: string,
  type: 'user' | 'ai',
  content: string,
  searchResults?: SearchResult[],
  searchIntent?: SearchIntent,
  thinkingMessages?: string[]
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        type,
        content,
        search_results: searchResults || null,
        search_intent: searchIntent || null,
        thinking_messages: thinkingMessages || null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving message:', error);
    return null;
  }
}

// Load messages for a conversation
export async function loadMessages(conversationId: string): Promise<StoredMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return [];
    }

    // Transform database messages to UI format
    return (data || []).map((msg: ChatMessage): StoredMessage => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      searchResults: msg.search_results || undefined,
      searchIntent: msg.search_intent || undefined,
      thinkingMessages: msg.thinking_messages || undefined
    }));
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
}

// Get conversation history for a session
export async function getConversationHistory(sessionId: string): Promise<ChatConversation[]> {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false })
      .limit(10); // Limit to last 10 conversations

    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

// Update conversation timestamp (to mark as recently active)
export async function updateConversationTimestamp(conversationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation timestamp:', error);
    }
  } catch (error) {
    console.error('Error updating conversation timestamp:', error);
  }
}

// Clear session (for testing or reset)
export function clearSession(): void {
  localStorage.removeItem('localit_chat_session_id');
}
