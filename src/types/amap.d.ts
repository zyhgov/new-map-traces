export {}

declare global {
  namespace AMap {
    class Map {
      constructor(container: string | HTMLElement, options?: MapOptions)
      destroy(): void
      setCenter(center: [number, number]): void
      setZoom(zoom: number): void
      setMapStyle(style: string): void
      add(overlay: Marker | Polyline | Polygon | Circle): void
      remove(overlay: Marker | Polyline | Polygon | Circle): void
      on(event: string, callback: (e: any) => void): void
      off(event: string, callback?: (e: any) => void): void
      getAllOverlays(type?: string): any[]
      clearMap(): void
    }

    interface MapOptions {
      zoom?: number
      center?: [number, number]
      viewMode?: '2D' | '3D'
      pitch?: number
      mapStyle?: string
    }

    class Marker {
      constructor(options?: MarkerOptions)
      setPosition(position: [number, number]): void
      getPosition(): LngLat
      setIcon(icon: Icon | string): void
      on(event: string, callback: () => void): void
      off(event: string, callback?: () => void): void
    }

    interface MarkerOptions {
      position?: [number, number]
      title?: string
      icon?: Icon | string
      offset?: Pixel
      anchor?: string
      content?: string | HTMLElement
      draggable?: boolean
    }

    class LngLat {
      lng: number
      lat: number
      constructor(lng: number, lat: number)
    }

    class Pixel {
      constructor(x: number, y: number)
    }

    class Icon {
      constructor(options?: IconOptions)
    }

    interface IconOptions {
      size?: Size
      image?: string
      imageSize?: Size
      imageOffset?: Pixel
    }

    class Size {
      constructor(width: number, height: number)
    }

    class Polyline {
      constructor(options?: PolylineOptions)
      getPath(): LngLat[]
      on(event: string, callback: () => void): void
    }

    interface PolylineOptions {
      path?: [number, number][]
      strokeColor?: string
      strokeWeight?: number
      strokeOpacity?: number
      strokeStyle?: string
    }

    class Polygon {
      constructor(options?: PolygonOptions)
      getPath(): LngLat[]
      on(event: string, callback: () => void): void
    }

    interface PolygonOptions {
      path?: [number, number][]
      strokeColor?: string
      strokeWeight?: number
      strokeOpacity?: number
      fillColor?: string
      fillOpacity?: number
    }

    class Circle {
      constructor(options?: CircleOptions)
      getCenter(): LngLat
      getRadius(): number
      on(event: string, callback: () => void): void
    }

    interface CircleOptions {
      center?: [number, number]
      radius?: number
      strokeColor?: string
      strokeWeight?: number
      strokeOpacity?: number
      fillColor?: string
      fillOpacity?: number
    }

    class MouseTool {
      constructor(map: Map)
      marker(options?: MarkerOptions): void
      polygon(options?: PolygonOptions): void
      circle(options?: CircleOptions): void
      polyline(options?: PolylineOptions): void
      close(clear?: boolean): void
      on(event: string, callback: (e: any) => void): void
    }

    class PolygonEditor {
      constructor(map: Map, polygon: Polygon)
      open(): void
      close(): void
      on(event: string, callback: (e: any) => void): void
    }

    class CircleEditor {
      constructor(map: Map, circle: Circle)
      open(): void
      close(): void
      on(event: string, callback: (e: any) => void): void
    }
  }

  const AMap: typeof AMap
}