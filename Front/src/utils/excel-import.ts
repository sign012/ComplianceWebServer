// 解析excel文档数据
import XLSX from 'xlsx';
import { ElMessage } from 'element-plus';
type objMap = {
  [key: string]: Array<string>;
};
export const importExcel = async (file: any, objMap: any) => {
  const types = file.name.split('.')[1];
  const fileType = ['xlsx', 'xls'].some((item) => item === types);
  if (!fileType) {
    ElMessage.error('格式错误！请重新选择');
    return;
  }
  return new Promise(function (resolve, reject) {
    file2Xce(file)
      .then((tabJson: any) => {
        if (tabJson && tabJson.length > 0) {
          const xlsxJson = tabJson;
          // console.log('数据', xlsxJson);
          const excell = { len: xlsxJson[0].sheet.length };
          for (const key in objMap) {
            (excell as objMap)[key] = [];
          }
          xlsxJson[0].sheet.map((item: any) => {
            for (const key in objMap) {
              (excell as objMap)[key].push(item[objMap[key]]);
            }
          });
          resolve(excell);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

function file2Xce(file: any) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      const data = e.target.result;
      this.wb = XLSX.read(data, {
        type: 'binary'
      });
      const result: any = [];
      this.wb.SheetNames.forEach((sheetName: any) => {
        result.push({
          sheetName: sheetName,
          sheet: XLSX.utils.sheet_to_json(this.wb.Sheets[sheetName])
        });
      });
      resolve(result);
    };
    reader.readAsBinaryString(file.raw);
  });
}
