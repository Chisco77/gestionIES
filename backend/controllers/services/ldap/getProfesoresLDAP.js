const ldap = require("ldapjs");
const { searchLDAP } = require("../../../utils/searchLdap");
const { normalizarTexto } = require("../untis/normalizarTexto");

const BASE_DN = "dc=instituto,dc=extremadura,dc=es";

module.exports = async function getProfesoresLDAP(ldapSession) {
  const LDAP_URL = ldapSession.external
    ? `ldap://${ldapSession.ldapHost}`
    : process.env.LDAP_URL;

  const client = ldap.createClient({ url: LDAP_URL });

  return new Promise((resolve, reject) => {
    client.bind(ldapSession.dn, ldapSession.password, async (err) => {
      if (err) {
        return reject(new Error("LDAP bind fallido: " + err.message));
      }

      try {
        // 1. Grupo teachers
        const group = await searchLDAP(client, `ou=Group,${BASE_DN}`, {
          scope: "sub",
          filter: "(&(cn=teachers)(objectClass=lisAclGroup))",
          attributes: ["memberUid"],
        });

        const memberUids = group[0]?.memberUid || [];

        const uidSet = new Set(
          memberUids.filter(
            (uid) => typeof uid === "string" && uid.trim() !== ""
          )
        );

        // 2. Personas
        const people = await searchLDAP(client, `ou=People,${BASE_DN}`, {
          scope: "sub",
          filter: "(objectClass=inetOrgPerson)",
          attributes: [
            "uidNumber",
            "givenName",
            "sn",
            "uid",
            "gidNumber",
            "employeeNumber",
          ],
        });

        const result = people
          .map((p) => ({
            id: p.uidNumber?.[0] || null,
            givenName: p.givenName?.[0] || "",
            sn: p.sn?.[0] || "",
            uid: p.uid?.[0] || "",
            gidNumber: p.gidNumber?.[0] || "",
            employeeNumber: p.employeeNumber?.[0] || "",
          }))
          .filter((p) => uidSet.has(p.uid));

        // 3. añadir normalización aquí (IMPORTANTE)
        const final = result.map((p) => ({
          ...p,
          nombreNormalizado: normalizarTexto(`${p.givenName} ${p.sn}`),
        }));

        client.unbind();
        resolve(final);
      } catch (error) {
        client.unbind();
        reject(error);
      }
    });
  });
};
