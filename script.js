const DAILY_GOAL = 2000;
let history = JSON.parse(localStorage.getItem('fastingHistory')) || {};
let viewDate = new Date(); // Date used for calendar navigation

function init() {
    updateTimer();
    setInterval(updateTimer, 1000);
    renderCalendar();
    updateStats();
    loadTodaysCalories();
}

function getRomaniaDateKey(date = new Date()) {
    return date.toLocaleDateString('ro-RO');
}

function updateTimer() {
    const now = new Date();
    const hrs = now.getHours();
    const statusEl = document.getElementById('timer-status');
    const countEl = document.getElementById('countdown');

    let target = new Date();
    let isEating = (hrs >= 12 && hrs < 20);

    if (isEating) {
        statusEl.innerText = "EATING WINDOW";
        statusEl.style.color = "#1DB954";
        target.setHours(20, 0, 0);
    } else {
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
}

function updateCalories() {
    const m1 = parseInt(document.getElementById('meal1').value) || 0;
    const m2 = parseInt(document.getElementById('meal2').value) || 0;
    const s = parseInt(document.getElementById('snacks').value) || 0;
    
    const total = m1 + m2 + s;
    const remaining = DAILY_GOAL - total;
    
    document.getElementById('remaining-calories').innerText = remaining;
    document.getElementById('progress-fill').style.width = Math.max(0, (remaining/DAILY_GOAL)*100) + "%";

    const today = getRomaniaDateKey();
    if(!history[today]) history[today] = { status: 'success' };
    history[today].meals = { m1, m2, s };
    save();
}

function loadTodaysCalories() {
    const today = getRomaniaDateKey();
    if(history[today]?.meals) {
        document.getElementById('meal1').value = history[today].meals.m1;
        document.getElementById('meal2').value = history[today].meals.m2;
        document.getElementById('snacks').value = history[today].meals.s;
        updateCalories();
    }
}

function logDay(status) {
    const today = getRomaniaDateKey();
    history[today] = { ...history[today], status: status };
    save();
    renderCalendar();
    updateStats();
}

function undoToday() {
    const today = getRomaniaDateKey();
    delete history[today];
    document.getElementById('meal1').value = '';
    document.getElementById('meal2').value = '';
    document.getElementById('snacks').value = '';
    updateCalories();
    save();
    renderCalendar();
    updateStats();
}

function changeMonth(step) {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + step, 1);
    const limitDate = new Date(2027, 11, 31);
    
    if (newDate <= limitDate) {
        viewDate = newDate;
        renderCalendar();
    } else {
        alert("Calendar limit reached: Dec 2027");
    }
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('month-name');
    grid.innerHTML = '';
    
    monthLabel.innerText = viewDate.toLocaleString('ro-RO', { month: 'long', year: 'numeric' });
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Padding for start of month
    for(let p=0; p<(firstDay === 0 ? 6 : firstDay - 1); p++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerText = i;
        
        const dateKey = new Date(year, month, i).toLocaleDateString('ro-RO');
        if (history[dateKey]) dayDiv.classList.add(history[dateKey].status);
        grid.appendChild(dayDiv);
    }
}

function updateStats() {
    const vals = Object.values(history);
    document.getElementById('streak-count').innerText = vals.filter(v => v.status === 'success').length;
    document.getElementById('relapse-count').innerText = vals.filter(v => v.status === 'relapse').length;
    document.getElementById('pause-count').innerText = vals.filter(v => v.status === 'paused').length;
}

function save() { localStorage.setItem('fastingHistory', JSON.stringify(history)); }

init();
