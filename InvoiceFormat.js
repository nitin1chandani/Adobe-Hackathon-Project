const addRecord = require("./csvcreate");

module.exports.extractBillInfo = async function extractBillInfo(extractedInfo) {
  for (let i = 0; i < extractedInfo.length; i++) {
    let data = extractedInfo[i];
    let invoice = {};
    let items = []; // To Store Items in Invoice.
    const allRecords = []; // To Store All the records from Current Invoive Object to enter in CSV File.
    let position = 0; // To Traverse The Text Elements in Order

    // EXTRACT FIELDS BASED ON BOUNDS

    let customerDetails = "";
    let invoiceDescription = "";
    let invoiceDueDate = "";

    // Traversing and Grouping
    data.forEach((element) => {
      if (element.Bounds[0] == 81.04800415039062) {
        customerDetails += element.Text + " "; // Customer Description
      } else if (element.Bounds[0] == 240.25999450683594) {
        invoiceDescription += element.Text + " "; // Invoice Description
      } else if (element.Bounds[0] == 412.8000030517578) {
        invoiceDueDate += element.Text + " "; // Invoice Due Date
      }
    });

    // Seperate Individual Fields From The Filtered Group.
    // For Customer Details.
    customerDetails = customerDetails.replace(/\s+/g, " ").trim(); // Remove Extra Space
    customerDetails = customerDetails.slice(7).trim().split(" "); // Remove 'BILL TO' Word from the string

    invoice.customername = customerDetails[0] + " " + customerDetails[1];

    let email = "",
      curr = 2;
    while (!email.endsWith(".com")) {
      email += customerDetails[curr++];
    }
    invoice.customerEmail = email;

    invoice.customerNumber = customerDetails[curr++];

    invoice.customerLine1 =
      customerDetails[curr++] +
      " " +
      customerDetails[curr++] +
      " " +
      customerDetails[curr++];

    invoice.customerLine2 = customerDetails[curr++];
    while (curr < customerDetails.length) {
      invoice.customerLine2 += " " + customerDetails[curr++];
    }

    // For Invoice Description.
    invoiceDescription = invoiceDescription.replace(/\s+/g, " ").trim();
    invoice.invoiceDesc = invoiceDescription.slice(7).trim();

    // For Invoice Due Date
    invoiceDueDate = invoiceDueDate.replace(/\s+/g, " ").trim();
    invoiceDueDate = invoiceDueDate.split(" ")[3].trim();
    invoice.invoiceDate = invoiceDueDate;
    // Extract fields based on position in the JSON object.
    // For business name.
    invoice.businessName = data[position++].Text.trim();

    // For Complete Business Address.
    let address = data[position++].Text.split(",");
    while (address.length < 4) {
      address.push(...data[position++].Text.split(","));
    }

    // Filtering empty headings from address array.
    address = address.filter((temp) => {
      return temp.trim() != "";
    });

    invoice.businessAddress = address[0].trim();
    invoice.businessCity = address[1].trim();
    invoice.businessCountry = address[2].trim() + ", " + address[3].trim();

    // For Zip Code.
    invoice.businessZipcode = parseInt(data[position++].Text.trim());

    // For Issue Date and Invoice Number.
    let details = data[position++].Text.trim().split(" ");
    while (details.length < 5) {
      details.push(...data[position++].Text.trim().split(" "));
    }
    invoice.invoiceNumber = details[1];
    invoice.invoiceIssueDate = details[4];

    // For Business Description.
    position++; // Skip The Business Title.
    invoice.businessDesc = data[position++].Text.trim();

    // For All Items.
    // Skipping all fields to reach first item.
    while (
      data[position].Text == undefined ||
      !data[position].Text.startsWith("AMOUNT")
    ) {
      position++;
    }
    position++;

    while (1) {
      if (data[position].Text.startsWith("Subtotal")) {
        break;
      }
      let item = {};
      item.billDetailsName = data[position++].Text.trim();
      item.billDetailsQuantity = parseInt(data[position++].Text.trim());
      item.billDetailsRate = parseInt(data[position++].Text.trim());
      items.push(item);
      position++;
    }

    // For invoice Tax.
    // Group All The Elements After Subtotal and then filter out the portion Before 'Total Due' and after '%'.
    let tax = "";
    while (position != data.length) {
      if (!data[position].Text.startsWith("$")) {
        tax += data[position++].Text;
      } else {
        position++;
      }
    }

    if (tax.indexOf("%") == -1) {
      invoice.InvoiceTax = "";
    } else {
      tax = tax.slice(tax.indexOf("%") + 1, tax.indexOf("Total Due")).trim();
      invoice.InvoiceTax = parseInt(tax);
    }

    /* Adding Each Record of Current PDF Object in Bounds and then Calling the Function 
           To Add Bounds of objects in CSV File. */
    items.forEach((item) => {
      allRecords.push({ ...invoice, ...item });
    });
    await addRecord(allRecords);
  }

  console.log("\nSuccesfully Created The CSV File");
};
