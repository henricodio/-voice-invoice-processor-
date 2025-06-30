export interface Question {
  id: string;
  label: string;
  question: string;
  type: 'text' | 'number' | 'date';
}

export const botScripts: Record<"factura" | "cliente", Question[]> = {
  factura: [
    { id: 'invoice_number', label: 'Número de Factura', question: 'Primero, dime el número de la factura.', type: 'text' },
    { id: 'client_name', label: 'Nombre del Cliente', question: '¿A nombre de quién está la factura?', type: 'text' },
    { id: 'total_amount', label: 'Importe Total', question: '¿Cuál es el importe total?', type: 'number' },
    { id: 'issue_date', label: 'Fecha de Emisión', question: '¿Cuál es la fecha de emisión?', type: 'date' },
  ],
  cliente: [
    { id: 'name', label: 'Nombre', question: '¿Cuál es el nombre del cliente?', type: 'text' },
    { id: 'nif', label: 'NIF/CIF', question: 'Ahora, dime su NIF o CIF.', type: 'text' },
    { id: 'address', label: 'Dirección', question: '¿Cuál es su dirección?', type: 'text' },
  ],
};
