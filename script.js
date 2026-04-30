document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggle-btn");
    const themeBtn = document.getElementById("theme-btn");
    const navBtns = document.querySelectorAll(".nav-btn[data-target]");
    const pages = document.querySelectorAll(".page");
    const pageTitle = document.getElementById("page-title");
    
    // Sidebar Toggle
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        const svg = toggleBtn.querySelector("svg");
        if (sidebar.classList.contains("collapsed")) {
            svg.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>'; // Chevron Right
        } else {
            svg.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>'; // Chevron Left
        }
    });

    // Theme Toggle
    themeBtn.addEventListener("click", () => {
        const body = document.body;
        const textSpan = themeBtn.querySelector(".nav-text");
        
        if (body.classList.contains("dark-theme")) {
            body.classList.replace("dark-theme", "light-theme");
            textSpan.textContent = "Theme: Light";
        } else {
            body.classList.replace("light-theme", "dark-theme");
            textSpan.textContent = "Theme: Dark";
        }
    });

    // Navigation
    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active from all
            navBtns.forEach(b => b.classList.remove("active"));
            pages.forEach(p => p.classList.remove("active"));
            
            // Set active
            btn.classList.add("active");
            const targetId = btn.getAttribute("data-target");
            document.getElementById(`page-${targetId}`).classList.add("active");
            
            // Update Title
            pageTitle.textContent = btn.querySelector(".nav-text").textContent;
        });
    });
    
    // Auto collapse on narrow screens
    window.addEventListener("resize", () => {
        if (window.innerWidth < 1180 && !sidebar.classList.contains("collapsed")) {
            sidebar.classList.add("collapsed");
            toggleBtn.querySelector("svg").innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
        } else if (window.innerWidth >= 1280 && sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
            toggleBtn.querySelector("svg").innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>';
        }
    });

    // --- MOCK HARVEST LOGIC ---
    
    // UI Elements
    const hiddenFileInput = document.getElementById('hidden-file-input');
    const harvestFileInput = document.getElementById('harvest-file-input');
    const harvestBrowseBtn = document.getElementById('harvest-browse-btn');
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnCancel = document.getElementById('btn-cancel');
    const statusPill = document.getElementById('harvest-status-pill');
    const globalStatusPill = document.getElementById('status-pill');
    const harvestBanner = document.getElementById('harvest-banner');
    const harvestBannerTitle = document.getElementById('harvest-banner-title');
    const progressBar = document.getElementById('harvest-progress-bar');
    const progressText = document.getElementById('harvest-progress-text');
    const harvestLog = document.getElementById('harvest-log');
    const previewTbody = document.getElementById('preview-tbody');
    const harvestElapsed = document.getElementById('harvest-elapsed');
    
    let mockTotalItems = 0;
    let mockProcessed = 0;
    let mockInterval = null;
    let timerInterval = null;
    let startTime = 0;
    let isPaused = false;

    // File Selection
    harvestBrowseBtn.addEventListener('click', () => {
        hiddenFileInput.click();
    });

    hiddenFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            harvestFileInput.value = file.name;
            document.getElementById('preview-filename').textContent = file.name;
            
            // Mock stats
            document.getElementById('stat-total').textContent = Math.floor(Math.random() * 100) + 20;
            document.getElementById('stat-valid').textContent = Math.floor(Math.random() * 80) + 15;
            document.getElementById('stat-invalid').textContent = "2";
            document.getElementById('stat-unique').textContent = Math.floor(Math.random() * 70) + 10;
            document.getElementById('stat-size').textContent = (file.size / 1024).toFixed(1) + " KB";
            
            btnStart.disabled = false;
        }
    });

    // Timer helper
    function updateTimer() {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        harvestElapsed.textContent = `${hrs}:${mins}:${secs}`;
    }

    // Set UI State
    function setUIState(state) {
        if (state === 'running') {
            btnStart.style.display = 'none';
            btnPause.style.display = 'inline-block';
            btnPause.textContent = '⏸ Pause';
            btnCancel.style.display = 'inline-block';
            
            harvestBanner.className = 'harvest-banner running';
            harvestBanner.style.borderLeftColor = 'var(--pill-running)';
            harvestBannerTitle.textContent = 'RUNNING';
            
            const pStyle = 'color: var(--pill-running); border-color: var(--pill-running);';
            statusPill.style = pStyle;
            statusPill.textContent = '● Running';
            globalStatusPill.style = pStyle;
            globalStatusPill.textContent = '● Running';
            
            progressBar.style.backgroundColor = 'var(--pill-running)';
            
        } else if (state === 'success') {
            btnStart.style.display = 'inline-block';
            btnStart.textContent = '↺ New Harvest';
            btnPause.style.display = 'none';
            btnCancel.style.display = 'none';
            
            harvestBanner.className = 'harvest-banner success';
            harvestBanner.style.borderLeftColor = 'var(--pill-success)';
            harvestBannerTitle.textContent = 'COMPLETED';
            
            const pStyle = 'color: var(--pill-success); border-color: var(--pill-success);';
            statusPill.style = pStyle;
            statusPill.textContent = '● Completed';
            globalStatusPill.style = pStyle;
            globalStatusPill.textContent = '● Completed';
            
            progressBar.style.backgroundColor = 'var(--pill-success)';
            harvestLog.textContent = "Harvest finished successfully.";
        } else if (state === 'idle') {
            btnStart.style.display = 'inline-block';
            btnStart.textContent = '▶ Start Harvest';
            btnPause.style.display = 'none';
            btnCancel.style.display = 'none';
            
            harvestBanner.className = 'harvest-banner ready';
            harvestBanner.style.borderLeftColor = 'var(--pill-success)';
            harvestBannerTitle.textContent = 'READY';
            
            const pStyle = 'color: var(--pill-idle); border-color: var(--pill-idle);';
            statusPill.style = pStyle;
            statusPill.textContent = '● Idle';
            globalStatusPill.style = pStyle;
            globalStatusPill.textContent = '● Idle';
            
            progressBar.style.backgroundColor = 'var(--pill-idle)';
            progressBar.style.width = '0%';
            harvestLog.textContent = "Ready…";
            progressText.textContent = "0 / 0";
            harvestElapsed.textContent = "00:00:00";
            previewTbody.innerHTML = '';
        }
    }

    // Start Harvest
    btnStart.addEventListener('click', async () => {
        if (btnStart.textContent.includes('New Harvest')) {
            setUIState('idle');
            return;
        }

        setUIState('running');
        previewTbody.innerHTML = '';
        
        // 1. Call Python API
        try {
            const res = await fetch('/api/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start' })
            });
            const data = await res.json();
            mockTotalItems = data.total_items || 30;
        } catch(e) {
            console.warn("API not reachable, using fallback mockup limits", e);
            mockTotalItems = Math.floor(Math.random() * 20) + 10;
        }
        
        mockProcessed = 0;
        startTime = Date.now();
        isPaused = false;
        
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);

        // 2. Simulate background worker progress
        mockInterval = setInterval(() => {
            if (isPaused) return;
            
            mockProcessed++;
            
            // Update Progress Bar
            const pct = Math.floor((mockProcessed / mockTotalItems) * 100);
            progressBar.style.width = pct + '%';
            progressText.textContent = `${mockProcessed} / ${mockTotalItems}`;
            
            // Fake ISBN and Log
            const fakeIsbn = "978" + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
            const statuses = ["Found", "Found", "Found", "Failed", "Cached"];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            harvestLog.textContent = `Processed ${fakeIsbn} - ${status}`;
            
            // Add row to preview table
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${fakeIsbn}</td><td><span style="color: ${status === 'Failed' ? 'var(--pill-error)' : 'var(--pill-success)'}">${status}</span></td>`;
            previewTbody.prepend(tr);
            
            // Limit rows
            if (previewTbody.children.length > 50) {
                previewTbody.lastElementChild.remove();
            }
            
            if (mockProcessed >= mockTotalItems) {
                clearInterval(mockInterval);
                clearInterval(timerInterval);
                setUIState('success');
            }
        }, 400); // Process 1 item every 400ms
    });
    
    // Pause
    btnPause.addEventListener('click', () => {
        isPaused = !isPaused;
        if (isPaused) {
            btnPause.textContent = '▶ Resume';
            statusPill.textContent = '● Paused';
            statusPill.style.color = 'var(--accent-hover)';
            statusPill.style.borderColor = 'var(--accent-hover)';
        } else {
            btnPause.textContent = '⏸ Pause';
            statusPill.textContent = '● Running';
            statusPill.style.color = 'var(--pill-running)';
            statusPill.style.borderColor = 'var(--pill-running)';
        }
    });
    
    // Cancel
    btnCancel.addEventListener('click', () => {
        clearInterval(mockInterval);
        clearInterval(timerInterval);
        
        btnStart.style.display = 'inline-block';
        btnStart.textContent = '↺ New Harvest';
        btnPause.style.display = 'none';
        btnCancel.style.display = 'none';
        
        harvestBanner.className = 'harvest-banner ready';
        harvestBanner.style.borderLeftColor = 'var(--pill-error)';
        harvestBannerTitle.textContent = 'CANCELLED';
        
        const pStyle = 'color: var(--pill-error); border-color: var(--pill-error);';
        statusPill.style = pStyle;
        statusPill.textContent = '● Cancelled';
        globalStatusPill.style = pStyle;
        globalStatusPill.textContent = '● Cancelled';
        
        progressBar.style.backgroundColor = 'var(--pill-error)';
        harvestLog.textContent = "Harvest cancelled by user.";
    });
});
