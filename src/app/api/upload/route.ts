import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryFile } from "@/types"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { pinecone } from "@/lib/pinecone"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { PineconeStore } from "@langchain/pinecone"

cloudinary.config({
  cloud_name: "darjfiyou",
  api_key: "582881756283974",
  api_secret: process.env.CLOUDINARY_SECRET,
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("pdf") as File
  if (file.type !== "application/pdf")
    return NextResponse.json({ error: "file is not pdf" }, { status: 422 })
  //upload to cloudinary
  const arrayBuffer = await file.arrayBuffer() //turn file into an arraybuffer
  const base64Data = Buffer.from(arrayBuffer).toString("base64") //then into a base64-encoded string
  const fileUri = "data:application/pdf;base64," + base64Data //and add it to the uri that will be uploaded to cloudinary
  let uploadedFile: CloudinaryFile
  try {
    const res = await cloudinary.uploader.upload(fileUri, {
      invalidate: true,
      allowed_formats: ["pdf"],
      tags: ["uploaded-pdfs"],
    })
    uploadedFile = res as unknown as CloudinaryFile
  } catch (err) {
    console.error("Error uploading to cloudinary:", err)
    return NextResponse.json({ error: "error uploading file" }, { status: 500 })
  }

  const { secure_url, pages, public_id } = uploadedFile

  const res = await fetch(secure_url)
  const blob = await res.blob()

  //upload to pinecone
  try {
    const loader = new PDFLoader(blob)
    const pageLevelDocs = await loader.load()

    const pineconeIndex = pinecone.index("pdx2")

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_KEY,
    })

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: public_id,
    })
  } catch (err) {
    console.error("Error processing PDF:", err)
    return NextResponse.json(
      { error: "error uploading to pinecone" },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { name: file.name, secure_url, public_id },
    { status: 200 }
  )
}
