import React from 'react';

export const MapContainer    = ({ children }: { children?: React.ReactNode }) => <div data-testid="map">{children}</div>;
export const TileLayer       = () => null;
export const Marker          = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const Popup           = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const useMap          = () => ({ setView: jest.fn() });
export const useMapEvents    = (handlers: Record<string, unknown>) => handlers;
