$(function() {
    // 1. 인트로 텍스트 애니메이션 (GSAP)
    const tl = gsap.timeline();

    tl.from(".intro-title span", { opacity: 0, y: 20, duration: 0.6 })
      .from(".intro-title", { opacity: 0, y: 30, duration: 0.8 }, "-=0.3")
      .from(".intro-desc", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
      .from(".intro-button-wrap", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
      .from(".intro-visual", { opacity: 0, x: 50, duration: 1, ease: "power2.out" }, "-=0.6");

    // 2. 묵업 클릭 이벤트 (HTML에서 a태그로 처리되어 있지만 추가 동작 필요 시 사용)
    $('.mockup').on('click', function(e) {
        // 부드러운 화면 전환 효과 등을 넣고 싶다면 여기서 처리
        console.log("메인으로 이동!");
    });
});