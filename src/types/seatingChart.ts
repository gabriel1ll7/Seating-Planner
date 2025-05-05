
import { Canvas, Circle, Rect } from "fabric";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  tableId: string;
  chairIndex: number;
}

export interface Table {
  id: string;
  number: number;
  left: number;
  top: number;
  radius: number;
  capacity: number;
  fabricObject?: Circle;
}

export interface VenueElement {
  id: string;
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  fabricObject?: Rect;
}
