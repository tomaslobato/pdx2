"use client"

import DropZone from "@/components/DropZone"
import { Pdf } from "@/types"
import { useState } from "react"
import { DropEvent, FileRejection } from "react-dropzone"
import { useMutation } from "@tanstack/react-query"
import Chat from "@/components/Chat"

export default function Home() {
  const [pdf, setPdf] = useState<Pdf | null>(null)
  const [err, setErr] = useState("")

  //upload file
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      try {
        const formData = new FormData()
        formData.append("pdf", file)
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const pdf = (await res.json()) as Pdf
        setPdf(pdf)
      } catch(err) {
        setErr("error uploading your file")
      }
    },
  })

  if (uploadFile.error) setErr("Error uploading the file")

  const handleDropRejected = () => {
    setErr("File type not allowed")
  }

  const handleDropAccepted = (acceptedFiles: File[]) => {
    uploadFile.mutate(acceptedFiles[0])
  }

  return (
    <main className="max-w-2xl m-auto flex flex-col">
      {pdf ? (
        <Chat />
      ) : (
        <>
          <div className="mt-56 text-center mb-2 "><span className="rounded-2xl border px-4 py-1"><span className="text-orange-500 font-bold">PDX v2</span> is here!</span></div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-5 md:mb-10 px-6">
            Chat with your PDFs with just an upload!
          </h1>
          <DropZone
            pending={uploadFile.isPending}
            error={err}
            onDropAccepted={handleDropAccepted}
            onDropRejected={handleDropRejected}
          />
        </>
      )}
    </main>
  )
}
