import { Message, Pdf } from "@/types"
import { useMutation } from "@tanstack/react-query"
import React, { useState } from "react"
import LoadingIcon from "./Icons/Loading"
import axios from "axios"
import SendIcon from "./Icons/Send"
import Messages from "./Messages"

type Props = {
  pdf: Pdf
}

export default function Chat({ pdf }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [err, setErr] = useState<string | null>(null)

  const ask = useMutation({
    mutationFn: async () => {
      const input = prompt
      setPrompt("")
      const res = await axios.post("/api/ask", {
        fileId: pdf.public_id,
        prompt: input,
        prevMessages: messages,
      })

      if (res.status !== 200) throw new Error("There was an error")

      return res.data
    },
    onError: (err) => {
      setErr(err.message)
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data])
    },
  })

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setErr(null)
    setMessages((prev) => [
      ...prev,
      { parts: [{ text: prompt }], role: "user" },
    ])
    ask.mutate()
  }

  return (
    <>
      <header
        className="fixed top-0 bg-black w-2xl  h-14 flex justify-between items-center p-3"
        style={{ width: 672, maxWidth: "100%" }}
      >
        <span className="rounded-full bg-zinc-700 px-3 max-w-[230px] md:max-w-xl h-6 truncate">
          <b className="hidden md:inline">PDX /</b> {pdf.name}
        </span>
        <a
          href={pdf.secure_url}
          target="_blank"
          className="p-2 rounded-xl border-2 border-zinc-500 bg-zinc-900 hover:bg-zinc-950 hover:border-white"
        >
          See PDF
        </a>
      </header>
      {/* messages */}
      <Messages messages={messages} ask={ask}/>
      {/* input */}
      <form
        id="chat-form"
        className="flex fixed bottom-0 p-3 gap-1.5 bg-black"
        style={{ width: 672, maxWidth: "100%" }}
      >
        <input
          type="text"
          id="chat-input"
          disabled={ask.isPending}
          className={`md:text-xl px-3 rounded-lg w-full border-2 border-zinc-950 bg-zinc-900 hover:bg-zinc-950 hover:border-white ${
            err ? " border-red-600" : ""
          }`}
          placeholder="Ask about PDF..."
          value={prompt}
          onChange={(ev) => setPrompt(ev.target.value)}
        />
        <button
          onClick={(ev) => handleSubmit(ev)}
          disabled={ask.isPending || prompt === ""}
          className="px-4 py-2 rounded-lg bg-orange-600 border-orange-950 border-2 cursor-pointer hover:bg-orange-700 hover:border-white"
        >
          <SendIcon size={25} className="" />
        </button>
      </form>
    </>
  )
}
