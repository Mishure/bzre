import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) {
    return _supabaseAdmin
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)')
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return _supabaseAdmin
}

// Export a getter instead of the client directly
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient]
  }
})

// Upload image to Supabase Storage
export async function uploadPropertySubmissionImage(
  file: File,
  submissionId: number,
  index: number
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${submissionId}-${index}-${Date.now()}.${fileExt}`
    const filePath = `submissions/${fileName}`

    const { data, error } = await supabaseAdmin.storage
      .from('property-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('property-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error in uploadPropertySubmissionImage:', error)
    return null
  }
}

// Download image from external URL and upload to Supabase
export async function downloadAndUploadImage(
  imageUrl: string,
  propertyId: number,
  index: number,
  folder: string = 'properties'
): Promise<string | null> {
  try {
    // Download image from Storia
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
    const urlExt = imageUrl.split('.').pop()?.split('?')[0]
    if (urlExt && ['jpg', 'jpeg', 'png', 'webp'].includes(urlExt.toLowerCase())) {
      fileExt = urlExt.toLowerCase()
    } else {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('png')) fileExt = 'png'
      else if (contentType?.includes('webp')) fileExt = 'webp'
    }

    const fileName = `${propertyId}-${index}-${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Upload to Supabase
    const { data, error } = await supabaseAdmin.storage
      .from('property-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      })

    if (error) {
      console.error('Error uploading image to Supabase:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('property-images')
      .getPublicUrl(filePath)

    return publicUrl
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
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return uploadedUrls
}
