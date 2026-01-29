document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course');
    const token = localStorage.getItem('token');

    if (!courseId || !token) {
        window.location.href = '/profile.html';
        return;
    }

    try {
        const profileRes = await fetch('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileRes.ok) {
            throw new Error('Failed to load profile');
        }

        const userData = await profileRes.json();

        const customer = userData.Customer;
        const fullName = customer
            ? `${customer.last_name} ${customer.first_name} ${customer.patronymic || ''}`.trim()
            : userData.username;

        document.getElementById('userName').textContent = fullName;

        if (customer?.avatar_data) {
            document.getElementById('userAvatar').innerHTML =
                `<img src="${customer.avatar_data}" alt="${fullName}">`;
        } else {
            document.getElementById('userInitials').textContent =
                userData.username.substring(0, 2).toUpperCase();
        }

        const progressRes = await fetch('/api/progress', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!progressRes.ok) {
            throw new Error('Failed to load progress data');
        }

        const progressData = await progressRes.json();
        const courseProgress = progressData.find(
            p => p.course_id === parseInt(courseId)
        );

        if (!courseProgress) {
            throw new Error('Course not found in your learning list');
        }

        const course = courseProgress.course;
        document.getElementById('courseTitle').textContent = course.title;

        let totalLessons = 0;
        course.modules?.forEach(
            m => (totalLessons += m.lessons?.length || 0)
        );

        document.getElementById('courseDuration').textContent =
            `${totalLessons * 2} hours of learning`;

        document.getElementById('completionDate').textContent =
            new Date().toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

        const certNumber = `UC-${userData.id
            .toString()
            .padStart(4, '0')}-${courseId.toString().padStart(3, '0')}`;

        document.getElementById('certNumber').textContent = certNumber;

        const pdfUrl = `/api/certificates/download/${courseId}?token=${token}`;
        const viewerContainer =
            document.getElementById('certificateViewer');

        const response = await fetch(pdfUrl);
        if (!response.ok) {
            window.location.href = '/profile.html';
            return;
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

        const pdf = await pdfjsLib.getDocument(blobUrl).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';

        viewerContainer.innerHTML = '';
        viewerContainer.appendChild(canvas);

        await page.render({
            canvasContext: context,
            viewport
        }).promise;

        document.getElementById('downloadBtn').onclick = () => {
            window.open(pdfUrl, '_blank');
        };

        document.getElementById('shareBtn').onclick = () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                const btn = document.getElementById('shareBtn');
                const oldContent = btn.innerHTML;
                btn.innerHTML = '<span>✓</span><span>Copied</span>';
                setTimeout(() => {
                    btn.innerHTML = oldContent;
                }, 2000);
            });
        };
    } catch (error) {
        document.getElementById('certificateViewer').innerHTML = `
            <div class="loading-state">
                <p style="color: #ef4444;">❌ Failed to load certificate</p>
                <p style="font-size: 14px;">${error.message}</p>
                <button
                    class="btn btn-primary"
                    onclick="location.href='/profile.html'"
                    style="margin-top: 20px;"
                >
                    Go to profile
                </button>
            </div>
        `;
    }
});
