export interface UserLocation {
    lat: number
    long: number
  }
  
  type LocationStatus = 'granted' | 'denied' | 'loading' | 'idle'
  
  interface GetLocationOptions {
    useCache?: boolean
    enableToast?: boolean
  }
  
  export const getUserLocation = (
    setLocationStatus: (status: LocationStatus) => void,
    showToast?: (type: 'success' | 'error', message: string) => void,
    options: GetLocationOptions = {}
  ): Promise<UserLocation | null> => {
    const { useCache = true, enableToast = true } = options
  
    return new Promise((resolve) => {
      if (useCache) {
        const cached = localStorage.getItem('userLocation')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            setLocationStatus('granted')
            return resolve(parsed)
          } catch (err) {
          }
        }
      }
  
      if (!navigator.geolocation) {
        setLocationStatus('denied')
        if (enableToast && showToast) showToast('error', 'Geolocation is not supported by your browser')
        return resolve(null)
      }
  
      setLocationStatus('loading')
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: UserLocation = {
            lat: position.coords.latitude,
            long: position.coords.longitude
          }
  
          localStorage.setItem('userLocation', JSON.stringify(userLocation))
          setLocationStatus('granted')
          if (enableToast && showToast) showToast('success', 'Location captured successfully!')
          resolve(userLocation)
        },
        (error) => {
          setLocationStatus('denied')
  
          if (enableToast && showToast) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                showToast('error', 'Location permission denied. Please enable it in your browser settings.')
                break
              case error.POSITION_UNAVAILABLE:
                showToast('error', 'Location information is unavailable.')
                break
              case error.TIMEOUT:
                showToast('error', 'Location request timed out. Please try again.')
                break
              default:
                showToast('error', 'An error occurred while getting your location.')
            }
          }
  
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }