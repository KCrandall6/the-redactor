// const path = require('path');
// const fs = require('fs').promises;
// const libre = require('libreoffice-convert');
// const { endpoint } = require('../src/configEndpoint');

// libre.convertAsync = require('util').promisify(libre.convert);

// exports.handler = async function (event, context) {
//   try {
//     // 1 - generate unique file name (use timestamp)
//     const timestamp = new Date().getTime();
//     const tempFileName = `${timestamp}.pdf`;

//     // 2 - write file content to temporary location on server
//     const tempFilePath = path.join('/tmp', tempFileName); // Use '/tmp' for temporary files in Netlify Lambda

//     await fs.writeFile(tempFilePath, event.body, 'binary');

//     // 3 - use libreoffice-converter to convert .docx to .pdf
//     const ext = '.pdf';
//     // const outputPath = path.join('/tmp', `${timestamp}${ext}`);

//     // const docxBuf = await fs.readFile(tempFilePath);

//     // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
//     // const pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);

//     // 4 - delete temporary file after conversion is complete
//     await fs.unlink(tempFilePath);

//     // 5 - return a temporary URL that points to the converted PDF file
//     // For demonstration purposes, you can use a constant temporary URL
//     const temporaryURL = `${endpoint}/temporary-files/${timestamp}${ext}`;

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ temporaryURL }),
//     };
//   } catch (error) {
//     console.error('Error in docxToPdf', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'Internal Server Error' }),
//     };
//   }
// };
