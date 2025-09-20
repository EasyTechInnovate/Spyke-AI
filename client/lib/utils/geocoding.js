/**
 * Geocoding Service Utility
 * Provides reverse geocoding functionality using OpenStreetMap Nominatim API (free)
 */

class GeocodingService {
    constructor() {
        this.cache = new Map()
        this.userAgent = 'SpykeAI/1.0'
    }

    /**
     * Reverse geocoding - get address from coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<string|null>} - Formatted address or null
     */
    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': this.userAgent
                    }
                }
            )
            
            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.status}`)
            }

            const data = await response.json()

            if (data && data.display_name) {
                // Extract city, state, country from the response
                const address = data.address || {}
                const city = address.city || address.town || address.village || address.county
                const state = address.state
                const country = address.country

                // Build a clean address string
                let cleanAddress = ''
                if (city) cleanAddress += city
                if (state && state !== city) {
                    cleanAddress += (cleanAddress ? ', ' : '') + state
                }
                if (country) {
                    cleanAddress += (cleanAddress ? ', ' : '') + country
                }

                return cleanAddress || data.display_name
            }
            return null
        } catch (error) {
            console.error('Reverse geocoding failed:', error)
            return null
        }
    }

    /**
     * Forward geocoding - get coordinates from address
     * @param {string} query - Search query (address, city, etc.)
     * @param {number} limit - Maximum number of results (default: 5)
     * @returns {Promise<Array>} - Array of search results
     */
    async forwardGeocode(query, limit = 5) {
        try {
            if (!query || query.length < 3) {
                return []
            }

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': this.userAgent
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.status}`)
            }

            const data = await response.json()

            return data.map((item) => ({
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                long: parseFloat(item.lon),
                address: item.display_name,
                // Additional useful fields
                city: item.address?.city || item.address?.town || item.address?.village,
                state: item.address?.state,
                country: item.address?.country,
                postcode: item.address?.postcode
            }))
        } catch (error) {
            console.error('Forward geocoding failed:', error)
            return []
        }
    }

    /**
     * Get cached location name or fetch new one
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<string|null>} - Cached or fetched address
     */
    async getLocationName(lat, lng) {
        const key = `${lat.toFixed(4)},${lng.toFixed(4)}`

        if (this.cache.has(key)) {
            return this.cache.get(key)
        }

        const address = await this.reverseGeocode(lat, lng)
        this.cache.set(key, address)
        return address
    }

    /**
     * Search for cities/places
     * @param {string} query - Search query
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} - Search results
     */
    async searchPlaces(query, limit = 5) {
        return this.forwardGeocode(query, limit)
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear()
    }

    /**
     * Get cache size
     * @returns {number} - Number of cached entries
     */
    getCacheSize() {
        return this.cache.size
    }
}

// Create singleton instance
const geocodingService = new GeocodingService()

export default geocodingService
export { GeocodingService }