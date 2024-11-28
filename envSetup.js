import dotEnv from 'dotenv'
import { expand } from 'dotenv-expand'
expand(dotEnv.config())

// in E5 import are done before the file (this case  server.js) so this is used to run expand function before the rest of the import file.
