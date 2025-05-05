
import { fabric } from "fabric";
import { Table, Guest, VenueElement } from "@/types/seatingChart";

export const setupCanvas = (canvasElement: HTMLCanvasElement): fabric.Canvas => {
  const fabricCanvas = new fabric.Canvas(canvasElement, {
    width: window.innerWidth - 350, // Adjust width to account for sidebar
    height: window.innerHeight - 150, // Adjust height to account for header
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
): void => {
  // Create the table circle - make it more visible with stronger colors
  const circle = new fabric.Circle({
    left: table.left,
    top: table.top,
    fill: "#ffffff",
    stroke: "#2563eb",
    strokeWidth: 3,
    radius: table.radius,
    originX: 'center',
    originY: 'center',
    hasControls: true,
    hasBorders: true,
    lockRotation: true,
    objectCaching: false,
    selectable: true,
  });

  // Set custom properties for identification
  circle.set('tableId', table.id);
  circle.set('type', "table");

  // Add the circle to canvas
  canvas.add(circle);

  // Create table number text
  const tableNumberText = new fabric.Text(`Table ${table.number}`, {
    left: table.left,
    top: table.top - 10,
    fontSize: 16,
    fontWeight: "bold",
    fill: "#1e3a8a",
    originX: 'center',
    originY: 'center',
    selectable: false,
    objectCaching: false,
  });

  // Set custom properties for identification
  tableNumberText.set('tableId', table.id);
  tableNumberText.set('type', "tableText");

  // Add the text to canvas
  canvas.add(tableNumberText);

  // Create guest count text
  const tableGuestCount = guests.filter((g) => g.tableId === table.id).length;
  const guestCountText = new fabric.Text(
    `${tableGuestCount}/${table.capacity} guests`, 
    {
      left: table.left,
      top: table.top + 10,
      fontSize: 14,
      fill: "#4b5563",
      originX: 'center',
      originY: 'center',
      selectable: false,
      objectCaching: false,
    }
  );

  // Set custom properties for identification
  guestCountText.set('tableId', table.id);
  guestCountText.set('type', "tableGuestCount");

  // Add the guest count to canvas
  canvas.add(guestCountText);

  // Create capacity control buttons
  const plusButton = new fabric.Text("+", {
    left: table.left + table.radius + 10,
    top: table.top,
    fontSize: 18,
    fontWeight: "bold",
    fill: "#10b981",
    backgroundColor: "#ffffff",
    originX: 'center',
    originY: 'center',
    width: 20,
    height: 20,
    selectable: true,
    objectCaching: false,
  });
  
  // Set custom properties for identification
  plusButton.set('tableId', table.id);
  plusButton.set('type', "tableButton");
  plusButton.set('buttonType', "plus");
  
  const minusButton = new fabric.Text("-", {
    left: table.left - table.radius - 10,
    top: table.top,
    fontSize: 18,
    fontWeight: "bold",
    fill: "#ef4444",
    backgroundColor: "#ffffff",
    originX: 'center',
    originY: 'center',
    width: 20,
    height: 20,
    selectable: true,
    objectCaching: false,
  });
  
  // Set custom properties for identification
  minusButton.set('tableId', table.id);
  minusButton.set('type', "tableButton");
  minusButton.set('buttonType', "minus");
  
  // Add capacity buttons to canvas
  canvas.add(plusButton);
  canvas.add(minusButton);
  
  // Set button click handlers
  plusButton.on('mousedown', () => {
    onTableClick(table, -1, false, true, "plus");
  });
  
  minusButton.on('mousedown', () => {
    onTableClick(table, -1, false, true, "minus");
  });

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
      hasControls: false,
      hasBorders: false,
      selectable: true,
      objectCaching: false,
    });
    
    // Set custom properties for identification
    chair.set('chairIndex', i);
    chair.set('tableId', table.id);
    chair.set('type', "tableChair");
    
    // Add chair to canvas
    canvas.add(chair);
    
    // Handle chair clicks to assign guests
    chair.on('mousedown', () => {
      onTableClick(table, i, true, false);
    });
  }

  // Handle moving the table
  circle.on("moving", (e) => {
    const newLeft = circle.left || 0;
    const newTop = circle.top || 0;
    
    // Update all the elements associated with this table
    canvas.getObjects().forEach(obj => {
      if (obj.tableId === table.id && obj !== circle) {
        if (obj.type === "tableText") {
          obj.set({
            left: newLeft,
            top: newTop - 10
          });
        } else if (obj.type === "tableGuestCount") {
          obj.set({
            left: newLeft,
            top: newTop + 10
          });
        } else if (obj.type === "tableChair") {
          const chairIndex = obj.chairIndex;
          if (typeof chairIndex === 'number') {
            const angle = (chairIndex * 2 * Math.PI) / table.capacity;
            obj.set({
              left: newLeft + (table.radius + 20) * Math.cos(angle),
              top: newTop + (table.radius + 20) * Math.sin(angle)
            });
          }
        } else if (obj.type === "tableButton") {
          if (obj.buttonType === "plus") {
            obj.set({
              left: newLeft + table.radius + 10,
              top: newTop
            });
          } else if (obj.buttonType === "minus") {
            obj.set({
              left: newLeft - table.radius - 10,
              top: newTop
            });
          }
        }
      }
    });
    
    // Call the handler to update the table position in state
    onTableClick({...table, left: newLeft, top: newTop}, -1, false, false);
    
    // Ensure canvas is re-rendered after move
    canvas.renderAll();
  });

  // Make sure to render after all objects are added
  canvas.renderAll();
};

export const createVenueElementOnCanvas = (
  canvas: fabric.Canvas,
  element: VenueElement,
  onElementUpdate: (updatedElement: VenueElement) => void
): void => {
  // Create the rectangle with solid fill for better visibility
  const rect = new fabric.Rect({
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    fill: element.color || "#E5DEFF",
    stroke: "#6b7280",
    strokeWidth: 2,
    rx: 5,
    ry: 5,
    originX: 'left',
    originY: 'top',
    opacity: 0.8, // Increased from 0.7 for better visibility
    hasControls: true,
    hasBorders: true,
    selectable: true,
    objectCaching: false,
  });

  // Set custom properties for identification
  rect.set('id', element.id);
  rect.set('type', "venueElement");

  // Add rectangle to canvas
  canvas.add(rect);

  // Create title text
  const titleText = new fabric.Text(element.title, {
    left: element.left + element.width / 2,
    top: element.top + element.height / 2,
    fontSize: 18, // Increased from 16 for better visibility
    fontWeight: "bold",
    fill: "#1f2937",
    originX: 'center',
    originY: 'center',
    selectable: false,
    objectCaching: false,
  });

  // Set custom properties for identification
  titleText.set('parentId', element.id);
  titleText.set('type', "venueTitle");

  // Add title to canvas
  canvas.add(titleText);

  // Handle moving the element
  rect.on("moving", (e) => {
    const newLeft = rect.left || 0;
    const newTop = rect.top || 0;
    
    // Update the title text position
    canvas.getObjects().forEach(obj => {
      if (obj.type === "venueTitle" && obj.parentId === element.id) {
        obj.set({
          left: newLeft + (rect.width || 0) * (rect.scaleX || 1) / 2,
          top: newTop + (rect.height || 0) * (rect.scaleY || 1) / 2
        });
      }
    });
    
    // Call the handler to update element position in state
    onElementUpdate({
      ...element, 
      left: newLeft, 
      top: newTop
    });
    
    // Ensure canvas is re-rendered after move
    canvas.renderAll();
  });

  // Handle scaling the element
  rect.on("scaling", (e) => {
    const newLeft = rect.left || 0;
    const newTop = rect.top || 0;
    const scaleX = rect.scaleX || 1;
    const scaleY = rect.scaleY || 1;
    const width = rect.width || 0;
    const height = rect.height || 0;
    const newWidth = width * scaleX;
    const newHeight = height * scaleY;
    
    // Update the title text position
    canvas.getObjects().forEach(obj => {
      if (obj.type === "venueTitle" && obj.parentId === element.id) {
        obj.set({
          left: newLeft + newWidth / 2,
          top: newTop + newHeight / 2
        });
      }
    });
    
    // Call the handler to update element dimensions in state
    onElementUpdate({
      ...element, 
      width: newWidth, 
      height: newHeight
    });
    
    // Ensure canvas is re-rendered after scaling
    canvas.renderAll();
  });

  // Make sure to render after all objects are added
  canvas.renderAll();
};
