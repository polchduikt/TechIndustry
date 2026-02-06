document.addEventListener('DOMContentLoaded', async () => {
    const viewerContainer = document.getElementById('certificateViewer');
    if (!currentCourseId) {
        window.location.href = '/profile';
        return;
    }
    try {
        const pdfUrl = `/api/certificates/download/${currentCourseId}`;
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        viewerContainer.innerHTML = '';
        viewerContainer.appendChild(canvas);
        await page.render({ canvasContext: context, viewport }).promise;
        document.getElementById('downloadBtn').onclick = () => {
            window.location.href = pdfUrl;
        };
        document.getElementById('shareBtn').onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            alert('Посилання скопійовано!');
        };

    } catch (error) {
        viewerContainer.innerHTML = `<p style="color:red; padding:20px;">Помилка візуалізації: ${error.message}</p>`;
    }
});