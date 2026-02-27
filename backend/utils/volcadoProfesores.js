/**
 * ================================================================
 *  Utils: volcadoProfesores.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Volcado completo de profesores desde LDAP a la tabla empleados
 *    Solo se ejecuta una vez desde login admin.
 *
 *  Autor: Francisco Damian Mendez Palma
 * ================================================================
 */

/*const ldap = require("ldapjs");
const empleadosController = require("../controllers/db/empleadosController");

const LDAP_URL = process.env.LDAP_URL;
const BASE_DN = "dc=instituto,dc=extremadura,dc=es";

async function volcarProfesoresALaBD(adminPassword) {
  return new Promise((resolve, reject) => {
    console.log("🔄 Iniciando volcado completo de profesores desde LDAP...");

    const client = ldap.createClient({ url: LDAP_URL });

    // 1️⃣ Bind como admin
    client.bind(`cn=admin,ou=People,${BASE_DN}`, adminPassword, (err) => {
      if (err) {
        console.error("❌ Error bind admin:", err);
        return reject(err);
      }

      console.log("🔐 Bind admin correcto. Obteniendo profesores...");

      // 2️⃣ Buscar grupo teachers
      const groupOptions = {
        scope: "sub",
        filter: "(cn=teachers)",
        attributes: ["memberUid"],
      };

      client.search(`ou=Group,${BASE_DN}`, groupOptions, (err, searchRes) => {
        if (err) return reject(err);

        let listaProfes = [];

        searchRes.on("searchEntry", (entry) => {
          const members =
            entry.attributes.find((a) => a.type === "memberUid")?.values || [];

          // Filtrar UIDs inválidos
          listaProfes.push(
            ...members.filter(
              (uid) => typeof uid === "string" && uid.trim() !== ""
            )
          );
        });

        searchRes.on("end", async () => {
          // Eliminar duplicados por seguridad
          listaProfes = [...new Set(listaProfes)];

          console.log(
            `📌 Encontrados ${listaProfes.length} profesores en LDAP`
          );

          for (const uid of listaProfes) {
            await procesarProfesor(client, uid);
          }

          client.unbind();
          console.log("✅ Volcado completo finalizado.");
          resolve();
        });
      });
    });
  });
}

// Procesar un solo profesor y volcar a la BD
async function procesarProfesor(client, uid) {
  return new Promise((resolve) => {
    // Protección extra
    if (!uid || uid.trim() === "") {
      console.warn("⚠️ UID inválido, se omite:", uid);
      return resolve();
    }

    console.log(`→ Procesando ${uid}`);

    const options = {
      scope: "sub",
      filter: `(uid=${uid})`,
      attributes: ["employeeNumber"],
    };

    client.search(`ou=People,${BASE_DN}`, options, async (err, res) => {
      if (err) {
        console.error(`❌ Error buscando usuario ${uid}:`, err);
        return resolve();
      }

      res.on("searchEntry", async (entry) => {
        const employeeNumber =
          entry.attributes.find((a) => a.type === "employeeNumber")
            ?.values[0] || "";

        try {
          await empleadosController.insertEmpleado({
            uid,
            tipo_usuario: 0,
            dni: employeeNumber,
            asuntos_propios: 4,
            tipo_empleado: "funcionario de carrera",
            jornada: 0,
            email: "",
            telefono:"",
            grupo:"",
            cuerpo:"",
          });
          console.log(`   ✔ Insertado en empleados: ${uid}`);
        } catch (err) {
          console.error(`❌ Error insertando ${uid}:`, err);
        }
      });

      res.on("end", () => resolve());
    });
  });
}

module.exports = volcarProfesoresALaBD;
*/

/**
 * ================================================================
 *  Utils: volcadoProfesores.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Volcado completo de empleados (teachers + staff)
 *    desde LDAP a la tabla empleados.
 *    Solo se ejecuta una vez desde login admin.
 *
 *  Autor: Francisco Damian Mendez Palma
 * ================================================================
 */

const ldap = require("ldapjs");
const empleadosController = require("../controllers/db/empleadosController");

const LDAP_URL = process.env.LDAP_URL;
const BASE_DN = "dc=instituto,dc=extremadura,dc=es";

async function volcarProfesoresALaBD(adminPassword) {
  return new Promise((resolve, reject) => {
    console.log(
      "🔄 Iniciando volcado completo de empleados (teachers + staff) desde LDAP..."
    );

    const client = ldap.createClient({ url: LDAP_URL });

    // 1️⃣ Bind como admin
    client.bind(`cn=admin,ou=People,${BASE_DN}`, adminPassword, (err) => {
      if (err) {
        console.error("❌ Error bind admin:", err);
        return reject(err);
      }

      console.log("🔐 Bind admin correcto. Obteniendo grupos teachers y staff...");

      // 2️⃣ Buscar ambos grupos en una sola consulta
      const groupOptions = {
        scope: "sub",
        filter: "(|(cn=teachers)(cn=staff))",
        attributes: ["cn", "memberUid"],
      };

      client.search(`ou=Group,${BASE_DN}`, groupOptions, (err, searchRes) => {
        if (err) return reject(err);

        let listaUsuarios = [];

        searchRes.on("searchEntry", (entry) => {
          const cn =
            entry.attributes.find((a) => a.type === "cn")?.values[0] || "";

          const members =
            entry.attributes.find((a) => a.type === "memberUid")?.values || [];

          // Filtrar UIDs inválidos
          members
            .filter((uid) => typeof uid === "string" && uid.trim() !== "")
            .forEach((uid) => {
              listaUsuarios.push({
                uid,
                personal: cn, // "teachers" o "staff"
              });
            });
        });

        searchRes.on("end", async () => {
          // Eliminar posibles duplicados por seguridad
          const mapaUnicos = new Map();
          listaUsuarios.forEach((u) => mapaUnicos.set(u.uid, u));
          listaUsuarios = Array.from(mapaUnicos.values());

          console.log(
            `📌 Encontrados ${listaUsuarios.length} empleados en LDAP`
          );

          for (const usuario of listaUsuarios) {
            await procesarProfesor(
              client,
              usuario.uid,
              usuario.personal
            );
          }

          client.unbind();
          console.log("✅ Volcado completo finalizado.");
          resolve();
        });
      });
    });
  });
}

// Procesar un solo empleado y volcar a la BD
async function procesarProfesor(client, uid, tipoPersonal) {
  return new Promise((resolve) => {
    if (!uid || uid.trim() === "") {
      console.warn("⚠️ UID inválido, se omite:", uid);
      return resolve();
    }

    console.log(`→ Procesando ${uid} (${tipoPersonal})`);

    const options = {
      scope: "sub",
      filter: `(uid=${uid})`,
      attributes: ["employeeNumber"],
    };

    client.search(`ou=People,${BASE_DN}`, options, async (err, res) => {
      if (err) {
        console.error(`❌ Error buscando usuario ${uid}:`, err);
        return resolve();
      }

      res.on("searchEntry", async (entry) => {
        const employeeNumber =
          entry.attributes.find((a) => a.type === "employeeNumber")
            ?.values[0] || "";

        try {
          await empleadosController.insertEmpleado({
            uid,
            tipo_usuario: 0,
            dni: employeeNumber,
            asuntos_propios: 4,
            tipo_empleado: "funcionario de carrera",
            jornada: 0,
            email: "",
            telefono: "",
            grupo: "",
            cuerpo: "",
            personal: tipoPersonal, // "teachers" o "staff"
          });
        } catch (err) {
          console.error(`❌ Error insertando ${uid}:`, err);
        }
      });

      res.on("end", () => resolve());
    });
  });
}

module.exports = volcarProfesoresALaBD;