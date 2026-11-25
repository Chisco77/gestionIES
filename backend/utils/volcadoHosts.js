/**
 * ================================================================
 *  Utilidad: volcadoHosts.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Sincroniza los hosts existentes en LDAP con PostgreSQL.
 *
 *  LDAP:
 *    ou=hosts,dc=instituto,dc=extremadura,dc=es
 *
 *  Atributos utilizados:
 *    dc
 *
 *  Importante:
 *    Actualiza exclusivamente los datos procedentes de LDAP.
 *    No modifica ubicación, coordenadas ni datos de gestión.
 *
 * ================================================================
 */

const db = require("../db");
const ldap = require("ldapjs");

const BASE_DN = "dc=instituto,dc=extremadura,dc=es";
const HOSTS_DN = `ou=hosts,${BASE_DN}`;

async function volcarHostsALaBD(passwordAdmin) {
  return new Promise((resolve, reject) => {
    const LDAP_URL = process.env.LDAP_URL;
    const adminDN = `cn=admin,ou=People,${BASE_DN}`;

    const client = ldap.createClient({
      url: LDAP_URL,
    });

    let finalizado = false;

    // Evita finalizar la promesa más de una vez.
    const finalizar = (error, resultado) => {
      if (finalizado) return;

      finalizado = true;

      try {
        client.unbind();
      } catch (err) {
        console.error("Error cerrando conexión LDAP:", err.message);
      }

      if (error) {
        reject(error);
      } else {
        resolve(resultado);
      }
    };

    client.bind(adminDN, passwordAdmin, (err) => {
      if (err) {
        console.error("❌ Error autenticando administrador LDAP:", err.message);

        return finalizar(err);
      }

      const options = {
        scope: "sub",
        filter: "(objectClass=dNSDomain2)",
        attributes: ["dc"],
      };

      const hosts = [];

      client.search(HOSTS_DN, options, (err, searchRes) => {
        if (err) {
          console.error("❌ Error buscando hosts LDAP:", err.message);

          return finalizar(err);
        }

        searchRes.on("searchEntry", (entry) => {
          const attrs = {};

          entry.attributes.forEach((attr) => {
            attrs[attr.type] = attr.vals;
          });

          const dc = attrs.dc?.[0];

          if (!dc) return;

          hosts.push({
            ldapDn: entry.dn.toString(),
            dc,
          });
        });

        searchRes.on("error", (err) => {
          console.error("❌ Error en búsqueda LDAP de hosts:", err.message);

          finalizar(err);
        });

        searchRes.on("end", async () => {
          try {
            let sincronizados = 0;

            for (const host of hosts) {
              await db.query(
                `
                INSERT INTO equipos (
                  ldap_dn,
                  dc
                )
                VALUES ($1, $2)

                ON CONFLICT (ldap_dn)
                DO UPDATE SET
                  dc = EXCLUDED.dc,
                  fecha_actualizacion = CURRENT_TIMESTAMP
                `,
                [host.ldapDn, host.dc]
              );

              sincronizados++;
            }

            console.log(
              `🟢 Sincronización de hosts finalizada. ` +
                `Total LDAP: ${hosts.length}. ` +
                `Sincronizados: ${sincronizados}.`
            );

            finalizar(null, {
              total: hosts.length,
              sincronizados,
            });
          } catch (errDB) {
            console.error(
              "❌ Error sincronizando hosts con PostgreSQL:",
              errDB.message
            );

            finalizar(errDB);
          }
        });
      });
    });
  });
}

module.exports = volcarHostsALaBD;
