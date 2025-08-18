/* A simple structure for creating google sheets from a JSON like structure.
Supports pushing a single row or multiple rows and formatting a sheet.
*/


function JsonSheet({ headers, sheetName, fetch = undefined, format = undefined }) {

    const ss = SpreadsheetApp.getActiveSpreadsheet(); //Cache().getSheet(sheetName,parentFolder);
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName); //ss.getActiveSheet();

    return {
        reset() {
            sheet.clear();
            sheet.appendRow(headers);
            return this;
        },
        read() {
            let data = sheet.getDataRange().getValues();
            if (!data || data.length === 0) { return []; }
            const hdrs = data[0];
            return data.slice(1).map(row => {
                const obj = {};
                for (let i = 0; i < hdrs.length; i++) {
                    obj[hdrs[i]] = row[i];
                }
                return obj;
            });
        },
        format() {
            if (format) { format(sheet, ss); }
        },
        push(row) {
            sheet.appendRow(headers.map((h) => row[h]));
        },
        extend(rows) {
            //console.log('starting with',rows);
            //console.log('headers',headers);
            const oldrows = rows;
            rows = rows.map((r) => headers.map((h) => r[h]));
            //console.log('mapped to...',rows)
            if (rows.length == 0) { return }
            const length = rows.length;
            const lastContent = sheet.getLastRow();
            const lastRow = sheet.getMaxRows();
            if ((lastContent + length) >= lastRow) {
                // insert what we need + 1
                sheet.insertRows(lastRow, length + 1)
            }
            sheet.getRange(
                lastContent + 1, 1,
                rows.length,
                rows[0].length
            ).setValues(rows);
        },
        update(row, idHeader) {
            // Upsert row by idHeader (defaults to first header)
            const keyHeader = idHeader || headers[0];
            if (headers.indexOf(keyHeader) === -1) {
                throw new Error(`JsonSheet.update: idHeader ${keyHeader} is not in headers`);
            }
            const idVal = row[keyHeader];
            if (idVal === undefined || idVal === null || idVal === "") {
                throw new Error(`JsonSheet.update: row is missing id value for ${keyHeader}`);
            }
            const data = sheet.getDataRange().getValues();
            if (!data || data.length === 0) {
                // no header yet; initialize
                sheet.clear();
                sheet.appendRow(headers);
            }
            const hdrs = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
            const idCol = hdrs.indexOf(keyHeader) + 1; // 1-based
            if (idCol <= 0) { throw new Error(`JsonSheet.update: header ${keyHeader} not found`); }

            // scan for existing
            const lastRow = sheet.getLastRow();
            let targetRow = -1;
            if (lastRow >= 2) {
                const idRange = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
                for (let i = 0; i < idRange.length; i++) {
                    if (String(idRange[i][0]) === String(idVal)) { targetRow = i + 2; break; }
                }
            }

            if (targetRow === -1) {
                // append new row using provided values only
                const newValues = hdrs.map(h => row[h] !== undefined ? row[h] : "");
                sheet.appendRow(newValues);
            } else {
                // merge with existing row values
                const existingVals = sheet.getRange(targetRow, 1, 1, hdrs.length).getValues()[0];
                const merged = existingVals.slice();
                for (let c = 0; c < hdrs.length; c++) {
                    const h = hdrs[c];
                    if (Object.prototype.hasOwnProperty.call(row, h)) {
                        merged[c] = row[h];
                    }
                }
                sheet.getRange(targetRow, 1, 1, hdrs.length).setValues([merged]);
            }
        },
        getId() { return ss.getId() },
        getUrl() { return ss.getUrl() },
        fetch() {
            fetch(this);
            return this;
        }
    }

}
