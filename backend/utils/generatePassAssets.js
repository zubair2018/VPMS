const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const generatePassAssets = async ({ passNumber, visitorName, purpose, validTill }) => {
  const qrPayload = JSON.stringify({ passNumber, visitorName, validTill });
  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

  const passDir = path.join(__dirname, '..', 'generated-passes');
  if (!fs.existsSync(passDir)) fs.mkdirSync(passDir, { recursive: true });

  const pdfPath = path.join(passDir, `${passNumber}.pdf`);
  const doc = new PDFDocument({ size: 'A6', margin: 20 });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  doc.fontSize(18).text('Visitor Pass', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Pass No: ${passNumber}`);
  doc.text(`Visitor: ${visitorName}`);
  doc.text(`Purpose: ${purpose}`);
  doc.text(`Valid Till: ${new Date(validTill).toLocaleString()}`);
  doc.moveDown();
  doc.image(qrCodeDataUrl, { fit: [120, 120], align: 'center' });
  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));

  return { qrCodeDataUrl, pdfPath };
};

module.exports = generatePassAssets;
