// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

console.log("Hello from extract-info function!")

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, extractionParams } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    // Normalize URL
    let normalizedUrl = url
    if (!url.match(/^https?:\/\/.+\..+/)) {
      normalizedUrl = 'https://' + url
    }

    // First, fetch the URL content
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    // Get the HTML content
    const html = await response.text()

    // Determine extraction type
    const extractionType = extractionParams?.extractionType || 'general'

    // Simulate AI extraction based on the extraction type
    let extractedData = {}
    
    if (extractionType === 'veterinary_clinic') {
      // Simulate veterinary clinic extraction
      extractedData = {
        clinic_name: "Valley Veterinary Clinic",
        clinic_address: "123 Main Street",
        clinic_city: "Springfield",
        clinic_state: "CA",
        clinic_zip: "91234",
        clinic_phone: "(555) 123-4567",
        clinic_email: "info@valleyvet.example",
        clinic_website: normalizedUrl,
        clinic_hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-2PM, Sun: Closed",
        veterinarians: [
          {
            name: "Dr. Sarah Johnson",
            title: "Medical Director",
            specialty: "Internal Medicine",
            bio: "Dr. Johnson graduated from UC Davis and has 15 years of experience treating small animals.",
            photo_url: "https://example.com/dr-johnson.jpg"
          },
          {
            name: "Dr. Michael Chen",
            title: "Associate Veterinarian",
            specialty: "Surgery",
            bio: "Dr. Chen specializes in orthopedic procedures and joined our team in 2018.",
            photo_url: "https://example.com/dr-chen.jpg"
          }
        ]
      }
    } else {
      // General extraction
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
      const title = titleMatch ? titleMatch[1] : null

      const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
      const description = descriptionMatch ? descriptionMatch[1] : null
      
      extractedData = {
        title: title,
        description: description,
        url: normalizedUrl,
        extractionType: 'general'
      }
    }

    // Return the extracted information
    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        metadata: {
          url: normalizedUrl,
          extractionType: extractionType,
          timestamp: new Date().toISOString()
        },
        extractionParams: extractionParams || {}
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/extract-info' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"url":"https://example.com", "extractionParams": {"extractionType": "veterinary_clinic"}}'