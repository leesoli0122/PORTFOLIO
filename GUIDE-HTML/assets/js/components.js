function initAutocomplete() {
    const frameworks = ["React", "Vue", "Angular", "Svelte", "Solid", "Next.js", "Nuxt", "Remix", "Astro", "Ember", "Javascript"];

    $("#ac-basic").autocomplete({
        source: frameworks,
        minLength: 1,
        delay: 100,
        select: function(e, ui) {
        console.log("선택:", ui.item.value);
        }
    });

    const countries = ["대한민국", "일본", "미국", "캐나다", "독일", "프랑스", "영국", "호주", "브라질", "인도"];

    $("#ac-remote").autocomplete({
        source: function(request, response) {
        $("#remote-spinner").show();
        setTimeout(function() {
            const filtered = $.ui.autocomplete.filter(countries, request.term);
            response(filtered.length ? filtered : [{ label: "결과 없음", value: "" }]);
            $("#remote-spinner").hide();
        }, 600);
        },
        minLength: 1,
        delay: 200,
        select: function(e, ui) {
        if (!ui.item.value) { $(this).val(""); return false; }
        }
    });
}

function initBadge() {
    const btnLight = document.getElementById('btn-light');
    const btnDark  = document.getElementById('btn-dark');

    function setMode(mode) {
        document.documentElement.setAttribute(
            'data-theme',
            mode === 'dark' ? 'dark' : ''
        );

        btnLight.classList.toggle('active', mode === 'light');
        btnDark.classList.toggle('active',  mode === 'dark');

        localStorage.setItem("guide_theme", mode);
    }

    // 저장된 테마 복원
    const savedTheme = localStorage.getItem("guide_theme");
    if (savedTheme) setMode(savedTheme);

    btnLight?.addEventListener('click', () => setMode('light'));
    btnDark?.addEventListener('click', () => setMode('dark'));
}