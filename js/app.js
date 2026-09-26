const forms = [
    {
        id: 1,
        code: 'gnt',
        title: 'Giấy nộp tiền vào NSNN',
        description: 'Giấy nộp tiền vào ngân sách nhà nước',
        category: 'NNT',
        icon: 'badge-dollar-sign',
        theme: 'color-theme-1'
    }, 
    {
        id: 2,
        code: 'pchs',
        title: 'Phiếu chuyển hồ sơ',
        description: 'Phiếu chuyển hồ sơ nội bộ.',
        category: 'CBT',
        icon: 'folder-sync',
        theme: 'color-theme-2'
    }, 
    {
        id: 3,
        code: 'mau_24_dkt',
        title: 'Mẫu 24/ĐKT - Đề nghị chấm dứt hiệu lực mã số thuế',
        description: 'Mẫu 24/ĐKT - Đề nghị chấm dứt hiệu lực mã số thuế',
        category: 'NNT',
        icon: 'globe-check',
        theme: 'color-theme-3'
    }, 
    {
        id: 4,
        code: 'bb_vphc',
        title: 'Biên bản vi phạm hành chính',
        description: 'Biên bản vi phạm hành chính',
        category: 'CBT',
        icon: 'whistle',
        theme: 'color-theme-4'
    }, 
    // {
    //     id: 4,
    //     title: 'Đánh giá hiệu suất',
    //     description: 'Đánh giá kết quả làm việc và đề xuất mục tiêu phát triển cá nhân.',
    //     category: 'Nhân sự',
    //     icon: 'bar-chart-3',
    //     theme: 'color-theme-4'
    // }, 
    // {
    //     id: 5,
    //     title: 'Đề xuất ý tưởng',
    //     description: 'Gửi ý tưởng sáng tạo, cải tiến quy trình và sản phẩm của công ty.',
    //     category: 'Sáng tạo',
    //     icon: 'lightbulb',
    //     theme: 'color-theme-5'
    // }, 
    // {
    //     id: 6,
    //     title: 'Khảo sát thị trường',
    //     description: 'Nghiên cứu xu hướng và nhu cầu của khách hàng mục tiêu.',
    //     category: 'Nghiên cứu',
    //     icon: 'trending-up',
    //     theme: 'color-theme-6'
    // }
];

function renderForms(filter = '') {
    const list = document.getElementById('formList');
    const count = document.getElementById('formCount');

    const filtered = forms.filter(f =>
        f.title.toLowerCase().includes(filter.toLowerCase()) ||
        f.category.toLowerCase().includes(filter.toLowerCase())
    );

    list.innerHTML = filtered.map(f => `
        <div 
            class="form-card ${f.theme} cursor-pointer"
            data-code="${f.code}"
        >
            <span class="order-badge">
                #${String(f.id).padStart(2, '0')}
            </span>

            <div class="icon-wrapper">
                <i data-lucide="${f.icon}" class="h-5 w-5"></i>
            </div>

            <div class="form-title">${f.title}</div>

            <p class="form-desc">${f.description}</p>

            <div class="form-meta">
                <span class="category-tag">${f.category}</span>

                <span style="margin-left:auto; opacity:0.5;">
                    ✦
                </span>

                <button class="action-btn" type="button">
                    Mở
                    <i data-lucide="arrow-right" class="h-3 w-3"></i>
                </button>
            </div>
        </div>
    `).join('');

    count.textContent = `${filtered.length} biểu mẫu`;

    // Click vào card
    document.querySelectorAll('.form-card').forEach(card => {
        card.addEventListener('click', () => {
            const code = card.dataset.code;
            window.open(`xforms/${code}/${code}.html`, '_blank');
        });
    });

    lucide.createIcons();
}

document.getElementById('searchInput').addEventListener('input', function() {
    renderForms(this.value);
});

renderForms();
lucide.createIcons();