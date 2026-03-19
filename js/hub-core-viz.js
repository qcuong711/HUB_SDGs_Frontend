document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('hub-core-viz');
    if (!container) return;

    // --- Language ---
    const lang = getLang(); // From lang.js
    const t = translations[lang];

    // --- Configuration ---
    const basePath = window.appImgPath || 'images/';
    const width = container.clientWidth || 800;
    const height = 600;
    const center = { x: width / 2, y: height / 2 };

    // Radii
    const rCore = 60;        // Logo Center
    const rPillarsIn = 80;   // Start of Pillars
    const rPillarsOut = 180; // End of Pillars
    const rSDGs = 260;       // Center of SDG Icons

    // Colors (HUB Palette)
    const hubColors = {
        blue: '#004080',
        gold: '#F2A900',
        red: '#d93025',
        green: '#1a5c3d',
        cyan: '#0099cc'
    };

    // --- Data: Pillars ---
    const pillars = [
        {
            id: 'gov',
            name: t.pillar_gov_name,
            desc: t.pillar_gov_desc,
            color: hubColors.blue,
            icon: 'fa-landmark',
            sdgs: [16, 17]
        },
        {
            id: 'edu',
            name: t.pillar_edu_name,
            desc: t.pillar_edu_desc,
            color: hubColors.gold,
            icon: 'fa-graduation-cap',
            sdgs: [4, 8, 9]
        },
        {
            id: 'res',
            name: t.pillar_res_name,
            desc: t.pillar_res_desc,
            color: hubColors.red,
            icon: 'fa-microscope',
            sdgs: [1, 2, 3, 5, 10]
        },
        {
            id: 'cam',
            name: t.pillar_cam_name,
            desc: t.pillar_cam_desc,
            color: hubColors.green,
            icon: 'fa-tree',
            sdgs: [6, 7, 11, 12]
        },
        {
            id: 'com',
            name: t.pillar_com_name,
            desc: t.pillar_com_desc,
            color: hubColors.cyan,
            icon: 'fa-hands-helping',
            sdgs: [13, 14, 15]
        }
    ];

    // --- SDG Data (Simple List for positioning) ---
    // 1 to 17
    const sdgCount = 17;
    const sdgAngleStep = (2 * Math.PI) / sdgCount;
    // Align SDG 1 to top (-90 degrees)
    const startAngle = -Math.PI / 2;

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    container.appendChild(svg);

    // --- Helper: Polar to Cartesian ---
    function polarToCartesian(centerX, centerY, radius, angleInRadians) {
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    // --- Helper: Describe Arc ---
    function describeArc(x, y, radius, startAngle, endAngle) {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
            "L", x, y,
            "Z" // Close path (goes to center, but we will cut the hole later or use donut logic)
        ].join(" ");
    }

    // Better Donut Slice Path
    function donutSlice(x, y, radiusIn, radiusOut, startAngle, endAngle) {
        const p1 = polarToCartesian(x, y, radiusOut, endAngle);
        const p2 = polarToCartesian(x, y, radiusOut, startAngle);
        const p3 = polarToCartesian(x, y, radiusIn, startAngle);
        const p4 = polarToCartesian(x, y, radiusIn, endAngle);

        const largeArc = endAngle - startAngle <= Math.PI ? "0" : "1";

        return `
            M ${p1.x} ${p1.y}
            A ${radiusOut} ${radiusOut} 0 ${largeArc} 0 ${p2.x} ${p2.y}
            L ${p3.x} ${p3.y}
            A ${radiusIn} ${radiusIn} 0 ${largeArc} 1 ${p4.x} ${p4.y}
            Z
        `;
    }

    // --- Layer 0: Connections (Light Trails) ---
    const connectionsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(connectionsGroup);

    // Store SDG positions for connection references
    const sdgPositions = [];
    for (let i = 0; i < sdgCount; i++) {
        const angle = startAngle + (i * sdgAngleStep);
        sdgPositions.push({
            id: i + 1,
            x: center.x + rSDGs * Math.cos(angle),
            y: center.y + rSDGs * Math.sin(angle),
            angle: angle
        });
    }

    // --- Layer 1: Pillars ---
    const pillarsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(pillarsGroup);

    const pillarStep = (2 * Math.PI) / pillars.length;

    pillars.forEach((pillar, i) => {
        const pStartAngle = startAngle + (i * pillarStep);
        const pEndAngle = pStartAngle + pillarStep - 0.05; // Gap
        // Center of the pillar arc (for connections)
        const pMidAngle = pStartAngle + (pillarStep / 2);
        const pMidX = center.x + ((rPillarsIn + rPillarsOut) / 2) * Math.cos(pMidAngle);
        const pMidY = center.y + ((rPillarsIn + rPillarsOut) / 2) * Math.sin(pMidAngle);

        // 1. Draw connections first (hidden)
        pillar.sdgs.forEach(sdgId => {
            const sdgPos = sdgPositions[sdgId - 1];
            if (sdgPos) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                // Bezier curve
                const d = `M ${pMidX} ${pMidY} Q ${(pMidX + sdgPos.x) / 2} ${(pMidY + sdgPos.y) / 2} ${sdgPos.x} ${sdgPos.y}`;
                path.setAttribute("d", d);
                path.setAttribute("stroke", pillar.color);
                path.setAttribute("stroke-width", "2");
                path.setAttribute("fill", "none");
                path.setAttribute("opacity", "0");
                path.setAttribute("class", `conn-line pillar-${pillar.id}`);
                connectionsGroup.appendChild(path);
            }
        });

        // 2. Draw Pillar Arc
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", donutSlice(center.x, center.y, rPillarsIn, rPillarsOut, pStartAngle, pEndAngle));
        path.setAttribute("fill", pillar.color);
        path.setAttribute("stroke", "white");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("class", "pillar-segment");
        path.style.cursor = "pointer";
        path.style.transition = "all 0.3s";

        // Interaction
        path.addEventListener('mouseenter', () => activatePillar(pillar, path));
        path.addEventListener('mouseleave', () => deactivatePillar(pillar, path));

        pillarsGroup.appendChild(path);

        // 3. Label/Icon inside Arc
        const textRadius = (rPillarsIn + rPillarsOut) / 2;
        const textX = center.x + textRadius * Math.cos(pMidAngle);
        const textY = center.y + textRadius * Math.sin(pMidAngle);

        // Wrapper for text/icon to rotate properly? 
        // Simple text for now
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", textX);
        text.setAttribute("y", textY);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "10");
        text.setAttribute("font-weight", "bold");
        text.style.pointerEvents = "none";

        // Simple multiline manual logic or just the name
        // Split name into 2 words logic simplified
        const words = pillar.name.split(' ');
        if (words.length > 2) {
            const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
            const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
            text.innerHTML = `<tspan x="${textX}" dy="-0.5em">${line1}</tspan><tspan x="${textX}" dy="1.2em">${line2}</tspan>`;
        } else {
            text.textContent = pillar.name;
        }

        pillarsGroup.appendChild(text);
    });

    // --- Layer 2: SDGs ---
    const sdgsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(sdgsGroup);

    sdgPositions.forEach(pos => {
        // Circle background
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 25);
        circle.setAttribute("fill", "white");
        circle.setAttribute("stroke", "#eee");
        circle.setAttribute("stroke-width", "1");
        circle.setAttribute("class", "sdg-node");
        sdgsGroup.appendChild(circle);

        // Image
        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttribute("x", pos.x - 25);
        img.setAttribute("y", pos.y - 25);
        img.setAttribute("width", "50");
        img.setAttribute("height", "50");
        img.setAttribute("href", `${basePath}sdg-${pos.id}.png`); // Ensure images exist or use placeholder
        img.setAttributeNS("http://www.w3.org/1999/xlink", "href", `${basePath}sdg-${pos.id}.png`);
        // Fallback or clip path circular
        img.setAttribute("class", "sdg-icon");
        sdgsGroup.appendChild(img);
    });

    // --- Layer 3: Core (Logo) ---
    const coreGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(coreGroup);

    const coreCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    coreCircle.setAttribute("cx", center.x);
    coreCircle.setAttribute("cy", center.y);
    coreCircle.setAttribute("r", rCore);
    coreCircle.setAttribute("fill", "white");
    coreCircle.setAttribute("class", "core-circle");
    coreGroup.appendChild(coreCircle);

    const logo = document.createElementNS("http://www.w3.org/2000/svg", "image");
    logo.setAttribute("x", center.x - 50);
    logo.setAttribute("y", center.y - 50);
    logo.setAttribute("width", "100");
    logo.setAttribute("height", "100");
    logo.setAttribute("href", `${basePath}HUB logo-08.png`); // Using available logo
    logo.setAttributeNS("http://www.w3.org/1999/xlink", "href", `${basePath}HUB logo-08.png`);
    coreGroup.appendChild(logo);

    /* 
    // Text Removed per user request
    const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    ...
    */


    // --- Layout: Side Panel ---
    const panel = document.getElementById('hub-core-panel');
    const panelContent = document.getElementById('hub-core-content');

    // --- Interactions ---

    function activatePillar(pillar, element) {
        // 1. Highlight lines
        const lines = document.querySelectorAll(`.pillar-${pillar.id}`);
        lines.forEach(line => {
            line.setAttribute("opacity", "1");
            line.style.strokeDasharray = "10";
            line.style.animation = "dash 1s linear infinite";
        });

        // 2. Dim others
        document.querySelectorAll('.pillar-segment').forEach(el => {
            if (el !== element) el.setAttribute("opacity", "0.3");
        });

        // 3. Show Panel
        if (panel && panelContent) {
            // "Đóng góp cho SDGs" -> t.impact_title (or a new key if distinct, using 'impact_title' is close enough or 'Contributions to SDGs')
            // Let's use a hardcoded label or new key. I'll use a new key concept or English/Vietnamese inline for now if I missed it?
            // I missed a specific key for "Contributions to SDGs:" in the panel.
            // But I have `impact_title` = "Cách các Trụ cột đóng góp...".
            // Let's just use "Contributions to SDGs" translated broadly.
            const contribLabel = lang === 'vi' ? "Đóng góp cho SDGs:" : "Contributions to SDGs:";
            const viewProjectLabel = lang === 'vi' ? "Xem chi tiết dự án" : "View Project Details";

            panelContent.innerHTML = `
                <h3 style="color: ${pillar.color}">${pillar.name}</h3>
                <p class="mb-4">${pillar.desc}</p>
                
                <h5 class="text-secondary">${contribLabel}</h5>
                <div class="row g-2">
                    ${pillar.sdgs.map(id => `
                        <div class="col-4">
                            <img src="${basePath}sdg-${id}.png" class="img-fluid rounded shadow-sm" alt="SDG ${id}">
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-4">
                    <button class="btn btn-sm btn-outline-dark w-100">${viewProjectLabel}</button>
                </div>
            `;
            panel.classList.add('active');
        }
    }

    function deactivatePillar(pillar, element) {
        // 1. Hide lines
        const lines = document.querySelectorAll(`.pillar-${pillar.id}`);
        lines.forEach(line => {
            line.setAttribute("opacity", "0");
            line.style.animation = "none";
        });

        // 2. Restore opacity
        document.querySelectorAll('.pillar-segment').forEach(el => {
            el.setAttribute("opacity", "1");
        });

        // 3. Keep panel? Or hiding it? 
        // User asked for "Panel side trượt ra". Maybe keep it until another hover?
        // Let's keep it visible but maybe update default state if needed.
        // For now, let's NOT hide it immediately to allow clicking.
    }

    // Initial Panel State
    if (panelContent) {
        const hoverText = lang === 'vi' ? "Rê chuột vào các Trụ cột để xem chi tiết đóng góp của HUB." : "Hover over the Pillars to see HUB's contributions.";
        panelContent.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-hand-pointer fa-3x mb-3"></i>
                <p>${hoverText}</p>
            </div>
        `;
    }

});
