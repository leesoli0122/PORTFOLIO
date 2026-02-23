document.addEventListener("DOMContentLoaded", () => {
    loadIncludes();
  });
  
  async function loadIncludes() {
    const elements = document.querySelectorAll("[data-include-path]");
  
    for (const el of elements) {
      const file = el.dataset.includePath;
      if (!file) continue;
  
      try {
        const response = await fetch(file);
        if (!response.ok) throw new Error("파일 로드 실패");
  
        const html = await response.text();
        el.innerHTML = html;
      } catch (error) {
        console.error("Include 오류:", file, error);
      }
    }
  }