document.addEventListener('DOMContentLoaded', function () {
    // --- 0. Initialization & Language ---
    const lang = getLang();
    const t = translations[lang];

    // Helper to get text or fallback
    const n = (key, fallback) => t[key] || fallback;

    // --- 1. Master Data (Mock) ---
    // 17 SDGs Colors
    const sdgColors = [
        '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2',
        '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
        '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
    ];

    // Mock Data Store
    const hubData = {
        // Research: [SDG Index, Year, Count] -> Heatmap
        research: [],
        // Teaching: [SDG Index, % Courses]
        teaching: [],
        // Stewardship: { energy, water, waste } per SDG (simplified)
        stewardship: [],
        progress: []
    };

    // Generate Mock Data
    for (let i = 0; i < 17; i++) {
        // Research: Random 5-20 papers per SDG
        hubData.research.push({ sdg: i + 1, count: Math.floor(Math.random() * 50) + 10 });

        // Teaching: Random 1-10% courses
        hubData.teaching.push({ sdg: i + 1, percentage: (Math.random() * 10).toFixed(1) });

        // Stewardship: Random progress 20-100%
        hubData.progress.push(Math.floor(Math.random() * 80) + 20);
    }

    // --- 2. Filter Logic ---
    let currentFilter = 'all'; // 'all' or 1..17
    const filterContainer = document.getElementById('sdg-filter');

    if (filterContainer) {
        // "All" Button (using logo or generic icon)
        let filterHtml = `
            <div class="sdg-filter-item active" data-sdg="all" title="Show All">
                <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#eee; font-weight:bold; color:#333;">ALL</div>
            </div>
        `;

        // 17 SDG Icons
        for (let i = 1; i <= 17; i++) {
            const basePath = window.appImgPath || 'images/';
            filterHtml += `
            <div class="sdg-filter-item" data-sdg="${i}" title="SDG ${i}">
                 <img src="${basePath}sdg-${i}.png" onerror="this.src='https://via.placeholder.com/60/ccc/333?text=${i}'" alt="SDG ${i}">
            </div>`;
        }
        filterContainer.innerHTML = filterHtml;

        // Click Event
        const items = filterContainer.querySelectorAll('.sdg-filter-item');
        items.forEach(item => {
            item.addEventListener('click', function () {
                // UI Update
                items.forEach(el => el.classList.remove('active'));
                this.classList.add('active');

                // Logic Update
                currentFilter = this.getAttribute('data-sdg');
                updateDashboard(currentFilter);
            });
        });
    }

    // --- 3. Charts Initialization ---

    // A. Research Heatmap (or Bar for simplicity first)
    // Let's use a Bar chart that animates.
    const chartResearchDom = document.getElementById('chart-research');
    let chartResearch = chartResearchDom ? echarts.init(chartResearchDom) : null;

    // B. Teaching Pie/Bar
    const chartTeachingDom = document.getElementById('chart-teaching');
    let chartTeaching = chartTeachingDom ? echarts.init(chartTeachingDom) : null;

    // C. Stewardship Gauge/Pie
    const chartStewardDom = document.getElementById('chart-stewardship');
    let chartSteward = chartStewardDom ? echarts.init(chartStewardDom) : null;

    // D. Outreach Bar Chart
    const chartOutreachDom = document.getElementById('chart-outreach');
    let chartOutreach = chartOutreachDom ? echarts.init(chartOutreachDom) : null;

    // --- 4. Update Function ---
    function updateDashboard(filter) {
        updateResearchChart(filter);
        updateTeachingChart(filter);
        updateStewardshipChart(filter);
        updateProgress(filter);
        updateOutreachChart(filter);
    }

    function updateResearchChart(filter) {
        if (!chartResearch) return;

        let xData = [];
        let yData = [];
        let colors = [];

        if (filter === 'all') {
            xData = hubData.research.map(d => `SDG ${d.sdg}`);
            yData = hubData.research.map(d => d.count);
            colors = sdgColors;
        } else {
            const sdgId = parseInt(filter);
            xData = [`SDG ${sdgId}`];
            yData = [hubData.research[sdgId - 1].count];
            colors = [sdgColors[sdgId - 1]];
        }

        const option = {
            tooltip: { trigger: 'axis' },
            grid: { top: '10%', bottom: '20%', left: '10%', right: '5%' },
            xAxis: {
                type: 'category',
                data: xData,
                axisLabel: { interval: 0, rotate: filter === 'all' ? 45 : 0, fontSize: 10 }
            },
            yAxis: { type: 'value', name: 'Papers' },
            series: [{
                data: yData.map((val, idx) => ({
                    value: val,
                    itemStyle: { color: filter === 'all' ? colors[idx] : colors[0] }
                })),
                type: 'bar',
                barWidth: '60%'
            }]
        };
        chartResearch.setOption(option, true);
    }

    function updateTeachingChart(filter) {
        if (!chartTeaching) return;

        let data = [];

        if (filter === 'all') {
            // Show Top 5 for "All" to avoid clutter
            let sorted = [...hubData.teaching].sort((a, b) => b.percentage - a.percentage).slice(0, 5);
            data = sorted.map(d => ({
                value: d.percentage,
                name: `SDG ${d.sdg}`,
                itemStyle: { color: sdgColors[d.sdg - 1] }
            }));
        } else {
            const sdgId = parseInt(filter);
            data = [{
                value: hubData.teaching[sdgId - 1].percentage,
                name: `SDG ${sdgId}`,
                itemStyle: { color: sdgColors[sdgId - 1] }
            }, {
                value: 100 - hubData.teaching[sdgId - 1].percentage,
                name: 'Other',
                itemStyle: { color: '#eee' }
            }];
        }

        const option = {
            tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: { show: true, position: 'outside', formatter: '{b}' }, // Simple label
                labelLine: { show: true },
                data: data
            }]
        };
        chartTeaching.setOption(option, true);
    }

    function updateStewardshipChart(filter) {
        if (!chartSteward) return;

        // Mock Consumption Data
        // If All: Breakdown by Type (Energy, Water, Waste)
        // If Filter: Contribution of this SDG to conservation? (Mock logic)

        const option = {
            tooltip: { trigger: 'item' },
            legend: { bottom: '0%', left: 'center' },
            series: [{
                name: 'Consumption',
                type: 'pie',
                radius: '45%',
                center: ['50%', '45%'], // Move up slightly
                data: [
                    { value: 1048, name: 'Energy (kWh)', itemStyle: { color: '#f0ad4e' } },
                    { value: 735, name: 'Water (m3)', itemStyle: { color: '#5bc0de' } },
                    { value: 580, name: 'Waste (kg)', itemStyle: { color: '#5cb85c' } }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    show: true,
                    formatter: '{b}\n{d}%',
                    lineHeight: 15
                }
            }]
        };
        chartSteward.setOption(option, true);
    }

    function updateProgress(filter) {
        const container = document.getElementById('steward-progress-container');
        if (!container) return;

        let html = '';
        if (filter === 'all') {
            // Show random 4 top policies
            const policies = [
                { name: t.dash_p3_prog || "Policy Progress", val: 85, color: '#28a745' },
                { name: "Paperless Campus", val: 60, color: '#17a2b8' },
                { name: "Gender Equality", val: 92, color: '#e83e8c' },
                { name: "Plastic Free", val: 45, color: '#ffc107' }
            ];

            policies.forEach(p => {
                html += `
                <div class="progress-wrapper">
                    <div class="progress-label">
                        <span>${p.name}</span>
                        <span>${p.val}%</span>
                    </div>
                    <div class="progress-custom">
                        <div class="progress-bar-custom" style="width: ${p.val}%; background-color: ${p.color}; background-image: none;"></div>
                    </div>
                </div>`;
            });
        } else {
            const sdgId = parseInt(filter);
            const val = hubData.progress[sdgId - 1];
            html = `
            <div class="text-center mt-4">
                <h5 class="text-success fw-bold">${val}%</h5>
                <p class="small text-muted">Alignment with SDG ${sdgId} Targets</p>
                <div class="progress-custom mt-2">
                    <div class="progress-bar-custom" style="width: ${val}%;"></div>
                </div>
            </div>`;
        }
        container.innerHTML = html;
    }

    function updateOutreachChart(filter) {
        if (!chartOutreach) return;

        // Mock Social Impact Data
        // Categories: Volunteers, Beneficiaries, Events, Partners
        let categories = [
            n('dash_out_vol', 'Volunteers'),
            n('dash_out_ben', 'Beneficiaries'),
            n('dash_out_evt', 'Events'),
            n('dash_out_part', 'Partners')
        ];
        let data = [];
        let color = '#d9534f'; // Default Outreach Red

        if (filter === 'all') {
            data = [1200, 5000, 45, 12]; // Aggregate
            color = '#A71B28'; // Hub Red
        } else {
            // Randomize based on SDG for demo
            const seed = parseInt(filter);
            data = [
                Math.floor(Math.random() * 200) + 50,  // Volunteers
                Math.floor(Math.random() * 1000) + 200, // Beneficiaries
                Math.floor(Math.random() * 10) + 2,    // Events
                Math.floor(Math.random() * 5) + 1      // Partners
            ];
            color = sdgColors[seed - 1];
        }

        const option = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { top: '10%', bottom: '10%', left: '20%', right: '10%' },
            xAxis: { type: 'value', splitLine: { show: false } },
            yAxis: {
                type: 'category',
                data: categories,
                axisLabel: { fontWeight: 'bold' }
            },
            series: [{
                name: 'Impact',
                type: 'bar',
                data: data,
                itemStyle: { color: color },
                label: { show: true, position: 'right' }
            }]
        };
        chartOutreach.setOption(option, true);
    }

    // Initialize with All
    updateDashboard('all');

    // Handle Resize
    window.addEventListener('resize', function () {
        chartResearch && chartResearch.resize();
        chartTeaching && chartTeaching.resize();
        chartSteward && chartSteward.resize();
        chartOutreach && chartOutreach.resize();
    });
});
