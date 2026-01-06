'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { AccessibleMap, type MapMarker } from './AccessibleMap';

// Charter-specific types
export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  type: 'international' | 'domestic' | 'private';
  services?: string[];
  runway?: {
    length: number;
    surface: string;
  };
}

export interface CharterRoute {
  id: string;
  departure: Airport;
  arrival: Airport;
  distance: number;
  estimatedTime: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  };
  aircraft?: string[];
  frequency?: 'high' | 'medium' | 'low';
}

export interface CharterMapProps {
  airports: Airport[];
  routes?: CharterRoute[];
  selectedRoute?: CharterRoute | null;
  onAirportSelect?: (airport: Airport) => void;
  onRouteSelect?: (route: CharterRoute) => void;
  className?: string;
  showRoutes?: boolean;
  showAirportDetails?: boolean;
  filterByAircraftType?: string;
  center?: { latitude: number; longitude: number };
  apiKey?: string;
  height?: string;
}

export function CharterMap({
  airports,
  routes = [],
  selectedRoute,
  onAirportSelect,
  onRouteSelect,
  className,
  showRoutes = true,
  showAirportDetails = true,
  filterByAircraftType,
  center,
  apiKey,
  height = '500px'
}: CharterMapProps) {
  const t = useTranslations('charterMap');
  const [hoveredAirport, setHoveredAirport] = useState<Airport | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  // Filter routes by aircraft type if specified
  const filteredRoutes = useMemo(() => {
    if (!filterByAircraftType) return routes;
    return routes.filter(route =>
      route.aircraft?.includes(filterByAircraftType)
    );
  }, [routes, filterByAircraftType]);

  // Convert airports to map markers
  const airportMarkers = useMemo((): MapMarker[] => {
    return airports.map(airport => ({
      id: airport.id,
      latitude: airport.latitude,
      longitude: airport.longitude,
      title: `${airport.name} (${airport.code})`,
      description: `${airport.city}, ${airport.country}`,
      category: airport.type,
      metadata: {
        code: airport.code,
        city: airport.city,
        country: airport.country,
        type: airport.type,
        services: airport.services?.join(', ') || '',
        runwayLength: airport.runway?.length || 'N/A',
        runwaySurface: airport.runway?.surface || 'N/A'
      },
      url: `/airports/${airport.code.toLowerCase()}`
    }));
  }, [airports]);

  // Calculate map center if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;

    if (selectedRoute) {
      // Center between departure and arrival
      return {
        latitude: (selectedRoute.departure.latitude + selectedRoute.arrival.latitude) / 2,
        longitude: (selectedRoute.departure.longitude + selectedRoute.arrival.longitude) / 2
      };
    }

    if (airports.length > 0) {
      // Center on airports
      const avgLat = airports.reduce((sum, airport) => sum + airport.latitude, 0) / airports.length;
      const avgLng = airports.reduce((sum, airport) => sum + airport.longitude, 0) / airports.length;
      return { latitude: avgLat, longitude: avgLng };
    }

    // Default to global view
    return { latitude: 20, longitude: 0 };
  }, [center, selectedRoute, airports]);

  // Handle airport marker click
  const handleMarkerClick = useCallback((marker: MapMarker) => {
    const airport = airports.find(a => a.id === marker.id);
    if (airport) {
      setSelectedAirport(airport);
      onAirportSelect?.(airport);

      // Track airport selection for analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'airport_selected', {
          airport_code: airport.code,
          airport_name: airport.name,
          airport_type: airport.type,
          event_category: 'Map Interaction'
        });
      }
    }
  }, [airports, onAirportSelect]);

  // Get airport icon based on type
  const getAirportIcon = (airportType: string) => {
    switch (airportType) {
      case 'international':
        return '✈️';
      case 'domestic':
        return '🛩️';
      case 'private':
        return '🏢';
      default:
        return '📍';
    }
  };

  // Format price range
  const formatPriceRange = (price: CharterRoute['price']) => {
    if (!price) return t('pricing.contactForPrice');

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency
    });

    return `${formatter.format(price.min)} - ${formatter.format(price.max)}`;
  };

  // Get route frequency color
  const getRouteFrequencyColor = (frequency: CharterRoute['frequency']) => {
    switch (frequency) {
      case 'high': return '#059669'; // green-600
      case 'medium': return '#D97706'; // amber-600
      case 'low': return '#DC2626'; // red-600
      default: return '#6B7280'; // gray-500
    }
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Map Component */}
      <AccessibleMap
        center={mapCenter}
        zoom={selectedRoute ? 6 : 4}
        markers={airportMarkers}
        onMarkerClick={handleMarkerClick}
        height={height}
        showControls={true}
        enableKeyboardNavigation={true}
        fitBounds={selectedRoute ? false : airports.length > 1}
        apiKey={apiKey}
        ariaLabel={t('mapAriaLabel')}
        instructions={t('mapInstructions')}
        className="rounded-lg shadow-lg"
      />

      {/* Route Visualization Overlay */}
      {showRoutes && selectedRoute && (
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={getRouteFrequencyColor(selectedRoute.frequency)}
                />
              </marker>
            </defs>
            <line
              x1="20"
              y1="50"
              x2="80"
              y2="50"
              stroke={getRouteFrequencyColor(selectedRoute.frequency)}
              strokeWidth="3"
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      {/* Airport Details Panel */}
      {showAirportDetails && selectedAirport && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm border border-neutral-light">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg text-neutral-dark">
                {selectedAirport.name}
              </h3>
              <p className="text-sm text-neutral-medium">
                {selectedAirport.code} • {selectedAirport.city}, {selectedAirport.country}
              </p>
            </div>
            <button
              onClick={() => setSelectedAirport(null)}
              className="text-neutral-medium hover:text-neutral-dark p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-primary"
              aria-label={t('closeDetails')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Airport Type */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getAirportIcon(selectedAirport.type)}</span>
              <span className="text-sm font-medium capitalize text-neutral-dark">
                {selectedAirport.type} {t('airport')}
              </span>
            </div>

            {/* Runway Information */}
            {selectedAirport.runway && (
              <div className="bg-neutral-light/30 rounded-md p-3">
                <h4 className="text-sm font-medium text-neutral-dark mb-1">
                  {t('runwayInfo')}
                </h4>
                <div className="text-sm text-neutral-medium space-y-1">
                  <div>{t('length')}: {selectedAirport.runway.length.toLocaleString()}ft</div>
                  <div>{t('surface')}: {selectedAirport.runway.surface}</div>
                </div>
              </div>
            )}

            {/* Services */}
            {selectedAirport.services && selectedAirport.services.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-neutral-dark mb-2">
                  {t('services')}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAirport.services.map((service, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-navy-primary/10 text-navy-primary rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available Routes */}
            {filteredRoutes.some(route =>
              route.departure.id === selectedAirport.id || route.arrival.id === selectedAirport.id
            ) && (
              <div>
                <h4 className="text-sm font-medium text-neutral-dark mb-2">
                  {t('availableRoutes')}
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredRoutes
                    .filter(route =>
                      route.departure.id === selectedAirport.id || route.arrival.id === selectedAirport.id
                    )
                    .slice(0, 5)
                    .map(route => {
                      const otherAirport = route.departure.id === selectedAirport.id
                        ? route.arrival
                        : route.departure;
                      const direction = route.departure.id === selectedAirport.id ? '→' : '←';

                      return (
                        <button
                          key={route.id}
                          onClick={() => onRouteSelect?.(route)}
                          className="w-full text-left p-2 rounded-md hover:bg-neutral-light/50 focus:outline-none focus:ring-2 focus:ring-navy-primary transition-colors"
                        >
                          <div className="text-sm font-medium text-neutral-dark">
                            {direction} {otherAirport.code}
                          </div>
                          <div className="text-xs text-neutral-medium">
                            {otherAirport.city} • {route.estimatedTime}
                          </div>
                          {route.price && (
                            <div className="text-xs text-navy-primary font-medium">
                              {formatPriceRange(route.price)}
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Details Panel */}
      {selectedRoute && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm border border-neutral-light">
          <h3 className="font-semibold text-lg text-neutral-dark mb-3">
            {t('routeDetails')}
          </h3>

          <div className="space-y-3">
            {/* Route Path */}
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="font-semibold text-neutral-dark">
                  {selectedRoute.departure.code}
                </div>
                <div className="text-xs text-neutral-medium">
                  {selectedRoute.departure.city}
                </div>
              </div>

              <div className="flex-1 mx-3 relative">
                <div className="border-t-2 border-dashed border-navy-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-2 text-xs text-neutral-medium">
                    {selectedRoute.estimatedTime}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="font-semibold text-neutral-dark">
                  {selectedRoute.arrival.code}
                </div>
                <div className="text-xs text-neutral-medium">
                  {selectedRoute.arrival.city}
                </div>
              </div>
            </div>

            {/* Route Metrics */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-neutral-medium">{t('distance')}</div>
                <div className="font-medium text-neutral-dark">
                  {selectedRoute.distance.toLocaleString()} nm
                </div>
              </div>
              <div>
                <div className="text-neutral-medium">{t('frequency')}</div>
                <div className="font-medium text-neutral-dark capitalize">
                  {selectedRoute.frequency || t('onDemand')}
                </div>
              </div>
            </div>

            {/* Pricing */}
            {selectedRoute.price && (
              <div className="bg-navy-primary/5 rounded-md p-3">
                <div className="text-sm text-neutral-medium mb-1">
                  {t('estimatedPrice')}
                </div>
                <div className="text-lg font-semibold text-navy-primary">
                  {formatPriceRange(selectedRoute.price)}
                </div>
              </div>
            )}

            {/* Available Aircraft */}
            {selectedRoute.aircraft && selectedRoute.aircraft.length > 0 && (
              <div>
                <div className="text-sm text-neutral-medium mb-1">
                  {t('availableAircraft')}
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedRoute.aircraft.map((aircraft, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-neutral-light text-neutral-dark rounded-full"
                    >
                      {aircraft}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <h4 className="font-semibold mb-2">{t('legend.title')}</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg">✈️</span>
            <span>{t('legend.international')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🛩️</span>
            <span>{t('legend.domestic')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏢</span>
            <span>{t('legend.private')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}