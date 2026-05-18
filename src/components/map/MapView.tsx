'use client'

import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Activity } from '@/types'

interface MapViewProps {
  activities: Activity[]
  onSelectActivity: (activity: Activity | null) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  music: '#A769E8',
  art: '#E86995',
  cafes: '#CD9450',
  outdoors: '#4ECD84',
  fitness: '#4EC4CD',
  volunteering: '#69B5E8',
  nightlife: '#9189E8',
  food: '#E8A84E',
  workshops: '#E8694E',
  gaming: '#4E69E8',
  wellness: '#A4CD4E',
}

export default function MapView({ activities, onSelectActivity }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: activities.length > 0
        ? [activities[0].longitude, activities[0].latitude]
        : [-122.4194, 37.7749],
      zoom: 12,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.on('load', () => setMapLoaded(true))

    return () => {
      markersRef.current.forEach((m) => m.remove())
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !map.current) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    activities.forEach((activity) => {
      const color = CATEGORY_COLORS[activity.category] ?? '#7C6FCD'

      const el = document.createElement('div')
      el.style.cssText = `width: 28px; height: 28px; cursor: pointer;`

      const inner = document.createElement('div')
      inner.style.cssText = `
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease;
      `
      inner.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 3L22 11L14 26L6 11Z"
            fill="${color}22"
            stroke="${color}"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <circle cx="14" cy="13" r="2.5" fill="${color}" />
        </svg>
      `
      el.appendChild(inner)

      el.addEventListener('mouseenter', () => {
        inner.style.transform = 'scale(1.3)'
        onSelectActivity(activity)
      })
      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1)'
        onSelectActivity(null)
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([activity.longitude, activity.latitude])
        .addTo(map.current!)

      el.addEventListener('click', () => {
        map.current?.flyTo({ center: [activity.longitude, activity.latitude], zoom: 14, duration: 600 })
      })

      markersRef.current.push(marker)
    })
  }, [mapLoaded, activities, onSelectActivity])

  const activeCategories = [...new Set(activities.map(a => a.category))]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {activeCategories.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '32px',
          right: '12px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          border: '1px solid #E8E8E8',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          minWidth: '130px',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#999', textTransform: 'uppercase', marginBottom: '2px' }}>
            Categories
          </p>
          {activeCategories.map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                background: CATEGORY_COLORS[cat] ?? '#7C6FCD',
                boxShadow: `0 0 6px ${CATEGORY_COLORS[cat] ?? '#7C6FCD'}66`,
              }} />
              <span style={{ fontSize: '12px', color: '#333', textTransform: 'capitalize', fontFamily: 'inherit' }}>
                {cat}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
