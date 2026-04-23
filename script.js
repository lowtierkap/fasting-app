const DAILY_GOAL = 2000;
let history = JSON.parse(localStorage.getItem('fastingHistory')) || {};

function init() {
    updateTimer();
    setInterval(updateTimer, 1000);
    renderCalendar();
    updateStats();
    
    // Load today's calories if any
    const today = getRomaniaDateKey();
    if(history[today]?.meals) {
        document.getElementById('meal1').value = history[today].meals.m1;
        document.getElementById('meal2').value = history[today].meals.m2;
        document.getElementById('snacks').value = history[today].meals.s;
        updateCalories();
    }
}

function getRomaniaDateKey() {
    return new Date().toLocaleDateString('ro-RO');
}

function updateTimer() {
    const now = new Date();
    const hrs = now.getHours();
    const statusEl = document.getElementById('timer-status');
    const countEl = document.getElementById('countdown');

    let target = new Date();
    let isEating = false;

    if (hrs >= 12 && hrs < 20) {
        isEating = true;
        statusEl.innerText = "EATING WINDOW";
        statusEl.style.color = "#1DB954";
        target.setHours(20, 0, 0);
    } else {
        isEating = false;
        statusEl.innerText = "FASTING";
        statusEl.style.color = "#ffffff";
        if (hrs >= 20) target.setDate(target.getDate() + 1);
        target.setHours(12, 0, 0);
    }

    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    countEl.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;

    // Auto-log success if it's the end of the day and no relapse
    if (!isEating && hrs === 23 && !history[getRomaniaDateKey()]) {
        logDay(true);
    }
}

function updateCalories() {
    const m1 = parseInt(document.getElementById('meal1').value) || 0;
    const m2 = parseInt(document.getElementById('meal2').value) || 0;
    const s = parseInt(document.getElementById('snacks').value) || 0;
    
    const total = m1 + m2 + s;
    const remaining = DAILY_GOAL - total;
    
    document.getElementById('remaining-calories').innerText = remaining;
    const percent = Math.max(0, (remaining / DAILY_GOAL) * 100);
    document.getElementById('progress-fill').style.width = percent + "%";

    // Save calorie state
    const today = getRomaniaDateKey();
    if(!history[today]) history[today] = { status: 'success' };
    history[today].meals = { m1, m2, s };
    localStorage.setItem('fastingHistory', JSON.stringify(history));
}

function logRelapse() {
    logDay(false);
    alert("Tomorrow is a new chance, twin. Stay focused.");
}

function logDay(isSuccess) {
    const today = getRomaniaDateKey();
    history[today] = { ...history[today], status: isSuccess ? 'success' : 'relapse' };
    localStorage.setItem('fastingHistory', JSON.stringify(history));
    renderCalendar();
    updateStats();
}

function updateStats() {
    const vals = Object.values(history);
    const streaks = vals.filter(v => v.status === 'success').length;
    const relapses = vals.filter(v => v.status === 'relapse').length;
    document.getElementById('streak-count').innerText = streaks;
    document.getElementById('relapse-count').innerText = relapses;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('month-name');
    grid.innerHTML = '';
    
    const now = new Date();
    monthLabel.innerText = now.toLocaleString('ro-RO', { month: 'long', year: 'numeric' });
    
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerText = i;
        
        const dateKey = new Date(now.getFullYear(), now.getMonth(), i).toLocaleDateString('ro-RO');
        if (history[dateKey]) {
            dayDiv.classList.add(history[dateKey].status);
        }
        grid.appendChild(dayDiv);
    }
}

init();
