import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { processAIQuery, type SearchResult, type SearchIntent, type VideoContext } from "@/lib/ai-service";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import {
  getSessionId,
  getCurrentConversation,
  createConversation,
  saveMessage,
  loadMessages,
  updateConversationTimestamp,
  type StoredMessage
} from "@/lib/chat-service";

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  searchResults?: SearchResult[];
  searchIntent?: SearchIntent;
  thinkingMessages?: string[];
};

const getWelcomeMessage = (): Message => ({
  id: 'welcome',
  type: 'ai',
  content: "Hi there! 👋 I'm your Localit AI assistant. I can help you find the perfect products and deals around Sarath City Capital Mall.\n\nTry asking me things like:\n• \"I need running shoes\"\n• \"Where can I find pizza?\"\n• \"Show me electronics deals\"\n• \"Looking for formal wear\"\n\nWhat are you looking for today?",
  timestamp: new Date(),
});

const thinkingMessages = [
  "Understanding your request...",
  "Searching through local inventory...",
  "Finding the best deals for you...",
  "Checking store availability...",
  "Analyzing product matches...",
  "Comparing prices across stores..."
];

const LocalitAI = () => {
  useSEO({
    title: "Localit AI – Your Smart Shopping Assistant",
    description: "Get personalized product recommendations and find the best deals around Sarath City Capital Mall with AI assistance.",
    canonical: window.location.origin + "/ai",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const videoContext = location.state?.videoContext as VideoContext | undefined;
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SearchResult | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserMessageIndex, setCurrentUserMessageIndex] = useState(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollSpeedRef = useRef<number>(1);

  // Get the previous page from location state or default to home
  const previousPage = location.state?.from || '/home';

  // Initialize conversation on component mount
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        const sessionId = getSessionId();
        const existingConversation = await getCurrentConversation(sessionId);

        if (existingConversation) {
          // Load existing conversation
          setConversationId(existingConversation.id);
          const storedMessages = await loadMessages(existingConversation.id);

          if (storedMessages.length > 0) {
            // Convert stored messages to UI format
            const uiMessages: Message[] = storedMessages.map(msg => ({
              id: msg.id,
              type: msg.type,
              content: msg.content,
              timestamp: msg.timestamp,
              searchResults: msg.searchResults,
              searchIntent: msg.searchIntent,
              thinkingMessages: msg.thinkingMessages
            }));
            setMessages(uiMessages);
          }
        }
        // If no existing conversation, we'll create one when the user sends their first message
      } catch (error) {
        console.error('Error initializing conversation:', error);
        toast.error("Failed to load chat history");
      } finally {
        setIsLoading(false);
      }
    };

    initializeConversation();
  }, []);

  // Handle video context when component loads
  useEffect(() => {
    if (videoContext && !isLoading) {
      console.log('🎬 Video context received:', videoContext);

      const defaultQuery = 'Find me stores or products mentioned in this video';

      // Create and send the video context message immediately
      const sendVideoContextMessage = async () => {
        const userMessage: Message = {
          id: 'video-context',
          type: 'user',
          content: defaultQuery,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
          // Ensure we have a conversation ID
          let currentConversationId = conversationId;
          if (!currentConversationId) {
            const sessionId = getSessionId();
            currentConversationId = await createConversation(sessionId, defaultQuery);
            if (currentConversationId) {
              setConversationId(currentConversationId);
            }
          }

          // Save user message to database
          if (currentConversationId) {
            await saveMessage(currentConversationId, 'user', defaultQuery);
            await updateConversationTimestamp(currentConversationId);
          }

          // Process query with AI (include video context)
          const aiResponse = await processAIQuery(defaultQuery, videoContext);

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: aiResponse.content,
            timestamp: new Date(),
            searchResults: aiResponse.searchResults,
          };

          setMessages(prev => [...prev, aiMessage]);

          // Save AI message to database
          if (currentConversationId) {
            await saveMessage(
              currentConversationId,
              'ai',
              aiResponse.content,
              aiResponse.searchResults,
              undefined, // searchIntent
              thinkingMessages // Store the thinking messages used
            );
            await updateConversationTimestamp(currentConversationId);
          }

        } catch (error) {
          console.error('Error processing video context AI query:', error);
          toast.error("Sorry, I'm having trouble processing the video. Please try again!");

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: "I'm experiencing some technical difficulties analyzing this video. Please try your search again!",
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      };

      // Send the message after a short delay
      setTimeout(() => {
        sendVideoContextMessage();
      }, 500);
    }
  }, [videoContext, isLoading, conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        console.log('📜 Scrolling to bottom - scrollHeight:', scrollAreaRef.current.scrollHeight, 'clientHeight:', scrollAreaRef.current.clientHeight);
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    };

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      setTimeout(scrollToBottom, 50);
    });
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading) {
      const scrollToBottom = () => {
        if (scrollAreaRef.current) {
          console.log('📜 Initial scroll to bottom - scrollHeight:', scrollAreaRef.current.scrollHeight, 'clientHeight:', scrollAreaRef.current.clientHeight);
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      };

      // Multiple attempts to ensure it works
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 500);
      setTimeout(scrollToBottom, 1000);
    }
  }, [isLoading]);

  // Keyboard support for viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && viewerOpen) {
        setViewerOpen(false);
      }
    };

    if (viewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when viewer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [viewerOpen]);

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Simulate AI thinking with rotating messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTyping) {
      interval = setInterval(() => {
        setCurrentThinkingMessage((prev) => (prev + 1) % thinkingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const query = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Ensure we have a conversation ID
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const sessionId = getSessionId();
        currentConversationId = await createConversation(sessionId, query);
        if (currentConversationId) {
          setConversationId(currentConversationId);
        }
      }

      // Save user message to database
      if (currentConversationId) {
        await saveMessage(currentConversationId, 'user', query);
        await updateConversationTimestamp(currentConversationId);
      }

      // Process query with AI (include video context if available)
      const aiResponse = await processAIQuery(query, videoContext);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        searchResults: aiResponse.searchResults,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to database
      if (currentConversationId) {
        await saveMessage(
          currentConversationId,
          'ai',
          aiResponse.content,
          aiResponse.searchResults,
          undefined, // searchIntent - we could store this if needed
          thinkingMessages // Store the thinking messages used
        );
        await updateConversationTimestamp(currentConversationId);
      }

    } catch (error) {
      console.error('Error processing AI query:', error);
      toast.error("Sorry, I'm having trouble processing your request. Please try again!");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm experiencing some technical difficulties. Please try your search again!",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);

      // Save error message to database
      if (conversationId) {
        await saveMessage(conversationId, 'ai', errorMessage.content);
      }
    } finally {
      setIsTyping(false);
      setCurrentThinkingMessage(0);
    }
  };

  // Handle business navigation
  const handleBusinessClick = (businessId: string) => {
    navigate(`/seller/${businessId}`);
  };

  // Handle post click for full-screen view
  const handlePostClick = (result: SearchResult) => {
    setSelectedPost(result);
    setViewerOpen(true);
  };

  // Component to display search results
  const SearchResultsDisplay = ({ results }: { results: SearchResult[] }) => {
    if (!results || results.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Found {results.length} result(s):</p>
        <div className="grid gap-2">
          {results.slice(0, 3).map((result) => (
            <div key={result.id} className="flex gap-2 p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              {/* Product image - clickable for full-screen view */}
              <button
                onClick={() => handlePostClick(result)}
                className="shrink-0 hover:opacity-80 transition-opacity"
              >
                <img
                  src={result.photo_url}
                  alt={result.description || 'Product'}
                  className="w-12 h-12 object-cover rounded"
                />
              </button>

              <div className="flex-1 min-w-0">
                {/* Business name - clickable for business page */}
                <button
                  onClick={() => handleBusinessClick(result.business_id)}
                  className="text-xs font-medium text-foreground truncate hover:text-primary transition-colors text-left"
                >
                  {result.business_name}
                </button>

                {result.offer && (
                  <p className="text-xs text-destructive font-medium">
                    {result.offer}
                  </p>
                )}

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {result.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    navigate(previousPage);
  };

  // Get user messages for navigation
  const getUserMessages = () => {
    return messages.filter(msg => msg.type === 'user');
  };

  // Navigate to previous/next user message
  const navigateToUserMessage = (direction: 'up' | 'down') => {
    const userMessages = getUserMessages();
    if (userMessages.length === 0) return;

    let newIndex = currentUserMessageIndex;

    if (direction === 'up') {
      newIndex = currentUserMessageIndex <= 0 ? userMessages.length - 1 : currentUserMessageIndex - 1;
    } else {
      newIndex = currentUserMessageIndex >= userMessages.length - 1 ? 0 : currentUserMessageIndex + 1;
    }

    setCurrentUserMessageIndex(newIndex);

    // Scroll to the message
    const targetMessage = userMessages[newIndex];
    const messageElement = messageRefs.current[targetMessage.id];
    if (messageElement && scrollAreaRef.current) {
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Handle long press for fast scrolling
  const handleLongPressStart = (direction: 'up' | 'down') => {
    scrollSpeedRef.current = 1;

    const scroll = () => {
      if (scrollAreaRef.current) {
        const scrollAmount = direction === 'up' ? -scrollSpeedRef.current * 10 : scrollSpeedRef.current * 10;
        scrollAreaRef.current.scrollTop += scrollAmount;

        // Exponentially increase speed
        scrollSpeedRef.current = Math.min(scrollSpeedRef.current * 1.1, 20);
      }

      longPressTimerRef.current = setTimeout(scroll, 50);
    };

    // Start after 500ms hold
    longPressTimerRef.current = setTimeout(() => {
      // Haptic feedback for long press
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      scroll();
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    scrollSpeedRef.current = 1;
  };

  return (
    <main className="flex flex-col h-screen w-full max-w-md mx-auto bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-9 w-9 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Localit AI</h1>
          <p className="text-xs text-muted-foreground">Your smart shopping assistant</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Beta
        </Badge>
      </header>

      {/* Messages */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-background"
        style={{
          minHeight: 0, // Important for flex child to be scrollable
          maxHeight: '100%'
        }}
      >
        <div className="p-4 space-y-4 min-h-full">
          {isLoading ? (
            // Loading state
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading conversation...</span>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              // Debug logging
              if (message.id === 'video-context') {
                console.log('🖼️ Rendering video context message:', message.id, 'videoContext:', videoContext);
              }

              return (
                <div
                  key={message.id}
                  ref={(el) => { messageRefs.current[message.id] = el; }}
                  className="grid grid-cols-12 gap-2 items-end"
                >
                  {message.type === 'user' ? (
                    // USER MESSAGE - Right aligned (columns 3-12)
                    <>
                      <div className="col-span-2"></div>
                      <div className="col-span-9 flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-2xl px-3 py-2 max-w-full break-words">
                          {/* Show video thumbnail if this is a video context message */}
                          {message.id === 'video-context' && videoContext && (
                            <div className="mb-2 p-2 bg-black/10 rounded border border-white/20">
                              <div className="flex items-center gap-2">
                                <img
                                  src={videoContext.thumbnailUrl}
                                  alt={videoContext.title}
                                  className="w-8 h-6 object-cover rounded flex-shrink-0"
                                  onError={(e) => {
                                    console.error('Failed to load video thumbnail:', videoContext.thumbnailUrl);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium truncate">
                                    {videoContext.title}
                                  </p>
                                  <p className="text-xs opacity-70">
                                    Video from feed
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="text-sm leading-relaxed">
                            {message.content}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    </>
                  ) : (
                    // AI MESSAGE - Left aligned (columns 1-10)
                    <>
                      <div className="col-span-1 flex justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="col-span-9">
                        <div className="bg-muted rounded-2xl px-3 py-2 max-w-full break-words">
                          <div className="text-sm prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                li: ({ children }) => <li className="mb-1 break-words">{children}</li>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          {message.searchResults && message.searchResults.length > 0 && (
                            <div className="mt-2">
                              <SearchResultsDisplay results={message.searchResults} />
                            </div>
                          )}
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2"></div>
                    </>
                  )}
                </div>
              );
            })
          )}

          {/* Thinking indicator */}
          {isTyping && (
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-1 flex justify-center">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              </div>
              <div className="col-span-9">
                <div className="bg-muted rounded-2xl px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {thinkingMessages[currentThinkingMessage]}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-purple-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
              <div className="col-span-2"></div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      {getUserMessages().length > 0 && (
        <div className="absolute bottom-20 right-4 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
            onMouseDown={() => handleLongPressStart('up')}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={() => handleLongPressStart('up')}
            onTouchEnd={handleLongPressEnd}
            onClick={() => navigateToUserMessage('up')}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
            onMouseDown={() => handleLongPressStart('down')}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={() => handleLongPressStart('down')}
            onTouchEnd={handleLongPressEnd}
            onClick={() => navigateToUserMessage('down')}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about products, deals, or stores..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here'
            ? 'Powered by OpenAI • Real-time search results'
            : 'Demo mode • Add OpenAI API key for full AI features'}
        </p>
      </div>

      {/* Full-screen post viewer */}
      {viewerOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full">
            <img
              src={selectedPost.photo_url}
              alt={selectedPost.description || "Product image"}
              className="absolute inset-0 w-full h-full object-contain"
            />

            {/* Close button */}
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute top-4 right-4 bg-background text-foreground rounded-full h-9 px-3 text-sm"
            >
              Close
            </button>

            {/* Product info overlay */}
            <div className="absolute left-0 right-0 bottom-0 p-4 glass text-primary-foreground">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-background grid place-items-center">
                  <img
                    src={selectedPost.business_logo_url || "https://via.placeholder.com/40x40?text=Logo"}
                    alt="store logo"
                    className="p-1 object-contain w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => {
                      setViewerOpen(false);
                      handleBusinessClick(selectedPost.business_id);
                    }}
                    className="text-sm font-medium hover:underline text-left"
                  >
                    {selectedPost.business_name}
                  </button>
                  <div className="text-xs opacity-80 truncate">
                    {selectedPost.description}
                  </div>
                </div>
                {selectedPost.offer && (
                  <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-semibold">
                    {selectedPost.offer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default LocalitAI;
