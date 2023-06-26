const API_SDK = require("@adobe/pdfservices-node-sdk");
const AdmZip = require("adm-zip");
const fs = require("fs");

const { extractBillInfo } = require("./InvoiceFormat.js");

// SDK
const credentials = API_SDK.Credentials.serviceAccountCredentialsBuilder()
  .fromFile("./pdfservices-api-credentials.json")
  .build();

// Create client config instance with custom time-outs.
const clientConfig = API_SDK.ClientConfig.clientConfigBuilder()
  .withConnectTimeout(20000)
  .withReadTimeout(20000)
  .build();

// Create a constant Context using credentials.
const Context = API_SDK.ExecutionContext.create(credentials, clientConfig);

// Build extractPDF options.
const options = new API_SDK.ExtractPDF.options.ExtractPdfOptions.Builder()
  .addElementsToExtract(API_SDK.ExtractPDF.options.ExtractElementType.TEXT)
  .build();

/* A request is sent to the API which converts each PDF into JSON objects,
Parse it and extract the Text Elements which are stored in the declared Array.
Eventually, after pdf have been extracted, Call the function to filter the records and store in CSV File.
*/
console.log("Starting To Convert PDFs To JSON");
const extractedInfo = []; // To store the parsed object of each pdf.
const Total_Count = 100; // Total number of PDFs to extract.
let PDFCount = 0; // Num of PDFs extracted till now.
let request_interval = 3000; // Time(ms) Between each request sent to API

// Loop over all the pdfs.
for (let i = 0; i < Total_Count; i++) {
  const Input = `./TestDataSet/output${i}.pdf`;
  const Zip_File = `./ResultZipSet/extracted_dataoutput${i}.zip`;

  // Remove if the output already exists.
  if (fs.existsSync(Zip_File)) fs.unlinkSync(Zip_File);

  // Pass the PDF to ExtractAPI to Convert into JSON.
  extractPDF(Input, Zip_File, i, request_interval * i);
}

/* FUNCTION TO CONVERT PDF TO JSON ,PARSE IT AND FILTER TEXT ELEMENTS,
   AND CALL 'extractBillInfo' FUNCTION AFTER ALL PDFs ARE CONVERTED. */
function extractPDF(Input_Pdf, Output_Zip, Num, timeout) {
  // Create a new operation instance.
  const extractPDFOperation = API_SDK.ExtractPDF.Operation.createNew();
  const input = API_SDK.FileRef.createFromLocalFile(
    Input_Pdf,
    API_SDK.ExtractPDF.SupportedSourceFormat.pdf
  );

  extractPDFOperation.setInput(input);
  extractPDFOperation.setOptions(options);

  // Execute the operation.
  extractPDFOperation
    .execute(Context)
    .then((result) => result.saveAsFile(Output_Zip))
    .then(() => {
      let zip = new AdmZip(Output_Zip);
      let jsondata = zip.readAsText("structuredData.json");
      let data = JSON.parse(jsondata);

      // Filter out the Text elements from the output.
      let JSON_DATA = [];
      data.elements.forEach((element) => {
        if (element.Text != undefined) {
          JSON_DATA.push(element);
        }
      });

      // Insert the Parsed JSON data in Output Array.
      extractedInfo[Num] = JSON_DATA;
      PDFCount++;

      console.clear();
      console.log(`Successfully extracted information from ${PDFCount} PDFs.`);

      /* After all PDFs are converted, Call the function to Extract the headings from Parsed dtaa from each Invoice
               and store values in the CSV File */
      if (PDFCount === Total_Count) {
        extractBillInfo(extractedInfo);
      }
    })
    .catch((err) => {
      console.log(err);

      console.log(`Resending Request For PDF Output${Num}.pdf`);
      const Input = `./InvoicesData/TestDataSet/output${Num}.pdf`;
      const Zip_File = `./ResultZipSet/extracted_dataoutput${Num}.zip`;

      // Removing the already existing files.
      if (fs.existsSync(Zip_File)) fs.unlinkSync(Zip_File);

      // Passing the PDF to API to Convert into JSON.
      extractPDF(Input, Zip_File, Num);
    });
}
