import supabase from './supabase';

/**
 * Server-side URL scraper service that bypasses CORS restrictions
 * Uses Supabase to store and retrieve scraping results
 */

/**
 * Request a URL to be scraped server-side
 * @param {string} url - The URL to scrape
 * @param {Object} options - Scraping options
 * @returns {Promise<Object>} - The scraping request
 */
export const requestScrape = async (url, options = {}) => {
  try {
    // Normalize URL
    if (!url.match(/^https?:\/\/.+\..+/)) {
      url = 'https://' + url;
    }

    console.log('Requesting scrape for:', url);

    // Create a new scraping request
    const { data, error } = await supabase
      .from('scrape_requests_xyz123')
      .insert([{
        url,
        status: 'pending',
        result: options
      }])
      .select();

    if (error) {
      console.error('Database error in requestScrape:', error);
      throw new Error(`Failed to create scrape request: ${error.message}`);
    }

    console.log('Scrape request created:', data);
    return {
      success: true,
      message: 'Scraping request submitted',
      requestId: data?.[0]?.id || 'unknown',
      status: data?.[0]?.status || 'pending'
    };
  } catch (error) {
    console.error('Error in requestScrape:', error);
    throw new Error(`Failed to submit scraping request: ${error.message}`);
  }
};

/**
 * Scrape a URL with server-side processing (bypasses CORS)
 * @param {string} url - The URL to scrape
 * @param {Object} options - Scraping options
 * @returns {Promise<Object>} - The scraping result
 */
export const scrapeUrl = async (url, options = {}) => {
  try {
    // Get Supabase configuration
    const supabaseUrl = 'https://lvnaloakfwckpwxkunmi.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bmFsb2FrZndja3B3eGt1bm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTY5MzcsImV4cCI6MjA2NzY3MjkzN30.VZFrqhsOiuFpFoo5hDu7q9LDVbPrVVTpRQwOXY5H3Js';

    console.log('Starting scrape for:', url);
    
    // Create a new scraping request in the database first
    try {
      const request = await requestScrape(url, options);
      console.log('Scrape request created:', request);
    } catch (requestError) {
      console.error('Error creating scrape request:', requestError);
      // Continue even if request creation fails
    }

    // Call the serverless function to perform the scrape
    console.log('Calling serverless function at:', `${supabaseUrl}/functions/v1/scrape-url`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/scrape-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ url, options })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from scrape-url function:', errorText);
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Scrape result received:', result);

    return {
      success: true,
      message: 'URL scraped successfully',
      data: result,
      requestId: null
    };
    
  } catch (error) {
    console.error('Error in scrapeUrl:', error);
    return {
      success: false,
      message: error.message || 'Failed to scrape URL',
      error: error.message,
      technicalDetails: {
        url,
        supabaseConfigured: true
      }
    };
  }
};

/**
 * Extract information from scraped HTML using server-side processing
 * @param {string} url - The URL to scrape and extract from
 * @param {Object} extractionParams - Parameters for extraction
 * @returns {Promise<Object>} - The extracted information
 */
export const extractFromUrl = async (url, extractionParams = {}) => {
  try {
    // Get Supabase configuration
    const supabaseUrl = 'https://lvnaloakfwckpwxkunmi.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bmFsb2FrZndja3B3eGt1bm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTY5MzcsImV4cCI6MjA2NzY3MjkzN30.VZFrqhsOiuFpFoo5hDu7q9LDVbPrVVTpRQwOXY5H3Js';

    console.log('Starting extraction for:', url);
    console.log('Extraction parameters:', extractionParams);

    // Call the serverless function to perform the extraction
    console.log('Calling serverless function at:', `${supabaseUrl}/functions/v1/extract-info`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/extract-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ url, extractionParams })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from extract-info function:', errorText);
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Extraction result received:', result);

    return {
      success: true,
      message: 'Information extracted successfully',
      data: result.data,
      metadata: result.metadata
    };
    
  } catch (error) {
    console.error('Error in extractFromUrl:', error);
    return {
      success: false,
      message: error.message || 'Failed to extract information',
      error: error.message,
      technicalDetails: {
        url,
        supabaseConfigured: true
      }
    };
  }
};