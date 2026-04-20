// js/save-manager.js
// PNG 저장 기능 전담 모듈

const SaveManager = {

    CANVAS_SIZE: 360,

    async saveAsPNG(selectedParts, layerOrder) {
        const canvas = document.createElement("canvas");
        canvas.width  = this.CANVAS_SIZE;
        canvas.height = this.CANVAS_SIZE;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
            for (const layer of layerOrder) {
                const partId = selectedParts[layer];
                if (!partId) continue;

                const imgPath = this._getImagePath(layer, partId);
                if (!imgPath) continue;

                await this._drawImage(ctx, imgPath, canvas.width, canvas.height);
            }

            this._downloadCanvas(canvas);

        } catch (error) {
            console.error("PNG 저장 실패:", error);
            alert(
                "저장 중 오류가 발생했습니다.\n" +
                "Live Server 또는 npx serve로 실행 중인지 확인해주세요."
            );
        }
    },

    // ★ 수정된 부분: PARTS_CONFIG.parts[layer] 구조에 맞게 변경
    _getImagePath(layer, partId) {
        if (!window.PARTS_CONFIG) return null;

        const items = window.PARTS_CONFIG.parts[layer];
        if (!items) return null;

        const part = items.find(item => item.id === partId);
        if (!part) return null;

        // app.js의 getImagePath()와 동일한 경로 규칙 사용
        return `assets/images/parts/${layer}/${partId}`;
    },

    _drawImage(ctx, src, width, height) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
                resolve();
            };
            img.onerror = () => {
                console.warn(`이미지 로드 실패: ${src}`);
                resolve();
            };
            img.src = src;
        });
    },

    _downloadCanvas(canvas) {
        const fileName = this._generateFileName();
        const dataURL  = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.download = fileName;
        link.href     = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`저장 완료: ${fileName}`);
    },

    _generateFileName() {
        const now = new Date();
        const pad = n => String(n).padStart(2, "0");

        const date =
            now.getFullYear().toString() +
            pad(now.getMonth() + 1) +
            pad(now.getDate());

        const time =
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds());

        return `emoji_${date}_${time}.png`;
    }
};