/* Library for manupulating data
*/
// Dependencies
const fs = require('fs');
const path = require('path');

const { parseJsonToObject } = require('./helpers');

// Module container (to be exported)
const lib = {};

// Base directory for the data
lib.baseDir = path.join(__dirname, '../.data/');

// Create data
lib.create = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data);
      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, err => {
        if (!err) {
          fs.close(fileDescriptor, err => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });

};
// Read data
lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
    if (!err && data) {
      const parsedData = parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }    
  });
};

//Update data
lib.update = (dir, file, data, callback) => {
  // Open file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data);
      // Truncate the file
      fs.truncate(fileDescriptor, err => {
        if (!err) {
          // Write to the file and close it
          fs.writeFile(fileDescriptor,stringData, err => {
            if (!err) {
              fs.close(fileDescriptor, err => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating the file');
        }
      });
    } else {
      callback('Error opening the file for update, it may not exist yet');
    }
  });
};

// Delete file
lib.delete = (dir, file, callback) => {
  // Unlink the file (remove it from file system)
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', err => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
};

module.exports = lib;