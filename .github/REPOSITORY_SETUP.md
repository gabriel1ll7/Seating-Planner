# GitHub Repository Setup Guide

This document contains instructions for configuring your GitHub repository settings via the web interface.

## Repository About Section

Navigate to: https://github.com/gabriel1ll7/Seating-Planner

Click the ⚙️ gear icon next to "About" and configure:

### Description
```
Beautiful, intuitive visual seating chart planner for events. Drag-and-drop interface for weddings, conferences, and celebrations.
```

### Website (optional)
```
https://seating.art
```
(Add when you have a live deployment URL)

### Topics (Tags)
Add these topics to help people discover your project (separated by spaces):
```
seating-chart event-planning wedding-planner seating-arrangement react typescript konva event-management table-planner guest-management drag-and-drop jotai postgresql vite bun
```

Click:
- [x] Include in the home page

## Repository Settings

Navigate to: Settings → General

### Features
Enable these features:
- [x] Issues
- [x] Discussions (optional, for community questions)
- [ ] Projects (enable if you want project boards)
- [ ] Wiki (not needed, use README)

### Pull Requests
- [x] Allow squash merging
- [x] Allow rebase merging
- [ ] Allow merge commits (optional)
- [x] Automatically delete head branches

## Branch Protection (Optional but Recommended)

Navigate to: Settings → Branches → Add rule

**Branch name pattern:** `main`

Suggested protections:
- [ ] Require a pull request before merging
- [ ] Require status checks to pass before merging
- [ ] Require conversation resolution before merging

(Note: These are optional for a solo project, enable when you have collaborators)

## Social Preview

Navigate to: Settings → General → Social preview

Upload a custom image (1280x640px) showing:
- App screenshot
- Project name/logo
- Key features

This image appears when your repo is shared on social media.

### Design Tips for Social Preview:
- Use screenshot from your app
- Add text overlay: "Seating.Art - Visual Seating Chart Planner"
- Include key features: "Drag & Drop • PIN Protected • Mobile Friendly"

## GitHub Pages (Optional)

If you want to host documentation or a landing page:

Navigate to: Settings → Pages

- Source: Deploy from a branch
- Branch: `main` / `docs` (if you create a docs folder)

## Repository Visibility

Current: Public ✅

If you ever want to change:
Navigate to: Settings → Danger Zone → Change repository visibility

## Security

Navigate to: Security → Code security and analysis

Enable:
- [x] Dependabot alerts (automatically enabled for public repos)
- [x] Dependabot security updates
- [ ] Code scanning (optional, for larger projects)
- [ ] Secret scanning (optional)

## Labels

GitHub provides default labels, but you can customize:

Navigate to: Issues → Labels

Suggested additions:
- `good first issue` - Easy issues for new contributors
- `help wanted` - Issues where you need help
- `question` - Questions about the project
- `duplicate` - Duplicate issues
- `wontfix` - Issues that won't be addressed

## Badges for README

You can add these badges to your README:

```markdown
![GitHub stars](https://img.shields.io/github/stars/gabriel1ll7/Seating-Planner?style=social)
![GitHub forks](https://img.shields.io/github/forks/gabriel1ll7/Seating-Planner?style=social)
![GitHub issues](https://img.shields.io/github/issues/gabriel1ll7/Seating-Planner)
![GitHub pull requests](https://img.shields.io/github/issues-pr/gabriel1ll7/Seating-Planner)
![GitHub last commit](https://img.shields.io/github/last-commit/gabriel1ll7/Seating-Planner)
```

## Checklist

After configuring these settings, your repository will have:
- [ ] Descriptive About section with topics
- [ ] Issue templates for bugs and features
- [ ] Pull request template
- [ ] Contributing guidelines
- [ ] Security features enabled
- [ ] Social preview image
- [ ] Proper labels
- [ ] Optional: Branch protection
- [ ] Optional: GitHub Pages

---

**Note:** Most of these settings require web access to GitHub. They cannot be configured via git commands.
