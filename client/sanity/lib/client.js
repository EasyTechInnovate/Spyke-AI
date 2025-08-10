import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Create a safe client that won't throw during build if env is missing
let client

if (projectId && dataset) {
  client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  })
} else {
  // Fallback stub to avoid build failures when SANITY env vars are not provided
  const stub = {
    fetch: async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[sanity] Missing NEXT_PUBLIC_SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_DATASET. Returning empty results.')
      }
      return []
    },
    withConfig: () => stub,
  }
  client = stub
}

export { client }
