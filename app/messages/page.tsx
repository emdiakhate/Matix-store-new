"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import {
  Send,
  Loader2,
  MessageSquare,
  ArrowLeft,
  User,
  Search
} from 'lucide-react';

interface ChatRoom {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const producerId = searchParams.get('producer');
  const orderId = searchParams.get('order');

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (user) {
      loadChatRooms();
    }
  }, [user, userLoading, isAuthenticated, router]);

  // Auto-open or create chat with producer if specified
  useEffect(() => {
    if (producerId && user && chatRooms.length >= 0) {
      openOrCreateChat(producerId);
    }
  }, [producerId, user, chatRooms]);

  // Subscribe to new messages
  useEffect(() => {
    if (!selectedRoom || !user) return;

    const subscription = supabase
      .channel(`room-${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${selectedRoom.id}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();

          // Mark as read if from other user
          if (newMsg.sender_id !== user.id) {
            markAsRead(newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedRoom, user, supabase]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadChatRooms = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get chat rooms where user is participant
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          participant_1,
          participant_2,
          created_at
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get other user info for each room
      const roomsWithInfo: ChatRoom[] = [];

      for (const room of (rooms || []) as any[]) {
        const otherUserId = room.participant_1 === user.id ? room.participant_2 : room.participant_1;

        // Get other user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, business_name, avatar_url')
          .eq('id', otherUserId)
          .single();

        // Get last message
        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('content, created_at')
          .eq('chat_room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_room_id', room.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        roomsWithInfo.push({
          id: room.id,
          other_user_id: otherUserId,
          other_user_name: profile?.business_name ||
            `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
            'Utilisateur',
          other_user_avatar: profile?.avatar_url,
          last_message: lastMsg?.content,
          last_message_at: lastMsg?.created_at,
          unread_count: count || 0
        });
      }

      setChatRooms(roomsWithInfo);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openOrCreateChat = async (otherUserId: string) => {
    if (!user) return;

    // Check if room already exists
    const existingRoom = chatRooms.find(r => r.other_user_id === otherUserId);
    if (existingRoom) {
      selectRoom(existingRoom);
      return;
    }

    try {
      // Check if room exists in DB
      const { data: existing } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .single();

      if (existing) {
        await loadChatRooms();
        const room = chatRooms.find(r => r.id === existing.id);
        if (room) selectRoom(room);
        return;
      }

      // Create new room
      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          participant_1: user.id,
          participant_2: otherUserId
        })
        .select()
        .single();

      if (error) throw error;

      // Get other user info
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, business_name, avatar_url')
        .eq('id', otherUserId)
        .single();

      const newChatRoom: ChatRoom = {
        id: newRoom.id,
        other_user_id: otherUserId,
        other_user_name: profile?.business_name ||
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
          'Utilisateur',
        other_user_avatar: profile?.avatar_url,
        unread_count: 0
      };

      setChatRooms(prev => [newChatRoom, ...prev]);
      selectRoom(newChatRoom);
    } catch (error) {
      console.error('Erreur création conversation:', error);
    }
  };

  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    await loadMessages(room.id);

    // Mark all messages as read
    if (room.unread_count > 0) {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('chat_room_id', room.id)
        .neq('sender_id', user?.id);

      setChatRooms(prev =>
        prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r)
      );
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: selectedRoom.id,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');

      // Update last message in room list
      setChatRooms(prev =>
        prev.map(r =>
          r.id === selectedRoom.id
            ? { ...r, last_message: newMessage.trim(), last_message_at: new Date().toISOString() }
            : r
        )
      );
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredRooms = chatRooms.filter(room =>
    room.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        <Card className="overflow-hidden">
          <div className="flex h-[600px]">
            {/* Chat list */}
            <div className={`w-full md:w-1/3 border-r ${selectedRoom ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(100%-73px)]">
                {filteredRooms.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune conversation</p>
                  </div>
                ) : (
                  filteredRooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => selectRoom(room)}
                      className={`w-full p-4 text-left hover:bg-gray-50 border-b transition-colors ${
                        selectedRoom?.id === room.id ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {room.other_user_avatar ? (
                            <img
                              src={room.other_user_avatar}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 truncate">
                              {room.other_user_name}
                            </p>
                            {room.unread_count > 0 && (
                              <span className="bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                                {room.unread_count}
                              </span>
                            )}
                          </div>
                          {room.last_message && (
                            <p className="text-sm text-gray-500 truncate">
                              {room.last_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className={`flex-1 flex flex-col ${!selectedRoom ? 'hidden md:flex' : ''}`}>
              {selectedRoom ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="md:hidden"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedRoom.other_user_avatar ? (
                        <img
                          src={selectedRoom.other_user_avatar}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedRoom.other_user_name}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender_id === user?.id
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Écrivez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Sélectionnez une conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
