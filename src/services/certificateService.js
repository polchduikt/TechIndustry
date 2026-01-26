const PDFDocument = require('pdfkit');
const db = require('../models');
const path = require('path');

class CertificateService {
    async createPDF(userId, courseId) {
        const user = await db.User.findByPk(userId, { include: ['Customer'] });
        const course = await db.Course.findByPk(courseId, {
            include: [{ model: db.Module, as: 'modules', include: ['lessons'] }]
        });

        if (!user || !course) {
            throw new Error('Required data not found');
        }

        let totalLessons = 0;
        course.modules.forEach(m => {
            totalLessons += m.lessons?.length || 0;
        });
        const hours = totalLessons * 2;

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margin: 0
        });

        const fontBold = path.join(__dirname, '../../assets/fonts/Inter-Bold.ttf');
        const fontRegular = path.join(__dirname, '../../assets/fonts/Inter-Regular.ttf');
        const logoPath = path.join(__dirname, '../../public/img/logo.png');

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const leftMargin = 80;
        const rightMargin = 80;

        doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff');

        try {
            doc.image(logoPath, leftMargin, 60, { width: 140 });
        } catch {
            doc.font(fontBold)
                .fontSize(24)
                .fillColor('#6366f1')
                .text('TechIndustry', leftMargin, 60);
        }

        const certNumber = `UC-${userId
            .toString()
            .padStart(4, '0')}-${courseId
            .toString()
            .padStart(3, '0')}-${Date.now()
            .toString(36)
            .toUpperCase()}`;

        doc.font(fontRegular)
            .fontSize(9)
            .fillColor('#94a3b8')
            .text(`Certificate no: ${certNumber}`, pageWidth - 400, 70, {
                width: 340,
                align: 'right'
            })
            .text(`Certificate url: techindustry.ua/cert/${certNumber}`, pageWidth - 400, 85, {
                width: 340,
                align: 'right'
            })
            .text(`Reference Number: ${courseId.toString().padStart(4, '0')}`, pageWidth - 400, 100, {
                width: 340,
                align: 'right'
            });

        doc.font(fontRegular)
            .fontSize(14)
            .fillColor('#94a3b8')
            .text('CERTIFICATE OF COMPLETION', leftMargin, 200);

        doc.font(fontBold)
            .fontSize(52)
            .fillColor('#0f172a')
            .text(course.title, leftMargin, 240, {
                width: pageWidth - leftMargin - rightMargin,
                lineGap: 10
            });

        const instructorsY = doc.y + 15;
        doc.font(fontRegular)
            .fontSize(13)
            .fillColor('#64748b')
            .text('Instructors  TechIndustry Team', leftMargin, instructorsY);

        const customer = user.Customer;
        const fullName = customer
            ? `${customer.last_name} ${customer.first_name} ${customer.patronymic || ''}`.trim()
            : user.username;

        const nameY = pageHeight - 200;
        doc.font(fontBold)
            .fontSize(44)
            .fillColor('#0f172a')
            .text(fullName, leftMargin, nameY);

        const footerY = pageHeight - 100;

        doc.font(fontBold)
            .fontSize(12)
            .fillColor('#0f172a')
            .text('Date', leftMargin, footerY);

        doc.font(fontRegular)
            .fontSize(12)
            .fillColor('#0f172a')
            .text(
                new Date().toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                leftMargin,
                footerY + 18
            );

        doc.font(fontBold)
            .fontSize(12)
            .fillColor('#0f172a')
            .text('Length', leftMargin, footerY + 45);

        doc.font(fontRegular)
            .fontSize(12)
            .fillColor('#0f172a')
            .text(`${hours} total hours`, leftMargin, footerY + 63);

        doc.font(fontBold)
            .fontSize(14)
            .fillColor('#0f172a')
            .text('TechIndustry Team', pageWidth - rightMargin - 240, footerY + 30, {
                width: 240,
                align: 'right'
            });

        doc.font(fontRegular)
            .fontSize(10)
            .fillColor('#64748b')
            .text(
                'Official confirmation of course completion',
                pageWidth - rightMargin - 240,
                footerY + 50,
                { width: 240, align: 'right' }
            );

        return doc;
    }

    async generateCertificate(userId, courseId) {
        try {
            const pdfDoc = await this.createPDF(userId, courseId);

            return new Promise((resolve, reject) => {
                const chunks = [];
                pdfDoc.on('data', chunk => chunks.push(chunk));
                pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
                pdfDoc.on('error', reject);
                pdfDoc.end();
            });
        } catch (error) {
            throw new Error('Failed to generate certificate');
        }
    }

    async verifyCourseCompletion(userId, courseId, progressData) {
        const totalLessons = this.calculateTotalLessons(progressData.course);
        const completedLessons = progressData.completed_lessons?.length || 0;

        const progressPercent =
            totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

        return progressPercent === 100 && progressData.status === 'completed';
    }

    calculateTotalLessons(course) {
        let total = 0;

        if (course.modules?.length) {
            course.modules.forEach(module => {
                if (module.lessons) {
                    total += module.lessons.length;
                }
            });
        }

        return total;
    }
}

module.exports = new CertificateService();
