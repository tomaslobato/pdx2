import React, { useCallback } from "react"
import { useDropzone, FileRejection, DropEvent } from "react-dropzone"
import LoadingIcon from "./Icons/Loading"

interface Props {
  onDropAccepted: (acceptedFiles: File[]) => void
  onDropRejected: () => void
  error: string | null
  pending: boolean
}

const DropZone = ({
  onDropAccepted,
  onDropRejected,
  error,
  pending,
}: Props) => {
  const onDropAcceptedCallback = useCallback(
    (acceptedFiles: File[]) => {
      if (
        acceptedFiles.length > 0 &&
        acceptedFiles[0].type === "application/pdf"
      ) {
        onDropAccepted(acceptedFiles)
      } else {
        alert("Only PDF files are allowed")
      }
    },
    [onDropAccepted]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: onDropAcceptedCallback,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
  })

  return (
    <div
      {...getRootProps()}
      className={`bg-zinc-800 hover:bg-zinc-900 transition-all cursor-pointer h-[150px] md:h-[200px] rounded-2xl flex items-center justify-center text-2xl mx-6 px-5 text-center border-dashed border-2`}
    >
      <input {...getInputProps()} disabled={error ? true : false || pending} />
      {isDragActive ? (
        <p>Drop the PDF file here...</p>
      ) : error ? (
        <p className="text-red-600 font-bold">{error}</p>
      ) : pending ? (
        <LoadingIcon size={48} className="animate-spin" />
      ) : (
        <p className="flex">Click to select a PDF<b className="md:flex hidden">, or just drop it</b></p>
      )}
    </div>
  )
}

export default DropZone
