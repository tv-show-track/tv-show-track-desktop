import sha1 from 'sha1';
import * as _ from 'lodash';
import { ipcMain } from 'electron';
import { request } from 'graphql-request';
import si from 'systeminformation';
import Database from './database';

const graphqlEndpoint = 'https://api.graph.cool/simple/v1/tv-show-track';

function init() {
  ipcMain.on('save-license-key', saveLicenseKey);
}

async function saveLicenseKey(event, licenseKey) {
  let validLicense = false;

  if (!licenseKey) {
    return;
  }

  const licenseIsOk = await checkLicense(licenseKey, true);

  if (licenseIsOk) {
    const res = await Database.writeLicense({ key: 'licenseKey', value: licenseKey });
    validLicense = res && res.value;
  }

  event.sender.send('license-key-saved', validLicense);
}

async function licenseKeyIsValid() {
  try {
    const res = await Database.getLicense({ key: 'licenseKey' });
    if (res && res.value) {
      const licenseKey = res.value;
      return checkLicense(licenseKey);
    }

    return false;
  } catch (e) {
    return false;
  }
}

async function checkLicense(licenseKey, addLicense) {
  const fingerprint = await getDeviceFingerprint();

  const getInvoiceRes = await getInvoice(licenseKey);

  if (getInvoiceRes && getInvoiceRes.Invoice && getInvoiceRes.Invoice.id) {
    if (getInvoiceRes.Invoice.fingerprint === fingerprint && getInvoiceRes.Invoice.registered) {
      return true;
    }

    if (addLicense) {
      const updateInvoiceRes = await updateInvoice(getInvoiceRes.Invoice.id, fingerprint);

      if (updateInvoiceRes && updateInvoiceRes.updateInvoice) {
        return true;
      }
    }
  }

  return false;
}

async function getInvoice(licenseKey) {
  const query = `{
    Invoice(licenseKey: "${licenseKey}") {
      id,
      createdAt,
      fingerprint,
      registered
    }
  }`;

  return request(graphqlEndpoint, query);
}

async function updateInvoice(id, fingerprint) {
  const query = `mutation {
      updateInvoice(
        id: "${id}"
        fingerprint: "${fingerprint}"
        registered: true
      ) {
        id,
        fingerprint,
        registered
      }
    }
  `;

  return request(graphqlEndpoint, query);
}

async function getDeviceFingerprint() {
  const cpuData = await si.cpu();
  const cpuStrg = cpuData.brand + cpuData.family + cpuData.model +
    cpuData.speedmax + cpuData.cores;

  const nisData = await si.networkInterfaces();
  const niData = _.find(nisData, { iface: 'en0' });
  const niStrg = niData.mac;

  const timeData = await si.time();
  const timeStrg = timeData.timezoneName;

  const fingerprint = sha1(cpuStrg + niStrg + timeStrg);

  return fingerprint;
}

export { init, licenseKeyIsValid, saveLicenseKey };
