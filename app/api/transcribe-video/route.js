import { YoutubeTranscript } from 'youtube-transcript';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get('url');

    if (!videoUrl) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    try {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        if (!videoId) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        // Fetch the transcript
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        if (!transcript || transcript.length === 0) {
            return NextResponse.json({ error: 'Transcript not available or disabled' }, { status: 404 });
        }

        return NextResponse.json({ result: transcript });
    } catch (error) {
        if (error.message.includes('Transcript is disabled')) {
            return NextResponse.json({ error: 'Transcript is disabled for this video' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
    }
}
