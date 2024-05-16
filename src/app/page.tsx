"use client"

import { genAI } from "@/lib/ai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { FormEvent, useState } from "react"

type Message = {
  msg: string
  from: "ai" | "user"
}

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  const askAI = async (ev: FormEvent) => {
    ev.preventDefault()

    // Add user message to messages state
    setMessages(prevMessages => [...prevMessages, { msg: prompt, from: "user" }])

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent(prompt)
    const msg = result.response.text()

    // Add AI response to messages state
    setPrompt("")
    setMessages(prevMessages => [...prevMessages, { msg, from: "ai" }])
  }

  return (
    <main className="max-w-2xl m-auto flex flex-col">
      <header className="fixed top-0 bg-black border-zinc-500 w-2xl border p-3 text-lg" style={{ width: 672, maxWidth: "100%" }}>PDX2</header>
      <ul className="text-lg min-h-screen border-zinc-500 border overflow-auto pb-24 pt-16 flex flex-col">
        {messages.map((msg, idx) => (
          <li key={idx} className="py-1.5 px-6 flex flex-col">
            <span className={msg.from === "ai" ? "text-blue-500" : ""}><b>{msg.from}:</b></span>
            <p>{msg.msg}</p>
          </li>
        ))}
      </ul>
      <form action="" className="text-xl flex fixed bottom-0 p-3 border-zinc-500 border gap-1.5 bg-black" style={{ width: 672, maxWidth: "100%" }}>
        <input type="text" className="px-3 rounded-lg w-full" placeholder="Prompt..." value={prompt} onChange={(ev) => setPrompt(ev.target.value)} />
        <button onClick={(ev) => askAI(ev)} className="px-4 py-2 rounded-lg bg-zinc-900" disabled={prompt === ""}>ask</button>
      </form>
    </main >
  )
}
