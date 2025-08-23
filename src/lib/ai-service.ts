import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { supabase } from '@/integrations/supabase/client';

// Configure OpenAI provider
const openaiProvider = createOpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
});

// Types for AI responses
export interface SearchIntent {
  searchQuery: string;
  searchDescription: string;
  categoryHint?: string;
}

export interface SearchResult {
  id: string;
  photo_url: string;
  offer: string | null;
  description: string | null;
  business_name: string;
  business_logo_url: string | null;
  category_name: string | null;
  relevance_score: number;
}

export interface AIResponse {
  content: string;
  searchResults?: SearchResult[];
}

export interface VideoContext {
  id?: string;
  title: string;
  thumbnailUrl: string;
  summary?: string;
}

// System prompt for understanding user queries
const SYSTEM_PROMPT = `You are Localit AI, a smart shopping assistant for Sarath City Capital Mall. Your role is to help users find products, deals, and businesses in the mall.

CONTEXT:
- Localit is a hyperlocal retail discovery app focused on Sarath City Capital Mall
- Users can search for products, businesses, categories, and deals
- The database contains posts (product listings) from various businesses with categories
- Available data: business names, product descriptions, offers, categories

YOUR TASKS:
1. Understand if the user query is related to local retail/shopping
2. Extract search intent and generate appropriate database queries
3. Provide helpful, conversational responses about found products/deals

RESPONSE FORMAT:
When a user asks about products/shopping, respond with a JSON object:
{
  "searchQuery": "optimized search term for database",
  "searchDescription": "what you're searching for (shown in thinking mode)",
  "categoryHint": "category name if applicable (optional)"
}

EXAMPLES:
User: "I need running shoes"
Response: {"searchQuery": "running shoes sneakers athletic footwear", "searchDescription": "Searching for running shoes and athletic footwear", "categoryHint": "footwear"}

User: "Where can I get pizza?"
Response: {"searchQuery": "pizza food restaurant", "searchDescription": "Looking for pizza restaurants and food options", "categoryHint": "food"}

User: "Show me electronics deals"
Response: {"searchQuery": "electronics gadgets phones laptops", "searchDescription": "Finding electronics and gadget deals", "categoryHint": "electronics"}

GUIDELINES:
- Always be helpful and conversational
- Focus on local retail context
- If query is not retail-related, politely redirect to shopping topics
- Use synonyms and related terms in searchQuery for better results
- Keep searchDescription user-friendly for the thinking mode display`;

// Generate search intent from user query
export async function generateSearchIntent(userQuery: string, videoContext?: VideoContext): Promise<SearchIntent | null> {
  // Check if OpenAI API key is configured
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.log('OpenAI API key not configured, using fallback logic');
    return generateFallbackSearchIntent(userQuery);
  }

  try {
    // Build the prompt with video context if available
    let prompt = `User query: "${userQuery}"`;

    if (videoContext) {
      prompt += `

VIDEO CONTEXT:
The user is asking about a video titled: "${videoContext.title}"`;

      if (videoContext.summary) {
        prompt += `

VIDEO SUMMARY:
${videoContext.summary}

Based on this video content and the user's query, help them find related products, stores, or businesses mentioned in the video or similar to what's shown.`;
      }
    }

    prompt += `

Analyze this query and determine if it's related to shopping/retail. If yes, extract the search intent as JSON. If not retail-related, return null.`;

    const { text } = await generateText({
      model: openaiProvider('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      prompt: prompt,
      temperature: 0.3,
    });

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.searchQuery && parsed.searchDescription) {
        return parsed as SearchIntent;
      }
    } catch {
      // If not JSON, treat as non-retail query
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error generating search intent:', error);
    // Fallback to simple logic if AI fails
    return generateFallbackSearchIntent(userQuery);
  }
}

// Fallback search intent generation without AI
function generateFallbackSearchIntent(userQuery: string): SearchIntent | null {
  const query = userQuery.toLowerCase().trim();

  // Simple keyword-based detection for retail queries
  const retailKeywords = [
    'buy', 'shop', 'store', 'deal', 'offer', 'price', 'sale', 'discount',
    'shoe', 'clothes', 'food', 'restaurant', 'electronics', 'phone', 'laptop',
    'dress', 'shirt', 'bag', 'watch', 'jewelry', 'book', 'toy', 'gift'
  ];

  const isRetailQuery = retailKeywords.some(keyword => query.includes(keyword));

  if (!isRetailQuery && query.length < 3) {
    return null; // Too short and no retail keywords
  }

  return {
    searchQuery: userQuery,
    searchDescription: `Searching for "${userQuery}" in local stores`,
    categoryHint: undefined
  };
}

// Search products in database
export async function searchProducts(searchIntent: SearchIntent): Promise<SearchResult[]> {
  try {
    // Try the advanced search function first
    const { data, error } = await (supabase as any).rpc('search_posts', {
      search_term: searchIntent.searchQuery,
      category_filter: null,
      result_limit: 10,
      result_offset: 0
    });

    if (error) {
      console.log('Advanced search not available, falling back to basic search:', error.message);

      // Fallback to basic search if search_posts function doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('posts')
        .select(`
          id,
          photo_url,
          offer,
          description,
          business:businesses!inner(
            name,
            logo_url
          ),
          category:categories(
            name
          )
        `)
        .or(`description.ilike.%${searchIntent.searchQuery}%,businesses.name.ilike.%${searchIntent.searchQuery}%`)
        .limit(10);

      if (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        return [];
      }

      // Transform fallback data to match SearchResult interface
      return (fallbackData || []).map(post => ({
        id: post.id,
        photo_url: post.photo_url,
        offer: post.offer,
        description: post.description,
        business_name: post.business?.name || 'Unknown Business',
        business_logo_url: post.business?.logo_url || null,
        category_name: post.category?.name || null,
        relevance_score: 1.0 // Default score for fallback
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Generate AI response based on search results
export async function generateAIResponse(
  userQuery: string,
  searchResults: SearchResult[],
  searchIntent: SearchIntent
): Promise<string> {
  // Check if OpenAI API key is configured
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return generateFallbackResponse(userQuery, searchResults, searchIntent);
  }

  try {
    const resultsContext = searchResults.length > 0
      ? searchResults.map(result =>
          `- ${result.business_name}: ${result.description || 'Product listing'}${result.offer ? ` (${result.offer})` : ''}`
        ).join('\n')
      : 'No matching products found in the database.';

    const { text } = await generateText({
      model: openaiProvider('gpt-4o-mini'),
      system: `You are Localit AI, a helpful shopping assistant for Sarath City Capital Mall.

      Respond conversationally and helpfully about the search results.
      - If products are found, highlight the best options with business names and offers
      - Include relevant details like store locations (floor info if available)
      - Be enthusiastic about deals and offers
      - If no results, suggest alternative searches or related categories
      - Keep responses concise but informative
      - Use emojis sparingly for a friendly tone`,
      prompt: `User asked: "${userQuery}"

      Search intent: ${searchIntent.searchDescription}

      Found results:
      ${resultsContext}

      Provide a helpful response about these findings:`,
      temperature: 0.7,
    });

    return text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return generateFallbackResponse(userQuery, searchResults, searchIntent);
  }
}

// Fallback response generation without AI
function generateFallbackResponse(
  userQuery: string,
  searchResults: SearchResult[],
  searchIntent: SearchIntent
): string {
  if (searchResults.length === 0) {
    return `I searched for "${userQuery}" but couldn't find any matching products in our database right now. Try searching for related terms or browse our categories to discover great deals at Sarath City Capital Mall! 🛍️`;
  }

  const resultCount = searchResults.length;
  const businessNames = [...new Set(searchResults.map(r => r.business_name))];
  const hasOffers = searchResults.some(r => r.offer);

  let response = `🔍 I found ${resultCount} result${resultCount > 1 ? 's' : ''} for "${userQuery}"!\n\n`;

  // Highlight top results
  searchResults.slice(0, 3).forEach((result, index) => {
    response += `${index + 1}. **${result.business_name}**`;
    if (result.offer) {
      response += ` - ${result.offer}`;
    }
    if (result.description) {
      response += `\n   ${result.description.substring(0, 100)}${result.description.length > 100 ? '...' : ''}`;
    }
    response += '\n\n';
  });

  if (hasOffers) {
    response += '💰 Great deals available! ';
  }

  if (businessNames.length > 1) {
    response += `Found options across ${businessNames.length} different stores.`;
  }

  return response.trim();
}

// Main AI chat function
export async function processAIQuery(userQuery: string, videoContext?: VideoContext): Promise<AIResponse> {
  try {
    // Step 1: Generate search intent
    const searchIntent = await generateSearchIntent(userQuery, videoContext);

    if (!searchIntent) {
      // Non-retail query - provide a helpful redirect
      return {
        content: "I'm here to help you find products and deals around Sarath City Capital Mall! 🛍️ Try asking me about things like 'shoes', 'restaurants', 'electronics deals', or any specific product you're looking for."
      };
    }

    // Step 2: Search database
    const searchResults = await searchProducts(searchIntent);

    // Step 3: Generate AI response
    const aiResponse = await generateAIResponse(userQuery, searchResults, searchIntent);

    return {
      content: aiResponse,
      searchResults: searchResults.length > 0 ? searchResults : undefined
    };

  } catch (error) {
    console.error('Error processing AI query:', error);
    return {
      content: "I'm experiencing some technical difficulties. Please try your search again!"
    };
  }
}
