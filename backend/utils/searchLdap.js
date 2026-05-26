export function searchLDAP(client, baseDN, options) {
  return new Promise((resolve, reject) => {
    const entries = [];

    client.search(baseDN, options, (err, res) => {
      if (err) return reject(err);

      res.on("searchEntry", (entry) => {
        const obj = {};
        entry.attributes.forEach((attr) => {
          obj[attr.type] = attr.vals;
        });
        entries.push(obj);
      });

      res.on("error", reject);
      res.on("end", () => resolve(entries));
    });
  });
}