export type Message = {
  parts: [{ text: string }]
  role: "model" | "user"
}

export type Pdf = {
  secure_url: string
  public_id: string
  name: string
}

export interface CloudinaryFile {
  asset_id: string
  public_id: string
  version: number
  version_id: string
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  pages: number
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  folder: string
  api_key: string
}

export type IconProps = { size: number; className: string }
