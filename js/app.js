const forms = [

    {
        name: "Mẫu biểu 01",

        description:
            "Tạo và in mẫu biểu khách hàng.",

        category: "Khách hàng",

        icon: "file-text",

        path: "./Form01/index.html"
    },


    {
        name: "Mẫu biểu 02",

        description:
            "Lập mẫu biểu theo thông tin khách hàng.",

        category: "Nghiệp vụ",

        icon: "clipboard-list",

        path: "./Form02/index.html"
    }

];


const formList =
    document.getElementById("formList");


const formCount =
    document.getElementById("formCount");


const searchInput =
    document.getElementById("searchInput");



function renderForms(list) {

    formList.innerHTML = "";


    formCount.textContent =
        `${list.length} biểu mẫu`;


    if (list.length === 0) {

        formList.innerHTML = `

            <div
                class="
                    col-span-full
                    border
                    border-dashed
                    border-[#d5d5d0]
                    bg-white
                    p-10
                    text-center
                "
            >

                <i
                    data-lucide="file-search"
                    class="
                        mx-auto
                        mb-3
                        h-6
                        w-6
                        text-[#aaa]
                    "
                ></i>


                <div
                    class="
                        text-[13px]
                        font-medium
                        text-[#666]
                    "
                >
                    Không tìm thấy biểu mẫu
                </div>


                <div
                    class="
                        mt-1
                        text-[12px]
                        text-[#999]
                    "
                >
                    Thử lại với từ khóa khác.
                </div>

            </div>

        `;


        lucide.createIcons();

        return;
    }



    list.forEach(form => {

        const card =
            document.createElement("div");


        card.className = `
            form-card
            group
            cursor-pointer
            border
            border-[#deded9]
            bg-white
            px-5
            py-4
        `;


        card.innerHTML = `

            <div
                class="
                    flex
                    items-center
                    gap-4
                "
            >


                <!-- Icon -->

                <div
                    class="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        bg-[#f1f1ee]
                        text-[#555]
                    "
                >

                    <i
                        data-lucide="${form.icon}"
                        class="h-[18px] w-[18px]"
                    ></i>

                </div>



                <!-- Text -->

                <div class="min-w-0 flex-1">

                    <div
                        class="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <h2
                            class="
                                truncate
                                text-[14px]
                                font-medium
                            "
                        >
                            ${form.name}
                        </h2>


                        <span
                            class="
                                hidden
                                rounded
                                bg-[#f2f2ef]
                                px-1.5
                                py-0.5
                                text-[9px]
                                text-[#777]
                                sm:inline
                            "
                        >
                            ${form.category}
                        </span>

                    </div>


                    <p
                        class="
                            mt-1
                            truncate
                            text-[12px]
                            text-[#888]
                        "
                    >
                        ${form.description}
                    </p>

                </div>



                <!-- Arrow -->

                <i
                    data-lucide="chevron-right"
                    class="
                        open-icon
                        h-4
                        w-4
                        shrink-0
                        text-[#aaa]
                    "
                ></i>


            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                window.location.href =
                    form.path;

            }
        );


        formList.appendChild(card);

    });


    lucide.createIcons();

}



searchInput.addEventListener(
    "input",
    event => {

        const keyword =
            event.target.value
                .trim()
                .toLowerCase();


        const filtered =
            forms.filter(form => {

                return (

                    form.name
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    form.description
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    form.category
                        .toLowerCase()
                        .includes(keyword)

                );

            });


        renderForms(filtered);

    }
);


renderForms(forms);