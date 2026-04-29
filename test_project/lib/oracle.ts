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

// Next.js HMR 환경에서 Pool 중복 생성을 방지하기 위한 글로벌 캐싱
declare global {
  var _oraclePool: oracledb.Pool | undefined;
}

async function getPool(): Promise<oracledb.Pool> {
  if (global._oraclePool) {
    return global._oraclePool;
  }

  const { user, password, connectString } = getOracleEnv();

  global._oraclePool = await oracledb.createPool({
    user,
    password,
    connectString,
    poolMin: 2,       // 항상 유지할 최소 커넥션 수
    poolMax: 10,      // 최대 커넥션 수
    poolIncrement: 1, // 부족 시 한 번에 늘리는 수
    poolTimeout: 60,  // 유휴 커넥션 해제 대기 시간 (초)
  });

  return global._oraclePool;
}

export async function getOracleConnection() {
  const pool = await getPool();
  return pool.getConnection();
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
