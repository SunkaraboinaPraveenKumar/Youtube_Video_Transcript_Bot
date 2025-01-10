import { NextResponse } from 'next/server';
const DDG = require('duck-duck-scrape');

export async function POST(req) {
  try {
    const { query } = await req.json();

    // Perform DuckDuckGo search with strict SafeSearch
    const searchResults = await DDG.search(query, {
      safeSearch: DDG.SafeSearchType.STRICT,
    });

    // Extract URLs from the search results
    // console.log(searchResults);
    // const urls = searchResults?.results?.map((r) => r.url) || [];

    // Respond with search results
    return NextResponse.json({ results: searchResults }, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to fetch web search results.' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
