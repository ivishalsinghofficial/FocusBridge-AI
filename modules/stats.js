let dailyChart = null;
let weeklyChart = null;

// Ensure Chart is available (loaded via script tag in HTML)
// We treat it as a global since it's not an ESM import in this setup
const Chart = window.Chart;

export async function loadAllStats() {
    const res = await chrome.storage.local.get(['history']);
    const history = res.history || {};
    const todayDate = new Date().toISOString().split('T')[0];

    // Use the history object for TODAY as the source for the wheel
    const todayMins = history[todayDate] || 0;

    const todayLabel = document.getElementById('todayMins');
    if (todayLabel) todayLabel.innerText = todayMins;

    const wheelCtx = document.getElementById('dailyWheel')?.getContext('2d');
    const barCtx = document.getElementById('weeklyBarChart')?.getContext('2d');
    if (!wheelCtx || !barCtx) return;

    // DAILY WHEEL
    if (dailyChart) dailyChart.destroy();
    if (Chart) {
        dailyChart = new Chart(wheelCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [todayMins, Math.max(0, 60 - todayMins)], // Goal is 60 mins
                    backgroundColor: ['#ffa500', '#eee'],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: { plugins: { tooltip: { enabled: false } }, maintainAspectRatio: false }
        });
    }

    // WEEKLY BAR
    const labels = []; const dataPoints = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        labels.push(days[d.getDay()]);
        dataPoints.push(history[dateStr] || 0);
    }

    if (weeklyChart) weeklyChart.destroy();
    if (Chart) {
        weeklyChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ data: dataPoints, backgroundColor: '#ffa500', borderRadius: 4 }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { display: false, beginAtZero: true }, x: { grid: { display: false } } }
            }
        });
    }
}
