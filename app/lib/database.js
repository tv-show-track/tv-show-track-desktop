import { app } from 'electron';
import Datastore from 'nedb';
import Q from 'q';
import fs from 'fs';
import path from 'path';

const DATA_PATH = app.getPath('userData');
const db = {};

function promisifyDatastore(datastore) {
  const store = datastore;
  store.insert = Q.nbind(store.insert, store);
  store.update = Q.nbind(store.update, store);
  store.remove = Q.nbind(store.remove, store);
}

function promisifyDb(obj) {
  return Q.Promise((resolve, reject) => {
    obj.exec((error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

function dbInit(name) {
  console.log('dbInit', name, path.join(DATA_PATH, `data/${name}.db`));
  db[name] = new Datastore({
    filename: path.join(DATA_PATH, `./data/${name}.db`),
    autoload: true
  });
  promisifyDatastore(db[name]);
}

const dbNames = ['settings'];
dbNames.map(dbInit);

// settings key uniqueness
db.settings.ensureIndex({
  fieldName: 'key',
  unique: true
});

const Database = {
  initialize: () => (
    new Promise((resolve) => resolve())
  ),

  getSetting: data => (
    promisifyDb(db.settings.findOne({
      key: data.key
    }))
  ),

  deleteSetting: data => (
    db.settings.remove({
      key: data.key
    })
  ),

  getSettings: () => promisifyDb(db.settings.find({})),

  writeSetting: data => (
    Database.getSetting({
      key: data.key
    })
    .then(result => {
      if (result) {
        return db.settings.update({
          key: data.key
        }, {
          $set: {
            value: data.value
          }
        }, {});
      }
      return db.settings.insert(data);
    })
    .catch(console.log)
  ),

  resetSettings: () => (
    db.settings.remove({}, {
      multi: true
    })
  ),

  deleteDatabases: () => {
    fs.unlinkSync(path.join(DATA_PATH, 'data/settings.db'));
  }
};

export function checkIfValidProviders() {
  Database.getSetting({ key: 'authTraktTv' })
    .then(doc => (
      new Promise((resolve, reject) => {
        if (doc && doc.value) {
          resolve();
        } else {
          reject();
        }
      })
    ))
    .catch(console.error);
}

export default Database;
