let currentNewsPage = 1;
                        const newsPerPage = 6;
                        let visibleNewsCards = [];
                        let visibleYearFilter = 'all';
                        let visibleSDGFilter = 'all';

                        function goToNewsPage(page) {
                            const totalPages = Math.ceil(visibleNewsCards.length / newsPerPage);
                            if (page < 1 || page > totalPages) return;
                            currentNewsPage = page;
                            renderPagination();
                            document.getElementById('news-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }

                        function renderPagination() {
                            const totalPages = Math.ceil(visibleNewsCards.length / newsPerPage);
                            const paginationContainer = document.getElementById('news-pagination');
                            if (paginationContainer) {
                                let html = '';
                                html += `<li class="page-item ${currentNewsPage === 1 ? 'disabled' : ''}"><a class="page-link shadow-none rounded-0 px-3" href="javascript:void(0)" onclick="goToNewsPage(${currentNewsPage - 1})" ${currentNewsPage === 1 ? 'style="color: #999;"' : 'style="color: #333;"'}>&laquo; Trước</a></li>`;

                                for (let i = 1; i <= totalPages; i++) {
                                    if (i === currentNewsPage) {
                                        html += `<li class="page-item active"><a class="page-link shadow-none" href="javascript:void(0)" onclick="goToNewsPage(${i})" style="background-color:#004080; border-color:#004080; color:white;">${i}</a></li>`;
                                    } else {
                                        html += `<li class="page-item"><a class="page-link text-dark shadow-none" href="javascript:void(0)" onclick="goToNewsPage(${i})">${i}</a></li>`;
                                    }
                                }

                                html += `<li class="page-item ${currentNewsPage === totalPages || totalPages === 0 ? 'disabled' : ''}"><a class="page-link shadow-none rounded-0 px-3" href="javascript:void(0)" onclick="goToNewsPage(${currentNewsPage + 1})" ${currentNewsPage === totalPages || totalPages === 0 ? 'style="color: #999;"' : 'style="color: #333;"'}>Sau &raquo;</a></li>`;

                                paginationContainer.innerHTML = html;

                                if (totalPages <= 1) {
                                    paginationContainer.parentElement.style.display = 'none';
                                } else {
                                    paginationContainer.parentElement.style.display = 'flex';
                                }
                            }

                            // Apply visibility based on page
                            document.querySelectorAll('.news-card-item').forEach(c => c.style.display = 'none');

                            visibleNewsCards.forEach((card, index) => {
                                if (index >= (currentNewsPage - 1) * newsPerPage && index < currentNewsPage * newsPerPage) {
                                    card.style.display = 'block';
                                }
                            });

                            let emptyMsg = document.getElementById('news-empty-msg');
                            if (!emptyMsg) {
                                emptyMsg = document.createElement('div');
                                emptyMsg.id = 'news-empty-msg';
                                emptyMsg.className = 'col-12 text-center text-muted py-5';
                                emptyMsg.innerHTML = '<i class="fas fa-box-open fs-1 mb-3" style="color:#ddd;"></i><p>Chưa có bài viết nào phù hợp với bộ lọc.</p>';
                                document.getElementById('news-grid').appendChild(emptyMsg);
                            }
                            emptyMsg.style.display = visibleNewsCards.length === 0 ? 'block' : 'none';
                        }

                        function applyAllFilters() {
                            const newsCards = document.querySelectorAll('.news-card-item');
                            
                            newsCards.forEach(card => {
                                const cardYear = card.getAttribute('data-year');
                                const cardSdg = card.getAttribute('data-sdg');
                                
                                const yearMatch = (visibleYearFilter === 'all' || parseInt(cardYear) === parseInt(visibleYearFilter));
                                const sdgMatch = (visibleSDGFilter === 'all' || cardSdg === visibleSDGFilter);
                                
                                if (yearMatch && sdgMatch) {
                                    card.setAttribute('data-visible', 'true');
                                } else {
                                    card.setAttribute('data-visible', 'false');
                                }
                            });

                            currentNewsPage = 1;
                            visibleNewsCards = Array.from(document.querySelectorAll('.news-card-item[data-visible="true"]'));
                            
                            // Sort by year descending
                            visibleNewsCards.sort((a, b) => parseInt(b.getAttribute('data-year')) - parseInt(a.getAttribute('data-year')));
                            
                            renderPagination();
                        }

                        function updateNewsTimeline(element, year) {
                            if (element) {
                                document.querySelectorAll('.news-timeline-step').forEach(step => step.classList.remove('active'));
                                element.classList.add('active');
                            }
                            visibleYearFilter = year;
                            applyAllFilters();
                        }

                        function updateNewsSDG(element, sdg) {
                            if (element) {
                                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                                element.classList.add('active');
                            }
                            visibleSDGFilter = sdg;
                            applyAllFilters();
                        }

                        document.addEventListener('DOMContentLoaded', () => {
                            // Bind SDG Filter buttons
                            document.querySelectorAll('.filter-btn').forEach(btn => {
                                btn.addEventListener('click', function() {
                                    const sdg = this.getAttribute('data-tag-sdg');
                                    updateNewsSDG(this, sdg);
                                });
                            });

                            // Adding a 'Tất cả' filter to the timeline to allow discovering paginaton intuitively
                            const timelineSteps = document.querySelector('.news-timeline-steps');
                            if (timelineSteps && document.querySelectorAll('.news-timeline-step').length === 7) {
                                const allStepHtml = document.createElement('div');
                                allStepHtml.className = 'news-timeline-step';
                                allStepHtml.onclick = function () { updateNewsTimeline(this, 'all'); };
                                allStepHtml.innerHTML = '<div class="news-timeline-dot" style="background-color: #F2A900; border-color: #004080;"></div><div class="news-timeline-year fw-bold" style="color: #004080;">Tất cả</div>';
                                timelineSteps.insertBefore(allStepHtml, timelineSteps.firstChild);
                            }

                            // Initial filter application
                            const allStep = document.querySelector('.news-timeline-step');
                            updateNewsTimeline(allStep, 'all');
                        });

document.addEventListener('DOMContentLoaded', () => {
            // 1. SDG Grid Population
            const sdgGrid = document.getElementById('sdg-grid');
            if (sdgGrid) {
                let gridHtml = '';
                const colorMap = [
                    '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2',
                    '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
                    '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
                ];
                // Mock stats labels for flip cards to match user requests
                const labels = [
                    "Học bổng", "Suất ăn", "Bảo hiểm", "Khóa học", "Nữ giới", "Nước sạch",
                    "Tái tạo", "Việc làm", "Số hóa", "Công bằng", "Không gian", "Dự án",
                    "Cam kết", "Bảo tồn", "Cây xanh", "Minh bạch", "Đối tác"
                ];
                const stats = ["5 tỷ+", "95%", "100%", "50+", "60%", "100%", "45%", "15000+", "82%", "90%", "11ha", "16+", "100%", "65%", "80%", "95%", "50+"];

                for (let i = 1; i <= 17; i++) {
                    const sdgColor = colorMap[i-1];
                    gridHtml += `
                        <div class="col-4 col-sm-3 col-md-2 mb-2">
                            <div class="flip-card flip-card-sm shadow-sm">
                                <div class="flip-card-inner">
                                    <div class="flip-card-front">
                                        <img src="images/sdg-${i}.png" class="w-100 h-100" style="object-fit: contain; padding: 0px;" alt="SDG ${i}">
                                    </div>
                                    <div class="flip-card-back" style="background-color: ${sdgColor};">
                                        <div class="flip-sdg-title">SDG ${i}</div>
                                        <div class="flip-stat-number">${stats[i-1]}</div>
                                        <div class="flip-stat-label">${labels[i-1]}</div>
                                        <button class="btn btn-flip-detail" onclick="window.location.href='sdg-${i.toString().padStart(2, '0')}-detail.html'">Chi Tiết</button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                }
                sdgGrid.innerHTML = gridHtml;
            }

            // Expose logic to window for external scripts
            window.runCounter = (el) => {
                if (!el) return;
                const target = +el.getAttribute('data-target');
                const duration = 1500;
                let count = 0;
                el.innerText = "0";
                const timer = setInterval(() => {
                    count += Math.ceil(target / (duration / 30));
                    if (count >= target) {
                        el.innerText = target;
                        clearInterval(timer);
                    } else {
                        el.innerText = count;
                    }
                }, 30);
            };

            // 3. Map & Navigation Logic
            const markers = document.querySelectorAll('.marker');
            const detailModalEl = document.getElementById('strategyDetailModal');
            let detailModal = null;
            if (detailModalEl && typeof bootstrap !== 'undefined') {
                detailModal = new bootstrap.Modal(detailModalEl);
            }

            markers.forEach(marker => {
                marker.addEventListener('click', function () {
                    const sdg = this.getAttribute('data-sdg');
                    if (detailModal) detailModal.show();
                    if (typeof filterNewsGrid === 'function') filterNewsGrid(sdg);
                });
            });

            // 4. News Grid Filtering & Search
            const filterButtons = document.querySelectorAll('.filter-btn');
            const searchInput = document.querySelector('.search-input');
            const newsGrid = document.getElementById('news-grid');
            const newsCards = Array.from(document.querySelectorAll('.news-card-item'));
            let visibleYearFilter = 'all';

            window.filterNewsGrid = function(sdg, year = 'all', query = '') {
                const activeSdg = sdg || 'all';
                const activeYear = year || visibleYearFilter;
                const activeQuery = query || (searchInput ? searchInput.value : '');

                let filtered = newsCards;
                if (activeSdg !== 'all') {
                    filtered = filtered.filter(card => card.getAttribute('data-sdg') == activeSdg);
                }
                if (activeYear !== 'all') {
                    filtered = filtered.filter(card => card.getAttribute('data-year') == activeYear);
                }
                if (activeQuery) {
                    const q = activeQuery.toLowerCase();
                    filtered = filtered.filter(card => {
                        const title = card.querySelector('.card-title').innerText.toLowerCase();
                        const text = card.querySelector('.card-text').innerText.toLowerCase();
                        return title.includes(q) || text.includes(q);
                    });
                }

                newsCards.forEach(card => card.style.display = 'none');
                filtered.forEach(card => card.style.display = 'block');

                const pagination = document.getElementById('news-pagination');
                const emptyMsg = document.getElementById('news-empty-msg');
                if (filtered.length === 0) {
                    if (!emptyMsg && newsGrid) {
                        const msg = document.createElement('div');
                        msg.id = 'news-empty-msg';
                        msg.className = 'col-12 text-center py-5';
                        msg.innerHTML = `<h5 class="text-muted" data-i18n="news_empty_query">Không tìm thấy bài viết nào phù hợp...</h5>`;
                        newsGrid.appendChild(msg);
                        if (typeof updateStaticContent === 'function') updateStaticContent();
                    }
                    if (pagination) pagination.parentElement.style.display = 'none';
                } else {
                    if (emptyMsg) emptyMsg.remove();
                    if (pagination) pagination.parentElement.style.display = 'flex';
                }
            };

            // Timeline interaction
            window.updateNewsTimeline = function (el, year) {
                if (el) {
                    document.querySelectorAll('.news-timeline-step').forEach(s => s.classList.remove('active'));
                    el.classList.add('active');
                }
                visibleYearFilter = year;
                const activeBtn = document.querySelector('.filter-btn.active');
                const sdg = activeBtn ? activeBtn.getAttribute('data-tag-sdg') : 'all';
                
                // Trigger global filter if exists
                if (typeof filterNewsGrid === 'function') {
                    filterNewsGrid(sdg, year, searchInput ? searchInput.value : '');
                }
            };

            // 5. Modal and Tab Interactions
            if (detailModalEl) {
                detailModalEl.addEventListener('shown.bs.modal', () => {
                    const activePane = document.querySelector('.strategy-pane.active.show');
                    if (activePane) {
                        const counter = activePane.querySelector('.counter-value');
                        if (counter) runCounter(counter);
                        if (activePane.id === 'str-edu') initRadarChart();
                        if (typeof updateStaticContent === 'function') updateStaticContent();
                    }
                });
            }

            const tabBtns = document.querySelectorAll('.strategy-tab-btn');
            const panes = document.querySelectorAll('.strategy-pane');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    panes.forEach(p => {
                        p.classList.remove('show', 'active');
                        p.style.display = 'none';
                    });
                    const targetId = btn.getAttribute('data-target');
                    const targetPane = document.getElementById(targetId);
                    if (targetPane) {
                        targetPane.style.display = 'block';
                        setTimeout(() => {
                            targetPane.classList.add('show', 'active');
                            const counter = targetPane.querySelector('.counter-value');
                            if (counter) runCounter(counter);
                            if (targetId === 'str-edu') initRadarChart();
                        }, 50);
                    }
                });
            });

            // 6. ECharts Radar Chart
            let eduRadarChart = null;
            function initRadarChart() {
                const chartDom = document.getElementById('radar-chart-edu');
                if (!chartDom || typeof echarts === 'undefined') return;
                if (!eduRadarChart) eduRadarChart = echarts.init(chartDom);
                const option = {
                    color: ['#0099cc'],
                    radar: {
                        indicator: [
                            { name: 'Chương trình\nĐào tạo', max: 100 },
                            { name: 'Nghiên cứu', max: 100 },
                            { name: 'Cơ sở\nVật chất', max: 100 },
                            { name: 'Khởi nghiệp', max: 100 },
                            { name: 'Mạng lưới\nDoanh nghiệp', max: 100 }
                        ],
                        radius: 80,
                        axisName: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 11 },
                        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } }
                    },
                    series: [{
                        type: 'radar',
                        data: [{
                            value: [90, 85, 95, 80, 100],
                            areaStyle: { color: 'rgba(0, 153, 204, 0.4)' },
                            lineStyle: { color: '#0099cc', width: 2 }
                        }]
                    }]
                };
                eduRadarChart.setOption(option);
            }
        });

// Chatbot Widget Toggle
        function toggleHubiPopup(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const popup = document.getElementById('hubiPopup');
            if (popup) popup.classList.toggle('active');
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            const popup = document.getElementById('hubiPopup');
            const mascot = document.getElementById('hubiMascot');
            if (popup && popup.classList.contains('active') && !popup.contains(e.target) && (!mascot || !mascot.contains(e.target))) {
                popup.classList.remove('active');
            }
        });


