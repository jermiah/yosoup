import axios from 'axios';

class MCPService {
  constructor() {
    this.servers = {
      airbnb: import.meta.env.VITE_MCP_AIRBNB_URL,
      braveSearch: import.meta.env.VITE_MCP_BRAVE_SEARCH_URL,
      perplexity: import.meta.env.VITE_MCP_PERPLEXITY_URL,
      gmail: import.meta.env.VITE_MCP_GMAIL_URL,
      googleMaps: import.meta.env.VITE_MCP_GOOGLE_MAPS_URL,
      firecrawl: import.meta.env.VITE_MCP_FIRECRAWL_URL,
      youtube: import.meta.env.VITE_MCP_YOUTUBE_URL,
    };
  }

  // Generic method to call any MCP server
  async callTool(serverName, toolName, parameters) {
    const serverUrl = this.servers[serverName];
    if (!serverUrl) {
      throw new Error(`MCP server ${serverName} not configured`);
    }

    try {
      const response = await axios.post(`${serverUrl}/tools/${toolName}`, {
        arguments: parameters,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error(`Error calling ${serverName}.${toolName}:`, error);
      throw error;
    }
  }

  // Brave Search MCP methods
  async braveWebSearch(query, count = 10) {
    return this.callTool('braveSearch', 'brave_web_search', { query, count });
  }

  async braveImageSearch(query, count = 10) {
    return this.callTool('braveSearch', 'brave_image_search', { query, count });
  }

  async braveNewsSearch(query, count = 10) {
    return this.callTool('braveSearch', 'brave_news_search', { query, count });
  }

  // Perplexity MCP methods
  async perplexityAsk(messages) {
    return this.callTool('perplexity', 'perplexity_ask', { messages });
  }

  async perplexityResearch(messages) {
    return this.callTool('perplexity', 'perplexity_research', { messages });
  }

  // Gmail MCP methods
  async listGmailMessages(count = 10) {
    return this.callTool('gmail', 'listMessages', { count });
  }

  async findGmailMessage(query) {
    return this.callTool('gmail', 'findMessage', { query });
  }

  async sendGmail(to, subject, body, cc = null, bcc = null) {
    const params = { to, subject, body };
    if (cc) params.cc = cc;
    if (bcc) params.bcc = bcc;
    return this.callTool('gmail', 'sendMessage', params);
  }

  // Google Maps MCP methods
  async geocodeAddress(address) {
    return this.callTool('googleMaps', 'maps_geocode', { address });
  }

  async reverseGeocode(latitude, longitude) {
    return this.callTool('googleMaps', 'maps_reverse_geocode', { latitude, longitude });
  }

  async searchPlaces(query) {
    return this.callTool('googleMaps', 'maps_search_places', { query });
  }

  async getDirections(origin, destination, travelMode = 'DRIVE') {
    return this.callTool('googleMaps', 'maps_directions', { origin, destination, travelMode });
  }

  async getPlaceDetails(place_id) {
    return this.callTool('googleMaps', 'maps_place_details', { place_id });
  }

  // Firecrawl MCP methods
  async scrapeUrl(url, formats = ['markdown']) {
    return this.callTool('firecrawl', 'firecrawl_scrape', { url, formats });
  }

  async searchWeb(query, limit = 5, sources = ['web']) {
    return this.callTool('firecrawl', 'firecrawl_search', { query, limit, sources });
  }

  async mapWebsite(url) {
    return this.callTool('firecrawl', 'firecrawl_map', { url });
  }

  // YouTube MCP methods
  async getYouTubeTranscript(url, lang = 'en') {
    return this.callTool('youtube', 'get_transcript', { url, lang });
  }

  async getYouTubeTimedTranscript(url, lang = 'en') {
    return this.callTool('youtube', 'get_timed_transcript', { url, lang });
  }

  async getYouTubeVideoInfo(url) {
    return this.callTool('youtube', 'get_video_info', { url });
  }

  // Airbnb MCP methods (assuming similar structure to other MCP servers)
  async searchAirbnb(location, checkIn, checkOut, guests = 1) {
    return this.callTool('airbnb', 'search_listings', {
      location,
      checkIn,
      checkOut,
      guests
    });
  }
}

export const mcpService = new MCPService();
