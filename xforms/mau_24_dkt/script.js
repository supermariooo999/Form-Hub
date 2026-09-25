/* =========================================================
   DỮ LIỆU NNT
   =========================================================

   Giữ nguyên biến "nnt" của hệ thống hiện tại.

   Ví dụ:

   const nnt = [
       {
           tenNNT: "CÔNG TY TNHH ABC",
           mst: "1900258934",
           cccd: "",
           maChuong: "857",
           tenAp: "Ấp A",
           tenXa: "Xã B",
           tenTinh: "Tỉnh Cà Mau"
       }
   ];

   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const nntModal =
    document.getElementById("nntModal");

const btnOpenNNT =
    document.getElementById("btnOpenNNT");

const btnOpenNNT2 =
    document.getElementById("btnOpenNNT2");

const btnCloseNNT =
    document.getElementById("btnCloseNNT");

const btnCancelNNT =
    document.getElementById("btnCancelNNT");

const btnConfirmNNT =
    document.getElementById("btnConfirmNNT");

const nntSearchInput =
    document.getElementById("nntSearchInput");

const nntResult =
    document.getElementById("nntResult");

const nntCurrent =
    document.getElementById("nntCurrent");


/* =========================================================
   NNT ĐANG CHỌN
   ========================================================= */

let selectedNNT = null;

let selectedNNTIndex = -1;


/* =========================================================
   CONFIG
   ========================================================= */

const MAX_RESULTS = 20;

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

    ? nnt.map(function(item, index) {

        return {

            index,

            item,

            ten:
                normalizeText(
                    item.tenNNT
                ),

            mst:
                normalizeText(
                    item.mst
                ),

            cccd:
                normalizeText(
                    item.cccd
                )

        };

    })

    : [];


console.log(
    "Số lượng NNT:",
    nntIndex.length
);


/* =========================================================
   CREATE HTML NNT
   ========================================================= */

function createNNTHTML(record) {

    const item =
        record.item;


    return `

        <div
            class="nnt-result-item"
            data-index="${record.index}"
        >

            <div class="nnt-result-name">

                ${escapeHtml(
                    item.tenNNT
                )}

            </div>


            <div class="nnt-result-info">

                <span class="nnt-tag">

                    MST:
                    ${escapeHtml(
                        item.mst
                    )}

                </span>


                <span class="nnt-tag">

                    CCCD:
                    ${escapeHtml(
                        item.cccd
                    )}

                </span>


                <span class="nnt-tag">

                    Mã chương:
                    ${escapeHtml(
                        item.maChuong
                    )}

                </span>

            </div>


            <div class="nnt-result-address">

                📍

                ${escapeHtml(
                    item.tenAp
                )}

                ·

                ${escapeHtml(
                    item.tenXa
                )}

                ·

                ${escapeHtml(
                    item.tenTinh
                )}

            </div>

        </div>

    `;

}


/* =========================================================
   RENDER
   ========================================================= */

function renderNNTResults(list) {

    if (
        !list ||
        list.length === 0
    ) {

        nntResult.innerHTML = `

            <div class="nnt-empty">

                Không tìm thấy người nộp thuế phù hợp

            </div>

        `;

        return;

    }


    let html = `

        <div class="nnt-result-count">

            Hiển thị
            <strong>${list.length}</strong>
            người nộp thuế

        </div>

    `;


    for (
        let i = 0;

        i < list.length &&
        i < MAX_RESULTS;

        i++
    ) {

        html +=
            createNNTHTML(
                list[i]
            );

    }


    nntResult.innerHTML =
        html;

}


/* =========================================================
   HIỆN NNT MẶC ĐỊNH
   ========================================================= */

function showDefaultNNT() {

    renderNNTResults(
        nntIndex.slice(
            0,
            MAX_RESULTS
        )
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function searchNNT(keyword) {

    const query =
        normalizeText(keyword);


    if (!query) {

        showDefaultNNT();

        return;

    }


    const results = [];


    for (
        let i = 0;

        i < nntIndex.length;

        i++
    ) {

        const record =
            nntIndex[i];


        if (

            record.ten.includes(query) ||

            record.mst.includes(query) ||

            record.cccd.includes(query)

        ) {

            results.push(record);


            if (
                results.length >=
                MAX_RESULTS
            ) {

                break;

            }

        }

    }


    renderNNTResults(
        results
    );

}


/* =========================================================
   DEBOUNCE
   ========================================================= */

let searchTimer = null;


nntSearchInput.addEventListener(
    "input",
    function() {

        const keyword =
            this.value;


        clearTimeout(
            searchTimer
        );


        searchTimer =
            setTimeout(
                function() {

                    searchNNT(
                        keyword
                    );

                },
                SEARCH_DELAY
            );

    }
);


/* =========================================================
   CLICK CHỌN NNT
   ========================================================= */

nntResult.addEventListener(
    "click",
    function(event) {

        const row =
            event.target.closest(
                ".nnt-result-item"
            );


        if (!row) {

            return;

        }


        const index =
            Number(
                row.dataset.index
            );


        if (

            Number.isNaN(index) ||

            !nnt[index]

        ) {

            return;

        }


        /*
         * Bỏ selected cũ
         */

        const oldSelected =
            nntResult.querySelector(
                ".nnt-result-item.selected"
            );


        if (oldSelected) {

            oldSelected.classList.remove(
                "selected"
            );

        }


        /*
         * Chọn mới
         */

        row.classList.add(
            "selected"
        );


        selectedNNTIndex =
            index;


        selectedNNT =
            nnt[index];


        btnConfirmNNT.disabled =
            false;

    }
);


/* =========================================================
   CẬP NHẬT THÔNG TIN TRÊN VĂN BẢN
   ========================================================= */

function updateNNTInfo() {

    if (!selectedNNT) {

        return;

    }


    /*
     * Tên NNT
     */

    const hoTen =
        document.getElementById(
            "hoTen"
        );


    hoTen.textContent =
        selectedNNT.tenNNT || "";


    /*
     * MST
     */

    const maSoThue =
        document.getElementById(
            "maSoThue"
        );


    maSoThue.textContent =
        selectedNNT.mst || "";


    /*
     * Địa chỉ
     */

    const addressParts = [

        selectedNNT.tenAp,

        selectedNNT.tenXa,

        selectedNNT.tenTinh

    ].filter(function(value) {

        return String(
            value || ""
        ).trim() !== "";

    });


    const diaChi =
        document.getElementById(
            "diaChi"
        );


    diaChi.textContent =
        addressParts.join(
            ", "
        );

    const lyDo =
        document.getElementById(
            "lyDo"
        );


    lyDo.textContent = "Ngừng hoạt động";


    /*
     * NNT đang chọn
     */

    nntCurrent.textContent =
        selectedNNT.tenNNT ||
        "Đã chọn NNT";


    nntCurrent.classList.add(
        "has-value"
    );

    // if (selectedNNT.maChuong === '857') {
    //     document.getElementById("sigName").textContent = selectedNNT.tenNNT;
    // }
    

}


/* =========================================================
   MỞ MODAL
   ========================================================= */

function openNNTModal() {

    nntSearchInput.value = "";

    btnConfirmNNT.disabled =
        !selectedNNT;


    showDefaultNNT();


    nntModal.classList.add(
        "show"
    );


    requestAnimationFrame(
        function() {

            nntSearchInput.focus();

        }
    );

}


btnOpenNNT.addEventListener(
    "click",
    openNNTModal
);


if (btnOpenNNT2) {

    btnOpenNNT2.addEventListener(
        "click",
        openNNTModal
    );

}


/* =========================================================
   ĐÓNG MODAL
   ========================================================= */

function closeNNTModal() {

    nntModal.classList.remove(
        "show"
    );

}


btnCloseNNT.addEventListener(
    "click",
    closeNNTModal
);


btnCancelNNT.addEventListener(
    "click",
    closeNNTModal
);


/* =========================================================
   CLICK NGOÀI MODAL
   ========================================================= */

nntModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            nntModal
        ) {

            closeNNTModal();

        }

    }
);


/* =========================================================
   ESC
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (

            event.key === "Escape" &&

            nntModal.classList.contains(
                "show"
            )

        ) {

            closeNNTModal();

        }

    }
);


/* =========================================================
   XÁC NHẬN NNT
   ========================================================= */

btnConfirmNNT.addEventListener(
    "click",
    function() {

        if (!selectedNNT) {

            return;

        }


        updateNNTInfo();


        closeNNTModal();

    }
);


/* =========================================================
   NGÀY HIỆN TẠI
   ========================================================= */

function setCurrentDate() {

    const today = new Date();

    document.getElementById("ngayVB").textContent =
        String(today.getDate()).padStart(2, "0");

    document.getElementById("thangVB").textContent =
        String(today.getMonth() + 1).padStart(2, "0");

    document.getElementById("namVB").textContent =
        today.getFullYear();
}


/* =========================================================
   KHỞI TẠO
   ========================================================= */

setCurrentDate();