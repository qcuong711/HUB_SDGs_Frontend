// Configuration for each SDG
        const sdgConfig = {
            '01': { color: '#E5243B' },
            '02': { color: '#DDA63A' },
            '03': { color: '#4C9F38' },
            '04': { color: '#C5192D' },
            '05': { color: '#FF3A21' },
            '06': { color: '#26BDE2' },
            '07': { color: '#FCC30B' },
            '08': { color: '#A21942' },
            '09': { color: '#FD6925' },
            '10': { color: '#DD1367' },
            '11': { color: '#FD9D24' },
            '12': { color: '#BF8B2E' },
            '13': { color: '#3F7E44' },
            '14': { color: '#0A97D9' },
            '15': { color: '#56C02B' },
            '16': { color: '#00689D' },
            '17': { color: '#19486A' }
        };

        // Detect current SDG from filename (e.g., sdg-01-detail.html)
        function initSDGPage() {
            const path = window.location.pathname;
            const match = path.match(/sdg-(\d{2})/);
            const sdgNum = match ? match[1] : '01';
            
            // Set Color
            const config = sdgConfig[sdgNum] || sdgConfig['01'];
            document.documentElement.style.setProperty('--sdg-color', config.color);
            
            // Update Number Display
            const numEl = document.getElementById('sdg-number-display');
            if (numEl) numEl.textContent = sdgNum;
            
            // Update i18n keys for this specific SDG
            const titleEl = document.getElementById('sdg-title-display');
            const subtitleEl = document.getElementById('sdg-subtitle-display');
            const breadcrumbEl = document.getElementById('breadcrumb-current-text');
            const overview1 = document.querySelector('[data-i18n$="_overview_p1"]');
            const overview2 = document.querySelector('[data-i18n$="_overview_p2"]');

            if (titleEl) titleEl.setAttribute('data-i18n', `sdg${parseInt(sdgNum)}_title`);
            if (subtitleEl) subtitleEl.setAttribute('data-i18n', `sdg${parseInt(sdgNum)}_subtitle`);
            if (breadcrumbEl) breadcrumbEl.setAttribute('data-i18n', `sdg${parseInt(sdgNum)}_breadcrumb`);
            if (overview1) overview1.setAttribute('data-i18n', `sdg${parseInt(sdgNum)}_overview_p1`);
            if (overview2) overview2.setAttribute('data-i18n', `sdg${parseInt(sdgNum)}_overview_p2`);

            // Update Infographic
            const infoTitle = document.querySelector('.infographic-title');
            if (infoTitle) infoTitle.setAttribute('data-i18n', `sdg${parseInt(sdgNum)}_infographic_title`);
            
            // SDG 1 specific images check, or fallbacks
            const gImg1 = document.getElementById('gallery-img-1');
            const gImg2 = document.getElementById('gallery-img-2');
            if (sdgNum === '04') {
                if(gImg1) gImg1.src = "images/class.jpg";
                if(gImg2) gImg2.src = "images/class3.jpg";
            } else if (sdgNum === '01') {
                if(gImg1) gImg1.src = "images/20251129143946-10101.jpg";
                if(gImg2) gImg2.src = "images/20251129144014-10107.jpg";
            }

            // Update Actions
            const actionItems = document.querySelectorAll('.action-item');
            actionItems.forEach((item, index) => {
                const title = item.querySelector('h4');
                const text = item.querySelector('p');
                const actionIdx = index + 1;
                
                // Try SDG specific action first, then common
                const specificTitleKey = `sdg${parseInt(sdgNum)}_action${actionIdx}_title`;
                const specificTextKey = `sdg${parseInt(sdgNum)}_action${actionIdx}_text`;
                const commonTitleKey = `common_action${actionIdx}_title`;
                const commonTextKey = `common_action${actionIdx}_text`;

                if (translations[getLang()][specificTitleKey]) {
                    title.setAttribute('data-i18n', specificTitleKey);
                    text.setAttribute('data-i18n', specificTextKey);
                } else {
                    title.setAttribute('data-i18n', commonTitleKey);
                    text.setAttribute('data-i18n', commonTextKey);
                }
            });

            // Re-run i18n update
            if (typeof updateStaticContent === 'function') {
                updateStaticContent();
            }

            // Populate related SDGs grid
            const grid = document.getElementById('related-sdgs-list');
            if (grid) {
                grid.innerHTML = '';
                for (let i = 1; i <= 17; i++) {
                    const num = i.toString().padStart(2, '0');
                    const imgNum = i.toString(); // No leading zero for images
                    const link = document.createElement('a');
                    link.href = `sdg-${num}-detail.html`;
                    link.className = `sdg-icon-mini ${num === sdgNum ? 'active-sdg' : ''}`;
                    link.innerHTML = `<img src="images/sdg-${imgNum}.png" alt="SDG ${imgNum}" style="width: 50px; height: 50px; border-radius: 4px; border: ${num === sdgNum ? '2px solid white' : 'none'}">`;
                    grid.appendChild(link);
                }
            }
        }

        document.addEventListener('DOMContentLoaded', initSDGPage);
