const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'tikcredit-pro',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

function addNewLoanApplication(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('AddNewLoanApplication', inputVars, inputOpts);
}
exports.addNewLoanApplication = addNewLoanApplication;

function getLoanApplicationsForUser(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetLoanApplicationsForUser', inputVars, inputOpts);
}
exports.getLoanApplicationsForUser = getLoanApplicationsForUser;

function updateLoanApplicationStatus(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateLoanApplicationStatus', inputVars, inputOpts);
}
exports.updateLoanApplicationStatus = updateLoanApplicationStatus;

function listLoanTypes(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListLoanTypes', undefined, inputOpts);
}
exports.listLoanTypes = listLoanTypes;

