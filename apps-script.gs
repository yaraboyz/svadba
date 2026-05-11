/**
 * Google Apps Script: приём анкеты со свадебного сайта.
 *
 * Что делает:
 *   - принимает POST с JSON-телом от index.html
 *   - дописывает строку в лист "Ответы"
 *   - при первом запуске сам создаёт заголовки колонок
 *
 * Деплой см. README.md.
 */

// ID Google-таблицы. Возьми из URL: docs.google.com/spreadsheets/d/<ЭТО_ID>/edit
const SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'Ответы';

const HEADERS = [
  'Время',
  'ФИО',
  'Будет ли',
  'Сколько дней',
  'Даты (если часть)',
  'Жильё',
  'Аллергия',
  'Подробности аллергии',
  'Алкоголь',
  'Подпись (клятва о собаках)',
  'User-Agent'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      data.full_name        || '',
      data.attending        || '',
      data.full_stay        || '',
      data.part_stay_dates  || '',
      data.housing          || '',
      data.allergy          || '',
      data.allergy_text     || '',
      Array.isArray(data.drinks) ? data.drinks.join(', ') : '',
      data.oath_signature   || '',
      data.user_agent       || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Чтобы можно было проверить, что Web App доступен, открыв URL в браузере.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, hint: 'Это endpoint анкеты. POST сюда JSON.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
