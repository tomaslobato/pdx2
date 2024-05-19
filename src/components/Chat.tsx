import { Message, Pdf } from "@/types"
import { useMutation } from "@tanstack/react-query"
import React, { useState } from "react"
import LoadingIcon from "./Icons/Loading"
import axios from "axios"
import SendIcon from "./Icons/Send"

type Props = {
    pdf: Pdf
}

export default function Chat({ pdf }: Props) {
    const [messages, setMessages] = useState<Message[]>([])
    const [prompt, setPrompt] = useState("")
    const [err, setErr] = useState<string | null>(null)

    const ask = useMutation({
        mutationFn: async () => {
            const res = await axios.post("/api/ask", { fileId: pdf.public_id, prompt, prevMessages: messages })

            if (res.status !== 200) throw new Error("There was an error")

            return res.data
        },
        onError: (err) => {
            setErr(err.message)
        },
        onSuccess: (data) => {
            setMessages((prev) => [...prev, data])
            setPrompt("")
        }
    })

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault()
        setErr(null)
        setMessages(prev => [...prev, { parts: [{ text: prompt }], role: "user" }])
        await ask.mutate()
    }

    return (
        <>
            <header className="fixed top-0 bg-black border-zinc-500 w-2xl border h-14 flex justify-between items-center p-3" style={{ width: 672, maxWidth: "100%" }}>
                <span className="rounded-full bg-zinc-700 px-3 max-w-[275px] md:max-w-md h-6 truncate">PDX / {pdf.name}</span>
                <a href={pdf.secure_url} target="_blank" className="p-2 rounded-xl border text-sm">See PDF</a>
            </header>
            {/* messages */}
            <ul className="text-lg min-h-screen border-zinc-500 border overflow-auto pb-20 pt-16 flex flex-col gap-2">
                {messages.map((msg, idx) => (
                    <li key={idx} className={`w-full px-3 flex flex-col ${msg.role === "user" ? "items-end" : "items-start pb-3 mb-2 border-b border-zinc-800"}`}>
                        <div className="rounded-xl flex p-3 bg-zinc-700 max-w-xl gap-1">
                            <p>{msg.parts[0].text}</p>
                        </div>
                    </li>
                ))}
                {ask.isPending && (
                    <li className="px-3 w-full pb-3">
                        <div className="bg-zinc-700 rounded-xl p-3 w-12">
                            <LoadingIcon className="animate-spin" size={24} />  
                        </div>
                    </li>
                )}
                {ask.error && (
                    <li className="px-3 w-full pb-3">
                        <div className="bg-red-500 rounded-xl p-3 w-80">
                            There was an error, try again.
                        </div>
                    </li>
                )}
            </ul>
            {/* input */}
            <form action="" className="flex fixed bottom-0 p-3 border-zinc-500 border gap-1.5 bg-black h-[86px]" style={{ width: 672, maxWidth: "100%" }} >
                <input type="text" disabled={ask.isPending} className={`text-xl px-3 rounded-lg w-full ${err ? "border-2 border-red-600" : ""}`} placeholder="Pregunta sobre el PDF..." value={prompt} onChange={(ev) => setPrompt(ev.target.value)} />
                <button onClick={(ev) => handleSubmit(ev)} disabled={ask.isPending || prompt === ""} className="px-4 py-2 rounded-lg bg-zinc-900"><SendIcon size={26} className=""/></button>
            </form>
        </>)
}