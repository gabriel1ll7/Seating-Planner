# Seating.Art 🪑✨

> **A beautiful, intuitive visual seating chart planner for events of all sizes.**

Plan your perfect seating arrangement with an elegant drag-and-drop interface. From intimate family gatherings to large weddings and corporate events, Seating.Art makes organizing your guests effortless and enjoyable.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/gabriel1ll7/Seating-Planner)](https://github.com/gabriel1ll7/Seating-Planner/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/gabriel1ll7/Seating-Planner)](https://github.com/gabriel1ll7/Seating-Planner/commits/main)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 🎉 The Story

I built this app to plan the seating arrangement for my son's baptism party. What started as a weekend project to avoid drawing tables on paper became a fully-featured event planner that friends and family now use for their own celebrations.

Whether you're organizing a baptism, wedding, conference, or dinner party, Seating.Art helps you visualize and perfect your seating arrangements with ease.

---

## ✨ Features

### 🎨 **Visual Canvas**
- **Interactive canvas** with zoom, pan, and drag-and-drop
- **Circular tables** with 6-12 adjustable seats
- **Custom venue elements** for bars, dance floors, DJ booths, and more
- **Venue space boundary** to define your event area
- **Real-time visual feedback** with hover highlights and tooltips
- **Keyboard shortcuts** (Ctrl+0 to fit all, Delete to remove, Alt+drag to pan)

### 👥 **Guest Management**
- **Drag-and-drop** guests between tables
- **Quick-add** guests directly from the sidebar
- **Bidirectional highlighting** between canvas and guest list
- **Capacity indicators** showing filled/total seats per table
- **Unassigned guests** section for easy organization
- **Guest search** by hovering over chairs or names

### 🔐 **Collaboration**
- **Shareable URLs** with unique slugs (e.g., `happy-table-742`)
- **PIN protection** for edit access
- **View-only mode** by default for shared links
- **Auto-save** to localStorage and server (2-second debounce)
- **Offline support** with localStorage fallback

### 🎨 **Beautiful UI**
- **Dark/Light mode** with system preference detection
- **Responsive design** optimized for desktop and mobile
- **Paper-texture** aesthetic throughout
- **Toast notifications** for all actions
- **Smooth animations** and transitions
- **Mobile-friendly** sidebar with sheet overlay

### 💾 **Persistence**
- **Automatic saving** with visual status indicator
- **PostgreSQL backend** for reliable data storage
- **localStorage caching** for instant loads
- **Last venue** auto-loads on return visit

---

## 🚀 Quick Start

### Prerequisites

- **Bun** (recommended) or **Node.js** 18+
- **PostgreSQL** 14+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/seating-art.git
   cd seating-art
   ```

2. **Install dependencies**
   ```bash
   bun install
   cd server && bun install && cd ..
   ```

3. **Set up the database**

   Create a PostgreSQL database and update `server/.env`:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/seating_art"
   PORT=3000
   ```

   Initialize the database schema:
   ```bash
   bun run db:init
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend concurrently
   bun run dev

   # Or start them separately:
   bun run dev:frontend  # Frontend on http://localhost:8080
   bun run dev:backend   # Backend on http://localhost:3000
   ```

5. **Open your browser**

   Navigate to `http://localhost:8080` and start planning!

---

## 🌐 Deployment

### Deploy to Fly.io (Recommended)

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**
   ```bash
   fly auth login
   ```

3. **Create a Fly app**
   ```bash
   fly launch
   # Follow the prompts, use the included fly.toml
   ```

4. **Create a PostgreSQL database**
   ```bash
   fly postgres create
   fly postgres attach <your-postgres-app>
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

6. **Initialize the database**
   ```bash
   fly ssh console
   cd server && bun run db:init
   ```

Your app will be live at `https://your-app-name.fly.dev`!

### Deploy to Other VPS (DigitalOcean, AWS, etc.)

1. **Build the application**
   ```bash
   bun run build          # Frontend
   bun run build:backend  # Backend
   ```

2. **Set up PostgreSQL** on your VPS and create a database

3. **Configure environment variables**

   Create `server/.env` on your server:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/seating_art"
   PORT=3000
   NODE_ENV=production
   ```

4. **Initialize the database**
   ```bash
   cd server && bun run db:init
   ```

5. **Start the server**
   ```bash
   cd server && bun run src/index.ts
   ```

6. **Set up a reverse proxy** (nginx/caddy)

   Example nginx config:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Use PM2** for process management (optional)
   ```bash
   npm install -g pm2
   pm2 start server/src/index.ts --interpreter bun
   pm2 save
   pm2 startup
   ```

### Docker Deployment

```bash
# Build the image
docker build -t seating-art .

# Run the container
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://USER:PASSWORD@host:5432/db" \
  seating-art
```

---

## 🛠️ Tech Stack

### Frontend
- **React** 18 - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Jotai** - State management
- **Konva** - Canvas rendering
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **React Query** - Server state
- **dnd-kit** - Drag and drop

### Backend
- **Express** - Web framework
- **PostgreSQL** - Database
- **bcrypt** - PIN hashing
- **TypeScript** - Type safety

### DevOps
- **Bun** - JavaScript runtime & package manager
- **Docker** - Containerization
- **Fly.io** - Deployment platform

---

## 📖 Usage Guide

### Creating Your First Seating Chart

1. **Define Your Venue**
   - Click "Draw Event Space" to set boundaries
   - Drag the corners to resize

2. **Add Tables**
   - Click "Add Table" to create circular tables
   - Drag tables to position them
   - Use +/- buttons to adjust seat count (6-12 seats)

3. **Assign Guests**
   - **Option A:** Click any chair on a table
   - **Option B:** Type names in the sidebar and press Enter
   - **Option C:** Drag guests from "Unassigned" to tables

4. **Add Decorations**
   - Click "Add Custom Element" for bars, dance floors, etc.
   - Drag to position, resize by selecting and dragging corners
   - Double-click to rename elements

5. **Share Your Plan**
   - Copy the URL from your browser
   - Share with collaborators
   - They'll need your PIN to make edits

### Tips & Tricks

- **Zoom:** Use mouse wheel or +/- buttons
- **Pan:** Hold Alt and drag, or drag the background
- **Fit All:** Press Ctrl+0 (Cmd+0 on Mac) to center everything
- **Delete:** Select a shape and press Delete key
- **Lock Venue Space:** Prevent accidental moves of your boundary
- **Hover Highlighting:** Hover over guests or chairs to see connections

---

## 🔮 Future Features

These features aren't built yet, but I'd love to add them if there's enough interest:

- 📊 **Export & Print** - PDF/PNG export for printing or sharing
- ↩️ **Undo/Redo** - Full history of changes
- 📋 **Bulk Import** - CSV upload for large guest lists
- 🔄 **Real-time Collaboration** - Multiple people editing simultaneously
- 🖼️ **Floor Plan Upload** - Use your venue's actual floor plan as background
- 🍽️ **Dietary Restrictions** - Track guest dietary needs and allergies
- 🤖 **Auto-Arrange** - AI-powered seating suggestions based on relationships
- 🔍 **Guest Search** - Filter and find guests quickly
- 📐 **More Table Shapes** - Square, rectangle, banquet, and custom shapes
- 📝 **Notes & Annotations** - Add reminders and comments to tables
- 🎭 **Table Templates** - Pre-configured layouts for common venue types
- 📊 **Analytics** - Insights on seating capacity and utilization
- 📱 **Mobile App** - Native iOS/Android apps

**Want one of these features?** [Open an issue](https://github.com/yourusername/seating-art/issues) and let me know!

---

## 🤝 Contributing

Contributions are welcome! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📖 Documentation improvements
- 🔧 Code contributions

Please feel free to open an issue or submit a pull request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add amazing feature'`)
5. Push to your fork (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- Built for my son's baptism celebration
- Inspired by the need for better event planning tools
- Thanks to the open-source community for the amazing tools and libraries
