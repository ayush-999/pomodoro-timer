# FOCUSCRAFT — Pomodoro Timer

<div align="center">

![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)
![Built With](https://img.shields.io/badge/Built%20With-Vanilla%20JS-yellow.svg)

A modern, feature-rich **Pomodoro Timer** with a retro-futuristic, cyberpunk-inspired design. Boost your productivity with customizable work sessions, break intervals, task management, and beautiful visual feedback.

[Live Demo](#getting-started) • [Features](#features) • [Installation](#installation) • [Usage](#usage) • [Contributing](#contributing)

</div>

---

## 🎯 Overview

FOCUSCRAFT is a productivity-focused web application implementing the Pomodoro Technique—a time management method that breaks work into focused intervals separated by short breaks. Built with vanilla JavaScript, jQuery, and modern CSS, it provides an intuitive interface with powerful features to help you achieve deep focus and sustained productivity.

Whether you're a student, developer, designer, or anyone looking to improve their work efficiency, FOCUSCRAFT offers the tools you need to stay on track and achieve your goals.

---

## ✨ Features

### Core Timer Functionality
- **Multiple Session Modes**
  - Work Sessions (default: 25 minutes)
  - Short Breaks (default: 5 minutes)
  - Long Breaks (default: 15 minutes)
  - Configurable durations via settings

- **Visual Progress Indicator**
  - Circular SVG progress ring with smooth animations
  - Real-time timer display (MM:SS format)
  - Session type label updates
  - Visual tick marks for quarter-hour intervals

- **Session Management**
  - Automatic cycle through work and break sessions
  - Long break triggers after configurable intervals
  - Session counter with visual pips
  - Manual session skip option

### Advanced Features
- **Task Management**
  - Create, edit, and delete tasks
  - Assign tasks to work sessions
  - Track task completion
  - Filter tasks (All / Active / Completed)
  - Drag-and-drop reordering with jQuery UI Sortable
  - Local storage persistence

- **Statistics & Progress Tracking**
  - Daily session counter
  - Total sessions completed (lifetime)
  - Productivity streak tracking
  - Automatic daily reset
  - Calendar view for session history

- **Customization**
  - Adjustable work, break, and interval durations
  - Audio notifications (toggle on/off)
  - Auto-break feature (automatically start breaks)
  - Dark/Light theme toggle
  - Responsive design for desktop and tablets

- **Theme System**
  - **Dark Theme**: Cyberpunk-inspired with cyan accents (#00D2FF)
  - **Light Theme**: Clean, professional appearance
  - Smooth theme transitions
  - Persistent theme preference

- **Data Management**
  - Full data persistence using browser localStorage
  - Export/Import settings
  - Clear all data option with confirmation
  - No server required—completely client-side

---

## 🛠 Technologies Used

**Frontend:**
- **HTML5** — Semantic markup with SVG custom elements
- **CSS3** — Custom properties (CSS variables), Grid, Flexbox, animations
- **JavaScript (ES6+)** — Modular code with jQuery utilities
- **jQuery** — DOM manipulation and event handling
- **jQuery UI** — Sortable task reordering
- **Google Fonts** — Space Mono (monospace) & Syne (display) typefaces

**Features:**
- LocalStorage API for data persistence
- SVG for scalable graphics
- CSS animations and transitions
- Responsive web design
- Browser Notifications API support

---

## 📋 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or dependencies required—pure client-side application

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/focuscraft-pomodoro-timer.git
   cd focuscraft-pomodoro-timer
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser, or
   - Serve with a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Python 2
     python -m SimpleHTTPServer 8000
     
     # Using Node.js (with http-server package)
     npx http-server
     ```

3. **Access the application**
   - Visit `http://localhost:8000` (or your server's URL)

---

## 🚀 Usage

### Starting a Session

1. Click the **START** button to begin a work session
2. The timer will count down in MM:SS format
3. Visual progress ring fills as the session progresses
4. When the session ends, audio notification plays (if enabled)
5. Manually switch between Work, Short Break, and Long Break tabs

### Managing Tasks

1. **Add a Task**: Type in the input field and press Enter
2. **Edit a Task**: Click the pencil icon and modify the text
3. **Complete a Task**: Click the checkbox to mark as done
4. **Delete a Task**: Click the trash icon
5. **Reorder Tasks**: Drag and drop to rearrange priority
6. **Filter Tasks**: Use filter buttons (All / Active / Completed)

### Customizing Settings

1. Click the **⚙ Settings** button in the header
2. Adjust session durations:
   - Work session length (minutes)
   - Short break length (minutes)
   - Long break length (minutes)
   - Sessions before long break
3. Toggle features:
   - Sound notifications
   - Auto-break (automatically start breaks)
4. Click "Save" to apply changes

### Managing Data

- **Toggle Theme**: Click the **◐** icon in the header (Dark/Light mode)
- **Clear All Data**: Click the **⊗** icon to reset everything (with confirmation)
- **Automatic Persistence**: All settings, tasks, and stats are saved automatically

---

## 📁 Project Structure

```
focuscraft-pomodoro-timer/
├── index.html          # Main HTML file with app structure
├── app.js              # Core JavaScript application logic
├── style.css           # Styling and theme definitions
└── README.md           # This file
```

### File Breakdown

**index.html**
- Semantic HTML5 structure
- SVG timer ring visualization
- Task list markup
- Settings and statistics panels
- External CDN dependencies (jQuery, jQuery UI, Google Fonts)

**app.js**
- Modular ES6+ code organization
- Timer logic and state management
- Task CRUD operations
- Settings persistence
- Statistics tracking
- Event listeners and DOM manipulation

**style.css**
- CSS custom properties for theming
- Responsive grid and flexbox layouts
- Animations and transitions
- Dark/Light theme variants
- Cyberpunk design aesthetic

---

## 🎨 Design Highlights

### Visual Design
- **Cyberpunk Aesthetic**: Neon cyan accents (#00D2FF) with orange secondary colors
- **Dark Mode First**: Energy-efficient dark theme with adjustable brightness
- **Smooth Animations**: Fluid transitions for timer updates and interactions
- **Readable Typography**: Space Mono for precision, Syne for headings
- **Responsive Layout**: Adapts seamlessly from desktop to tablet views

### User Experience
- Clear visual feedback for all interactions
- Intuitive controls and navigation
- Accessibility considerations (semantic HTML, high contrast)
- Persistent data—your progress is always saved
- No data tracking or external dependencies

---

## 🔧 Configuration

### Default Settings
The application comes with sensible defaults that can be customized:

```javascript
{
  work: 25,        // Work session duration (minutes)
  shortBreak: 5,   // Short break duration (minutes)
  longBreak: 15,   // Long break duration (minutes)
  interval: 4,     // Sessions before long break
  sound: true,     // Audio notifications enabled
  autoBreak: false // Auto-break feature disabled
}
```

All settings are stored in localStorage and persist across browser sessions.

---

## 💡 Tips for Maximum Productivity

1. **Use task management**: Assign specific tasks to each work session
2. **Respect breaks**: Actually step away during break periods
3. **Track your streak**: Build consistency with daily session goals
4. **Adjust durations**: Customize intervals to match your focus patterns
5. **Use notifications**: Keep sound on to respect timer alerts
6. **Review stats**: Check your progress in the statistics panel

---

## 🐛 Troubleshooting

### Timer doesn't start
- Ensure JavaScript is enabled in your browser
- Try refreshing the page
- Check browser console for errors (F12)

### Data not persisting
- Check if localStorage is enabled
- Verify your browser isn't in private/incognito mode
- Clear browser cache and refresh

### Audio notification not working
- Verify sound is enabled in settings
- Check system volume
- Ensure browser has permission to play audio
- Some browsers require user interaction before audio plays

### Theme not changing
- Clear localStorage and refresh
- Try a different browser
- Check CSS custom properties support

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve FOCUSCRAFT:

1. **Fork the repository**
   ```bash
   git clone https://github.com/ayush-999/focuscraft-pomodoro-timer.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Comment complex logic
   - Test thoroughly in different browsers

4. **Commit with descriptive messages**
   ```bash
   git commit -m "Add feature: your feature description"
   ```

5. **Push to your fork and submit a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Suggested Improvements
- Session history calendar view
- Pomodoro statistics dashboard
- Custom color themes
- Mobile app version (React Native/Flutter)
- Backend sync for multi-device support
- Keyboard shortcuts
- Accessibility improvements (ARIA labels)
- Internationalization (i18n) support


## 👨‍💻 Author

**Your Name**
- GitHub: [@ayush-999](https://github.com/ayush-999)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)

---

## 🙏 Acknowledgments

- Inspired by the [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique) by Francesco Cirillo
- Design influenced by cyberpunk and retro-futuristic aesthetics
- Built with [jQuery](https://jquery.com/) and [jQuery UI](https://jqueryui.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

## 📊 Future Roadmap

- [ ] Export productivity reports
- [ ] Team/social mode (shared sessions)
- [ ] Browser notifications API integration
- [ ] Keyboard shortcuts for power users
- [ ] Custom background themes
- [ ] Integration with calendar apps
- [ ] Mobile-responsive redesign
- [ ] PWA (Progressive Web App) support

---

<div align="center">

Made with ❤️ for productivity enthusiasts

[⬆ Back to Top](#focuscraft--pomodoro-timer)

</div>
