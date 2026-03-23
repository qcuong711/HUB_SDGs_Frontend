// --- API Service ---
const APIService = {
    /**
     * Lấy dữ liệu thống kê cho Dashboard
     * @returns {Promise<Object>} Trả về object chứa các mảng dữ liệu: research, teaching, progress
     */
    getDashboardStats: async () => {
        // --- 1. Lấy data mock ---
        if (CONFIG.USE_MOCK_DATA) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockData = {
                        research: [],
                        teaching: [],
                        stewardship: [],
                        progress: []
                    };
                    
                    // Tạo dữ liệu 17 SDGs
                    for (let i = 0; i < 17; i++) {
                        mockData.research.push({ sdg: i + 1, count: Math.floor(Math.random() * 50) + 10 });
                        mockData.teaching.push({ sdg: i + 1, percentage: (Math.random() * 10).toFixed(1) });
                        mockData.progress.push(Math.floor(Math.random() * 80) + 20);
                    }
                    resolve(mockData);
                }, 500);
            });
        }

        // --- 2. gọi API ---
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/dashboard/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Lỗi khi gọi API getDashboardStats:", error);
            return { research: [], teaching: [], stewardship: [], progress: [] };
        }
    },

    getNewsList: async (sdgId = 'all', page = 1) => {
        return [];
    }
};
