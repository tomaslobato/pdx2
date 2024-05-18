import { genAI } from "@/lib/gemini"
import { Message } from "@/types"
import { useMutation } from "@tanstack/react-query"
import React, { useState } from "react"
import LoadingIcon from "./Icons/Loading"

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([])
    const [prompt, setPrompt] = useState("")

    const { isPending, error, data } = useMutation({
        mutationFn: async (prompt: string) => {
            const formData = new FormData()
            formData.append('prompt', prompt)

            const data = await fetch("/api/ask", {
                method: "POST",
                body: formData
            })

            return data.json()
        }
    })

    //ask
    const askAI = async (ev: React.FormEvent) => {
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
        <>
            <header className="fixed top-0 bg-black border-zinc-500 w-2xl border p-3 text-lg" style={{ width: 672, maxWidth: "100%" }}>PDX2</header>
            {/* messages */}
            <ul className="text-lg min-h-screen border-zinc-500 border overflow-auto pb-24 pt-16 flex flex-col gap-2">
                {messages.map((msg, idx) => (
                    <li key={idx} className={`w-full px-3 flex flex-col ${msg.from === "user" ? "items-end" : "pb-4"}`}>
                        <div className={`bg-zinc-700 rounded-xl p-4 ${msg.from === "user" ? "max-w-[84%]" : "max-w-[96%]"}`}>
                            <span className={msg.from === "ai" ? "text-blue-500" : ""}><b>{msg.from}:</b></span>
                            <p>{msg.msg}</p>
                        </div>
                    </li>
                ))}
                {isPending && <LoadingIcon className="animate-spin" size={24} />}
            </ul>
            {/* input */}
            <form action="" className="text-xl flex fixed bottom-0 p-3 border-zinc-500 border gap-1.5 bg-black" style={{ width: 672, maxWidth: "100%" }}>
                <input type="text" className="px-3 rounded-lg w-full" placeholder="Prompt..." value={prompt} onChange={(ev) => setPrompt(ev.target.value)} />
                <button onClick={(ev) => askAI(ev)} className="px-4 py-2 rounded-lg bg-zinc-900" disabled={prompt === ""}>ask</button>
            </form>
        </>)
}