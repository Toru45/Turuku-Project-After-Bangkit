import { Sequelize } from "sequelize";
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await client.accessSecretVersion({
    name: secretName,
  });
  return version.payload.data.toString('utf8');
}


const ACCESS_TOKEN_SECRET = await getSecret('projects/bangkit-c242-ps070/secrets/ACCESS_TOKEN_SECRET/versions/latest');
const REFRESH_TOKEN_SECRET = await getSecret('projects/bangkit-c242-ps070/secrets/REFRESH_TOKEN_SECRET/versions/latest');

// Inisialisasi koneksi database secara langsung
const DB_NAME = await getSecret('projects/bangkit-c242-ps070/secrets/DB_NAME/versions/latest');
const SQL_HOST = await getSecret('projects/bangkit-c242-ps070/secrets/SQL_HOST/versions/latest');
const SQL_USER = await getSecret('projects/bangkit-c242-ps070/secrets/SQL_USER/versions/latest');
const SQL_PASSWORD = await getSecret('projects/bangkit-c242-ps070/secrets/SQL_PASSWORD/versions/latest');

const db = new Sequelize(DB_NAME, SQL_USER, SQL_PASSWORD, {
  host: SQL_HOST,
  dialect: "mysql"
});

export default db;
export { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET };