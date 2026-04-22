// =============================================
// save-manager.js — PNG 저장 전담 모듈
// =============================================

const SaveManager = {

    CANVAS_SIZE: 360,

    /**
     * 선택된 파츠 조합을 PNG로 저장하고 갤러리에도 기록한다.
     * @param {Object} selectedParts - { tabId: partObject | null }
     * @param {string[]} layerOrder  - 레이어를 그릴 순서
     */
    async saveAsPNG(selectedParts, layerOrder) {
        const offscreen        = document.createElement("canvas");
        offscreen.width        = this.CANVAS_SIZE;
        offscreen.height       = this.CANVAS_SIZE;
        const ctx              = offscreen.getContext("2d");

        ctx.clearRect(0, 0, offscreen.width, offscreen.height);

        try {
            // 레이어 순서대로 순차 렌더링
            for (const layerId of layerOrder) {
                const part = selectedParts[layerId];
                if (!part || !part.dataURL) continue;

                await this._drawImage(ctx, part.dataURL, offscreen.width, offscreen.height);
            }

            const dataURL = offscreen.toDataURL("image/png");

            // 갤러리 DB에 저장
            await DB.saveToGallery(dataURL);

            // 파일 다운로드
            this._downloadDataURL(dataURL);

            return true;

        } catch (error) {
            console.error("PNG 저장 실패:", error);
            return false;
        }
    },

    /**
     * 이미지를 캔버스에 비동기로 그린다.
     */
    _drawImage(ctx, src, width, height) {
        return new Promise((resolve) => {
            const img       = new Image();
            img.onload      = () => { ctx.drawImage(img, 0, 0, width, height); resolve(); };
            img.onerror     = () => { console.warn("이미지 로드 실패:", src.slice(0, 40)); resolve(); };
            img.src         = src;
        });
    },

    /**
     * dataURL을 PNG 파일로 다운로드한다.
     */
    _downloadDataURL(dataURL) {
        const fileName  = this._generateFileName();
        const link      = document.createElement("a");
        link.download   = fileName;
        link.href       = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * 파일명 생성: emoji_YYYYMMDD_HHMMSS.png
     */
    _generateFileName() {
        const now   = new Date();
        const pad   = n => String(n).padStart(2, "0");
        const date  = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
        const time  = pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
        return `emoji_${date}_${time}.png`;
    }

};