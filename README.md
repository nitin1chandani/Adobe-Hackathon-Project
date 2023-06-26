# Papyrus Nebulae Project

The project uses PDF Extract API by Adobe to read invoices given in .pdf format and convert the pdf data into csv file
so that it would become easy work businesses

# Working

1: Install dependencies by running the following commands:  
npm install @adobe/pdfservices-node-sdk  
npm install adm-zip

2: Input the Test Data path location and the extracted zip files path location inside extract.js as the values of constants

3: InvoiceFormat.js contains the code for filtering the fields from the object array of all PDFs.

4: csvcreate.js contains the modules to create the CSV File.
