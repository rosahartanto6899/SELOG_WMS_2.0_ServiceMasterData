import { injectable } from 'inversify';
import { Request, Response } from 'express';
import { Workbook } from 'exceljs';
import { MstLocation, MstMaterial } from '@/database/entities';
import { customerContext, customerScope } from '@/utils';
import { HTTP_STATUS } from '@/shared-libs/constants/http-status.constant';
import { BadRequestException } from '@/shared-libs/exceptions';
import { materialLocationMappingConstant as cst } from './constants/material-location-mapping.constant';

/**
 * Generate template Upload Material–Location Mapping dinamis (pola
 * ExcelTemplateService ServiceVehicle + upload-incoming-ahm):
 * dropdown master live (material/location), sheet Ref_bodyKey (veryHidden)
 * sebagai kunci integritas header<->key untuk parsing frontend.
 */
@injectable()
export class ExcelTemplateService {
  async generateTemplate(req: Request, res: Response) {
    const { columns } = cst;
    const ctx = customerContext(req);
    const warehouseCode = String(req.query.warehouseCode ?? '');

    // === Ambil master live untuk dropdown ===
    const materials = (
      await MstMaterial.findAll({
        where: { ...customerScope(ctx.customerCode), isActive: true, deletedDate: null },
        order: [['code', 'ASC']],
        attributes: ['id', 'code', 'name'],
        limit: 5000,
      })
    ).map((m) => m.get({ plain: true }) as any);

    const locations = (
      await MstLocation.findAll({
        where: { ...customerScope(ctx.customerCode), warehouseCode, isActive: true, deletedDate: null },
        order: [['name', 'ASC']],
        attributes: ['id', 'name'],
        limit: 5000,
      })
    ).map((l) => l.get({ plain: true }) as any);

    if (!materials.length || !locations.length) {
      throw new BadRequestException(
        'Material or location master is empty for this customer/warehouse',
      );
    }

    const workBook = new Workbook();
    const workSheet = workBook.addWorksheet(cst.excelSheetMain);

    // === Ref_bodyKey (veryHidden): header <-> field key ===
    const refBodyKey = workBook.addWorksheet(cst.excelSheetBodyKey, {
      state: cst.excelSheetStateVeryHidden,
    });
    refBodyKey.addRow([cst.keyName, cst.keyId]);
    columns.forEach((c) => refBodyKey.addRow([c.header, c.key]));

    // === Ref sheet master (veryHidden): header [name, id] — konsisten Ref_bodyKey,
    // agar sheet_to_json FE memetakan kolom dengan benar ===
    const addRefSheet = (
      name: string,
      rows: { id: string; [k: string]: any }[],
      valueKey: string,
    ) => {
      const sheet = workBook.addWorksheet(name, {
        state: cst.excelSheetStateVeryHidden,
      });
      sheet.addRow([cst.keyName, cst.keyId]);
      rows.forEach((r) => sheet.addRow([r[valueKey], r.id]));
      return sheet;
    };
    addRefSheet(cst.excelSheetRefMaterial, materials, 'code');
    addRefSheet(cst.excelSheetRefLocation, locations, 'name');

    // === Main sheet: mandatory read + instruksi ===
    const rowMandatoryRead = workSheet.addRow([cst.excelMandatoryRead]);
    rowMandatoryRead.font = { bold: true };
    const rowInstruction1 = workSheet.addRow([cst.excelInstructionPoint1]);
    workSheet.mergeCells(`A${rowInstruction1.number}:D${rowInstruction1.number}`);
    const rowInstruction2 = workSheet.addRow([cst.excelInstructionPoint2]);
    workSheet.mergeCells(`A${rowInstruction2.number}:D${rowInstruction2.number}`);
    workSheet.addRow([]); // spasi 1 baris

    // === Header row 5 ===
    const headerRow = workSheet.getRow(cst.headerRowNumber);
    headerRow.values = columns.map((c) => c.header);
    columns.forEach(
      (column, index) => (workSheet.getColumn(index + 1).width = column.width),
    );
    headerRow.eachCell((cell, colNumber) => {
      const isOptional = columns[colNumber - 1]?.optional;
      if (isOptional) {
        cell.fill = {
          type: cst.stringTypePattern as any,
          pattern: cst.stringPatternSolid as any,
          fgColor: { argb: cst.yellowHexColor },
        };
        cell.font = { bold: false };
      } else {
        cell.font = { bold: true };
      }
    });

    // === Baris contoh dari data ref pertama ===
    workSheet.addRow([
      materials[0]?.code ?? '',
      materials[0]?.name ?? '',
      '',
      locations[0]?.name ?? '',
    ]);

    // === Dropdown dataValidation utk kolom ref (materialCode, locationName) ===
    columns.forEach((column, index) => {
      if (!column.refSheet) return;
      const colLetter = workSheet.getColumn(index + 1).letter;
      const lastRow = cst.headerRowNumber + cst.dropdownRows;
      for (let row = cst.headerRowNumber + 1; row <= lastRow; row++) {
        workSheet.getCell(`${colLetter}${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`'${column.refSheet}'!$A$2:$A$5001`],
        };
      }
    });

    // === Kirim sebagai file download ===
    const buffer = await workBook.xlsx.writeBuffer();
    res.setHeader(cst.stringHeaderNameContentType, cst.stringHeaderValueSpreadsheet);
    res.setHeader(
      cst.stringHeaderNameContentDisposition,
      cst.stringHeaderValueFilename,
    );
    res.end(buffer);

    return { data: null, httpCode: HTTP_STATUS.OK };
  }
}
