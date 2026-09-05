let dailyChart = null;
let weeklyChart = null;

// Ensure Chart is available (loaded via script tag in HTML)
// We treat it as a global since it's not an ESM import in this setup
const Chart = window.Chart;

const barGlowPlugin = {
    id: 'focusbridgeBarGlow',
    beforeDatasetDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.shadowColor = 'rgba(255, 149, 0, 0.32)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
    },
    afterDatasetDraw(chart) {
        chart.ctx.restore();
    }
};

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
        const ringGradient = wheelCtx.createLinearGradient(0, 0, 168, 168);
        ringGradient.addColorStop(0, '#ffd08a');
        ringGradient.addColorStop(0.52, '#ffa500');
        ringGradient.addColorStop(1, '#e97900');

        dailyChart = new Chart(wheelCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [todayMins, Math.max(0, 60 - todayMins)], // Goal is 60 mins
                    backgroundColor: [ringGradient, 'rgba(255, 255, 255, 0.10)'],
                    borderWidth: 0,
                    cutout: '82%'
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
        const barGradient = barCtx.createLinearGradient(0, 0, 0, barCtx.canvas.height || 180);
        barGradient.addColorStop(0, '#ffd08a');
        barGradient.addColorStop(0.42, '#ffa500');
        barGradient.addColorStop(1, '#e98200');

        weeklyChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: dataPoints,
                    backgroundColor: barGradient,
                    borderRadius: 999,
                    borderSkipped: false,
                    minBarLength: 3,
                    barThickness: 14
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { display: false, beginAtZero: true },
                    x: { grid: { display: false }, border: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.48)' } }
                }
            },
            plugins: [barGlowPlugin]
        });
    }
}
