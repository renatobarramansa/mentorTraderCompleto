import { defineConfig } from "prisma/config";
import { config } from "dotenv";
config(); 
import path from "path";    
config({ path: path.resolve(__dirname, "../.env") }); 


export default defineConfig({  
  
  datasource: {
      url: process.env.DATABASE_URL || "postgresql://mentor:mentor123@localhost:5432/mentortrader",
  },
  
  migrations: {
    path: "./prisma/migrations",
  },
 
  
});
