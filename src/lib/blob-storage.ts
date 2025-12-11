import { put, del, list } from '@vercel/blob'

// Upload image buffer to Vercel Blob
export async function uploadImageToBlob(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> {
  try {
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType,
    })

    return blob.url
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error)
    return null
  }
}

// Download image from external URL and upload to Vercel Blob
export async function downloadAndUploadImage(
  imageUrl: string,
  propertyId: number,
  index: number,
  folder: string = 'properties'
): Promise<string | null> {
  try {
    // Download image from external URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine file extension from URL or content-type
    let fileExt = 'jpg'
    const urlExt = imageUrl.split('.').pop()?.split('?')[0]?.split(';')[0]
    if (urlExt && ['jpg', 'jpeg', 'png', 'webp'].includes(urlExt.toLowerCase())) {
      fileExt = urlExt.toLowerCase()
    } else {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('png')) fileExt = 'png'
      else if (contentType?.includes('webp')) fileExt = 'webp'
    }

    const fileName = `${folder}/${propertyId}-${index}-${Date.now()}.${fileExt}`
    const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`

    const url = await uploadImageToBlob(buffer, fileName, contentType)
    return url
  } catch (error) {
    console.error('Error in downloadAndUploadImage:', error)
    return null
  }
}

// Download multiple images from external URLs
export async function downloadAndUploadMultipleImages(
  imageUrls: string[],
  propertyId: number,
  folder: string = 'properties'
): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (let i = 0; i < imageUrls.length; i++) {
    const url = await downloadAndUploadImage(imageUrls[i], propertyId, i, folder)
    if (url) {
      uploadedUrls.push(url)
    }

    // Add small delay between uploads
    if (i < imageUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  return uploadedUrls
}

// Upload a File object to Vercel Blob (for form uploads)
export async function uploadPropertySubmissionImage(
  file: File,
  submissionId: number,
  index: number
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `submissions/${submissionId}-${index}-${Date.now()}.${fileExt}`

    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    })

    return blob.url
  } catch (error) {
    console.error('Error in uploadPropertySubmissionImage:', error)
    return null
  }
}

// Delete an image from Vercel Blob
export async function deleteImageFromBlob(url: string): Promise<boolean> {
  try {
    await del(url)
    return true
  } catch (error) {
    console.error('Error deleting image from Vercel Blob:', error)
    return false
  }
}

// List all blobs in a folder
export async function listBlobsInFolder(prefix: string): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix })
    return blobs.map(blob => blob.url)
  } catch (error) {
    console.error('Error listing blobs:', error)
    return []
  }
}
