const ldap = require('ldapjs');
//const LDAP_URL = import.meta.env.LDAP_URL;

exports.loginLdap = (req, res) => {
  const { username, password } = req.body;
  const LDAP_URL = process.env.LDAP_URL;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario o contraseña faltantes' });
  }

  const userDN = `uid=${username},ou=People,dc=instituto,dc=extremadura,dc=es`;

  const client = ldap.createClient({
   // url: 'ldap://172.16.218.2:389' // Cambia a IP o dominio real
    url: LDAP_URL // Cambia a IP o dominio real
  });

  client.bind(userDN, password, (err) => {
  if (err) {
    console.error("🔒 Error en bind LDAP:", err.message); // <--- log directo
    return res.status(401).json({ error: "Credenciales inválidas", details: err.message });
  }

  req.session.ldap = {
    dn: userDN,
    password: password,
  };

  client.unbind();
  res.json({ message: "Login correcto" });
});

};
