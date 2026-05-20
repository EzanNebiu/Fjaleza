/**
 * Albanian Wiktionary API client
 * Fetches page titles from sq.wiktionary.org using MediaWiki Action API
 */

import type { WikiAllPagesResponse } from '../../types/wiktionary';

const WIKTIONARY_API_URL = 'https://sq.wiktionary.org/w/api.php';
const MAX_PAGES_TO_FETCH = 50000; // Safety limit to avoid infinite loops
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Fetch all page titles from Albanian Wiktionary
 * Uses pagination to fetch all pages in the main namespace (ns=0)
 */
export async function fetchAllWiktionaryPages(): Promise<string[]> {
  const allTitles: string[] = [];
  let continueToken: string | undefined;
  let pagesFetched = 0;

  console.log('Starting Wiktionary fetch...');

  while (pagesFetched < MAX_PAGES_TO_FETCH) {
    try {
      const titles = await fetchPageBatch(continueToken);
      
      if (titles.length === 0) {
        // No more pages
        break;
      }

      allTitles.push(...titles);
      pagesFetched += titles.length;

      console.log(`Fetched ${pagesFetched} pages so far...`);

      // Check if there's a continue token for next batch
      const response = await makeWiktionaryRequest(continueToken);
      continueToken = response.continue?.apcontinue;

      if (!continueToken) {
        // No more pages to fetch
        break;
      }

      // Small delay to be respectful to the API
      await delay(100);
    } catch (error) {
      console.error('Error fetching Wiktionary batch:', error);
      throw error;
    }
  }

  console.log(`Completed: fetched ${allTitles.length} total pages from Wiktionary`);
  return allTitles;
}

/**
 * Fetch a single batch of pages
 */
async function fetchPageBatch(continueToken?: string): Promise<string[]> {
  const response = await makeWiktionaryRequest(continueToken);
  return response.query.allpages.map(page => page.title);
}

/**
 * Make a request to the Wiktionary API with retry logic
 */
async function makeWiktionaryRequest(
  continueToken?: string,
  retryCount = 0
): Promise<WikiAllPagesResponse> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'allpages',
    apnamespace: '0', // Main namespace only
    aplimit: 'max',   // Get as many as possible per request
    format: 'json',
    origin: '*',      // Required for CORS
  });

  if (continueToken) {
    params.set('apcontinue', continueToken);
  }

  const url = `${WIKTIONARY_API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: WikiAllPagesResponse = await response.json();
    return data;
  } catch (error) {
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.warn(`Request failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY * (retryCount + 1));
      return makeWiktionaryRequest(continueToken, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Simple delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test connection to Wiktionary API
 * Returns true if API is accessible
 */
export async function testWiktionaryConnection(): Promise<boolean> {
  try {
    const response = await makeWiktionaryRequest();
    return response.query.allpages.length > 0;
  } catch (error) {
    console.error('Wiktionary connection test failed:', error);
    return false;
  }
}
