// =============================================
// save-manager.js — PNG 저장 전담 모듈
// =============================================

const SaveManager = {

    CANVAS_SIZE_KAKAO: 360,
    CANVAS_SIZE_OGQ:   740,

    /**
     * 선택된 파츠 조합을 PNG로 저장하고 갤러리에도 기록한다.
     * @param {Object} selectedParts - { tabId: partObject | null }
     * @param {string[]} layerOrder  - 레이어를 그릴 순서
     * @param {Object} [options]     - { platform: 'kakao'|'ogq', canvasSize: number }
     */
    async saveAsPNG(selectedParts, layerOrder, options = {}) {
        const platform   = options.platform   || "kakao";
        const canvasSize = options.canvasSize || this.CANVAS_SIZE_KAKAO;

        const offscreen  = document.createElement("canvas");
        offscreen.width  = canvasSize;
        offscreen.height = canvasSize;
        const ctx        = offscreen.getContext("2d");

        ctx.clearRect(0, 0, offscreen.width, offscreen.height);

        try {
            for (const layerId of layerOrder) {
                const part = selectedParts[layerId];
                if (!part || !part.dataURL) continue;
                await this._drawImage(ctx, part.dataURL, offscreen.width, offscreen.height);
            }

            const dataURL = offscreen.toDataURL("image/png");

            // 갤러리 DB에 저장 (platform, size 정보 포함)
            await DB.saveToGallery(dataURL, { platform, size: canvasSize });

            // 파일 다운로드
            this._downloadDataURL(dataURL, platform);

            return true;

        } catch (error) {
            console.error("PNG 저장 실패:", error);
            return false;
        }
    },

    _drawImage(ctx, src, width, height) {
        return new Promise((resolve) => {
            const img     = new Image();
            img.onload    = () => { ctx.drawImage(img, 0, 0, width, height); resolve(); };
            img.onerror   = () => { console.warn("이미지 로드 실패:", src.slice(0, 40)); resolve(); };
            img.src       = src;
        });
    },

    _downloadDataURL(dataURL, platform = "kakao") {
        const fileName = this._generateFileName(platform);
        const link     = document.createElement("a");
        link.download  = fileName;
        link.href      = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    _generateFileName(platform = "kakao") {
        const now  = new Date();
        const pad  = n => String(n).padStart(2, "0");
        const date = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
        const time = pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
        return `${platform}_${date}_${time}.png`;
    }

};