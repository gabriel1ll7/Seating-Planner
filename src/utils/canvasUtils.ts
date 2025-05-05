
import { fabric } from "fabric";
import { Table, Guest, VenueElement } from "@/types/seatingChart";

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
  console.log("Creating table on canvas:", table);

  // Remove old table object if it exists
  if (table.fabricObject) {
    canvas.remove(table.fabricObject);
  }

  // Create the table circle without grouping first
  const circle = new fabric.Circle({
    left: table.left,
    top: table.top,
    fill: "#ffffff",
    stroke: "#2563eb",
    strokeWidth: 2,
    radius: table.radius,
    originX: 'center',
    originY: 'center',
    hasControls: true,
    hasBorders: true,
    lockRotation: true,
    tableId: table.id,
    selectable: true,
  });

  // Add the table circle to the canvas directly first
  canvas.add(circle);
  canvas.renderAll();
  console.log("Added circle to canvas:", circle);

  // Create table number text
  const tableNumberText = new fabric.Text(`Table ${table.number}`, {
    left: table.left,
    top: table.top - table.radius - 10,
    fontSize: 18,
    fontWeight: "bold",
    fill: "#1e3a8a",
    originX: 'center',
    originY: 'center',
    selectable: false,
  });

  // Add text to canvas
  canvas.add(tableNumberText);

  // Create guest count text
  const tableGuestCount = guests.filter((g) => g.tableId === table.id).length;
  const guestCountText = new fabric.Text(
    `${tableGuestCount}/${table.capacity} guests`, 
    {
      left: table.left,
      top: table.top + table.radius + 10,
      fontSize: 14,
      fill: "#4b5563",
      originX: 'center',
      originY: 'center',
      selectable: false,
    }
  );

  // Add guest count to canvas
  canvas.add(guestCountText);

  // Create chair circles
  for (let i = 0; i < table.capacity; i++) {
    const angle = (i * 2 * Math.PI) / table.capacity;
    const chairRadius = 12;
    const chairLeft = table.left + (table.radius + 20) * Math.cos(angle);
    const chairTop = table.top + (table.radius + 20) * Math.sin(angle);
    
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
      originX: 'center',
      originY: 'center',
      chairIndex: i,
      tableId: table.id,
      hasControls: false,
      hasBorders: false,
      selectable: true,
    });
    
    // Handle chair clicks to assign guests
    chair.on('mousedown', () => {
      console.log("Chair clicked:", i);
      onTableClick(table, i, true, false);
    });

    // Add chair to canvas
    canvas.add(chair);
  }

  // Handle moving the table - update position of all components
  circle.on("moving", (e) => {
    const newLeft = circle.left;
    const newTop = circle.top;
    
    if (typeof newLeft === 'number' && typeof newTop === 'number') {
      // Update table data
      table.left = newLeft;
      table.top = newTop;
      
      // Update table text positions
      tableNumberText.set({
        left: newLeft,
        top: newTop - table.radius - 10
      });
      
      guestCountText.set({
        left: newLeft,
        top: newTop + table.radius + 10
      });
      
      // Update chair positions
      canvas.getObjects().forEach(obj => {
        if (obj.chairIndex !== undefined && obj.tableId === table.id) {
          const chairIndex = obj.chairIndex;
          const angle = (chairIndex * 2 * Math.PI) / table.capacity;
          obj.set({
            left: newLeft + (table.radius + 20) * Math.cos(angle),
            top: newTop + (table.radius + 20) * Math.sin(angle)
          });
        }
      });
      
      canvas.renderAll();
      
      // Call the handler
      onTableClick({...table, left: newLeft, top: newTop}, -1, false, false);
    }
  });

  // Make sure to render after all objects are added
  canvas.renderAll();

  // Return the updated table object
  return {
    ...table,
    fabricObject: circle,
  };
};

export const createVenueElementOnCanvas = (
  canvas: fabric.Canvas,
  element: VenueElement,
  onElementUpdate: (updatedElement: VenueElement) => void
): VenueElement => {
  console.log("Creating venue element on canvas:", element);
  
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
    hasControls: true,
    hasBorders: true,
    selectable: true,
  });

  // Add rectangle to canvas
  canvas.add(rect);
  canvas.renderAll();
  console.log("Added rectangle to canvas:", rect);

  // Create title text
  const titleText = new fabric.Text(element.title, {
    left: element.left + element.width / 2,
    top: element.top + element.height / 2,
    fontSize: 16,
    fontWeight: "bold",
    fill: "#1f2937",
    originX: 'center',
    originY: 'center',
    selectable: false,
  });

  // Add text to canvas
  canvas.add(titleText);

  // Handle moving the element
  rect.on("moving", (e) => {
    const newLeft = rect.left;
    const newTop = rect.top;
    
    if (typeof newLeft === 'number' && typeof newTop === 'number') {
      // Update element data
      element.left = newLeft;
      element.top = newTop;
      
      // Update title text position
      titleText.set({
        left: newLeft + element.width / 2,
        top: newTop + element.height / 2
      });
      
      canvas.renderAll();
      
      // Call the handler
      onElementUpdate({...element, left: newLeft, top: newTop});
    }
  });

  // Handle scaling the element
  rect.on("scaling", (e) => {
    const target = e.target;
    const newWidth = target.width * target.scaleX;
    const newHeight = target.height * target.scaleY;
    
    // Update element data
    element.width = newWidth;
    element.height = newHeight;
    
    // Update title text position
    titleText.set({
      left: element.left + newWidth / 2,
      top: element.top + newHeight / 2
    });
    
    canvas.renderAll();
    
    // Call the handler
    onElementUpdate({...element, width: newWidth, height: newHeight});
  });

  // Make sure to render after all objects are added
  canvas.renderAll();

  return {
    ...element,
    fabricObject: rect,
  };
};
