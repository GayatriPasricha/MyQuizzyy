const { PDFParse } = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  let parser = null;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  } catch (err) {
    console.error('Error parsing PDF:', err);
    throw err;
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

module.exports = { extractTextFromPDF };
