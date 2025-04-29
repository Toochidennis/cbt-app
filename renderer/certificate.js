    const { jsPDF } = require('jspdf/dist/jspdf.umd');
    const html2canvas = require('html2canvas');

    const templates = {
        1: '../assets/img/scratch-cert.svg',
        2: '../assets/img/graphic-cert.svg',
        3: '../assets/img/web-cert.svg'
    };

    const spanColor = {
        1: '#d68e17',
        2: '#a8693d',
        3: '#da607d'
    };

    window.api.onSetName(async (_, name, courseId) => {
        const certTemplate = document.querySelector('.cert-img');
        const nameSpan = document.querySelector('.cert-name');

        if (nameSpan && certTemplate) {
            certTemplate.src = templates[courseId];
            nameSpan.innerText = name;
            nameSpan.style.color = spanColor[courseId];
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

        const cert = document.querySelector('.cert-content');

        const canvas = await html2canvas(cert, {
            scale: 2, // for better quality
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height],
        });

        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        const pdfBlob = pdf.output('blob');
        console.log("PDF Blob:", pdfBlob);
        const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
        console.log("PDF Buffer:", pdfBuffer);

        window.api.writePDF('pdf-generated', pdfBuffer);

    });