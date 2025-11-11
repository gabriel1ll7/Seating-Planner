# Seating.Art - Promotion Guide

Ready-to-use promotional content for submitting to various platforms.

---

## 🌟 GitHub-Specific Platforms

### 1. **GitHub Topics** ✅ (Already Done)
Just configured via repository settings.

### 2. **GitHub Trending**
No submission needed - your repo automatically appears if it gets stars/activity.

**Call to Action:**
Ask early users to ⭐ star the repo to help it trend!

---

## 📱 Reddit

### r/opensource
**Title:**
```
[Show OSS] Seating.Art - Beautiful drag-and-drop seating chart planner for events
```

**Post:**
```
Hi r/opensource!

I built **Seating.Art**, an open-source visual seating chart planner for events.

**Why I built it:** Needed to plan my son's baptism party seating, got tired of drawing tables on paper!

**What it does:**
- 🎨 Visual drag-and-drop canvas for tables and guests
- 🔐 PIN-protected shareable URLs
- 🌓 Dark/light mode
- 📱 Mobile-friendly
- 💾 Auto-saves to localStorage + PostgreSQL backend

**Tech Stack:**
React, TypeScript, Konva (canvas), Jotai (state), PostgreSQL, Bun

**Perfect for:** Weddings, conferences, baptisms, dinner parties, any event with assigned seating

**Live demo:** [Coming soon]
**GitHub:** https://github.com/gabriel1ll7/Seating-Planner
**License:** MIT

Looking for feedback and contributors! What features would you find useful?
```

**URL:** https://reddit.com/r/opensource/submit

---

### r/reactjs
**Title:**
```
Built a seating chart planner with React + Konva - feedback welcome!
```

**Post:**
```
Hey r/reactjs!

Built **Seating.Art** - a visual seating chart planner for events using React.

**Tech Stack:**
- React 18 + TypeScript
- Konva for canvas rendering
- Jotai for state management
- React Query for server state
- dnd-kit for drag & drop
- shadcn/ui components
- Tailwind CSS

**Interesting challenges solved:**
- Bidirectional highlighting (hover chair → highlight guest in sidebar)
- Canvas + React reconciliation with Konva
- Atom splitting for fine-grained reactivity
- PIN-based auth without traditional auth systems

**Features:**
- Drag tables/guests around canvas
- 6-12 seat tables with capacity indicators
- Shareable URLs with PIN protection
- Auto-save with 2s debounce
- Dark mode support

Built it for my son's baptism party - turned into a full-featured event planner!

**GitHub:** https://github.com/gabriel1ll7/Seating-Planner

Would love feedback on the React patterns used. Open to contributions!
```

**URL:** https://reddit.com/r/reactjs/submit

---

### r/webdev
**Title:**
```
Built a seating chart planner - from baptism party to open source project
```

**Post:**
```
Started as a quick tool to plan my son's baptism seating, ended up building a full-stack event planner!

**Seating.Art** - Visual seating chart planner

**Stack:**
Frontend: React, TypeScript, Konva (canvas), Jotai, Tailwind
Backend: Express, PostgreSQL, bcrypt for PIN protection
Build: Vite, Bun

**Features:**
- 🎨 Drag & drop interface for tables and guests
- 🔗 Shareable URLs with PIN protection
- 📱 Responsive (works on mobile)
- 💾 Auto-save to localStorage + server
- 🌓 Dark/light themes

**Cool tech decisions:**
- Used Konva for canvas instead of SVG (better perf with 100+ shapes)
- Jotai atom splitting for granular canvas updates
- PIN-based auth instead of full user accounts (simpler UX)
- JSONB in PostgreSQL for flexible schema

MIT licensed, looking for feedback!

**Repo:** https://github.com/gabriel1ll7/Seating-Planner
**Demo:** [Deploy and add URL here]
```

**URL:** https://reddit.com/r/webdev/submit

---

### r/typescript
**Title:**
```
Built an event planner with strict TypeScript - lessons learned
```

**Post:**
```
Built **Seating.Art** (seating chart planner) fully in TypeScript - frontend, backend, and shared types.

**Architecture highlights:**
- Shared types package (`shared/types/venue.ts`)
- Type-safe Jotai atoms with PrimitiveAtom<Shape>
- Konva with full TS support
- Express API with proper type guards

**Interesting patterns:**
```typescript
// Atom splitting for type-safe canvas rendering
const shapeAtomsAtom = splitAtom(baseShapesAtom);

// Type-safe shape rendering
const AtomRenderer: React.FC<{
  shapeAtom: PrimitiveAtom<Shape>;
}> = ({ shapeAtom }) => {
  const shape = useAtomValue(shapeAtom);
  if (shape.type === "venue") return <ElementRect />;
  if (shape.type === "table") return <TableCircle />;
};
```

Would love feedback on type safety approaches!

**GitHub:** https://github.com/gabriel1ll7/Seating-Planner
```

**URL:** https://reddit.com/r/typescript/submit

---

### r/SideProject
**Title:**
```
Built Seating.Art for my son's baptism - now it's open source!
```

**Post:**
```
**The Story:**
Was planning my son's baptism party, needed to arrange 80+ guests across tables. Tired of drawing on paper, built a web app instead. Turned into a full-featured event planner!

**What it is:**
Visual drag-and-drop seating chart planner for events

**Features:**
✅ Canvas-based table arrangement
✅ Drag guests between tables
✅ Shareable URLs with PIN protection
✅ Auto-save (localStorage + server)
✅ Mobile responsive
✅ Dark mode
✅ 100% free & open source

**Tech:**
React, TypeScript, PostgreSQL, Konva canvas, deployed on Fly.io

**Use cases:**
- Weddings
- Corporate events
- Conferences
- Family gatherings
- Restaurant reservations

**Next features** (if people want them):
- PDF export
- CSV bulk import
- Real-time collaboration
- Floor plan backgrounds

**Try it:** [Add live URL]
**GitHub:** https://github.com/gabriel1ll7/Seating-Planner

Would love to hear what features you'd find useful!
```

**URL:** https://reddit.com/r/SideProject/submit

---

## 🔶 Hacker News (news.ycombinator.com)

### Show HN Submission

**Title:**
```
Show HN: Seating.Art – Open-source seating chart planner for events
```

**URL to submit:**
```
https://github.com/gabriel1ll7/Seating-Planner
```

**Suggested comment (post as first comment):**
```
Hey HN!

Built this for my son's baptism party when I got frustrated drawing tables on paper.

Seating.Art is a visual seating chart planner with:
- Drag-and-drop canvas (Konva + React)
- Circular tables with 6-12 seats
- PIN-protected shareable URLs
- Auto-save to localStorage + PostgreSQL
- Mobile responsive

Tech stack: React, TypeScript, Jotai (state), Express, PostgreSQL, deployed on Fly.io

Open source (MIT). Looking for feedback on the architecture and feature ideas!

What would make this useful for your events?
```

**Submit:** https://news.ycombinator.com/submit

**Tips:**
- Post between 8-10 AM EST for best visibility
- Engage with comments quickly
- Be ready for technical questions

---

## 🚀 Product Hunt (producthunt.com)

**Product Name:**
```
Seating.Art
```

**Tagline (60 chars):**
```
Beautiful seating chart planner for events
```

**Description:**
```
Plan perfect seating arrangements for weddings, conferences, and celebrations with an elegant drag-and-drop interface.

🎨 Visual canvas for arranging tables and guests
🔐 PIN-protected shareable URLs for collaboration
💾 Auto-save to never lose your work
📱 Works on desktop and mobile
🌓 Beautiful dark and light themes
🆓 100% free and open source

Built from a real need - started as a tool for planning my son's baptism party, evolved into a full-featured event planner.

Perfect for:
- Wedding planners
- Event coordinators
- Corporate events
- Family gatherings
- Restaurant reservations

Tech: React, TypeScript, PostgreSQL, Konva canvas
```

**First Comment (when you launch):**
```
Hey Product Hunt! 👋

I'm the maker of Seating.Art. Built this to solve my own problem planning my son's baptism party seating.

What started as a weekend project turned into something friends and family use for their events!

Happy to answer any questions about:
- The tech stack (React + Konva canvas)
- Why PIN-based auth instead of accounts
- Feature roadmap
- Open source contribution

What features would make this useful for YOUR events?
```

**URL:** https://www.producthunt.com/posts/new

**Tips:**
- Launch on a Tuesday, Wednesday, or Thursday
- Have 5-10 friends ready to upvote in first hour
- Respond to ALL comments quickly

---

## 💬 Discord/Slack Communities

### React Community Discord
**Channel:** #show-your-work

**Message:**
```
Built a seating chart planner with React + Konva! 🎨

Seating.Art - drag-and-drop event seating planner

Features Konva canvas, Jotai state management, PIN-protected sharing, and auto-save.

Started as a tool for my son's baptism, now open source!

GitHub: https://github.com/gabriel1ll7/Seating-Planner

Would love feedback on the React patterns used!
```

---

### TypeScript Community Discord
**Channel:** #showcase

**Message:**
```
Built a full-stack TypeScript project: Seating.Art 🪑

Event seating planner with strict types throughout - frontend, backend, and shared types package.

Interesting patterns:
- Type-safe Jotai atoms with PrimitiveAtom<Shape>
- Shared types between client/server
- Konva with full TS support

Open source: https://github.com/gabriel1ll7/Seating-Planner

Looking for feedback on the type architecture!
```

---

## 🐦 Twitter/X

**Thread:**

```
🧵 Built Seating.Art - an open-source seating chart planner for events

Started when I needed to plan my son's baptism party. Got tired of drawing tables on paper. Built a web app instead.

Now it's a full-featured event planner!

🔗 https://github.com/gabriel1ll7/Seating-Planner

1/6
```

```
🎨 Features:
• Drag-and-drop canvas for tables & guests
• Circular tables with 6-12 adjustable seats
• PIN-protected shareable URLs
• Auto-save (never lose work)
• Dark/light mode
• Mobile responsive

Perfect for weddings, conferences, any event with assigned seating!

2/6
```

```
⚡ Tech Stack:
• React 18 + TypeScript
• Konva for canvas rendering
• Jotai for state management
• PostgreSQL + Express backend
• Deployed on Fly.io

100% open source (MIT license)

3/6
```

```
🤔 Interesting tech decisions:

Why Konva instead of SVG?
→ Better performance with 100+ shapes

Why PIN-based auth?
→ Simpler UX than traditional accounts

Why Jotai?
→ Atom splitting for fine-grained canvas updates

4/6
```

```
📋 Roadmap (if people want it):
• PDF/PNG export
• CSV bulk import for guests
• Real-time collaboration
• Floor plan backgrounds
• Auto-arrange algorithms

Open to feature requests!

5/6
```

```
Want to contribute? Open source and looking for:
• Bug reports
• Feature ideas
• PRs welcome!

🔗 Repo: https://github.com/gabriel1ll7/Seating-Planner
📄 Docs: Comprehensive README + contributing guide

⭐ Star if you find it useful!

6/6
```

**Hashtags:**
```
#opensource #react #typescript #buildinpublic #indiehacker #webdev #eventplanning #reactjs
```

---

## 📺 Dev.to

**Title:**
```
Building Seating.Art: A Visual Event Planner with React and Konva
```

**Tags:**
```
react, typescript, opensource, showdev
```

**Article:**
```markdown
# Building Seating.Art: From Baptism Party to Open Source Project

## The Problem

I needed to plan seating for my son's baptism party. 80+ guests, multiple tables, lots of family dynamics to consider.

Drawing on paper? Too messy.
Excel spreadsheets? Not visual enough.
Existing tools? Either paid, clunky, or overkill.

So I built my own.

## The Solution

[Seating.Art](https://github.com/gabriel1ll7/Seating-Planner) - a visual drag-and-drop seating chart planner.

![Screenshot](add-screenshot-here)

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Konva for canvas rendering
- Jotai for state management
- shadcn/ui + Tailwind CSS
- React Query

**Backend:**
- Express + TypeScript
- PostgreSQL with JSONB
- bcrypt for PIN protection
- Deployed on Fly.io

## Interesting Technical Decisions

### 1. Canvas vs SVG

Chose Konva (canvas) over SVG because:
- Better performance with 100+ shapes
- Built-in transformer for resizing
- Smooth drag interactions

### 2. PIN-based Auth

Instead of traditional user accounts:
- Generate 4-digit PIN per venue
- Store bcrypt hash in DB
- Share URL + PIN for collaboration
- Much simpler UX

### 3. Jotai Atom Splitting

```typescript
// Split base shapes into individual atoms
const shapeAtomsAtom = splitAtom(baseShapesAtom);

// Each shape updates independently
const TableCircle = ({ shapeAtom }) => {
  const [shape, setShape] = useAtom(shapeAtom);
  // Only this table re-renders on change
};
```

### 4. Bidirectional Highlighting

Hover a chair → highlights guest in sidebar
Hover guest in sidebar → highlights chair on canvas

Implemented with a `hoveredGuestIdAtom` that both components observe.

## Features

✅ Visual canvas with zoom/pan
✅ Drag-and-drop for tables and guests
✅ 6-12 seat tables with capacity indicators
✅ Shareable URLs with PIN protection
✅ Auto-save to localStorage + server
✅ Mobile responsive
✅ Dark/light mode

## Lessons Learned

1. **Start with a real problem** - Building for myself made decisions easy
2. **Canvas is powerful** - Konva made complex interactions simple
3. **Keep it simple** - PIN auth vs full accounts saved weeks
4. **TypeScript everywhere** - Shared types between client/server paid off

## Open Source

Released under MIT license. Looking for:
- Bug reports
- Feature requests
- Contributors

⭐ Star on GitHub: https://github.com/gabriel1ll7/Seating-Planner

## What's Next?

Potential features if people want them:
- PDF export
- CSV bulk import
- Real-time collaboration
- Floor plan backgrounds

What would YOU find useful?

---

*Built this for my son's baptism. Now you can use it for your events too!*
```

**Publish:** https://dev.to/new

---

## 🎥 YouTube (if you make a demo video)

**Title:**
```
Building a Seating Chart Planner with React + Konva | Open Source Project
```

**Description:**
```
I built Seating.Art - an open-source visual seating chart planner for events using React and Konva canvas.

🔗 GitHub: https://github.com/gabriel1ll7/Seating-Planner
🔗 Live Demo: [Add URL]

TIMESTAMPS:
0:00 - Why I built this
1:30 - Demo walkthrough
5:00 - Tech stack overview
8:00 - Interesting code patterns
12:00 - How to contribute

TECH STACK:
- React 18 + TypeScript
- Konva for canvas rendering
- Jotai for state management
- PostgreSQL + Express
- Deployed on Fly.io

Perfect for weddings, conferences, and any event with assigned seating!

⭐ Star the repo if you find it useful!

#react #typescript #opensource #webdev #eventplanning
```

---

## 📧 Email to Event Planning Communities

**Subject:**
```
Free open-source seating chart planner for your events
```

**Body:**
```
Hi [Community],

I recently built an open-source seating chart planner that might be useful for your events.

Seating.Art is a free, visual drag-and-drop tool for planning seating arrangements.

Features:
- Visual canvas for arranging tables and guests
- Shareable URLs for collaboration
- Works on desktop and mobile
- Completely free (no premium upsells)
- Your data stays private

I built it for my son's baptism party and figured others might find it useful!

Try it: [Add live URL when deployed]
GitHub: https://github.com/gabriel1ll7/Seating-Planner

Would love your feedback!
```

---

## 🎯 Indie Hackers

**Title:**
```
Launched: Seating.Art - Open-source event seating planner
```

**Post:**
```
**What:** Visual seating chart planner for events

**Why:** Built it for my son's baptism, realized it could help others

**Tech:** React, TypeScript, PostgreSQL, deployed on Fly.io

**Business Model:** None! Open source (MIT). Just solving a problem.

**Stats:**
- Built in [X] weeks
- [X] lines of code
- Costs $0/month to run (Fly.io free tier)

**What's working:**
- Clean, intuitive UI
- Mobile responsive
- Auto-save (never lose work)

**Challenges:**
- Konva + React reconciliation was tricky
- Making canvas accessible
- Handling concurrent edits

**Next steps:**
- Get feedback
- Add requested features
- Maybe launch a paid hosted version?

Open to advice from experienced IH members!

🔗 https://github.com/gabriel1ll7/Seating-Planner

What features would make this worth paying for?
```

**URL:** https://www.indiehackers.com/post/new

---

## 📊 Summary of Platforms

### High Impact (Post First):
1. ✅ **Reddit r/SideProject** - Best for personal stories
2. ✅ **Hacker News** - Best for tech-savvy audience
3. ✅ **Product Hunt** - Best for visibility (plan launch day)
4. ✅ **Dev.to** - Best for detailed technical article

### Medium Impact:
5. **Reddit r/reactjs** - Targeted React developers
6. **Reddit r/opensource** - Open source community
7. **Twitter/X** - Thread for developer audience
8. **Indie Hackers** - Builder community

### Lower Impact but Worth It:
9. **Discord communities** - Quick shares
10. **Dev.to alternatives** (Hashnode, Medium)

---

## 🎯 Posting Strategy

**Week 1:**
- Day 1: Reddit r/SideProject
- Day 2: Dev.to article
- Day 3: Twitter thread
- Day 4: Reddit r/reactjs

**Week 2:**
- Day 1: Hacker News (Show HN)
- Day 2: Indie Hackers
- Day 3: Reddit r/opensource

**Week 3:**
- Launch on Product Hunt (requires preparation)

**Tips:**
- Don't spam all at once
- Engage with EVERY comment
- Be humble and ask for feedback
- Share metrics/lessons learned in updates

---

## 📝 Quick Copy-Paste Links

All promotional text is ready above. Just:
1. Copy the text for each platform
2. Paste into the submission form
3. Add your live demo URL when ready
4. Hit submit!

Good luck! 🚀
