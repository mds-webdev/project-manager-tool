// backend/ldapAuth.js
const ldap = require('ldapjs');
require('dotenv').config();

function authenticate(username, password) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: process.env.LDAP_URL,
    });

    const userDN = `CN=${username},${process.env.LDAP_SEARCH_BASE}`;

    client.bind(userDN, password, (err) => {
      if (err) {
        reject('Anmeldung fehlgeschlagen');
      } else {
        resolve('Erfolgreich angemeldet');
      }
      client.unbind();
    });
  });
}

module.exports = authenticate;
