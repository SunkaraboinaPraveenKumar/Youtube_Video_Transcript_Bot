import { YoutubeTranscript } from 'youtube-transcript';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get('url');

    if (!videoUrl) {
        return new NextResponse(
            JSON.stringify({ error: 'No URL provided' }),
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    }

    try {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        if (!videoId) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid YouTube URL' }),
                { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
            );
        }

        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        if (!transcript || transcript.length === 0) {
            return new NextResponse(
                JSON.stringify({ error: 'No transcript available' }),
                { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
            );
        }

        return new NextResponse(
            JSON.stringify({ result: transcript }),
            { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    }
}
