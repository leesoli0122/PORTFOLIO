// default placeholder(2024년)
$(window).on("load", function () {
    var selectedText = $("#selectCustom select option:selected").text();
    $("#selectCustom .btn-fake-slt .value").text(selectedText);

    changeYear(); // mobile active 클래스 디폴트 추가
});

// mobile select box로 해당 연도에 active 클래스 추가
function changeYear() {
    var select = document.getElementById("yearSelect");
    var tr = document.querySelectorAll("tbody tr");
    var trArray = Array.from(tr).map((tr) => tr.children);
    document.querySelectorAll("thead .colYear").forEach((header) => {
        header.classList.remove("active");
    });
    trArray.forEach((row) => {
        Array.from(row).forEach((cell) => cell.classList.remove("active"));
    });

    var columnIndex = 0;

    switch (select.value) {
        case "tab1":
            columnIndex = 1;
            break;
        case "tab2":
            columnIndex = 2;
            break;
        case "tab3":
            columnIndex = 3;
            break;
        case "tab4":
            columnIndex = 4;
            break;
        case "tab5":
            columnIndex = 5;
            break;
        case "tab6":
            columnIndex = 6;
            break;
        case "tab7":
            columnIndex = 7;
            break;
        default:
            columnIndex = 1;
    }

    document.querySelectorAll("thead").forEach((thead) => {
        const ths = thead.querySelectorAll(".colYear");
        if (ths[columnIndex - 1]) {
            ths[columnIndex - 1].classList.add("active");
        }
    });

    trArray.forEach((row) => {
        if (row[columnIndex]) {
            row[columnIndex].classList.add("active");
        }
    });
}
