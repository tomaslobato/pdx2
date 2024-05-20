"use client"

import { Message } from "@/types"
import LoadingIcon from "./Icons/Loading"
import { UseMutationResult } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

type Props = {
  messages: Message[]
  ask: UseMutationResult<any, Error, void, unknown>
}

export default function Messages({ messages, ask }: Props) {
  const messagesEndRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <ul className="min-h-screen border-zinc-500 border overflow-auto pb-16 pt-16 flex flex-col gap-2">
      {messages.map((msg, idx) => (
        <li
          key={idx}
          className={`w-full px-3 flex flex-col ${
            msg.role === "user"
              ? "items-end"
              : "items-start pb-3 mb-2 border-b border-zinc-800"
          }`}
        >
          {msg.parts[0].text === "" ? (
            <div className="bg-red-500 rounded-2xl p-3 w-80">
              <p>There was an error, don't worry and try again.</p>
            </div>
          ) : (
            <div
              className={`rounded-2xl flex p-3 max-w-sm md:max-w-xl gap-1 ${
                msg.role === "user"
                  ? "rounded-tr-none bg-zinc-700"
                  : "rounded-bl-none bg-zinc-800"
              }`}
            >
              <p>{msg.parts[0].text}</p>
            </div>
          )}
        </li>
      ))}
      {ask.isPending && (
        <li className="px-3 w-full pb-3">
          <div className="bg-zinc-700 rounded-2xl p-3 w-12 rounded-bl-none">
            <LoadingIcon className="animate-spin" size={24} />
          </div>
        </li>
      )}
      {ask.error && (
        <li className="px-3 w-full pb-3">
          <div className="bg-red-500 rounded-2xl p-3 w-80">
            <p>There was an error, try again.</p>
          </div>
        </li>
      )}
      <li ref={messagesEndRef} />
    </ul>
  )
}
