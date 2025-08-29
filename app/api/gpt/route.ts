import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// API anahtarını ortam değişkenlerinden oku
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

     if (!process.env.OPENAI_API_KEY) {
       return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
     }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
        return NextResponse.json({ error: 'Failed to get response from OpenAI' }, { status: 500 });
    }

    return NextResponse.json({ response: responseContent });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
     let errorMessage = 'Internal Server Error';
     if (error instanceof Error) {
       errorMessage = error.message;
     }
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
} 