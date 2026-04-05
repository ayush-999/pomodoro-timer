/* ════════════════════════════════════════════════
   FOCUSCRAFT — app.js
   Modular ES6+ Pomodoro Timer with jQuery
   ════════════════════════════════════════════════ */

$(function () {
  /* ══════════════════════════════════
     MODULE: State & Config
  ══════════════════════════════════ */
  const DEFAULT_CONFIG = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    interval: 4,
    sound: true,
    autoBreak: false,
  };

  let config = loadConfig();
  let tasks = loadTasks();
  let stats = loadStats();
  let filter = "all";

  // Timer state
  let timerState = {
    mode: "work", // 'work' | 'short-break' | 'long-break'
    running: false,
    remaining: config.work * 60,
    total: config.work * 60,
    sessionCount: 0, // completed work sessions this cycle
    activeTaskId: null,
  };

  let timerInterval = null;

  /* ══════════════════════════════════
     MODULE: Persistence
  ══════════════════════════════════ */
  function loadConfig() {
    try {
      return $.extend(
        {},
        DEFAULT_CONFIG,
        JSON.parse(localStorage.getItem("fc_config") || "{}"),
      );
    } catch {
      return $.extend({}, DEFAULT_CONFIG);
    }
  }
  function saveConfig() {
    localStorage.setItem("fc_config", JSON.stringify(config));
  }

  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem("fc_tasks") || "[]");
    } catch {
      return [];
    }
  }
  function saveTasks() {
    localStorage.setItem("fc_tasks", JSON.stringify(tasks));
  }

  function loadStats() {
    const defaults = { today: 0, total: 0, streak: 0, lastDate: null };
    try {
      const s = $.extend(
        {},
        defaults,
        JSON.parse(localStorage.getItem("fc_stats") || "{}"),
      );
      // Reset today counter if it's a new day
      const today = new Date().toDateString();
      if (s.lastDate !== today) {
        s.streak = s.lastDate ? (isYesterday(s.lastDate) ? s.streak : 0) : 0;
        s.today = 0;
        s.lastDate = today;
      }
      return s;
    } catch {
      return defaults;
    }
  }
  function saveStats() {
    localStorage.setItem("fc_stats", JSON.stringify(stats));
  }

  function isYesterday(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    d.setDate(d.getDate() + 1);
    return d.toDateString() === now.toDateString();
  }

  function clearAllData() {
    if (!confirm("Clear all saved data? This cannot be undone.")) return;
    localStorage.removeItem("fc_config");
    localStorage.removeItem("fc_tasks");
    localStorage.removeItem("fc_stats");
    location.reload();
  }

  /* ══════════════════════════════════
     MODULE: Timer Core
  ══════════════════════════════════ */
  function startTimer() {
    if (timerState.running) return;
    timerState.running = true;
    $("body").addClass("running");
    $("#start-btn").text("PAUSE");

    timerInterval = setInterval(() => {
      timerState.remaining--;
      updateTimerDisplay();
      if (timerState.remaining <= 0) onTimerComplete();
    }, 1000);
  }

  function pauseTimer() {
    if (!timerState.running) return;
    timerState.running = false;
    $("body").removeClass("running");
    clearInterval(timerInterval);
    timerInterval = null;
    $("#start-btn").text("RESUME");
  }

  function resetTimer() {
    pauseTimer();
    timerState.remaining = timerState.total;
    timerState.running = false;
    $("body").removeClass("running");
    $("#start-btn").text("START");
    updateTimerDisplay();
    updateRingProgress(1);
  }

  function skipSession() {
    pauseTimer();
    advanceMode();
  }

  function onTimerComplete() {
    pauseTimer();
    // Play sound
    if (config.sound) playBeep();

    if (timerState.mode === "work") {
      // Increment session count
      timerState.sessionCount++;
      stats.today++;
      stats.total++;
      stats.streak = stats.today; // simple streak = today's count
      stats.lastDate = new Date().toDateString();
      saveStats();
      updateStats();

      // Increment active task pomodoros
      if (timerState.activeTaskId) {
        const task = tasks.find((t) => t.id === timerState.activeTaskId);
        if (task) {
          task.completedPomos = (task.completedPomos || 0) + 1;
          saveTasks();
          renderTasks();
        }
      }

      showMotivation();
      confettiBurst();
    }

    // Ring flash
    $(".timer-ring-wrapper").addClass("complete-flash");
    setTimeout(
      () => $(".timer-ring-wrapper").removeClass("complete-flash"),
      800,
    );

    advanceMode();

    // Auto-start break if enabled
    if (config.autoBreak && timerState.mode !== "work") {
      setTimeout(() => startTimer(), 1500);
    }
  }

  function advanceMode() {
    if (timerState.mode === "work") {
      // Decide break type
      if (timerState.sessionCount % config.interval === 0) {
        setMode("long-break");
      } else {
        setMode("short-break");
      }
    } else {
      setMode("work");
    }
    resetTimer();
  }

  function setMode(mode) {
    timerState.mode = mode;
    const isWork = mode === "work";
    const mins =
      mode === "work"
        ? config.work
        : mode === "short-break"
          ? config.shortBreak
          : config.longBreak;

    timerState.total = mins * 60;
    timerState.remaining = timerState.total;

    // UI updates
    $(".tab-btn").removeClass("active break-active");
    $(`.tab-btn[data-mode="${mode}"]`).addClass(
      isWork ? "active" : "break-active",
    );

    const label =
      mode === "work"
        ? "FOCUS SESSION"
        : mode === "short-break"
          ? "SHORT BREAK"
          : "LONG BREAK";
    $("#timer-label").text(label);

    $("body").toggleClass("break-mode", !isWork);
    $("#start-btn").toggleClass("break-mode", !isWork).text("START");

    updateTimerDisplay();
    updateRingProgress(1);
    updateSessionPips();
  }

  /* ══════════════════════════════════
     MODULE: Timer Display
  ══════════════════════════════════ */
  function updateTimerDisplay() {
    const m = String(Math.floor(timerState.remaining / 60)).padStart(2, "0");
    const s = String(timerState.remaining % 60).padStart(2, "0");
    const text = `${m}:${s}`;

    const $digits = $("#timer-digits");
    if ($digits.text() !== text) {
      $digits.text(text).addClass("tick");
      setTimeout(() => $digits.removeClass("tick"), 130);
    }

    // Progress ring
    const pct = timerState.remaining / timerState.total;
    updateRingProgress(pct);

    // Page title
    document.title = `${text} — FOCUSCRAFT`;
  }

  function updateRingProgress(pct) {
    const circumference = 2 * Math.PI * 120; // r=120
    const offset = circumference * (1 - pct);
    $("#ring-progress").attr("stroke-dashoffset", offset.toFixed(2));
  }

  function updateSessionPips() {
    const interval = config.interval;
    const filled = timerState.sessionCount % interval;
    let html = "";
    for (let i = 0; i < interval; i++) {
      html += `<span class="pip${i < filled ? " filled" : ""}"></span>`;
    }
    $("#session-pips").html(html);
  }

  /* ══════════════════════════════════
     MODULE: Tick Marks (SVG decoration)
  ══════════════════════════════════ */
  function drawTickMarks() {
    const $g = $("#tick-marks");
    const cx = 140,
      cy = 140,
      r = 120;
    let html = "";
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * 360 - 90;
      const rad = (angle * Math.PI) / 180;
      const isMin = i % 5 === 0;
      const len = isMin ? 10 : 5;
      const r1 = r + 5;
      const r2 = r1 - len;
      const x1 = cx + r1 * Math.cos(rad);
      const y1 = cy + r1 * Math.sin(rad);
      const x2 = cx + r2 * Math.cos(rad);
      const y2 = cy + r2 * Math.sin(rad);
      html += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke-width="${isMin ? 2 : 1}" opacity="${isMin ? 0.5 : 0.2}" />`;
    }
    $g.html(html);
  }

  /* ══════════════════════════════════
     MODULE: Tasks
  ══════════════════════════════════ */
  function generateId() {
    return "task_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  }

  function addTask(name) {
    name = name.trim();
    if (!name) return;
    tasks.push({
      id: generateId(),
      name,
      done: false,
      pomos: 1,
      completedPomos: 0,
      created: Date.now(),
    });
    saveTasks();
    renderTasks();
    updateTaskCount();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    if (timerState.activeTaskId === id) setActiveTask(null);
    saveTasks();
    renderTasks();
    updateTaskCount();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;
    saveTasks();
    renderTasks();
    updateTaskCount();
  }

  function setActiveTask(id) {
    timerState.activeTaskId = id;
    const task = tasks.find((t) => t.id === id);
    const $bar = $("#active-task-bar");

    if (task) {
      $("#active-task-name").text(task.name);
      $bar.addClass("has-task");
    } else {
      $("#active-task-name").text("— none selected —");
      $bar.removeClass("has-task");
    }
    renderTasks(); // re-render to show selected
  }

  function openEditModal(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    $("#edit-input").val(task.name);
    $("#edit-pomodoros").val(task.pomos);
    $("#save-edit-btn").data("task-id", id);
    $("#edit-modal").addClass("open");
    setTimeout(() => $("#edit-input").focus(), 100);
  }

  function saveEdit() {
    const id = $("#save-edit-btn").data("task-id");
    const name = $("#edit-input").val().trim();
    const pomos = parseInt($("#edit-pomodoros").val()) || 1;
    if (!name) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.name = name;
    task.pomos = pomos;
    saveTasks();
    renderTasks();
    $("#edit-modal").removeClass("open");
    if (timerState.activeTaskId === id) setActiveTask(id);
  }

  function renderTasks() {
    const $list = $("#task-list");
    const $empty = $("#task-empty");
    $list.empty();

    const filtered = tasks.filter((t) => {
      if (filter === "active") return !t.done;
      if (filter === "done") return t.done;
      return true;
    });

    if (filtered.length === 0) {
      $empty.addClass("visible");
      updateTaskCount();
      return;
    }
    $empty.removeClass("visible");

    filtered.forEach((task) => {
      const isActive = task.id === timerState.activeTaskId;
      const pomoDots = buildPomoDots(task);
      const $item = $(`
        <li class="task-item${task.done ? " completed" : ""}${isActive ? " active-task" : ""}" data-id="${task.id}">
          <span class="drag-handle">⠿</span>
          <button class="task-check" title="Complete">${task.done ? "✓" : ""}</button>
          <div class="task-body">
            <div class="task-name">${escHtml(task.name)}</div>
            <div class="task-meta">
              <span class="task-pomo">${pomoDots}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="task-action-btn select-btn" title="Set as active">◎</button>
            <button class="task-action-btn edit-btn"   title="Edit">✎</button>
            <button class="task-action-btn delete-btn" title="Delete">✕</button>
          </div>
        </li>
      `);

      // Events
      $item.find(".task-check").on("click", function (e) {
        e.stopPropagation();
        $item.addClass("just-done");
        setTimeout(() => toggleTask(task.id), 300);
      });
      $item.find(".select-btn").on("click", function (e) {
        e.stopPropagation();
        setActiveTask(isActive ? null : task.id);
      });
      $item.find(".edit-btn").on("click", function (e) {
        e.stopPropagation();
        openEditModal(task.id);
      });
      $item.find(".delete-btn").on("click", function (e) {
        e.stopPropagation();
        deleteTask(task.id);
      });

      $list.append($item);
    });

    // Drag-and-drop reorder via jQuery UI Sortable
    $list.sortable({
      handle: ".drag-handle",
      placeholder: "ui-sortable-placeholder",
      tolerance: "pointer",
      update: function () {
        const newOrder = [];
        $list.find(".task-item").each(function () {
          const id = $(this).data("id");
          const task = tasks.find((t) => t.id === id);
          if (task) newOrder.push(task);
        });
        // Merge back non-visible tasks (filtered out)
        const visibleIds = new Set(newOrder.map((t) => t.id));
        tasks
          .filter((t) => !visibleIds.has(t.id))
          .forEach((t) => newOrder.push(t));
        tasks = newOrder;
        saveTasks();
      },
    });

    updateTaskCount();
  }

  function buildPomoDots(task) {
    let html = "";
    for (let i = 0; i < task.pomos; i++) {
      const filled = i < (task.completedPomos || 0);
      html += `<span class="pomo-dot${filled ? " pomo-filled" : ""}">◎</span> `;
    }
    return html.trim();
  }

  function updateTaskCount() {
    const active = tasks.filter((t) => !t.done).length;
    const total = tasks.length;
    $("#task-count").text(`${active}/${total} active`);
  }

  function escHtml(str) {
    return $("<div>").text(str).html();
  }

  /* ══════════════════════════════════
     MODULE: Stats
  ══════════════════════════════════ */
  function updateStats() {
    $("#stat-today").text(stats.today);
    $("#stat-total").text(stats.total);
    $("#stat-streak").text(stats.streak);
  }

  /* ══════════════════════════════════
     MODULE: Motivational Messages
  ══════════════════════════════════ */
  const MOTIVATIONS = [
    "Excellent work! Every session builds momentum.",
    "You're on fire! Keep that focus blazing.",
    "Deep work done. The compound effect is real.",
    "One more session closer to mastery. ✦",
    "Your future self thanks you for this.",
    "Flow state achieved. You're unstoppable.",
    "Discipline beats motivation every single time.",
    "Another brick in the wall of excellence.",
    "Progress isn't always visible — but it's there.",
    "The best time to start was earlier. Now is second best.",
    "Consistency is the superpower. You have it.",
    "Session locked in. Champion behavior.",
  ];

  function showMotivation() {
    const msg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    $("#toast-message").text(msg);
    const $toast = $("#motivation-toast");
    $toast.addClass("show");
    setTimeout(() => $toast.removeClass("show"), 5000);
  }

  /* ══════════════════════════════════
     MODULE: Sound
  ══════════════════════════════════ */
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const play = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + start + dur,
        );
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      play(880, 0, 0.15);
      play(1046, 0.18, 0.15);
      play(1318, 0.36, 0.3);
    } catch (e) {
      /* audio API unavailable */
    }
  }

  /* ══════════════════════════════════
     MODULE: Confetti
  ══════════════════════════════════ */
  function confettiBurst() {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#00d2ff", "#ff6b35", "#7fff6e", "#ffd32a", "#ffffff"];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      r: Math.random() * 6 + 2,
      d: Math.random() * 80 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.1 + 0.05,
    }));

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.tiltAngle += p.tiltSpeed;
        p.y += Math.cos(p.d) + 2;
        p.x += Math.sin(frame / 20) * 1.2;
        p.tilt = Math.sin(p.tiltAngle) * 12;
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      });
      frame++;
      if (frame < 180) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    requestAnimationFrame(animate);
  }

  /* ══════════════════════════════════
     MODULE: Particle Background
  ══════════════════════════════════ */
  function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    const getAccentColor = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#00d2ff";

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const color = getAccentColor();
      particles.forEach((p) => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      requestAnimationFrame(draw);
    }
    draw();

    $(window).on("resize", () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });
  }

  /* ══════════════════════════════════
     MODULE: Settings Modal
  ══════════════════════════════════ */
  function openSettings() {
    $("#set-work").val(config.work);
    $("#set-short").val(config.shortBreak);
    $("#set-long").val(config.longBreak);
    $("#set-interval").val(config.interval);
    $("#set-sound").prop("checked", config.sound);
    $("#set-autobreak").prop("checked", config.autoBreak);
    $("#settings-modal").addClass("open");
  }

  function saveSettings() {
    config.work = parseInt($("#set-work").val()) || DEFAULT_CONFIG.work;
    config.shortBreak =
      parseInt($("#set-short").val()) || DEFAULT_CONFIG.shortBreak;
    config.longBreak =
      parseInt($("#set-long").val()) || DEFAULT_CONFIG.longBreak;
    config.interval =
      parseInt($("#set-interval").val()) || DEFAULT_CONFIG.interval;
    config.sound = $("#set-sound").is(":checked");
    config.autoBreak = $("#set-autobreak").is(":checked");
    saveConfig();
    $("#settings-modal").removeClass("open");

    // Re-apply current mode with new duration
    pauseTimer();
    setMode(timerState.mode);
  }

  /* ══════════════════════════════════
     MODULE: Theme
  ══════════════════════════════════ */
  function initTheme() {
    const saved = localStorage.getItem("fc_theme") || "dark";
    $("html").attr("data-theme", saved);
    updateThemeIcon(saved);
  }
  function toggleTheme() {
    const current = $("html").attr("data-theme");
    const next = current === "dark" ? "light" : "dark";
    $("html").attr("data-theme", next);
    localStorage.setItem("fc_theme", next);
    updateThemeIcon(next);
  }
  function updateThemeIcon(theme) {
    $("#theme-toggle .theme-icon").text(theme === "dark" ? "◑" : "◐");
  }

  /* ══════════════════════════════════
     EVENT BINDINGS
  ══════════════════════════════════ */

  // Timer controls
  $("#start-btn").on("click", () => {
    timerState.running ? pauseTimer() : startTimer();
  });
  $("#reset-btn").on("click", resetTimer);
  $("#skip-btn").on("click", skipSession);

  // Session tabs
  $(".tab-btn").on("click", function () {
    const mode = $(this).data("mode");
    if (timerState.mode === mode) return;
    pauseTimer();
    setMode(mode);
  });

  // Task input
  $("#task-input").on("keydown", function (e) {
    if (e.key === "Enter") {
      addTask($(this).val());
      $(this).val("");
    }
  });
  $("#add-task-btn").on("click", () => {
    const val = $("#task-input").val();
    addTask(val);
    $("#task-input").val("").focus();
  });

  // Filter
  $(".filter-btn").on("click", function () {
    filter = $(this).data("filter");
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");
    renderTasks();
  });

  // Settings
  $("#settings-btn").on("click", openSettings);
  $("#settings-close").on("click", () =>
    $("#settings-modal").removeClass("open"),
  );
  $("#save-settings-btn").on("click", saveSettings);

  // Edit modal
  $("#edit-close").on("click", () => $("#edit-modal").removeClass("open"));
  $("#save-edit-btn").on("click", saveEdit);
  $("#edit-input").on("keydown", (e) => {
    if (e.key === "Enter") saveEdit();
  });

  // Clear data
  $("#clear-data-btn").on("click", clearAllData);

  // Theme toggle
  $("#theme-toggle").on("click", toggleTheme);

  // Close modals on overlay click
  $(".modal-overlay").on("click", function (e) {
    if ($(e.target).hasClass("modal-overlay")) $(this).removeClass("open");
  });

  // Keyboard shortcuts
  $(document).on("keydown", function (e) {
    // Space = start/pause (when not focused on input)
    if (e.code === "Space" && !$(e.target).is("input, textarea, button")) {
      e.preventDefault();
      timerState.running ? pauseTimer() : startTimer();
    }
    // Escape = close modals
    if (e.key === "Escape") {
      $(".modal-overlay").removeClass("open");
    }
  });

  /* ══════════════════════════════════
     INIT
  ══════════════════════════════════ */
  function init() {
    initTheme();
    drawTickMarks();
    initParticles();
    setMode("work");
    renderTasks();
    updateStats();
    updateSessionPips();
    updateTimerDisplay();
  }

  init();
}); // end jQuery ready
