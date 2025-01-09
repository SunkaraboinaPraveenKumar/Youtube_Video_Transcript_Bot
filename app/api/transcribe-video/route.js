// import { YoutubeTranscript } from 'youtube-transcript';
// import { NextResponse } from 'next/server';

// export async function GET(req) {
//     const url = new URL(req.url);
//     const videoUrl = url.searchParams.get('url');

//     if (!videoUrl) {
//         return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
//     }

//     try {
//         const videoId = videoUrl.split('v=')[1]?.split('&')[0];
//         if (!videoId) {
//             return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
//         }

//         const transcript = await YoutubeTranscript.fetchTranscript(videoId);

//         if (!transcript || transcript.length === 0) {
//             return NextResponse.json({ error: 'No transcript available' }, { status: 500 });
//         }

//         return NextResponse.json({ result: transcript });
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js/web';

export async function GET(req) {
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get('url');

    if (!videoUrl) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    try {
        // Extract the video ID from the URL
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        if (!videoId) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        // Create an Innertube instance
        const youtube = await Innertube.create({
            lang: 'en',
            location: 'IN',
            retrieve_player: false,
        });

        // Fetch video info and transcript using videoId
        const info = await youtube.getInfo(videoId);  // Use videoId here
        const transcriptData = await info.getTranscript();

        if (!transcriptData || transcriptData.transcript.content.body.initial_segments.length === 0) {
            return NextResponse.json({ error: 'No transcript available' }, { status: 500 });
        }

        // Extract the transcript text
        const transcript = transcriptData.transcript.content.body.initial_segments.map(
            (segment) => segment.snippet.text
        );

        return NextResponse.json({ result: transcript });
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

