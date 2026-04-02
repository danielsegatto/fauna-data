import {
  FaBinoculars,
  FaBucket,
  FaCamera,
  FaDungeon,
  FaEarListen,
  FaEye,
  FaGrip,
  FaLeftRight,
  FaListUl,
  FaLocationDot,
  FaVolumeHigh,
} from "react-icons/fa6";
import { type IconType } from "react-icons";
import { PiPawPrint } from "react-icons/pi";

export const METHODOLOGY_ICONS: Record<string, IconType> = {
  "point-count": FaEarListen,
  transect: FaLeftRight,
  "mist-net": FaGrip,
  mackinnon: FaListUl,
  "free-observation": FaBinoculars,
  "camera-trap": FaCamera,
  "track-station": PiPawPrint,
  "live-trap": FaDungeon,
  "visual-search": FaEye,
  pitfall: FaBucket,
  acoustic: FaVolumeHigh,
};

export const FALLBACK_METHODOLOGY_ICON: IconType = FaLocationDot;

export function getMethodologyIcon(methodologyId: string): IconType {
  return METHODOLOGY_ICONS[methodologyId] ?? FALLBACK_METHODOLOGY_ICON;
}