'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';

// Map marker types
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  category?: string;
  icon?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface AccessibleMapProps {
  center: { latitude: number; longitude: number };
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (coordinates: { latitude: number; longitude: number }) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
  enableKeyboardNavigation?: boolean;
  cluster?: boolean;
  fitBounds?: boolean;
  style?: 'standard' | 'satellite' | 'terrain';
  apiKey?: string;
  ariaLabel?: string;
  instructions?: string;
}

export function AccessibleMap({
  center,
  zoom = 10,
  markers = [],
  onMarkerClick,
  onMapClick,
  className,
  height = '400px',
  showControls = true,
  enableKeyboardNavigation = true,
  cluster = true,
  fitBounds = false,
  style = 'standard',
  apiKey,
  ariaLabel,
  instructions
}: AccessibleMapProps) {
  const t = useTranslations('map');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const markerClusterRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [focusedMarkerIndex, setFocusedMarkerIndex] = useState(-1);

  // Load Google Maps API
  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError(t('errors.loadFailed'));

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey, t]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: center.latitude, lng: center.longitude },
        zoom,
        mapTypeId: getMapTypeId(style),
        gestureHandling: 'cooperative',
        keyboardShortcuts: enableKeyboardNavigation,
        disableDefaultUI: !showControls,
        accessibleMode: true,
        clickableIcons: false,
        ...getAccessibilityOptions()
      });

      // Add click handler
      if (onMapClick) {
        mapInstanceRef.current.addListener('click', (event: any) => {
          if (event.latLng) {
            onMapClick({
              latitude: event.latLng.lat(),
              longitude: event.latLng.lng()
            });
          }
        });
      }

      // Create info window
      infoWindowRef.current = new (window as any).google.maps.InfoWindow({
        maxWidth: 300,
        ariaLabel: t('infoWindow.label')
      });

    } catch (err) {
      setError(t('errors.initializationFailed'));
    }
  }, [isLoaded, center, zoom, style, showControls, enableKeyboardNavigation, onMapClick, t]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (markerClusterRef.current) {
      markerClusterRef.current.clearMarkers();
    }

    // Add new markers
    const newMarkers = markers.map((markerData, index) => {
      const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
        position: { lat: markerData.latitude, lng: markerData.longitude },
        map: mapInstanceRef.current,
        title: markerData.title,
        content: createMarkerContent(markerData, index),
        gmpClickable: true
      });

      // Add click handler
      marker.addListener('click', () => {
        setSelectedMarker(markerData);
        setFocusedMarkerIndex(index);
        showInfoWindow(marker, markerData);
        onMarkerClick?.(markerData);

        // Announce to screen readers
        announceMarkerSelection(markerData);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Initialize clustering if enabled
    if (cluster && newMarkers.length > 0) {
      // Note: This would typically use @googlemaps/markerclusterer
      // For now, we'll handle it manually or use a simple implementation
      initializeMarkerClustering(newMarkers);
    }

    // Fit bounds to markers if requested
    if (fitBounds && newMarkers.length > 0) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend({ lat: marker.latitude, lng: marker.longitude });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }

  }, [markers, isLoaded, cluster, fitBounds, onMarkerClick]);

  // Keyboard navigation for markers
  useEffect(() => {
    if (!enableKeyboardNavigation || !mapRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!markers.length) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = focusedMarkerIndex < markers.length - 1 ? focusedMarkerIndex + 1 : 0;
          focusMarker(nextIndex);
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = focusedMarkerIndex > 0 ? focusedMarkerIndex - 1 : markers.length - 1;
          focusMarker(prevIndex);
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedMarkerIndex >= 0 && focusedMarkerIndex < markers.length) {
            const marker = markers[focusedMarkerIndex];
            setSelectedMarker(marker);
            showInfoWindow(markersRef.current[focusedMarkerIndex], marker);
            onMarkerClick?.(marker);
          }
          break;

        case 'Escape':
          event.preventDefault();
          closeInfoWindow();
          setSelectedMarker(null);
          setFocusedMarkerIndex(-1);
          break;
      }
    };

    const mapElement = mapRef.current;
    mapElement.addEventListener('keydown', handleKeyDown);

    return () => {
      mapElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableKeyboardNavigation, markers, focusedMarkerIndex, onMarkerClick]);

  // Helper functions
  const getMapTypeId = (mapStyle: string) => {
    switch (mapStyle) {
      case 'satellite': return (window as any).google.maps.MapTypeId.SATELLITE;
      case 'terrain': return (window as any).google.maps.MapTypeId.TERRAIN;
      default: return (window as any).google.maps.MapTypeId.ROADMAP;
    }
  };

  const getAccessibilityOptions = () => ({
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: (window as any).google.maps.ControlPosition.TOP_RIGHT
    },
    mapTypeControl: showControls,
    mapTypeControlOptions: {
      position: (window as any).google.maps.ControlPosition.TOP_LEFT,
      style: (window as any).google.maps.MapTypeControlStyle.DEFAULT
    },
    streetViewControl: showControls,
    streetViewControlOptions: {
      position: (window as any).google.maps.ControlPosition.LEFT_TOP
    },
    zoomControl: showControls,
    zoomControlOptions: {
      position: (window as any).google.maps.ControlPosition.LEFT_CENTER
    }
  });

  const createMarkerContent = (markerData: MapMarker, index: number) => {
    const content = document.createElement('div');
    content.className = 'marker-content';
    content.innerHTML = `
      <div class="bg-white rounded-full p-2 shadow-lg border-2 border-navy-primary cursor-pointer hover:scale-110 transition-transform"
           role="button"
           tabindex="0"
           aria-label="${markerData.title}"
           data-marker-index="${index}">
        ${markerData.icon ? `<img src="${markerData.icon}" alt="" class="w-6 h-6">` : `
          <svg class="w-6 h-6 text-navy-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        `}
      </div>
    `;
    return content;
  };

  const initializeMarkerClustering = (markers: any[]) => {
    // Simple clustering implementation
    // In a real application, you would use @googlemaps/markerclusterer
    // This is a placeholder for the clustering logic
  };

  const focusMarker = (index: number) => {
    if (index < 0 || index >= markers.length || !mapInstanceRef.current) return;

    const marker = markers[index];
    setFocusedMarkerIndex(index);

    // Pan to marker
    mapInstanceRef.current.panTo({ lat: marker.latitude, lng: marker.longitude });

    // Announce to screen readers
    announceMarkerFocus(marker, index + 1, markers.length);
  };

  const showInfoWindow = (marker: any, markerData: MapMarker) => {
    if (!infoWindowRef.current) return;

    const content = `
      <div class="p-3 max-w-xs">
        <h3 class="font-semibold text-lg mb-2">${markerData.title}</h3>
        ${markerData.description ? `<p class="text-sm text-gray-600 mb-2">${markerData.description}</p>` : ''}
        ${markerData.category ? `<span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">${markerData.category}</span>` : ''}
        ${markerData.url ? `<a href="${markerData.url}" class="block mt-2 text-blue-600 hover:text-blue-800 text-sm">${t('viewDetails')}</a>` : ''}
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

  const closeInfoWindow = () => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  };

  const announceMarkerSelection = (marker: MapMarker) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = t('announcements.markerSelected', { title: marker.title });

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const announceMarkerFocus = (marker: MapMarker, position: number, total: number) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = t('announcements.markerFocused', {
      title: marker.title,
      position,
      total
    });

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Render error state
  if (error) {
    return (
      <div
        className={clsx('flex items-center justify-center bg-neutral-light border border-neutral-medium rounded-lg', className)}
        style={{ height }}
        role="alert"
        aria-labelledby="map-error-title"
      >
        <div className="text-center p-6">
          <svg className="w-12 h-12 text-neutral-medium mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
          <h3 id="map-error-title" className="text-lg font-semibold text-neutral-dark mb-2">
            {t('errors.loadFailed')}
          </h3>
          <p className="text-neutral-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (!isLoaded) {
    return (
      <div
        className={clsx('flex items-center justify-center bg-neutral-light border border-neutral-medium rounded-lg', className)}
        style={{ height }}
        role="status"
        aria-label={t('loading')}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-primary mx-auto mb-2" />
          <p className="text-neutral-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('relative rounded-lg overflow-hidden', className)}>
      {/* Map Container */}
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full"
        role="application"
        aria-label={ariaLabel || t('defaultAriaLabel')}
        aria-describedby="map-instructions"
        tabIndex={enableKeyboardNavigation ? 0 : -1}
      />

      {/* Accessibility Instructions */}
      <div id="map-instructions" className="sr-only">
        {instructions || t('defaultInstructions')}
      </div>

      {/* Map Legend */}
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-semibold text-sm mb-2">{t('legend.title')}</h4>
          <div className="space-y-1">
            {markers.slice(0, 5).map((marker, index) => (
              <div key={marker.id} className="flex items-center text-xs">
                <div className="w-3 h-3 bg-navy-primary rounded-full mr-2" />
                <span className="truncate">{marker.title}</span>
              </div>
            ))}
            {markers.length > 5 && (
              <div className="text-xs text-neutral-medium">
                {t('legend.andMore', { count: markers.length - 5 })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Controls Info */}
      {enableKeyboardNavigation && markers.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs">
          <h4 className="font-semibold mb-1">{t('keyboardControls.title')}</h4>
          <div className="space-y-1 text-neutral-medium">
            <div>{t('keyboardControls.arrows')}</div>
            <div>{t('keyboardControls.enter')}</div>
            <div>{t('keyboardControls.escape')}</div>
          </div>
        </div>
      )}
    </div>
  );
}