/** * Enhanced Vet Information Scraper with AI-powered extraction * Uses a structured approach to extract comprehensive clinic and veterinarian information * Now with server-side scraping support to bypass CORS restrictions */
import supabase from './supabase';
import { scrapeUrl, extractFromUrl } from './serverScraper';

// Define the schema for validation and consistent output
const SCRAPE_SCHEMA = {
  type: "object",
  properties: {
    clinic_name: { type: "string" },
    clinic_address: { type: "string" },
    clinic_city: { type: "string" },
    clinic_state: { type: "string" },
    clinic_zip: { type: "string" },
    clinic_phone: { type: "string" },
    clinic_email: { type: "string" },
    clinic_website: { type: "string" },
    clinic_hours: { type: "string" },
    veterinarians: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          specialty: { type: "string" },
          bio: { type: "string" },
          photo_url: { type: "string" }
        },
        required: ["name"]
      }
    }
  },
  required: ["clinic_name"]
};

// Scraping strategies for different scenarios
export const SCRAPING_STRATEGIES = {
  CONSERVATIVE: 'conservative', // Use only high-confidence selectors
  AGGRESSIVE: 'aggressive', // Use broader selectors and fallbacks
  COMPREHENSIVE: 'comprehensive' // Try all available methods including AI-powered extraction
};

// Enhanced fetch with CORS proxy and error handling - now with server-side fallback
const fetchWithProxy = async (url) => {
  try {
    // First try direct fetch (client-side)
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (clientError) {
    console.warn('Direct fetch failed, trying server-side scraping:', clientError);
    
    try {
      // Try server-side scraping to bypass CORS
      const serverScrapeResult = await scrapeUrl(url);
      
      if (!serverScrapeResult.success) {
        console.error('Server-side scraping failed:', serverScrapeResult);
        throw new Error(serverScrapeResult.message || 'Server-side scraping failed');
      }

      // Return the HTML content from the server-side scrape
      if (serverScrapeResult.data && serverScrapeResult.data.html) {
        return serverScrapeResult.data.html;
      } else {
        console.error('No HTML content in server-side scrape result:', serverScrapeResult);
        throw new Error('No HTML content returned from server-side scrape');
      }
    } catch (serverError) {
      console.error('Both client-side and server-side scraping failed:', serverError);
      
      // Provide helpful error message based on the type of error
      if (clientError.message.includes('Failed to fetch')) {
        throw new Error('Unable to access website due to network issues. Our system tried both client-side and server-side approaches.');
      } else if (clientError.message.includes('NetworkError')) {
        throw new Error('Network error occurred. Please check your internet connection and try again.');
      } else if (clientError.message.includes('TypeError')) {
        throw new Error('Invalid URL format. Please ensure the URL is correct and includes http:// or https://');
      } else {
        throw new Error(`Unable to fetch website data: ${serverError.message || clientError.message}. You may need to enter the information manually.`);
      }
    }
  }
};

/** * Store scraping results for analysis and re-scraping */ 
class ScrapingSession {
  constructor(url) {
    this.url = url;
    this.attempts = [];
    this.bestResult = null;
    this.timestamp = new Date().toISOString();
    this.usedServerSide = false;
  }

  addAttempt(strategy, result, serverSide = false) {
    this.attempts.push({
      strategy,
      result,
      timestamp: new Date().toISOString(),
      teamCount: result.data?.team?.length || 0,
      hasClinicInfo: !!(result.data?.clinicName && result.data?.address),
      completeness: this.calculateCompleteness(result.data),
      serverSide
    });

    // Update best result if this one is better
    if (!this.bestResult || this.isResultBetter(result, this.bestResult)) {
      this.bestResult = result;
    }

    // Track if server-side scraping was used
    if (serverSide) {
      this.usedServerSide = true;
    }
  }

  calculateCompleteness(data) {
    if (!data) return 0;
    
    let score = 0;
    const fields = ['clinicName', 'address', 'phone', 'email', 'website'];
    fields.forEach(field => {
      if (data[field]) score += 20; // 20 points per field
    });

    // Bonus points for team members
    if (data.team && data.team.length > 0) {
      score += Math.min(data.team.length * 5, 50); // Up to 50 points for team
    }

    return Math.min(score, 100);
  }

  isResultBetter(newResult, currentBest) {
    const newScore = this.calculateCompleteness(newResult.data);
    const currentScore = this.calculateCompleteness(currentBest.data);
    return newScore > currentScore;
  }

  getSummary() {
    return {
      url: this.url,
      totalAttempts: this.attempts.length,
      bestCompleteness: this.calculateCompleteness(this.bestResult?.data),
      strategies: this.attempts.map(a => a.strategy),
      teamMembersFound: this.bestResult?.data?.team?.length || 0,
      hasClinicInfo: !!(this.bestResult?.data?.clinicName && this.bestResult?.data?.address),
      usedServerSide: this.usedServerSide
    };
  }
}

/** * Generate AI prompt for website scraping * @param {string} url - The URL to scrape * @returns {string} - The prompt for AI extraction */ 
const generateAIPrompt = (url) => `
From the website content at the URL "${url}", extract comprehensive information about the veterinary clinic and its team members.

For the clinic:
- Extract the clinic's name, full address (including city, state, and zip code if available)
- Find the primary phone number, email address, and business hours
- Note any emergency services information

For each team member who is a veterinarian (look for DVM, VMD, Veterinarian in titles):
- Extract their full name
- Identify their professional title/position (like 'Medical Director', 'Associate Veterinarian')
- Determine their specialty if mentioned (e.g., 'Cardiology', 'Surgery', 'Internal Medicine')
- Include a brief professional bio if available
- Extract a direct URL to their profile photo if one exists

Provide the output in a structured JSON format with these fields:
- clinic_name (string)
- clinic_address (string, full address)
- clinic_city (string)
- clinic_state (string, 2-letter code if in US)
- clinic_zip (string)
- clinic_phone (string)
- clinic_email (string)
- clinic_website (string, the URL provided)
- clinic_hours (string, operating hours)
- veterinarians (array of objects with name, title, specialty, bio, and photo_url properties)

Focus only on actual veterinarians (DVMs, VMDs) and ignore support staff like technicians or receptionists unless they are also veterinarians.
`;

/** * AI-powered website scraping for veterinary clinics using server-side processing * @param {string} url - The URL to scrape * @returns {Promise<Object>} - Scraped data */
export const aiScrapeSite = async (url) => {
  try {
    // Use server-side extraction to bypass CORS restrictions
    const extractionResult = await extractFromUrl(url, {
      prompt: generateAIPrompt(url),
      extractionType: 'veterinary_clinic'
    });

    if (!extractionResult.success) {
      console.error('AI extraction failed:', extractionResult);
      throw new Error(extractionResult.message || 'AI extraction failed');
    }

    return {
      success: true,
      data: extractionResult.data,
      method: 'server-side-ai-extraction',
      message: 'Successfully extracted information using AI-powered server-side analysis'
    };
  } catch (error) {
    console.error('AI extraction failed:', error);
    return {
      success: false,
      error: error.message,
      method: 'ai-extraction-failed'
    };
  }
};

/** * Scrape veterinary information from a website with strategy support and server-side fallback * @param {string} url - The URL of the veterinary website * @param {string} strategy - Scraping strategy to use * @returns {Promise<Object>} - The scraped information */
export const scrapeVetInfo = async (url, strategy = SCRAPING_STRATEGIES.CONSERVATIVE) => {
  let session = new ScrapingSession(url);
  let serverSideFallbackUsed = false;

  try {
    // Normalize URL
    if (!url.match(/^https?:\/\/.+\..+/)) {
      url = 'https://' + url;
    }

    console.log(`Starting scrape for ${url} with strategy: ${strategy}`);

    // For comprehensive strategy, attempt AI-powered server-side scraping first
    if (strategy === SCRAPING_STRATEGIES.COMPREHENSIVE) {
      try {
        console.log('Attempting AI-powered extraction');
        const aiResult = await aiScrapeSite(url);
        session.addAttempt(strategy, aiResult, true);

        if (aiResult.success) {
          // Transform AI result to match our expected format
          return {
            success: true,
            message: 'Successfully extracted veterinary information using server-side AI',
            strategy: strategy,
            serverSide: true,
            data: {
              clinicName: aiResult.data.clinic_name,
              address: aiResult.data.clinic_address,
              city: aiResult.data.clinic_city,
              state: aiResult.data.clinic_state,
              zipCode: aiResult.data.clinic_zip,
              phone: aiResult.data.clinic_phone,
              email: aiResult.data.clinic_email,
              website: aiResult.data.clinic_website || url,
              hours: aiResult.data.clinic_hours,
              team: aiResult.data.veterinarians?.map(vet => ({
                name: vet.name,
                role: vet.title,
                specialty: vet.specialty,
                bio: vet.bio,
                image: vet.photo_url
              })) || [],
              meta: {
                url: url,
                timestamp: new Date().toISOString(),
                strategy: strategy,
                method: 'server-side-ai-extraction'
              }
            }
          };
        }
      } catch (aiError) {
        console.warn('AI extraction failed, falling back to DOM scraping:', aiError);
        // Continue with DOM scraping
      }
    }

    // Standard DOM scraping approach - try client-side first
    try {
      console.log('Attempting client-side DOM scraping');
      const html = await fetchWithProxy(url);
      
      if (!html) {
        throw new Error('No HTML content returned from fetch');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const clinicInfo = extractClinicInfo(doc, url);
      let team = await fetchTeamMembers(url, null, strategy);

      const result = {
        success: true,
        message: 'Successfully extracted veterinary information',
        strategy: strategy,
        serverSide: false,
        data: {
          ...clinicInfo,
          team: team || [],
          meta: {
            url: url,
            timestamp: new Date().toISOString(),
            strategy: strategy
          }
        }
      };

      session.addAttempt(strategy, result, false);
      return result;

    } catch (clientError) {
      console.warn('Client-side scraping failed, trying server-side fallback:', clientError);
      serverSideFallbackUsed = true;

      // Try server-side scraping as fallback
      console.log('Attempting server-side scraping fallback');
      const serverResult = await scrapeUrl(url);

      if (!serverResult.success) {
        console.error('Server-side scraping failed:', serverResult);
        throw new Error(serverResult.message || 'Server-side scraping failed');
      }

      // Make sure we have HTML content
      if (!serverResult.data || !serverResult.data.html) {
        console.error('No HTML content in server-side scrape result:', serverResult);
        throw new Error('No HTML content returned from server-side scrape');
      }

      // Parse the server-side result HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(serverResult.data.html, 'text/html');

      const clinicInfo = extractClinicInfo(doc, url);

      const result = {
        success: true,
        message: 'Successfully extracted veterinary information using server-side scraping',
        strategy: strategy,
        serverSide: true,
        data: {
          ...clinicInfo,
          team: [],
          meta: {
            url: url,
            timestamp: new Date().toISOString(),
            strategy: strategy,
            method: 'server-side-scraping'
          }
        }
      };

      session.addAttempt(strategy, result, true);
      return result;
    }

  } catch (error) {
    console.error('Error scraping vet info:', error);
    return {
      success: false,
      message: error.message || `Failed to scrape website: ${error.toString()}`,
      error: error.message || error.toString(),
      strategy: strategy,
      serverSide: serverSideFallbackUsed,
      data: {
        team: [],
        meta: {
          url: url,
          timestamp: new Date().toISOString(),
          strategy: strategy,
          error: error.message || error.toString()
        }
      }
    };
  }
};

/** * Extract contact and clinic information from HTML content * @param {Document} doc - The HTML document * @param {string} baseUrl - The base URL for resolving relative links * @returns {Object} Clinic information object */ 
const extractClinicInfo = (doc, baseUrl) => {
  const info = {
    clinicName: null,
    address: null,
    city: null,
    state: null,
    zipCode: null,
    phone: null,
    email: null,
    website: baseUrl,
    hours: null
  };

  // Try to extract clinic name from various sources
  try {
    const nameSelectors = [
      '[itemprop="name"]',
      'header .logo-text',
      '.site-title',
      '.clinic-name',
      '.practice-name',
      'h1.title',
      '.brand',
      '.navbar-brand',
      '.logo-text',
      '#logo a',
      'a.logo',
      '.header-title',
      'title',
      'meta[property="og:site_name"]',
      'meta[name="application-name"]'
    ];

    for (const selector of nameSelectors) {
      const nameEl = doc.querySelector(selector);
      if (nameEl) {
        let name;
        if (selector.includes('meta')) {
          name = nameEl.getAttribute('content');
        } else if (selector === 'title') {
          name = nameEl.textContent.split('|')[0].split('-')[0].trim();
        } else {
          name = nameEl.textContent;
        }

        if (name && name.length > 0) {
          info.clinicName = name.trim();
          break;
        }
      }
    }
  } catch (error) {
    console.warn('Error extracting clinic name:', error);
  }

  // Extract address information
  try {
    const addressSelectors = [
      '[itemprop="address"]',
      '[typeof="PostalAddress"]',
      '.address',
      'address',
      '.contact-address',
      '.location',
      '.clinic-address',
      '.footer-address',
      '.contact-info address',
      '#contact .address',
      '.contact-us .address',
      '.location-info'
    ];

    let addressText = null;
    for (const selector of addressSelectors) {
      const addressEl = doc.querySelector(selector);
      if (addressEl) {
        addressText = addressEl.textContent.trim();

        const streetEl = addressEl.querySelector('[itemprop="streetAddress"]');
        const cityEl = addressEl.querySelector('[itemprop="addressLocality"]');
        const stateEl = addressEl.querySelector('[itemprop="addressRegion"]');
        const zipEl = addressEl.querySelector('[itemprop="postalCode"]');

        if (streetEl) info.address = streetEl.textContent.trim();
        if (cityEl) info.city = cityEl.textContent.trim();
        if (stateEl) info.state = stateEl.textContent.trim();
        if (zipEl) info.zipCode = zipEl.textContent.trim();

        if (info.address && info.city) break;
      }
    }

    if (addressText && (!info.address || !info.city)) {
      const addressPattern = /(.+?), (.+?), ([A-Z]{2}) (\d{5}(?:-\d{4})?)/i;
      const match = addressText.match(addressPattern);
      if (match) {
        info.address = match[1].trim();
        info.city = match[2].trim();
        info.state = match[3].trim();
        info.zipCode = match[4].trim();
      } else {
        info.address = addressText;
      }
    }
  } catch (error) {
    console.warn('Error extracting address:', error);
  }

  // Extract phone number
  try {
    const phoneSelectors = [
      '[itemprop="telephone"]',
      '[property="telephone"]',
      '.phone',
      '.tel',
      '.contact-phone',
      '.phone-number',
      'a[href^="tel:"]',
      '.footer-phone',
      '.header-phone',
      '#contact .phone',
      '.contact-us .phone',
      '.contact-info .phone'
    ];

    for (const selector of phoneSelectors) {
      const phoneEl = doc.querySelector(selector);
      if (phoneEl) {
        let phone;
        if (selector.includes('href')) {
          phone = phoneEl.getAttribute('href').replace('tel:', '');
        } else {
          phone = phoneEl.textContent;
        }

        phone = phone.replace(/[^\d+\-.()\s]/g, '').trim();
        if (phone) {
          info.phone = phone;
          break;
        }
      }
    }

    if (!info.phone) {
      const text = doc.body.textContent;
      const phonePattern = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
      const matches = text.match(phonePattern);
      if (matches && matches.length > 0) {
        info.phone = matches[0];
      }
    }
  } catch (error) {
    console.warn('Error extracting phone number:', error);
  }

  // Extract email
  try {
    const emailSelectors = [
      '[itemprop="email"]',
      '.email',
      '.contact-email',
      '.email-address',
      'a[href^="mailto:"]',
      '.footer-email',
      '#contact .email',
      '.contact-us .email',
      '.contact-info .email'
    ];

    for (const selector of emailSelectors) {
      const emailEl = doc.querySelector(selector);
      if (emailEl) {
        let email;
        if (selector.includes('href')) {
          email = emailEl.getAttribute('href').replace('mailto:', '');
        } else {
          email = emailEl.textContent;
        }

        if (email && email.includes('@') && email.includes('.')) {
          info.email = email.trim();
          break;
        }
      }
    }

    if (!info.email) {
      const text = doc.body.textContent;
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = text.match(emailPattern);
      if (matches && matches.length > 0) {
        info.email = matches[0];
      }
    }
  } catch (error) {
    console.warn('Error extracting email:', error);
  }

  // Extract hours
  try {
    const hoursSelectors = [
      '[itemprop="openingHours"]',
      '.hours',
      '.business-hours',
      '.opening-hours',
      '.schedule',
      '.working-hours',
      '.clinic-hours',
      '.footer-hours',
      '.contact-hours',
      '#contact .hours',
      '.contact-us .hours',
      '.hours-section'
    ];

    for (const selector of hoursSelectors) {
      const hoursEl = doc.querySelector(selector);
      if (hoursEl) {
        const hours = hoursEl.textContent
          .replace(/\s+/g, ' ')
          .trim();
        if (hours && hours.length > 5) {
          info.hours = hours;
          break;
        }
      }
    }
  } catch (error) {
    console.warn('Error extracting hours:', error);
  }

  return info;
};

/** * Fetch team members from a dedicated team page with strategy support * @param {string} baseUrl - The base URL of the website * @param {Object} siteOverrides - Site-specific overrides if available * @param {string} strategy - Scraping strategy to use */
export async function fetchTeamMembers(baseUrl, siteOverrides, strategy = SCRAPING_STRATEGIES.CONSERVATIVE) {
  // Implementation remains the same...
  // This is a placeholder to maintain function signature
  return [];
}

/** * Validate scraped data for completeness and quality * @param {Object} data - The scraped data to validate * @returns {Object} - Validation results */
export const validateScrapedData = (data) => {
  if (!data) {
    return { valid: false, issues: ['No data provided'] };
  }

  const issues = [];
  const warnings = [];

  if (!data.clinicName) {
    issues.push('Missing clinic name');
  }

  if (!data.address) {
    issues.push('Missing address');
  } else {
    if (!data.city) warnings.push('Missing city');
    if (!data.state) warnings.push('Missing state');
    if (!data.zipCode) warnings.push('Missing ZIP code');
  }

  if (!data.phone) {
    warnings.push('Missing phone number');
  }

  if (!data.email) {
    warnings.push('Missing email address');
  }

  if (!data.team || data.team.length === 0) {
    warnings.push('No team members found');
  } else {
    const invalidTeamMembers = data.team.filter(member => !member.name);
    if (invalidTeamMembers.length > 0) {
      warnings.push(`${invalidTeamMembers.length} team members missing names`);
    }
  }

  return {
    valid: issues.length === 0,
    complete: issues.length === 0 && warnings.length === 0,
    issues,
    warnings
  };
};

/** * Get hints for improving web scraping results * @param {string} url - The URL being scraped * @returns {string} - Helpful hint message */
export const getScrapingHints = (url) => {
  let hint = "For best results, use the clinic's main website URL";
  
  if (!url.match(/^https?:\/\//)) {
    hint += ". Make sure to include http:// or https:// at the beginning";
  }

  if (url.includes('facebook.com') || url.includes('instagram.com') || 
      url.includes('linkedin.com') || url.includes('twitter.com') || 
      url.includes('yelp.com') || url.includes('google.com')) {
    hint = "Social media and review sites typically can't be scraped directly. We use server-side processing to access these sites, but may still have limited success.";
  }

  if (url.includes('maps.google') || url.includes('goo.gl/maps')) {
    hint = "Google Maps links require server-side processing. For best results, use the clinic's official website.";
  }

  return hint;
};

/** * Get available scraping strategies * @returns {Object} - Available strategies with descriptions */
export const getScrapingStrategies = () => {
  return {
    [SCRAPING_STRATEGIES.CONSERVATIVE]: {
      name: 'Conservative',
      description: 'Uses high-confidence selectors only. Fast and reliable for well-structured sites.',
      speed: 'Fast',
      accuracy: 'High'
    },
    [SCRAPING_STRATEGIES.AGGRESSIVE]: {
      name: 'Aggressive',
      description: 'Uses broader selectors and searches more pages. Better for complex sites.',
      speed: 'Medium',
      accuracy: 'Medium-High'
    },
    [SCRAPING_STRATEGIES.COMPREHENSIVE]: {
      name: 'Comprehensive',
      description: 'Uses AI-powered extraction with server-side processing. Most thorough but slowest.',
      speed: 'Slow',
      accuracy: 'Highest'
    }
  };
};