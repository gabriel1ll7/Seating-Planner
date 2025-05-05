
import { fabric } from "fabric";
import { Table, Guest } from "@/hooks/useSeatingChart";

export const setupCanvas = (canvasElement: HTMLCanvasElement): fabric.Canvas => {
  const fabricCanvas = new fabric.Canvas(canvasElement, {
    width: 1000,
    height: 800,
    backgroundColor: "#f5f7fb",
    selection: true,
    preserveObjectStacking: true,
  });

  // Enable zooming and panning
  fabricCanvas.on("mouse:wheel", function (opt) {
    const delta = opt.e.deltaY;
    let zoom = fabricCanvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.5) zoom = 0.5;
    fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // Panning
  fabricCanvas.on("mouse:down", function (opt) {
    const evt = opt.e;
    if (evt.altKey === true) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  });

  fabricCanvas.on("mouse:move", function (opt) {
    if (this.isDragging) {
      const e = opt.e;
      const vpt = this.viewportTransform;
      vpt[4] += e.clientX - this.lastPosX;
      vpt[5] += e.clientY - this.lastPosY;
      this.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  });

  fabricCanvas.on("mouse:up", function (opt) {
    this.isDragging = false;
    this.selection = true;
  });

  return fabricCanvas;
};

export const createTableOnCanvas = (
  canvas: fabric.Canvas, 
  table: Table, 
  guests: Guest[], 
  onTableClick: (table: Table, chairIndex: number, isChair: boolean, isButton: boolean, buttonType?: string) => void
): Table => {
  // Remove old table if it exists
  if (table.fabricObject) {
    canvas.remove(table.fabricObject);
  }

  // Create the table circle
  const circle = new fabric.Circle({
    left: table.left,
    top: table.top,
    fill: "#ffffff",
    stroke: "#2563eb",
    strokeWidth: 2,
    radius: table.radius,
    hasControls: true,
    hasBorders: true,
    lockRotation: true,
    tableId: table.id,
    tableNumber: table.number,
    capacity: table.capacity,
  });

  // Create table number text
  const tableNumberText = new fabric.Text(`Table ${table.number}`, {
    left: table.left,
    top: table.top - 15,
    originX: "center",
    originY: "center",
    fontSize: 18,
    fontWeight: "bold",
    fill: "#1e3a8a",
  });

  // Create guest count text
  const tableGuestCount = guests.filter((g) => g.tableId === table.id).length;
  const guestCountText = new fabric.Text(
    `${tableGuestCount}/${table.capacity} guests`, 
    {
      left: table.left,
      top: table.top + 10,
      originX: "center",
      originY: "center",
      fontSize: 14,
      fill: "#4b5563",
    }
  );

  // Create plus button
  const plusButton = new fabric.Circle({
    left: table.left + 25,
    top: table.top + 35,
    fill: "#3b82f6",
    radius: 12,
    originX: "center",
    originY: "center",
  });
  
  const plusText = new fabric.Text("+", {
    left: table.left + 25,
    top: table.top + 35,
    fill: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    originX: "center",
    originY: "center",
  });

  // Create minus button
  const minusButton = new fabric.Circle({
    left: table.left - 25,
    top: table.top + 35,
    fill: "#ef4444",
    radius: 12,
    originX: "center",
    originY: "center",
  });
  
  const minusText = new fabric.Text("-", {
    left: table.left - 25,
    top: table.top + 35,
    fill: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    originX: "center",
    originY: "center",
  });

  // Create chair circles
  const chairObjects = [];
  const chairRadius = 12;
  
  for (let i = 0; i < table.capacity; i++) {
    const angle = (i * 2 * Math.PI) / table.capacity;
    const chairLeft = table.left + (table.radius + 10) * Math.cos(angle);
    const chairTop = table.top + (table.radius + 10) * Math.sin(angle);
    
    const guest = guests.find(
      (g) => g.tableId === table.id && g.chairIndex === i
    );
    
    const chairColor = guest ? "#4ade80" : "#e5e7eb";
    
    const chair = new fabric.Circle({
      left: chairLeft,
      top: chairTop,
      fill: chairColor,
      stroke: "#4b5563",
      strokeWidth: 1,
      radius: chairRadius,
      originX: "center",
      originY: "center",
      chairIndex: i,
      tableId: table.id,
      hasControls: false,
      hasBorders: false,
      selectable: true,
    });
    
    chairObjects.push(chair);
  }

  // Create a group for the table and its elements
  const tableGroup = new fabric.Group(
    [circle, tableNumberText, guestCountText, plusButton, plusText, minusButton, minusText, ...chairObjects],
    {
      left: table.left,
      top: table.top,
      originX: "center",
      originY: "center",
      subTargetCheck: true,
      tableId: table.id,
      tableNumber: table.number,
    }
  );

  // Handle chair clicks to assign guests
  tableGroup.on("mousedown", (e) => {
    const target = e.target;
    
    // Handle capacity buttons
    if (target === plusText || target === plusButton) {
      onTableClick(table, -1, false, true, "plus");
      return;
    }
    
    if (target === minusText || target === minusButton) {
      onTableClick(table, -1, false, true, "minus");
      return;
    }
    
    // Check if the click is on a chair
    if (target && "chairIndex" in target) {
      const chairIndex = target.chairIndex;
      onTableClick(table, chairIndex, true, false);
    }
  });

  // Handle moving the table
  tableGroup.on("moving", (e) => {
    const left = tableGroup.left;
    const top = tableGroup.top;
    
    if (typeof left === 'number' && typeof top === 'number') {
      onTableClick({...table, left, top}, -1, false, false);
    }
  });

  // Add the table group to the canvas
  canvas.add(tableGroup);
  canvas.renderAll();

  // Update the table object in state
  return {
    ...table,
    fabricObject: tableGroup,
  };
};

export const createVenueElementOnCanvas = (
  canvas: fabric.Canvas,
  element: any,
  onElementUpdate: (updatedElement: any) => void
) => {
  if (!canvas) return;

  // Remove old element if it exists
  if (element.fabricObject) {
    canvas.remove(element.fabricObject);
  }

  // Create the rectangle
  const rect = new fabric.Rect({
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    fill: element.color,
    stroke: "#6b7280",
    strokeWidth: 1,
    rx: 5,
    ry: 5,
    id: element.id,
    elementTitle: element.title,
  });

  // Create title text
  const titleText = new fabric.Text(element.title, {
    left: element.left + element.width / 2,
    top: element.top + element.height / 2,
    originX: "center",
    originY: "center",
    fontSize: 16,
    fontWeight: "bold",
    fill: "#1f2937",
  });

  // Create a group for the element and its title
  const elementGroup = new fabric.Group([rect, titleText], {
    left: element.left,
    top: element.top,
    id: element.id,
    elementTitle: element.title,
  });

  // Handle moving the element
  elementGroup.on("moving", (e) => {
    const target = e.target;
    const updatedElement = {
      ...element,
      left: target.left,
      top: target.top,
    };
    onElementUpdate(updatedElement);
  });

  // Handle scaling the element
  elementGroup.on("scaling", (e) => {
    const target = e.target;
    const updatedElement = {
      ...element,
      width: target.width * target.scaleX,
      height: target.height * target.scaleY,
    };
    onElementUpdate(updatedElement);
  });

  // Add the element group to the canvas
  canvas.add(elementGroup);
  canvas.renderAll();

  // Update the element object in state
  return {
    ...element,
    fabricObject: elementGroup,
  };
};
