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
  business_id: string;
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
const SYSTEM_PROMPT = `You are Localit AI, a smart shopping assistant for hyperlocal retail discovery. Your role is to help users find products, deals, and businesses in their local area.

CONTEXT:
- Localit is a hyperlocal retail discovery app that connects users with local businesses
- Users can search for products, businesses, categories, and deals across various locations
- The database contains posts (product listings) from businesses with categories across different regions
- Available data: business names, product descriptions, offers, categories, locations

YOUR TASKS:
1. Understand if the user query is related to local retail/shopping
2. Extract search intent and generate appropriate database queries
3. Provide helpful, conversational responses about found products/deals
4. When video context is provided, use the video summary to enhance search relevance

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

User: "Find stores mentioned in this video" (with video context)
Response: {"searchQuery": "[brands/products from video summary]", "searchDescription": "Searching for businesses and products mentioned in the video", "categoryHint": "[relevant category]"}

GUIDELINES:
- Always be helpful and conversational
- Focus on local retail context across all available locations
- If query is not retail-related, politely redirect to shopping topics
- Use synonyms and related terms in searchQuery for better results
- When video context is available, incorporate relevant details from the video summary
- Keep searchDescription user-friendly for the thinking mode display`;

// Generate search intent from user query
export async function generateSearchIntent(userQuery: string, videoContext?: VideoContext): Promise<SearchIntent | null> {
  console.log('🎯 Generating search intent for:', userQuery);
  console.log('📹 Video context available:', !!videoContext);

  // Check if OpenAI API key is configured
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.log('🔑 OpenAI API key not configured, using fallback logic');
    const fallbackIntent = generateFallbackSearchIntent(userQuery, videoContext);
    console.log('🔄 Fallback search intent:', fallbackIntent);
    return fallbackIntent;
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

Based on this video content and the user's query, help them find related products, stores, or businesses mentioned in the video or similar to what's shown. Extract relevant brand names, product types, store names, and categories from the video summary to create comprehensive search terms.`;
      } else {
        prompt += `

The user is asking about a video but no summary is available yet. Focus on the user's query and general retail search intent.`;
      }
    }

    prompt += `

Analyze this query and determine if it's related to shopping/retail. If yes, extract the search intent as JSON with optimized search terms that include:
- Direct keywords from the user query
- Related terms and synonyms
- Brand names or store names from video context (if available)
- Product categories and types
- Alternative search terms that might match database content

If not retail-related, return null.`;

    console.log('🤖 Sending prompt to OpenAI:', prompt);

    const { text } = await generateText({
      model: openaiProvider('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      prompt: prompt,
      temperature: 0.3,
    });

    console.log('🤖 OpenAI response:', text);

    // Try to parse JSON response - handle markdown code blocks
    try {
      // Strip markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      console.log('🧹 Cleaned text for parsing:', cleanText);

      const parsed = JSON.parse(cleanText);
      console.log('✅ Parsed JSON:', parsed);
      if (parsed && parsed.searchQuery && parsed.searchDescription) {
        return parsed as SearchIntent;
      }
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError);
      console.log('📝 Original text:', text);
      // If not JSON, treat as non-retail query
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error generating search intent:', error);
    // Fallback to simple logic if AI fails
    return generateFallbackSearchIntent(userQuery, videoContext);
  }
}

// Fallback search intent generation without AI
function generateFallbackSearchIntent(userQuery: string, videoContext?: VideoContext): SearchIntent | null {
  const query = userQuery.toLowerCase().trim();
  console.log('🔄 Fallback search intent for query:', query);

  // Expanded keyword-based detection for retail queries
  const retailKeywords = [
    'buy', 'shop', 'store', 'stores', 'deal', 'offer', 'price', 'sale', 'discount',
    'shoe', 'shoes', 'clothes', 'clothing', 'food', 'restaurant', 'restaurants',
    'electronics', 'phone', 'laptop', 'dress', 'shirt', 'bag', 'watch', 'jewelry',
    'book', 'toy', 'gift', 'find', 'search', 'looking', 'need', 'want',
    'product', 'products', 'business', 'businesses', 'mall', 'market', 'cafe',
    'outlet', 'brand', 'brands', 'shopping', 'purchase', 'item', 'items'
  ];

  const isRetailQuery = retailKeywords.some(keyword => query.includes(keyword));
  console.log('🏪 Is retail query:', isRetailQuery);

  // If we have video context, it's likely a retail query
  const hasVideoContext = videoContext && videoContext.summary;
  console.log('📹 Has video context:', hasVideoContext);

  // Be more inclusive - if it has video context OR retail keywords OR mentions location, treat as retail
  const mentionsLocation = /\b(in|at|near|around|gachibowli|hyderabad|mall|area|location)\b/.test(query);
  console.log('📍 Mentions location:', mentionsLocation);

  if (!isRetailQuery && !hasVideoContext && !mentionsLocation && query.length < 3) {
    console.log('❌ Query too short and no indicators');
    return null; // Too short and no retail keywords or video context
  }

  // Enhanced search query with video context
  let searchQuery = userQuery;
  let searchDescription = `Searching for "${userQuery}" in local businesses`;

  if (hasVideoContext) {
    // Extract potential search terms from video summary and title
    const summary = videoContext.summary!.toLowerCase();
    const title = videoContext.title.toLowerCase();

    const businessTerms = ['store', 'shop', 'mall', 'restaurant', 'cafe', 'outlet', 'market', 'lounge', 'kitchen'];
    const productTerms = ['product', 'item', 'brand', 'clothing', 'food', 'electronics', 'accessories'];

    const hasBusinessTerms = businessTerms.some(term => summary.includes(term) || title.includes(term));
    const hasProductTerms = productTerms.some(term => summary.includes(term) || title.includes(term));

    console.log('🏢 Has business terms:', hasBusinessTerms);
    console.log('📦 Has product terms:', hasProductTerms);

    if (hasBusinessTerms || hasProductTerms) {
      // Extract key terms from video title and summary
      const titleWords = videoContext.title.split(' ').filter(word => word.length > 3);
      searchQuery = `${userQuery} ${titleWords.slice(0, 3).join(' ')}`.trim();
      searchDescription = `Searching for businesses and products from the video: "${videoContext.title}"`;
    }
  }

  const result = {
    searchQuery,
    searchDescription,
    categoryHint: undefined
  };

  console.log('✅ Generated fallback search intent:', result);
  return result;
}

// Search products and businesses in database
export async function searchProducts(searchIntent: SearchIntent): Promise<SearchResult[]> {
  try {
    console.log('🔍 Searching posts with term:', searchIntent.searchQuery);

    // Try the advanced search function first for posts
    const { data: postsData, error: postsError } = await (supabase as any).rpc('search_posts', {
      search_term: searchIntent.searchQuery,
      category_filter: null,
      result_limit: 8,
      result_offset: 0
    });

    console.log('📝 Posts search result:', { postsData, postsError });

    // Also try to search businesses directly
    const { data: businessesData, error: businessesError } = await (supabase as any).rpc('search_businesses', {
      search_term: searchIntent.searchQuery,
      category_filter: null,
      result_limit: 5,
      result_offset: 0
    });

    console.log('🏢 Businesses search result:', { businessesData, businessesError });

    let allResults: SearchResult[] = [];

    // Add posts results
    if (!postsError && postsData) {
      allResults = [...postsData];
    }

    // Add business results (convert to SearchResult format)
    if (!businessesError && businessesData) {
      const businessResults: SearchResult[] = businessesData.map((business: any) => ({
        id: `business-${business.id}`,
        photo_url: business.logo_url || business.cover_photo_url || '',
        offer: business.current_offer,
        description: business.description || `${business.name} - Local business`,
        business_name: business.name,
        business_id: business.id,
        business_logo_url: business.logo_url,
        category_name: 'Business',
        relevance_score: business.relevance_score || 1.0
      }));
      allResults = [...allResults, ...businessResults];
    }

    // If advanced search worked for either, return combined results
    if (allResults.length > 0) {
      // Sort by relevance score if available
      return allResults.sort((a, b) => (b.relevance_score || 1.0) - (a.relevance_score || 1.0));
    }

    // Fallback to basic search if advanced search functions don't exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('posts')
      .select(`
        id,
        photo_url,
        offer,
        description,
        business_id,
        business:businesses!inner(
          id,
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
      business_id: post.business?.id || post.business_id || '',
      business_logo_url: post.business?.logo_url || null,
      category_name: post.category?.name || null,
      relevance_score: 1.0 // Default score for fallback
    }));
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
      system: `You are Localit AI, a helpful shopping assistant for hyperlocal retail discovery.

      Respond conversationally and helpfully about the search results.
      - If products are found, highlight the best options with business names and offers
      - Include relevant details like store locations and regions when available
      - Be enthusiastic about deals and offers
      - If no results, suggest alternative searches or related categories
      - Keep responses concise but informative
      - Use emojis sparingly for a friendly tone
      - Focus on helping users discover local businesses and products`,
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
    return `I searched for "${userQuery}" but couldn't find any matching products in our database right now. Try searching for related terms or browse our categories to discover great deals from local businesses! 🛍️`;
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
    console.log('🔍 Processing AI query:', userQuery);
    console.log('📹 Video context:', videoContext);

    // Step 1: Generate search intent
    const searchIntent = await generateSearchIntent(userQuery, videoContext);
    console.log('🎯 Generated search intent:', searchIntent);

    if (!searchIntent) {
      console.log('❌ No search intent generated - non-retail query');
      // Non-retail query - provide a helpful redirect
      return {
        content: "I'm here to help you find products and deals from local businesses! 🛍️ Try asking me about things like 'shoes', 'restaurants', 'electronics deals', or any specific product you're looking for."
      };
    }

    // Step 2: Search database
    console.log('🔎 Searching database with query:', searchIntent.searchQuery);
    const searchResults = await searchProducts(searchIntent);
    console.log('📊 Search results found:', searchResults.length, searchResults);

    // Step 3: Generate AI response
    const aiResponse = await generateAIResponse(userQuery, searchResults, searchIntent);
    console.log('🤖 Generated AI response:', aiResponse);

    return {
      content: aiResponse,
      searchResults: searchResults.length > 0 ? searchResults : undefined
    };

  } catch (error) {
    console.error('❌ Error processing AI query:', error);
    return {
      content: "I'm experiencing some technical difficulties. Please try your search again!"
    };
  }
}
