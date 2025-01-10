import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, targetLanguage } = await req.json();
    console.log('Received:', { text, targetLanguage });

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Text and target language are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google-t5/t5-base",
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: `Translate to ${targetLanguage}: ${text}` }),
      }
    );

    const result = await response.json();
    console.log('Hugging Face API response:', result);

    if (response.ok) {
      return NextResponse.json({ translatedText: result[0]?.translation_text || "" });
    } else {
      return NextResponse.json(
        { error: result.error || "Translation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error during translation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
