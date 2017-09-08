import sha1 from 'sha1';
import * as _ from 'lodash';
import { ipcMain } from 'electron';
import { request } from 'graphql-request';
import log from 'electron-log';
import si from 'systeminformation';
import Database from './database';

const graphqlEndpoint =
    process.env.NODE_ENV === 'production'
      ? 'https://api.graph.cool/simple/v1/tv-show-track-live'
      : 'https://api.graph.cool/simple/v1/tv-show-track-dev';

function init() {
  ipcMain.on('save-license-key', saveLicenseKey);
}

async function saveLicenseKey(event, licenseKey) {
  log.info(`saveLicenseKey: ${licenseKey}`);
  let validLicense = false;

  if (!licenseKey) {
    return;
  }

  const licenseIsOk = await checkLicense(licenseKey.replace(' ', ''), true);

  if (licenseIsOk) {
    const res = await Database.writeLicense({ key: 'licenseKey', value: licenseKey });
    validLicense = res && res.value;
  }

  event.sender.send('license-key-saved', validLicense);
}

async function licenseKeyIsValid() {
  log.info('licenseKeyIsValid...');

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
  log.info(`checkLicense... addLicense: ${JSON.stringify(licenseKey)}, ${JSON.stringify(addLicense)}`);
  const fingerprint = await getDeviceFingerprint();
  log.info(`fingerprint: ${JSON.stringify(fingerprint)}`);

  const getInvoiceRes = await getInvoice(licenseKey);
  log.info(`getInvoiceRes: ${JSON.stringify(getInvoiceRes)}`);

  if (getInvoiceRes && getInvoiceRes.Invoice && getInvoiceRes.Invoice.id) {
    if (getInvoiceRes.Invoice.fingerprint === fingerprint && getInvoiceRes.Invoice.registered) {
      return true;
    }

    if (addLicense) {
      const updateInvoiceRes = await updateInvoice(getInvoiceRes.Invoice.id, fingerprint);
      log.info(`updateInvoiceRes: ${JSON.stringify(updateInvoiceRes)}`);

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
