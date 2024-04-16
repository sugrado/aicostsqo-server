const Rp = require('../models/rp.model');
const { createOutputVolumes } = require('./distributionCurves.service');
const { getByRp } = require('./outputVolume.service');
const { writeWorkbookToFile } = require('../scripts/utils/excel.helper');
const { addWorksheetToWorkbook, createWorkBook } = require('./excel.service');
const { RP_COLUMNS } = require('./constants/modelColumns');

const list = async () => {
  const rps = await Rp.find({});
  if (rps) return rps;
  throw new Error('Rps not found');
};
const bulkDeleteRps = async (rps) => {
  const result = await Rp.deleteMany({ _id: { $in: rps } });
  console.log('silme sonucu: ', result);
};

const bulkInsertRps = async (rps) => {
  await Rp.insertMany(rps);
};

const insert = async (rpData) => {
  const rp = await Rp.create(rpData);
  if (rp) return rp;
  throw new Error('Rp not created');
};

const getRpsBySiteBoundId = async (siteBoundId) => {
  const rps = await Rp.find({ siteBound: siteBoundId }).sort({ name: 1 });
  if (rps) return rps;
  throw new Error('Rps not found');
};

const getLastRpBySiteBoundId = async (siteBoundId) => {
  const rp = await Rp.findOne({
    siteBound: siteBoundId,
  })
    .sort({ name: -1 })
    .limit(1);
  if (rp) return rp;
  throw new Error('Rps not found');
};

const getOutputVolumesByRp = async (rpId) => {
  const outputVolumes = await getByRp(rpId);
  if (outputVolumes.length < 1) {
    return await createOutputVolumes(rpId);
  }
  return outputVolumes;
};

const exportBySiteBoundToExcel = async (siteBoundId) => {
  const rps = (await getRpsBySiteBoundId(siteBoundId)).map((p) => {
    return {
      ...p._doc,
      _id: p._id.toString(),
      siteBound: p.siteBound.toString(),
    };
  });

  const workbook = createWorkBook();
  addWorksheetToWorkbook(workbook, 'RPs', RP_COLUMNS, rps);
  return writeWorkbookToFile(workbook);
};

module.exports = {
  bulkDeleteRps,
  listRps: list,
  insertRp: insert,
  getRpsBySiteBoundId,
  bulkInsertRps,
  getLastRpBySiteBoundId,
  getOutputVolumesByRp,
  exportBySiteBoundToExcel,
};
