import { genAI } from "@/lib/gemini"
import { pinecone } from "@/lib/pinecone"
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { PineconeStore } from "@langchain/pinecone"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { fileId, prompt, prevMessages } = await req.json()

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_KEY,
  })
  const pineconeIndex = pinecone.index("pdx2")

  let results
  try {
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: fileId,
    })

    results = await vectorStore.similaritySearch(prompt, 8)
  } catch (err) {
    console.error("Error occurred getting file from Pinecone:", err)
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    )
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  })

  const chat = model.startChat({
    history: prevMessages,
    generationConfig: {
      maxOutputTokens: 500,
    },
  })

  try {
    const res = await chat.sendMessage(`
      Use the context (PDF document in flat text), and the previous conversation if necessary, to answer the user's question in Markdown format.
      Maintain a comprehensive conversation with the user. Never respond with nothing, try to give the user context of what's happening.
      Answer in around 200 words.
      -----------------------------
      CONTEXT: ${results
        .map((r, i) => `Page ${i}:\n ${r.pageContent}`)
        .join(`\n\n`)}
      -----------------------------
      USER INPUT: ${prompt}
    `)
    const text = res.response.text()
    return NextResponse.json({ parts: [{ text }], role: "model" })
  } catch (err) {
    console.error("Error occurred during AI chat:", err)
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    )
  }
}
