// Database Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_number: number;
  guest_name: string;
  group_name: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  quantity: number;
  notes: string | null;
  is_custom: boolean;
  created_at: string;
}

// Extended Types for Frontend
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface PopularDrink {
  item_name: string;
  order_count: number;
  is_custom: boolean;
}

// Cart Types
export interface CartItem {
  menuItemId?: string;
  name: string;
  description?: string;
  quantity: number;
  notes: string;
  isCustom: boolean;
}

// API Request/Response Types
export interface CreateOrderRequest {
  guest_name: string;
  group_name?: string;
  items: {
    menu_item_id?: string;
    item_name: string;
    quantity: number;
    notes?: string;
    is_custom: boolean;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  bartender_key?: string;
  session_auth?: boolean;
}

export interface GuestSearchResponse {
  names: string[];
}
