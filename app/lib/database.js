import { app } from 'electron';
import Datastore from 'nedb';
import Q from 'q';
import fs from 'fs';
import path from 'path';
import * as _ from 'lodash';

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

const dbNames = ['settings', 'watched', 'license'];
dbNames.map(dbInit);

// settings key uniqueness
db.settings.ensureIndex({
  fieldName: 'key',
  unique: true
});

db.watched.ensureIndex({
  fieldName: 'tvdb',
  unique: true
});

db.watched.ensureIndex({
  fieldName: 'imdb',
  unique: true
});

const Database = {

  deleteDatabases: () => {
    fs.unlinkSync(path.join(DATA_PATH, 'data/settings.db'));
    fs.unlinkSync(path.join(DATA_PATH, 'data/watched.db'));
  },

  /** ****************************
   *******   SETTINGS     ********
   *******************************/

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
        }, {
          upsert: true
        });
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

  /** ****************************
   *******   License     ********
   *******************************/

  getLicense: data => (
    promisifyDb(db.license.findOne({
      key: data.key
    }))
  ),

  deleteLicense: data => (
    db.license.remove({
      key: data.key
    })
  ),

  getLicenses: () => promisifyDb(db.license.find({})),

  writeLicense: data => (
    Database.getLicense({
      key: data.key
    })
    .then(result => {
      if (result) {
        return db.license.update({
          key: data.key
        }, {
          $set: {
            value: data.value
          }
        }, {
          upsert: true
        });
      }
      return db.license.insert(data);
    })
    .catch(console.log)
  ),

  resetLicense: () => (
    db.license.remove({}, {
      multi: true
    })
  ),

  /** ****************************
   *******     SHOWS      ********
   *******************************/

  setEpisodeAsWatched: data => {
    const dataToInsert = {
      tvdb: _.get(data, 'tvdb', '').toString(),
      imdb: _.get(data, 'imdb', '').toString(),
      season: _.get(data, 'season'),
      number: _.get(data, 'number'),
      title: _.get(data, 'title'),
      type: 'episode',
      date: new Date(),
      syncProvider: data.syncProvider
    };

    return db.watched.update({
      tvdb: dataToInsert.tvdb
    }, dataToInsert, {
      upsert: true
    });
  },

  setEpisodesAsWatched: data => (
    db.watched.insert(data)
  ),

  getWatchedNotSynced: async syncProvider => {
    const notSyncedQuery = promisifyDb(db.watched.find({
      $not: { syncProvider }
    }));
    const syncedQuery = promisifyDb(db.watched.find({ syncProvider }));
    const [notSynced, synced] = await Promise.all([notSyncedQuery, syncedQuery]);

    _.remove(notSynced, ns => (_.find(synced, s => (s.tvdb === ns.tvdb && s.date > ns.date))));
    return notSynced;
  }
};

export default Database;
