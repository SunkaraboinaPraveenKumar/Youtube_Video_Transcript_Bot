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

import { Innertube } from 'youtubei.js/web';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Parse the request URL
        const url = new URL(req.url);
        const videoUrl = url.searchParams.get('url');

        if (!videoUrl) {
            return NextResponse.json(
                { error: 'No URL provided' },
                { status: 400 }
            );
        }

        // Initialize the Innertube client
        const youtube = await Innertube.create({
            lang: 'en',
            location: 'US',
            retrieve_player: false,
        });

        // Fetch video information and transcript
        const info = await youtube.getInfo(videoUrl);
        const transcriptData = await info.getTranscript();

        // Check if transcript is available
        if (!transcriptData || !transcriptData.transcript) {
            return NextResponse.json(
                { error: 'Transcript not available for this video' },
                { status: 404 }
            );
        }

        // Extract and map transcript content
        const transcript = transcriptData.transcript.content.body.initial_segments.map(
            (segment) => segment.snippet.text
        );

        return NextResponse.json({ result: transcript }, { status: 200 });
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return NextResponse.json(
            { error: error.message || 'An unknown error occurred' },
            { status: 500 }
        );
    }
}
``
