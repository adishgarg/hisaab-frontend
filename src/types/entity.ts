interface Entity {
  id: string;
  name: string;
  type: "customer" | "business";
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  contactPerson?: string;
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface CreateEntityRequest {
  name: string;
  type: "customer" | "business";
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  contactPerson?: string;
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
  status: "active" | "inactive";
}

interface UpdateEntityRequest {
  name?: string;
  type?: "customer" | "business";
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  contactPerson?: string;
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
  status?: "active" | "inactive";
}
