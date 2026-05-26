const ldap = require("ldapjs");

const GROUP_DN = "ou=Group,dc=instituto,dc=extremadura,dc=es";

module.exports = async function getGruposLDAP(ldapSession) {
  const LDAP_URL = ldapSession.external
    ? `ldap://${ldapSession.ldapHost}`
    : process.env.LDAP_URL;

  const client = ldap.createClient({ url: LDAP_URL });

  return new Promise((resolve, reject) => {
    client.bind(ldapSession.dn, ldapSession.password, (err) => {
      if (err) {
        return reject(new Error("LDAP bind fallido: " + err.message));
      }

      const options = {
        scope: "sub",
        filter: "(&(objectClass=lisAclGroup)(groupType=school_class))",
        attributes: ["cn", "description", "gidNumber", "groupType"],
      };

      const grupos = [];

      client.search(GROUP_DN, options, (err, res) => {
        if (err) {
          client.unbind();
          return reject(err);
        }

        res.on("searchEntry", (entry) => {
          const attrs = {};

          entry.attributes.forEach((attr) => {
            attrs[attr.type] = attr.vals;
          });

          grupos.push({
            cn: attrs.cn?.[0] || "",
            description: attrs.description?.[0] || "",
            gidNumber: attrs.gidNumber?.[0] || "",
            groupType: attrs.groupType?.[0] || "",
          });
        });

        res.on("end", () => {
          client.unbind();
          resolve(grupos);
        });

        res.on("error", (err) => {
          client.unbind();
          reject(err);
        });
      });
    });
  });
};
