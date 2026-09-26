/* =========================================================
   DỮ LIỆU NNT
   ---------------------------------------------------------
   Nạp từ ../../xdata/nnt.js — biến `nnt` là mảng các object:
   { id, cccd, mst, tenNNT, nganhNghe, tenAp, tenXa, tenTinh, maChuong }
   ========================================================= */

/* =========================================================
   DOM
   ========================================================= */
const nntModal       = document.getElementById("nntModal");
const btnOpenNNT     = document.getElementById("btnOpenNNT");
const btnOpenNNT2    = document.getElementById("btnOpenNNT2");
const btnCloseNNT    = document.getElementById("btnCloseNNT");
const btnCancelNNT   = document.getElementById("btnCancelNNT");
const btnConfirmNNT  = document.getElementById("btnConfirmNNT");
const nntSearchInput = document.getElementById("nntSearchInput");
const nntResult      = document.getElementById("nntResult");
const hanhViViPham   = document.getElementById("hanhViViPham");


/* =========================================================
   STATE
   ========================================================= */
let selectedNNT = null;
let selectedNNTIndex = -1;

/* =========================================================
   CONFIG
   ========================================================= */
const MAX_RESULTS  = 20;
const SEARCH_DELAY = 150;

/* =========================================================
   NORMALIZE
   ========================================================= */
function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   SEARCH INDEX
   ========================================================= */
const nntIndex = Array.isArray(nnt)
    ? nnt.map(function (item, index) {
        return {
            index,
            item,
            ten:  normalizeText(item.tenNNT),
            mst:  normalizeText(item.mst),
            cccd: normalizeText(item.cccd)
        };
    })
    : [];

console.log("Số lượng NNT:", nntIndex.length);

/* =========================================================
   CREATE HTML NNT
   ========================================================= */
function createNNTHTML(record) {
    const item = record.item;

    const tags = [];
    if (item.mst)      tags.push(`<span class="nnt-tag">MST: ${escapeHtml(item.mst)}</span>`);
    if (item.cccd)     tags.push(`<span class="nnt-tag">CCCD: ${escapeHtml(item.cccd)}</span>`);
    if (item.maChuong) tags.push(`<span class="nnt-tag">Mã chương: ${escapeHtml(item.maChuong)}</span>`);

    const address = [item.tenAp, item.tenXa, item.tenTinh]
        .map(v => String(v ?? "").trim())
        .filter(v => v !== "")
        .map(escapeHtml)
        .join(" · ");

    return `
        <div class="nnt-result-item" data-index="${record.index}">
            <div class="nnt-result-name">
                ${escapeHtml(item.tenNNT)}
            </div>
            <div class="nnt-result-info">
                ${tags.join("")}
            </div>
            <div class="nnt-result-address">
                📍 ${address}
            </div>
        </div>
    `;
}

/* =========================================================
   RENDER
   ========================================================= */
function renderNNTResults(list) {
    if (!list || list.length === 0) {
        nntResult.innerHTML = `
            <div class="nnt-empty">
                Không tìm thấy người nộp thuế phù hợp
            </div>
        `;
        return;
    }

    let html = `
        <div class="nnt-result-count">
            Hiển thị <strong>${Math.min(list.length, MAX_RESULTS)}</strong> người nộp thuế
        </div>
    `;

    for (let i = 0; i < list.length && i < MAX_RESULTS; i++) {
        html += createNNTHTML(list[i]);
    }

    nntResult.innerHTML = html;

    /* Giữ trạng thái selected khi re-render */
    if (selectedNNTIndex >= 0) {
        const row = nntResult.querySelector(
            `.nnt-result-item[data-index="${selectedNNTIndex}"]`
        );
        if (row) row.classList.add("selected");
    }
}

/* =========================================================
   HIỆN MẶC ĐỊNH
   ========================================================= */
function showDefaultNNT() {
    renderNNTResults(nntIndex.slice(0, MAX_RESULTS));
}

/* =========================================================
   SEARCH
   ========================================================= */
function searchNNT(keyword) {
    const query = normalizeText(keyword);

    if (!query) {
        showDefaultNNT();
        return;
    }

    const results = [];

    for (let i = 0; i < nntIndex.length; i++) {
        const record = nntIndex[i];

        if (
            record.ten.includes(query)  ||
            record.mst.includes(query)  ||
            record.cccd.includes(query)
        ) {
            results.push(record);
            if (results.length >= MAX_RESULTS) break;
        }
    }

    renderNNTResults(results);
}

/* =========================================================
   DEBOUNCE SEARCH
   ========================================================= */
let searchTimer = null;

nntSearchInput.addEventListener("input", function () {
    const keyword = this.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
        searchNNT(keyword);
    }, SEARCH_DELAY);
});

/* =========================================================
   CLICK CHỌN NNT
   ========================================================= */
nntResult.addEventListener("click", function (event) {
    const row = event.target.closest(".nnt-result-item");
    if (!row) return;

    const index = Number(row.dataset.index);
    if (Number.isNaN(index) || !nnt[index]) return;

    const oldSelected = nntResult.querySelector(".nnt-result-item.selected");
    if (oldSelected) oldSelected.classList.remove("selected");

    row.classList.add("selected");
    selectedNNTIndex = index;
    selectedNNT = nnt[index];

    btnConfirmNNT.disabled = false;
});

/* =========================================================
   HELPER: SET FIELD (auto-fill + flash vàng tạm thời)
   ========================================================= */
function setField(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    const v = String(value ?? "").trim();

    if (v !== "") {
        el.textContent = v;
        el.classList.add("filled");

        /* Restart animation */
        el.classList.remove("just-filled");
        void el.offsetWidth;
        el.classList.add("just-filled");
    } else {
        el.textContent = el.dataset.default || "";
        el.classList.remove("filled", "just-filled");
    }
}

/* =========================================================
   CẬP NHẬT THÔNG TIN NNT VÀO VĂN BẢN
   ---------------------------------------------------------
   Theo yêu cầu: TẠM THỜI luôn điền vào khối TỔ CHỨC,
   ẩn khối CÁ NHÂN — không phân biệt cá nhân/tổ chức.
   ========================================================= */
function updateNNTInfo() {
    if (!selectedNNT) return;

    const item = selectedNNT;

    /* Địa chỉ ghép ấp - xã - tỉnh */
    const diaChi = [item.tenAp, item.tenXa, item.tenTinh]
        .map(v => String(v ?? "").trim())
        .filter(v => v !== "")
        .join(", ");

    /* Ẩn khối cá nhân — luôn dùng khối tổ chức */
    const caNhanBlock = document.getElementById("caNhanViPham");
    const toChucBlock = document.getElementById("toChucViPham");
    if (caNhanBlock) caNhanBlock.style.display = "none";
    if (toChucBlock) toChucBlock.style.display = "";

    /* Điền vào khối tổ chức */
    setField("tc_ten",          item.tenNNT);
    setField("tc_ten4",         item.tenNNT);
    setField("tc_ten5",         item.tenNNT);
    setField("tc_mst",          item.mst);
    setField("tc_diaChi",       diaChi);
    setField("tc_cccd",         item.mst);
    // tc_nguoiDaiDien7

}

/* =========================================================
   MỞ MODAL
   ========================================================= */
function openNNTModal() {
    nntSearchInput.value = "";
    btnConfirmNNT.disabled = !selectedNNT;

    showDefaultNNT();

    nntModal.classList.add("show");

    requestAnimationFrame(function () {
        nntSearchInput.focus();
    });
}

btnOpenNNT.addEventListener("click", openNNTModal);
if (btnOpenNNT2) btnOpenNNT2.addEventListener("click", openNNTModal);

/* =========================================================
   ĐÓNG MODAL
   ========================================================= */
function closeNNTModal() {
    nntModal.classList.remove("show");
}

btnCloseNNT.addEventListener("click", closeNNTModal);
btnCancelNNT.addEventListener("click", closeNNTModal);

nntModal.addEventListener("click", function (event) {
    if (event.target === nntModal) closeNNTModal();
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nntModal.classList.contains("show")) {
        closeNNTModal();
    }
});

/* =========================================================
   XÁC NHẬN NNT
   ========================================================= */
btnConfirmNNT.addEventListener("click", function () {
    if (!selectedNNT) return;

    updateNNTInfo();
    closeNNTModal();
});

/* =========================================================
   NGÀY GIỜ BIÊN BẢN
   ========================================================= */
function setNgayGioBienBan() {
    const now = new Date();

    const gio   = String(now.getHours()).padStart(2, "0");
    const phut  = String(now.getMinutes()).padStart(2, "0");
    const ngay  = String(now.getDate()).padStart(2, "0");
    const thang = String(now.getMonth() + 1).padStart(2, "0");
    const nam   = now.getFullYear();

    const set = function (id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set("gioBB", gio);
    set("phutBB", phut);
    set("ngayBB", ngay);
    set("thangBB", thang);
    set("namBB", nam);

    /* ============================================
       Giờ lập xong = giờ lập + 30 phút
       ============================================ */
    const xong = new Date(now.getTime() + 30 * 60 * 1000);

    const gioXong   = String(xong.getHours()).padStart(2, "0");
    const phutXong  = String(xong.getMinutes()).padStart(2, "0");
    const ngayXong  = String(xong.getDate()).padStart(2, "0");
    const thangXong = String(xong.getMonth() + 1).padStart(2, "0");
    const namXong   = xong.getFullYear();

    set("gioXong", gioXong);
    set("phutXong", phutXong);
    set("ngayXong", ngayXong);
    set("thangXong", thangXong);
    set("namXong", namXong);
}

setNgayGioBienBan();

/* =========================================================
   HÀNH VI VI PHẠM















   ========================================================= */


const hanhViModal       = document.getElementById("hanhViModal");
const btnOpenHanhVi     = document.getElementById("btnOpenHanhVi");
const btnCloseHanhVi    = document.getElementById("btnCloseHanhVi");
const btnCancelHanhVi   = document.getElementById("btnCancelHanhVi");
const btnAddHanhVi      = document.getElementById("btnAddHanhVi");
const btnAddRow         = document.getElementById("btnAddRow");
const hvTableBody       = document.getElementById("hvTableBody");
const hvPreviewContent  = document.getElementById("hvPreviewContent");
const hanhViList        = document.getElementById("hanhViList");

/* Danh sách hành vi đã LƯU (dùng để render vào văn bản) */
let hanhViData = [];

/* Danh sách tờ khai ĐANG NHẬP trong modal (chưa lưu) */
let hvDraft = [];

/* =========================================================
   DANH MỤC MẪU TỜ KHAI — PHÂN NHÓM THEO LOẠI THUẾ
   ========================================================= */
const MAU_TO_KHAI_GROUPS = [
    {
        group: "Tờ khai thuế Giá trị gia tăng",
        items: [
            { value: "01/GTGT", label: "01/GTGT - Khai thuế GTGT theo phương pháp khấu trừ có hoạt động sản xuất, kinh doanh" },
            { value: "02/GTGT", label: "02/GTGT - Khai thuế GTGT theo phương pháp khấu trừ có dự án đầu tư" },
            { value: "03/GTGT", label: "03/GTGT - Khai thuế GTGT đối với hoạt động mua bán, chế tác vàng, bạc, đá quý tính thuế theo phương pháp trực tiếp trên giá trị gia tăng" },
            { value: "04/GTGT", label: "04/GTGT - Khai thuế GTGT theo phương pháp trực tiếp trên doanh thu" }
        ]
    },
    {
        group: "Tờ khai thuế Thu nhập doanh nghiệp",
        items: [
            { value: "03/TNDN", label: "03/TNDN - Khai quyết toán thuế TNDN theo phương pháp doanh thu trừ chi phí" },
            { value: "04/TNDN", label: "04/TNDN - Khai thuế TNDN tính theo tỷ lệ phần trăm trên doanh thu" }
        ]
    },
    {
        group: "Tờ khai thuế Thu nhập cá nhân",
        items: [
            { value: "05/QTT-TNCN", label: "05/QTT-TNCN - Khai quyết toán thuế TNCN đối với tổ chức, cá nhân trả thu nhập từ tiền lương, tiền công" }
        ]
    }
];

/* Helper: build <option> từ 1 item */
function buildOption(item, selectedValue) {
    const sel = item.value === selectedValue ? " selected" : "";
    return `<option value="${escapeHtml(item.value)}"${sel}>${escapeHtml(item.label)}</option>`;
}

/* Helper: build toàn bộ <optgroup> + <option> */
function buildMauToKhaiOptions(selectedValue) {
    let html = `<option value="">-- Chọn mẫu tờ khai --</option>`;

    MAU_TO_KHAI_GROUPS.forEach(function (grp) {
        html += `<optgroup label="${escapeHtml(grp.group)}">`;
        grp.items.forEach(function (item) {
            html += buildOption(item, selectedValue);
        });
        html += `</optgroup>`;
    });

    return html;
}

/* =========================================================
   PARSE KỲ TÍNH THUẾ
   ---------------------------------------------------------
   - "26Q2"  → quý 2 năm 2026
   - "2512"  → tháng 12 năm 2025
   - "25CN"  → năm 2025   ← bổ sung
   - "2025"  → năm 2025   (dự phòng)
   ========================================================= */
function parseKyTinhThue(str) {
    const s = String(str ?? "").trim().toUpperCase();
    if (!s) return null;

    /* Dạng Quý: NNQx (VD 26Q2) */
    let m = s.match(/^(\d{2})Q([1-4])$/);
    if (m) {
        return { type: 'quy', quy: Number(m[2]), nam: 2000 + Number(m[1]) };
    }

    /* Dạng Năm: NNCN (VD 25CN) */
    m = s.match(/^(\d{2})CN$/);
    if (m) {
        return { type: 'nam', nam: 2000 + Number(m[1]) };
    }

    /* Dạng Năm: YYYY (VD 2025) */
    m = s.match(/^(19|20)(\d{2})$/);
    if (m) {
        return { type: 'nam', nam: Number(s) };
    }

    /* Dạng Tháng: NNMM (VD 2512) */
    m = s.match(/^(\d{2})(0[1-9]|1[0-2])$/);
    if (m) {
        return { type: 'thang', thang: Number(m[2]), nam: 2000 + Number(m[1]) };
    }

    return { type: 'invalid' };
}

function formatKyTinhThue(parsed) {
    if (!parsed) return "";
    switch (parsed.type) {
        case 'quy':   return `quý ${parsed.quy} năm ${parsed.nam}`;
        case 'thang': return `tháng ${parsed.thang} năm ${parsed.nam}`;
        case 'nam':   return `năm ${parsed.nam}`;
        default:      return "";
    }
}

/* =========================================================
   XÁC ĐỊNH MỨC PHẠT THEO SỐ NGÀY CHẬM
   ========================================================= */
function getMucPhat(soNgay) {
    const n = Number(soNgay);
    if (!Number.isFinite(n) || n < 0) return "";
    if (n <= 30) return "từ 01 ngày đến 30 ngày";
    if (n <= 60) return "từ 31 ngày đến 60 ngày";
    if (n <= 90) return "từ 61 ngày đến 90 ngày";
    return "từ 90 ngày trở lên";
}

/* =========================================================
   FORMAT NGÀY
   ========================================================= */
function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatDateVN(isoDate) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

/* =========================================================
   BUILD CÂU HÀNH VI
   ========================================================= */
function buildHanhViText(data) {
    const mucPhat  = getMucPhat(data.chamNop);
    const kyParsed = parseKyTinhThue(data.kyTinhThue);
    const kyText   = formatKyTinhThue(kyParsed);
    const ngayNhan = formatDateVN(data.tiepNhan);

    return `Hành vi nộp hồ sơ khai thuế quá thời hạn ${mucPhat} `
        + `(Tờ khai mẫu ${data.mauToKhai} - Tờ khai thuế `
        + `kỳ tính thuế ${kyText}, `
        + `thời gian tiếp nhận hồ sơ: ngày ${ngayNhan}, `
        + `thời gian chậm nộp: ${data.chamNop} ngày).`;
}

/* =========================================================
   RENDER BẢNG NHẬP (DRAFT)
   ========================================================= */
function renderDraftTable() {
    if (!hvTableBody) return;

    if (hvDraft.length === 0) {
        hvDraft.push(newEmptyRow());
    }

    let html = "";
    hvDraft.forEach(function (row, idx) {
        const kyParsed = parseKyTinhThue(row.kyTinhThue);
        let kyHint = "";
        if (row.kyTinhThue) {
            if (kyParsed && kyParsed.type !== 'invalid') {
                kyHint = `<span class="ky-hint ok">→ ${formatKyTinhThue(kyParsed)}</span>`;
            } else {
                kyHint = `<span class="ky-hint error">✗ Sai định dạng (VD: 26Q2, 2512, 25CN)</span>`;
            }
        }

        const options = buildMauToKhaiOptions(row.mauToKhai);

        const removeDisabled = hvDraft.length <= 1 ? " disabled" : "";

        html += `
            <tr data-index="${idx}">
                <td class="row-index">${idx + 1}</td>
                <td>
                    <select class="cell-mauToKhai">${options}</select>
                </td>
                <td>
                    <input type="text" class="cell-kyTinhThue"
                           value="${escapeHtml(row.kyTinhThue)}"
                           placeholder="26Q2 / 2512 / 25CN">
                    ${kyHint}
                </td>
                <td>
                    <input type="date" class="cell-tiepNhan"
                           value="${escapeHtml(row.tiepNhan)}">
                </td>
                <td>
                    <input type="number" class="cell-chamNop"
                           value="${escapeHtml(row.chamNop)}"
                           min="0" placeholder="168">
                </td>
                <td>
                    <button type="button" class="row-remove"
                            data-index="${idx}"${removeDisabled}
                            title="Xóa dòng">×</button>
                </td>
            </tr>
        `;
    });

    hvTableBody.innerHTML = html;
    renderPreview();
}

/* Tạo 1 dòng trống mới */
function newEmptyRow() {
    return {
        mauToKhai: "",
        kyTinhThue: "",
        tiepNhan: todayISO(),
        chamNop: ""
    };
}

/* =========================================================
   RENDER PREVIEW
   ========================================================= */
function renderPreview() {
    if (!hvPreviewContent) return;

    const validRows = hvDraft.filter(function (row) {
        const kyParsed = parseKyTinhThue(row.kyTinhThue);
        return row.mauToKhai
            && kyParsed && kyParsed.type !== 'invalid'
            && row.tiepNhan
            && Number.isFinite(Number(row.chamNop))
            && row.chamNop !== "";
    });

    if (validRows.length === 0) {
        hvPreviewContent.innerHTML =
            '<div class="empty-note">(Chưa có tờ khai nào hợp lệ)</div>';
        return;
    }

    let html = "";
    validRows.forEach(function (row) {
        html += `<div class="hv-preview-item">- ${escapeHtml(buildHanhViText(row))}</div>`;
    });
    hvPreviewContent.innerHTML = html;
}

/* =========================================================
   ĐỒNG BỘ INPUT → DRAFT
   ========================================================= */
hvTableBody.addEventListener("input", function (e) {
    const tr = e.target.closest("tr[data-index]");
    if (!tr) return;
    const idx = Number(tr.dataset.index);
    if (Number.isNaN(idx) || !hvDraft[idx]) return;

    if (e.target.classList.contains("cell-kyTinhThue")) {
        hvDraft[idx].kyTinhThue = e.target.value;
    } else if (e.target.classList.contains("cell-tiepNhan")) {
        hvDraft[idx].tiepNhan = e.target.value;
    } else if (e.target.classList.contains("cell-chamNop")) {
        hvDraft[idx].chamNop = e.target.value;
    }

    renderPreview();
});

hvTableBody.addEventListener("change", function (e) {
    const tr = e.target.closest("tr[data-index]");
    if (!tr) return;
    const idx = Number(tr.dataset.index);
    if (Number.isNaN(idx) || !hvDraft[idx]) return;

    if (e.target.classList.contains("cell-mauToKhai")) {
        hvDraft[idx].mauToKhai = e.target.value;
    } else if (e.target.classList.contains("cell-tiepNhan")) {
        hvDraft[idx].tiepNhan = e.target.value;
    }

    /* Cập nhật lại hint kỳ */
    if (e.target.classList.contains("cell-kyTinhThue")) {
        hvDraft[idx].kyTinhThue = e.target.value;
        renderDraftTable();
    } else {
        renderPreview();
    }
});

/* =========================================================
   XÓA DÒNG
   ========================================================= */
hvTableBody.addEventListener("click", function (e) {
    const btn = e.target.closest(".row-remove");
    if (!btn || btn.disabled) return;

    const idx = Number(btn.dataset.index);
    if (Number.isNaN(idx)) return;

    hvDraft.splice(idx, 1);
    renderDraftTable();
});

/* =========================================================
   THÊM DÒNG
   ========================================================= */
btnAddRow.addEventListener("click", function () {
    hvDraft.push(newEmptyRow());
    renderDraftTable();

    /* Focus vào ô select của dòng mới */
    requestAnimationFrame(function () {
        const rows = hvTableBody.querySelectorAll("tr");
        const last = rows[rows.length - 1];
        if (last) {
            const sel = last.querySelector(".cell-mauToKhai");
            if (sel) sel.focus();
        }
    });
});

/* =========================================================
   RENDER DANH SÁCH HÀNH VI ĐÃ LƯU (VÀO VĂN BẢN)
   ========================================================= */
function renderHanhViList() {
    if (!hanhViList) return;

    if (hanhViData.length === 0) {
        hanhViViPham.style.display = "block";
        hanhViList.innerHTML = "";
        return;
    }

    let html = "";
    hanhViData.forEach(function (hv, idx) {
        html += `
            <div class="hanh-vi-item" data-index="${idx}">
                <p>
                - ${escapeHtml(hv.text)}
                </p>
            </div>
        `;
    });

    hanhViViPham.style.display = "none";
    hanhViList.innerHTML = html;
}

hanhViList.addEventListener("click", function (e) {
    const btn = e.target.closest(".hv-remove");
    if (!btn) return;

    const idx = Number(btn.dataset.index);
    if (Number.isNaN(idx)) return;

    /* Xóa ở cả 2 nơi để đồng bộ */
    hanhViData.splice(idx, 1);
    hvDraft.splice(idx, 1);

    /* Nếu draft rỗng → thêm lại 1 dòng trống để modal không bị trắng */
    if (hvDraft.length === 0) {
        hvDraft.push(newEmptyRow());
    }

    renderHanhViList();
});

/* =========================================================
   MỞ / ĐÓNG MODAL
   ---------------------------------------------------------
   Khi mở lại → DRAFT được giữ nguyên (không reset)
   ========================================================= */
function openHanhViModal() {
    /* Nếu draft rỗng (lần đầu) → thêm 1 dòng trống */
    if (hvDraft.length === 0) {
        hvDraft.push(newEmptyRow());
    }

    renderDraftTable();

    hanhViModal.classList.add("show");
    requestAnimationFrame(function () {
        const first = hvTableBody.querySelector(".cell-mauToKhai");
        if (first) first.focus();
    });
}

function closeHanhViModal() {
    hanhViModal.classList.remove("show");
}

btnOpenHanhVi.addEventListener("click", openHanhViModal);
btnCloseHanhVi.addEventListener("click", closeHanhViModal);
btnCancelHanhVi.addEventListener("click", closeHanhViModal);

hanhViModal.addEventListener("click", function (e) {
    if (e.target === hanhViModal) closeHanhViModal();
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && hanhViModal.classList.contains("show")) {
        closeHanhViModal();
    }
});

/* =========================================================
   LƯU HÀNH VI (đồng bộ draft → hanhViData, không cộng dồn)
   ========================================================= */
btnAddHanhVi.addEventListener("click", function () {
    let hasError = false;

    /* Validate từng dòng */
    hvDraft.forEach(function (row, idx) {
        const tr = hvTableBody.querySelector(`tr[data-index="${idx}"]`);
        if (!tr) return;

        const selMau  = tr.querySelector(".cell-mauToKhai");
        const inpKy   = tr.querySelector(".cell-kyTinhThue");
        const inpNhan = tr.querySelector(".cell-tiepNhan");
        const inpCham = tr.querySelector(".cell-chamNop");

        /* Mẫu tờ khai */
        if (!row.mauToKhai) {
            selMau.classList.add("invalid");
            hasError = true;
        } else {
            selMau.classList.remove("invalid");
        }

        /* Kỳ tính thuế */
        const parsed = parseKyTinhThue(row.kyTinhThue);
        if (!parsed || parsed.type === 'invalid') {
            inpKy.classList.add("invalid");
            hasError = true;
        } else {
            inpKy.classList.remove("invalid");
        }

        /* Tiếp nhận */
        if (!row.tiepNhan) {
            inpNhan.classList.add("invalid");
            hasError = true;
        } else {
            inpNhan.classList.remove("invalid");
        }

        /* Chậm nộp */
        const n = Number(row.chamNop);
        if (row.chamNop === "" || !Number.isFinite(n) || n < 0) {
            inpCham.classList.add("invalid");
            hasError = true;
        } else {
            inpCham.classList.remove("invalid");
        }
    });

    if (hasError) return;

    /* ✅ ĐỒNG BỘ: gán lại toàn bộ hanhViData từ hvDraft */
    hanhViData = hvDraft.map(function (row) {
        return {
            mauToKhai:  row.mauToKhai,
            kyTinhThue: row.kyTinhThue,
            tiepNhan:   row.tiepNhan,
            chamNop:    Number(row.chamNop),
            text:       buildHanhViText(row)
        };
    });

    /* ✅ KHÔNG reset hvDraft — giữ nguyên cho lần mở sau */

    renderHanhViList();
    closeHanhViModal();

    updateMuc3();       /* ← thêm */
    updateMuc6();
});