const hideClutter = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
]

export const MAP_STYLE_LIGHT = [
  ...hideClutter,
  { elementType: 'geometry', stylers: [{ color: '#f4f4f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#71717a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#fafafa' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e4e4e7' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#a1a1aa' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e4e4e7' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d4d4d8' }]
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d4d4d8' }]
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#a1a1aa' }]
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }]
  }
]

export const MAP_STYLE_DARK = [
  ...hideClutter,
  { elementType: 'geometry', stylers: [{ color: '#13131f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#09090f' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0f0f18' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#09090f' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a4a6a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e1b4b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#13131f' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2d1f4e' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e1b4b' }]
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e1b4b' }]
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2d1f4e' }]
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }]
  }
]

export const MARKER_COLOR_LIGHT = '#0891b2'
export const MARKER_COLOR_DARK = '#a78bfa'

export const US_CENTER = { lat: 39.5, lng: -96 }
export const US_ZOOM = 4
