import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { formatDateTime } from "@/lib/format";
import { GROUP_LABELS } from "@/lib/types";
import type { CollectionPointMapPin, RecordMapPin } from "@/lib/recordMap";

/** Red pulsing dot — for individual species records. */
const MAP_MARKER_ICON = L.divIcon({
  className: "records-map-pin",
  html: '<span class="records-map-pin__ring"></span><span class="records-map-pin__dot"></span><span class="records-map-pin__pointer"></span>',
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -33],
});

/** Teal diamond — for collection point anchors. */
const MAP_CP_ICON = L.divIcon({
  className: "map-cp-pin",
  html: '<span class="map-cp-pin__diamond"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

interface FitBoundsProps {
  pins: RecordMapPin[];
  collectionPointPins: CollectionPointMapPin[];
}

function FitBounds({ pins, collectionPointPins }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    const allCoords: [number, number][] = [
      ...pins.map((p) => [p.latitude, p.longitude] as [number, number]),
      ...collectionPointPins.map((p) => [p.latitude, p.longitude] as [number, number]),
    ];

    if (allCoords.length === 0) return;

    if (allCoords.length === 1) {
      map.setView(allCoords[0], 14);
      return;
    }

    const bounds = L.latLngBounds(allCoords);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }, [map, pins, collectionPointPins]);

  return null;
}

interface RecordsMapProps {
  pins: RecordMapPin[];
  collectionPointPins?: CollectionPointMapPin[];
  heightClassName?: string;
  onOpenRecord?: (recordId: string) => void;
  onOpenCollectionPoint?: (pointId: string) => void;
}

const DEFAULT_CENTER: [number, number] = [-14.235, -51.9253];

export function RecordsMap({
  pins,
  collectionPointPins = [],
  heightClassName = "h-[440px]",
  onOpenRecord,
  onOpenCollectionPoint,
}: RecordsMapProps) {
  return (
    <div className={`records-map-scope relative isolate z-0 rounded-2xl overflow-hidden border border-gray-200 shadow-card ${heightClassName}`}>
      <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium text-gray-600 backdrop-blur">
        Imagery © Esri
      </div>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={4}
        className="h-full w-full"
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <ZoomControl position="topright" />
        <FitBounds pins={pins} collectionPointPins={collectionPointPins} />

        {/* Collection point markers — teal diamond */}
        {collectionPointPins.map((cp) => (
          <Marker key={`cp-${cp.collectionPointId}`} position={[cp.latitude, cp.longitude]} icon={MAP_CP_ICON}>
            <Popup>
              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <p className="text-sm font-bold text-gray-900">{cp.name}</p>
                <p className="text-xs text-gray-600">{GROUP_LABELS[cp.group]}</p>
                <p className="text-xs text-gray-500">{cp.recordCount} registro{cp.recordCount !== 1 ? "s" : ""}</p>
                {onOpenCollectionPoint && (
                  <div className="pt-1">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold"
                      onClick={() => onOpenCollectionPoint(cp.collectionPointId)}
                    >
                      Ver Ponto
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Record markers — red pulsing dot */}
        {pins.map((pin) => (
          <Marker key={pin.recordId} position={[pin.latitude, pin.longitude]} icon={MAP_MARKER_ICON}>
            <Popup>
              <div className="flex flex-col gap-1.5 min-w-[180px]">
                <p className="text-sm font-bold text-gray-900">{pin.species}</p>
                <p className="text-xs text-gray-600">{GROUP_LABELS[pin.group]}</p>
                <p className="text-xs text-gray-500">{pin.collectionPointName}</p>
                <p className="text-xs text-gray-500">{formatDateTime(pin.timestamp)}</p>

                <div className="flex gap-2 pt-1">
                  {onOpenRecord && (
                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold"
                      onClick={() => onOpenRecord(pin.recordId)}
                    >
                      Registro
                    </button>
                  )}
                  {onOpenCollectionPoint && (
                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold"
                      onClick={() => onOpenCollectionPoint(pin.collectionPointId)}
                    >
                      Ponto
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
