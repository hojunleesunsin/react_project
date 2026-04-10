import oracledb from "oracledb";

type OracleEnv = {
  user: string;
  password: string;
  connectString: string;
};

function getOracleEnv(): OracleEnv {
  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;
  const connectString = process.env.ORACLE_CONNECT_STRING;

  if (!user || !password || !connectString) {
    throw new Error(
      "Missing Oracle env. Set ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECT_STRING in .env.local",
    );
  }

  return { user, password, connectString };
}

export async function getOracleConnection() {
  const { user, password, connectString } = getOracleEnv();
  return oracledb.getConnection({ user, password, connectString });
}

export async function testOracleConnection() {
  const connection = await getOracleConnection();

  try {
    const result = await connection.execute(
      "SELECT SYS_CONTEXT('USERENV', 'DB_NAME') AS DB_NAME FROM DUAL",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return result.rows ?? [];
  } finally {
    await connection.close();
  }
}
