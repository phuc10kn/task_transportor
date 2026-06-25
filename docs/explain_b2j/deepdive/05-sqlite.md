# Deepdive: `src/sqlite.js` — Low-Level SQLite CLI Wrapper

## Vai trò

Đây là lớp giao tiếp với SQLite database. Thay vì dùng npm package `better-sqlite3` hay `sql.js`, module này fork `sqlite3` CLI như một subprocess và giao tiếp qua stdin/stdout.

## Tại sao không dùng npm package?

- **Zero dependencies**: Đây là nguyên tắc thiết kế của toàn bộ project
- **sqlite3 CLI có sẵn**: Hầu hết môi trường dev đều có sqlite3, nếu không có thể cài qua `apt`, `brew`, `choco`
- **Đơn giản**: Không cần native binding, không lo version conflict

## Public API

| Function | Input | Output | Mô tả |
|----------|-------|--------|-------|
| `ensureDbDirectory(dbPath)` | `string` | `void` | Tạo thư mục chứa DB nếu chưa có |
| `runSql(dbPath, sql)` | `string`, `string` | `string` (stdout) | Execute SQL query, trả về raw stdout |
| `runSqlFile(dbPath, sqlFilePath)` | `string`, `string` | `string` | Execute .sql file qua `.read` command |
| `queryJson(dbPath, sql)` | `string`, `string` | `object[]` | Execute SQL và parse output dạng JSON |
| `sqlString(value)` | `any` | `string` | Escape giá trị cho SQL, NULL nếu empty |
| `sqlRequiredString(value, label)` | `any`, `string` | `string` | Validate + escape, throw nếu missing |

## Chi tiết implementation

### `runSql(dbPath, sql)`
```
execFileSync('sqlite3', [dbPath], {
    input: "PRAGMA foreign_keys = ON;\n" + sql,
    encoding: 'utf-8'
})
```

- Dùng `execFileSync` (không phải `execSync`) — an toàn hơn, không qua shell
- Luôn bật `PRAGMA foreign_keys = ON` trước mỗi query
- Không dùng async — toàn bộ tool là synchronous

### `runSqlFile(dbPath, sqlFilePath)`
```
execFileSync('sqlite3', [dbPath], {
    input: ".read \"${sqlFilePath}\"\n",
    encoding: 'utf-8'
})
```

- Dùng sqlite3 dot-command `.read` để execute file SQL
- Thường dùng để chạy migration files

### `queryJson(dbPath, sql)`
```
execFileSync('sqlite3', ['-json', dbPath, sql], {
    encoding: 'utf-8'
})
// Parse stdout thành JSON array
```

- Dùng flag `-json` của sqlite3 CLI (có từ sqlite3 3.33.0, 2020)
- Parse stdout thành JavaScript array of objects
- Dùng cho SELECT queries cần kết quả trả về

### `sqlString(value)`
```
if (!value || (typeof value === 'string' && value.trim() === ''))
    return 'NULL'
// Escape single quotes: '' (SQL standard)
return `'${String(value).replace(/'/g, "''")}'`
```

- Empty/null → `NULL` (không phải `''`)
- Escape single quote bằng cách double (`'` → `''`)
- An toàn với SQL injection (value được quote và escape)

### `sqlRequiredString(value, label)`
```
if (!value) throw new Error(`${label} is required`)
return sqlString(value)
```

- Giống `sqlString` nhưng throw nếu value falsy
- Dùng cho trường NOT NULL

## Security considerations

- **execFileSync, không execSync**: Tránh shell injection vì arguments không qua shell
- **SQL injection protection**: Mọi user input đều qua `sqlString()` hoặc `sqlRequiredString()` trước khi đưa vào SQL
- **No raw string concatenation**: Không cho phép template literal SQL với user input

## Limitations

- **Sqlite3 CLI phải có sẵn trên PATH**: Nếu không, tất cả DB operations đều fail
- **Synchronous**: Blocking I/O — không phù hợp cho high-concurrency, nhưng phù hợp với CLI tool
- **JSON mode cần sqlite3 >= 3.33.0**: Hầu hết hệ thống đều có, nhưng cần kiểm tra nếu dùng môi trường cũ
- **Không support prepared statements**: Mỗi query là một lần fork process — không optimal cho batch operations
