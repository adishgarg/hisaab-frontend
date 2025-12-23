export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  companyId?: string;
  employeeId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationType {
  INVOICE_CREATED = "INVOICE_CREATED",
  INVOICE_UPDATED = "INVOICE_UPDATED",
  INVOICE_DELETED = "INVOICE_DELETED",
  EMPLOYEE_ADDED = "EMPLOYEE_ADDED",
  EMPLOYEE_UPDATED = "EMPLOYEE_UPDATED",
  EMPLOYEE_REMOVED = "EMPLOYEE_REMOVED",
  ROLE_CHANGED = "ROLE_CHANGED",
  ENTITY_ADDED = "ENTITY_ADDED",
  ENTITY_UPDATED = "ENTITY_UPDATED",
  ITEM_LOW_STOCK = "ITEM_LOW_STOCK",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  GENERAL = "GENERAL",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface NotificationResponse {
  notifications: AppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}
