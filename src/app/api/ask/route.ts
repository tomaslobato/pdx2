import { genAI } from "@/lib/gemini"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { prompt, prevMessages } = await req.json()

  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const result = await model.generateContent(prompt)
  const response = result.response.text()

  return new Response(response)
}
