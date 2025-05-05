import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { Table, Guest } from "@/hooks/useSeatingChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export const Canvas = ({
  canvas,
  setCanvas,
  tables,
  setTables,
  guests,
  setGuests,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [activeChair, setActiveChair] = useState<{
    tableId: string;
    chairIndex: number;
  } | null>(null);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
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

      setCanvas(fabricCanvas);
    }
  }, [setCanvas, canvas]);

  // Handle table changes
  const updateTableOnCanvas = (table: Table) => {
    if (!canvas) return;

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
        handleCapacityChange(table, 1);
        return;
      }
      
      if (target === minusText || target === minusButton) {
        handleCapacityChange(table, -1);
        return;
      }
      
      // Check if the click is on a chair
      if (target && "chairIndex" in target) {
        const chairIndex = target.chairIndex;
        const tableId = target.tableId;
        
        // Set active chair and open dialog
        setActiveChair({ tableId, chairIndex });
        setActiveTable(table);
        
        // Find if there's a guest already assigned
        const existingGuest = guests.find(
          (g) => g.tableId === tableId && g.chairIndex === chairIndex
        );
        
        if (existingGuest) {
          setGuestFirstName(existingGuest.firstName);
          setGuestLastName(existingGuest.lastName);
        } else {
          setGuestFirstName("");
          setGuestLastName("");
        }
        
        setGuestDialogOpen(true);
      }
    });

    // Handle moving the table
    tableGroup.on("moving", (e) => {
      const target = e.target;
      const updatedTables = tables.map((t) => {
        if (t.id === table.id) {
          return {
            ...t,
            left: target.left,
            top: target.top,
          };
        }
        return t;
      });
      setTables(updatedTables);
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

  // Handle venue element changes
  const updateVenueElementOnCanvas = (element) => {
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
      const updatedElements = tables.map((el) => {
        if (el.id === element.id) {
          return {
            ...el,
            left: target.left,
            top: target.top,
          };
        }
        return el;
      });
      setTables(updatedElements);
    });

    // Handle scaling the element
    elementGroup.on("scaling", (e) => {
      const target = e.target;
      const updatedElements = tables.map((el) => {
        if (el.id === element.id) {
          return {
            ...el,
            width: target.width * target.scaleX,
            height: target.height * target.scaleY,
          };
        }
        return el;
      });
      setTables(updatedElements);
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

  // Handle adding/removing chairs when capacity changes
  const handleCapacityChange = (table: Table, change: number) => {
    const newCapacity = Math.min(Math.max(table.capacity + change, 6), 12);
    
    if (newCapacity === table.capacity) return;

    // Update table capacity
    const updatedTables = tables.map((t) => {
      if (t.id === table.id) {
        return {
          ...t,
          capacity: newCapacity,
        };
      }
      return t;
    });
    
    setTables(updatedTables);
    
    // If capacity is reduced, remove guests from removed chairs
    if (change < 0) {
      const updatedGuests = guests.filter(
        (g) => !(g.tableId === table.id && g.chairIndex >= newCapacity)
      );
      setGuests(updatedGuests);
    }
    
    // Redraw the table
    updateTableOnCanvas({
      ...table,
      capacity: newCapacity,
    });
  };

  // Handle guest assignment dialog
  const handleGuestDialogSubmit = () => {
    if (!activeChair || !activeTable) return;
    
    // If name is empty, remove the guest
    if (!guestFirstName.trim() && !guestLastName.trim()) {
      const updatedGuests = guests.filter(
        (g) =>
          !(
            g.tableId === activeChair.tableId &&
            g.chairIndex === activeChair.chairIndex
          )
      );
      setGuests(updatedGuests);
    } else {
      // Update or add guest
      const existingGuestIndex = guests.findIndex(
        (g) =>
          g.tableId === activeChair.tableId &&
          g.chairIndex === activeChair.chairIndex
      );
      
      if (existingGuestIndex >= 0) {
        // Update existing guest
        const updatedGuests = [...guests];
        updatedGuests[existingGuestIndex] = {
          ...updatedGuests[existingGuestIndex],
          firstName: guestFirstName,
          lastName: guestLastName,
        };
        setGuests(updatedGuests);
      } else {
        // Add new guest
        setGuests([
          ...guests,
          {
            id: `guest-${Date.now()}`,
            firstName: guestFirstName,
            lastName: guestLastName,
            tableId: activeChair.tableId,
            chairIndex: activeChair.chairIndex,
          },
        ]);
      }
    }
    
    // Close dialog and reset form
    setGuestDialogOpen(false);
    setGuestFirstName("");
    setGuestLastName("");
    setActiveChair(null);
    
    // Redraw the table
    if (activeTable) {
      updateTableOnCanvas(activeTable);
    }
  };

  // Render tables whenever tables state changes
  useEffect(() => {
    if (!canvas || tables.length === 0) return;
    
    // Create a separate function to avoid setting state in the effect
    const updateTablesOnCanvas = () => {
      const updatedTables = [...tables];
      tables.forEach((table, index) => {
        const updatedTable = updateTableOnCanvas(table);
        if (updatedTable) {
          updatedTables[index] = updatedTable;
        }
      });
      return updatedTables;
    };
    
    const newTables = updateTablesOnCanvas();
    
    // Only set tables state if it actually changed
    if (JSON.stringify(newTables) !== JSON.stringify(tables)) {
      setTables(newTables);
    }
  }, [canvas, tables.length, guests.length]); // Only depend on the lengths to avoid infinite renders

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="fabric-canvas" />
      
      <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Guest to Seat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={guestFirstName}
                onChange={(e) => setGuestFirstName(e.target.value)}
                placeholder="First Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={guestLastName}
                onChange={(e) => setGuestLastName(e.target.value)}
                placeholder="Last Name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setGuestDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleGuestDialogSubmit}>
                {guestFirstName || guestLastName ? "Save Guest" : "Remove Guest"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
