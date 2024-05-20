"use client"

import DropZone from "@/components/DropZone"
import { Pdf } from "@/types"
import { useState } from "react"
import { DropEvent, FileRejection } from "react-dropzone"
import { useMutation } from "@tanstack/react-query"
import Chat from "@/components/Chat"
import axios from "axios"

export default function Home() {
  const [pdf, setPdf] = useState<Pdf | null>(null)
  const [err, setErr] = useState<string | null>(null)

  //upload file
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("pdf", file)
      const res = await axios.post("/api/upload", formData)

      if (res.status !== 200) {
        const error = await res.data
        throw new Error(`Upload failed: ${error.message}`)
      }

      const pdf = (await res.data) as Pdf
      return pdf
    },
    onError: () => {
      if (!err) {
        setErr("Error uploading your file")
        setTimeout(() => setErr(null), 2000)
      }
    },
    onSuccess: (pdf) => {
      setPdf(pdf)
    },
  })

  const handleDropRejected = () => {
    setErr("File type not allowed")
    setTimeout(() => setErr(null), 2000)
  }

  const handleDropAccepted = (acceptedFiles: File[]) => {
    setErr(null)
    uploadFile.mutate(acceptedFiles[0])
  }

  return (
    <main className="max-w-2xl m-auto flex flex-col">
      {pdf ? (
        <Chat pdf={pdf} />
      ) : (
        <>
          <div className="mt-36 md:mt-56 text-center mb-2 ">
            <span className="rounded-2xl border px-4 py-1">
              <span className="text-orange-500 font-bold">PDX v2</span> is here!
            </span>
          </div>
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
