/* =========================================================
   SUY RA HÌNH THỨC XỬ PHẠT — Điều 13 NĐ 125/2020
   ---------------------------------------------------------
   Trả về object: { khoan, muc, khung, moTa }
   ========================================================= */
function getHinhThucXuPhat(soNgay, laToChuc) {
    const n = Number(soNgay);
    if (!Number.isFinite(n) || n < 0) return null;

    /* Khoản 1: 1-5 ngày + tình tiết giảm nhẹ */
    if (n >= 1 && n <= 5) {
        return {
            khoan: "khoản 1",
            khung: "Cảnh cáo",
            moTa: "Phạt cảnh cáo"
        };
    }

    /* Khoản 2: 1-30 ngày */
    if (n <= 30) {
        return {
            khoan: "khoản 2",
            khung: "2.000.000 đồng đến 5.000.000 đồng",
            moTa: "Phạt tiền từ 2.000.000 đồng đến 5.000.000 đồng"
        };
    }

    /* Khoản 3: 31-60 ngày */
    if (n <= 60) {
        return {
            khoan: "khoản 3",
            khung: "5.000.000 đồng đến 8.000.000 đồng",
            moTa: "Phạt tiền từ 5.000.000 đồng đến 8.000.000 đồng"
        };
    }

    /* Khoản 4a: 61-90 ngày */
    if (n <= 90) {
        return {
            khoan: "điểm a khoản 4",
            khung: "8.000.000 đồng đến 15.000.000 đồng",
            moTa: "Phạt tiền từ 8.000.000 đồng đến 15.000.000 đồng"
        };
    }

    /*
     * n > 90 ngày:
     * - Nếu CÓ phát sinh thuế + đã nộp đủ → khoản 5
     * - Nếu KHÔNG phát sinh thuế → điểm b khoản 4
     *
     * Hiện chưa có input riêng cho "có phát sinh thuế hay không",
     * nên tạm mặc định áp khoản 5 (giả định có phát sinh + đã nộp đủ).
     */
    return {
        khoan: "khoản 5",
        khung: "15.000.000 đồng đến 25.000.000 đồng",
        moTa: "Phạt tiền từ 15.000.000 đồng đến 25.000.000 đồng"
    };
}

/* =========================================================
   SUY RA QUYỀN GIẢI TRÌNH — Điều 61 Luật XLVPHC
   ---------------------------------------------------------
   Cá nhân: khung tối đa >= 15tr  → có quyền
   Tổ chức: khung tối đa >= 30tr  → có quyền
   ========================================================= */
function getQuyenGiaiTrinh(soNgay, laToChuc) {
    const n = Number(soNgay);
    if (!Number.isFinite(n) || n < 0) return null;

    /* Khung tối đa theo từng khoản Điều 13 */
    let khungToiDa;
    if (n <= 5)       khungToiDa = 0;         // Cảnh cáo
    else if (n <= 30) khungToiDa = 5_000_000;
    else if (n <= 60) khungToiDa = 8_000_000;
    else if (n <= 90) khungToiDa = 15_000_000;
    else              khungToiDa = 25_000_000;

    const nguong = laToChuc ? 30_000_000 : 15_000_000;
    const coQuyen = khungToiDa >= nguong;

    return {
        coQuyen,
        khungToiDa,
        nguong
    };
}

/* =========================================================
   CẬP NHẬT MỤC 3 — HÌNH THỨC XỬ PHẠT
   ---------------------------------------------------------
   Dựa trên số ngày chậm nộp LỚN NHẤT trong danh sách hành vi
   ========================================================= */
function updateMuc3() {
    const el = document.getElementById("hinhThucXuPhat");
    if (!el) return;

    if (!hanhViData || hanhViData.length === 0) {
        el.textContent = el.dataset.default || "";
        el.classList.remove("filled", "just-filled");
        return;
    }

    /* Lấy số ngày chậm nộp lớn nhất */
    const maxNgay = Math.max.apply(null, hanhViData.map(h => Number(h.chamNop) || 0));

    const laToChuc = true;   /* Tạm mặc định: khối tổ chức */
    const hinhPhat = getHinhThucXuPhat(maxNgay, laToChuc);
    if (!hinhPhat) {
        el.textContent = el.dataset.default || "";
        el.classList.remove("filled", "just-filled");
        return;
    }

    /* Câu đầy đủ */
    let text = `${hinhPhat.moTa} được quy định tại ${hinhPhat.khoan} `
        + `Điều 13 Nghị định số 125/2020/NĐ-CP ngày 19 tháng 10 năm 2020 `
        + `của Chính phủ quy định về xử phạt vi phạm hành chính về thuế, hóa đơn`;

    /* Riêng khoản 5 → chèn thêm căn cứ sửa đổi */
    if (hinhPhat.khoan === "khoản 5") {
        text += `, được sửa đổi, bổ sung bởi điểm a khoản 10 Điều 1 `
            + `Nghị định số 310/2025/NĐ-CP ngày 02 tháng 12 năm 2025 của Chính phủ`;
    }

text += `.`;

    el.textContent = text;
    el.classList.add("filled");

    el.classList.remove("just-filled");
    el.classList.add("just-filled");
}

/* =========================================================
   CẬP NHẬT MỤC 6 — QUYỀN VÀ THỜI HẠN GIẢI TRÌNH
   ========================================================= */
function updateMuc6() {
    const el = document.getElementById("quyenGiaiTrinh");
    if (!el) return;

    if (!hanhViData || hanhViData.length === 0) {
        el.textContent = el.dataset.default || "";
        el.classList.remove("filled", "just-filled");
        return;
    }

    const maxNgay = Math.max.apply(null, hanhViData.map(h => Number(h.chamNop) || 0));

    const laToChuc = true;
    const quyen = getQuyenGiaiTrinh(maxNgay, laToChuc);

    let text;

    if (quyen && quyen.coQuyen) {
        /* CÓ quyền giải trình */
        text = `Cá nhân, tổ chức vi phạm hành chính có quyền giải trình trực tiếp `
            + `hoặc bằng văn bản với người có thẩm quyền xử phạt vi phạm hành chính `
            + `theo quy định tại khoản 1 Điều 61 Luật Xử lý vi phạm hành chính `
            + `đối với hành vi vi phạm quy định tại Điều 13 Nghị định số 125/2020/NĐ-CP `
            + `ngày 19 tháng 10 năm 2020 của Chính phủ quy định về xử phạt vi phạm `
            + `hành chính về thuế, hóa đơn.`;
    } else {
        /* KHÔNG có quyền giải trình */
        text = `Không được quyền giải trình (do không thuộc trường hợp quy định `
            + `tại khoản 1 Điều 61 Luật Xử lý vi phạm hành chính) đối với hành vi `
            + `vi phạm quy định tại Điều 13 Nghị định số 125/2020/NĐ-CP ngày 19 `
            + `tháng 10 năm 2020 của Chính phủ quy định về xử phạt vi phạm hành `
            + `chính về thuế, hóa đơn.`;
    }

    el.textContent = text;
    el.classList.add("filled");

    el.classList.remove("just-filled");
    el.classList.add("just-filled");
}