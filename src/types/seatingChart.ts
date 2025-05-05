export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  tableId: string;
  chairIndex: number;
}

export interface Table {
  type: "table";
  id: string;
  number: number;
  x: number;
  y: number;
  radius: number;
  capacity: number;
  draggable?: boolean;
}

export interface VenueElement {
  type: "venue";
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  draggable?: boolean;
}
