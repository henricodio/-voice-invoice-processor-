export type Database = {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string
          // Add other invoice fields here
          [key: string]: unknown
        }
        Insert: {
          id?: string
          [key: string]: unknown
        }
        Update: {
          id?: string
          [key: string]: unknown
        }
      }
      // Add other tables as needed
    }
  }
}
