import mysql from "mysql2/promise"

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  timezone: "+00:00",
  charset: "utf8mb4",
}

// Create connection pool for better performance
let pool: mysql.Pool | null = null

export function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Execute query with error handling
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const connection = getConnection()
    const [rows] = await connection.execute(query, params)
    return rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    console.error("Query:", query)
    console.error("Params:", params)
    throw new Error("Database operation failed")
  }
}

// Execute single query (for INSERT, UPDATE, DELETE)
export async function executeSingle(
  query: string,
  params: any[] = [],
): Promise<{ insertId?: number; affectedRows: number }> {
  try {
    const connection = getConnection()
    const [result] = await connection.execute(query, params)
    const mysqlResult = result as mysql.ResultSetHeader
    return {
      insertId: mysqlResult.insertId,
      affectedRows: mysqlResult.affectedRows,
    }
  } catch (error) {
    console.error("Database query error:", error)
    console.error("Query:", query)
    console.error("Params:", params)
    throw new Error("Database operation failed")
  }
}

// Close connection pool
export async function closeConnection() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = getConnection()
    await connection.execute("SELECT 1")
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
