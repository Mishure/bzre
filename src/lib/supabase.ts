import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client with service role for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
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
