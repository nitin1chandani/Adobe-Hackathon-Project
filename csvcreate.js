const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const headings = [
  { id: "businessCity", title: "Business__City" },
  { id: "businessCountry", title: "Business__Country" },
  { id: "businessDesc", title: "Business__Description" },
  { id: "businessName", title: "Business__Name" },
  { id: "businessAddress", title: "Business__StreetAddress" },
  { id: "businessZipcode", title: "Business__Zipcode" },
  { id: "customerLine1", title: "Customer__Address__line1" },
  { id: "customerLine2", title: "Customer__Address__line2" },
  { id: "customerEmail", title: "Customer__Email" },
  { id: "customername", title: "Customer__Name" },
  { id: "customerNumber", title: "Customer__PhoneNumber" },
  { id: "billDetailsName", title: "Invoice__BillDetails__Name" },
  { id: "billDetailsQuantity", title: "Invoice__BillDetails__Quantity" },
  { id: "billDetailsRate", title: "Invoice__BillDetails__Rate" },
  { id: "invoiceDesc", title: "Invoice__Description" },
  { id: "invoiceDate", title: "Invoice__DueDate" },
  { id: "invoiceIssueDate", title: "Invoice__IssueDate" },
  { id: "invoiceNumber", title: "Invoice__Number" },
  { id: "InvoiceTax", title: "Invoice__Tax" },
];

const csvWriter = createCsvWriter({
  header: headings,
  path: "./FinalData/FinalData.csv",
});

module.exports = async function addRecord(record) {
  await csvWriter.writeRecords(record).catch((err) => console.log(err));
};
