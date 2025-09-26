declare module 'leaflet' {
  export * from 'leaflet';
}

declare global {
  interface Window {
    L: any;
  }
}
