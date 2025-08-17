import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
};

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'ai',
    content: "Hi there! 👋 I'm your Localit AI assistant. I can help you find the perfect products and deals around Sarath City Mall. What are you looking for today?",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  }
];

const thinkingMessages = [
  "Analyzing your request...",
  "Searching through local inventory...",
  "Finding the best deals for you...",
  "Checking store availability...",
  "Comparing prices across stores..."
];

const LocalitAI = () => {
  useSEO({
    title: "Localit AI – Your Smart Shopping Assistant",
    description: "Get personalized product recommendations and find the best deals around Sarath City Mall with AI assistance.",
    canonical: window.location.origin + "/ai",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the previous page from location state or default to home
  const previousPage = location.state?.from || '/home';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

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

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = generateMockResponse(userMessage.content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setCurrentThinkingMessage(0);
    }, 3000 + Math.random() * 2000); // 3-5 seconds
  };

  const generateMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('shoe') || input.includes('sneaker') || input.includes('footwear')) {
      return "🔍 I found some great shoe deals for you!\n\n👟 **Nike Air Max** - 25% off at SportZone (2nd Floor)\n👞 **Formal Leather Shoes** - Buy 1 Get 1 at Bata (Ground Floor)\n🏃‍♂️ **Running Shoes** - Up to 40% off at Decathlon (1st Floor)\n\nWould you like me to check specific sizes or brands?";
    }
    
    if (input.includes('food') || input.includes('restaurant') || input.includes('eat')) {
      return "🍽️ Here are the best food options near you:\n\n🍕 **Pizza Hut** - 30% off on large pizzas (Food Court)\n🍔 **McDonald's** - Happy Meal deals (Ground Floor)\n🥘 **Biryani Blues** - Special weekend combo (Food Court)\n🍰 **Cake Shop** - Fresh pastries and desserts (1st Floor)\n\nAny specific cuisine you're craving?";
    }
    
    if (input.includes('cloth') || input.includes('dress') || input.includes('fashion')) {
      return "👗 Fashion finds just for you!\n\n✨ **Zara** - End of season sale up to 50% off (2nd Floor)\n👔 **Van Heusen** - Formal wear collection (1st Floor)\n👕 **H&M** - New arrivals with 20% off (Ground Floor)\n🛍️ **Local Boutique** - Handcrafted ethnic wear (3rd Floor)\n\nWhat style are you looking for?";
    }
    
    if (input.includes('electronic') || input.includes('phone') || input.includes('gadget')) {
      return "📱 Tech deals alert!\n\n📱 **iPhone 15** - Special financing available at iStore (2nd Floor)\n💻 **Laptops** - Back to school offers at Croma (1st Floor)\n🎧 **Headphones** - Premium audio gear at Vijay Sales (Ground Floor)\n⌚ **Smart Watches** - Fitness trackers on sale (2nd Floor)\n\nLooking for anything specific?";
    }
    
    // Default response
    return `🤖 I understand you're looking for "${userInput}". Let me search through our local stores...\n\n🏪 I found several relevant options across different stores in Sarath City Mall. Here are some personalized recommendations:\n\n• **Store A** - Great deals on similar items\n• **Store B** - Premium quality options\n• **Store C** - Budget-friendly alternatives\n\nWould you like me to provide more specific details about any of these options?`;
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

  return (
    <main className="flex flex-col h-screen max-w-md mx-auto bg-background">
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
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3 max-w-[80%]">
                <p className="text-sm text-muted-foreground">
                  {thinkingMessages[currentThinkingMessage]}
                </p>
                <div className="flex gap-1 mt-2">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

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
          AI responses are simulated for demo purposes
        </p>
      </div>
    </main>
  );
};

export default LocalitAI;
