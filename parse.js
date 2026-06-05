const mammoth = require("mammoth");
const fs = require("fs");

mammoth.extractRawText({
    path: "C:\\Users\\acer\\Downloads\\EF_and_Questions_updated_final.docx"
})
.then(function(result) {
    fs.writeFileSync("EF_raw.txt", result.value, "utf8");
    console.log("Extracted " + result.value.length + " chars.");
})
.catch(function(err) {
    console.error(err);
});